import React, { Component } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { IconDownload, Panel } from "@zero-design-system/react";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";
import { mockLivePreview } from "../../lib/mockSessions";
import { downloadWithHubAuth } from "../../config/hubAuth";
import { resolveHubAuthToken } from "../../config/hubSessionAuth";
import { DEFAULT_STACK_AUTH_LOGIN, DEFAULT_STACK_AUTH_ME, DEFAULT_STACK_LOGIN, DEFAULT_STACK_USER } from "../../lib/defaultStack";
import { fullscreenAction } from "../fullscreenAction";

import "xterm/css/xterm.css";
import { StyledLog } from "./style.css";
import colors from "ansi-256-colors";

const RESIZE_DEBOUNCE_MS = 100;
/** Matches `.term .terminal { line-height: 20px }` — fallback if cell metrics unavailable. */
const FALLBACK_CELL_HEIGHT_PX = 20;
const MIN_ROWS = 2;
/** Grow the xterm viewport in chunks so a long session does not resize every line. */
const GROW_ROWS = 16;

const MOCK_LIVE_LOG = [
    "[chromedriver] ChromeDriver was started successfully.",
    "POST /session 200",
    `POST /session/url ${DEFAULT_STACK_LOGIN} 200`,
    "POST /session/element {using: css selector, value: [data-testid='login-input']}",
    `POST /session/element/value ${DEFAULT_STACK_USER}`,
    "POST /session/element {using: css selector, value: [data-testid='password-input']}",
];

const MOCK_LIVE_TICKS = [
    `POST ${DEFAULT_STACK_AUTH_LOGIN} 200 18ms`,
    `GET ${DEFAULT_STACK_AUTH_ME} 200 42ms`,
    "[devtools] Runtime.consoleAPICalled",
];

function logFileName(session: string, caps: any = {}) {
    const custom = String(caps.logName || "").trim();
    if (custom) {
        return custom.endsWith(".log") ? custom : `${custom}.log`;
    }
    return `${session}.log`;
}

function mockAttachLine(caps: any = {}) {
    const browser = caps.browserName || "chrome";
    const version = caps.version || "149.0";
    return `[selenoid] attached ${browser} ${version} session`;
}

/** xterm creates a helper textarea without id/name/autocomplete — DevTools Issues noise. */
function decorateXtermTextarea(term: Terminal) {
    const textarea = (term as any).textarea as HTMLTextAreaElement | undefined;
    if (!textarea) {
        return;
    }
    textarea.id = "session-log-input";
    textarea.name = "session-log";
    textarea.setAttribute("autocomplete", "off");
}

export default class Log extends Component<any, any> {
    term: Terminal;
    fitAddon: FitAddon;
    socket: WebSocket | null;
    currentOrigin: string | null;
    resizeTimer: ReturnType<typeof setTimeout> | null;
    decoder: TextDecoder;
    termel: HTMLDivElement | null | undefined;
    mockTimer: ReturnType<typeof setInterval> | null;

    constructor(props: any) {
        super(props);

        const terminal = new Terminal({
            cursorBlink: false,
            tabStopWidth: 4,
            disableStdin: true,
            fontSize: 13,
            lineHeight: 1,
            scrollback: 5000,
            theme: {
                // Match panel--terminal (--panel-bg) — no nested inner frame.
                background: "#1a1917",
            },
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        this.term = terminal;
        this.fitAddon = fitAddon;
        this.socket = null;
        this.currentOrigin = null;
        this.resizeTimer = null;
        this.decoder = new TextDecoder("utf8");
        this.mockTimer = null;
    }

    componentDidMount() {
        this.term.open(this.termel as HTMLElement);
        decorateXtermTextarea(this.term);
        this.fitToContent();
        this.term.writeln(colors.fg.getRgb(2, 3, 4) + "Initialize..." + colors.reset);
        this.fitToContent();

        window.addEventListener("resize", this.onResize);
        this.connect(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps: any) {
        this.connect(nextProps);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
        this.closeSocket();
        this.stopMockLog();
        this.term.dispose();
    }

    onResize = () => {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.resizeTimer = null;
            this.fitToContent();
        }, RESIZE_DEBOUNCE_MS);
    };

    cellHeightPx() {
        const dims = (this.term as any)?._core?._renderService?.dimensions?.css?.cell;
        if (dims && dims.height) {
            return dims.height;
        }
        return FALLBACK_CELL_HEIGHT_PX;
    }

    /**
     * Width → cols via FitAddon; host height hugs written lines.
     * Never shrink xterm.rows: a per-line resize rebuilds the canvas
     * and flashes the whole buffer while the first lines appear.
     */
    fitToContent = () => {
        if (!this.termel || !this.term.element) {
            return;
        }

        const proposed = this.fitAddon.proposeDimensions?.();
        const cols = proposed?.cols || this.term.cols || 80;
        const needed = this.cursorInclusiveRows();
        const rows = Math.max(needed, this.term.rows || MIN_ROWS);

        if (cols !== this.term.cols || rows !== this.term.rows) {
            this.term.resize(cols, rows);
        }
        this.scrollLogToTop();
        this.syncTermHostHeight(this.visualRows(needed));
    };

    scrollLogToTop() {
        const viewportY = this.term.buffer?.active?.viewportY || 0;
        if (viewportY > 0) {
            this.term.scrollToTop();
        }
    }

    /** Viewport rows that include the cursor (xterm must keep this or it scrolls the top line away). */
    cursorInclusiveRows() {
        const buf = this.term.buffer?.active;
        if (!buf) {
            return MIN_ROWS;
        }
        return Math.max((buf.baseY || 0) + (buf.cursorY || 0) + 1, MIN_ROWS);
    }

    /**
     * After a trailing newline the cursor sits on an empty next line.
     * Keep that row in xterm, but do not size the host around it.
     */
    visualRows(cursorInclusive: number) {
        const buf = this.term.buffer?.active;
        if (!buf) {
            return Math.max(cursorInclusive, MIN_ROWS);
        }
        const last = (buf.baseY || 0) + (buf.cursorY || 0);
        for (let y = last; y >= 0 && y >= last - 3; y--) {
            const line = typeof buf.getLine === "function" ? buf.getLine(y) : undefined;
            const text = line ? line.translateToString(true) : "";
            if (text.trim().length > 0) {
                return Math.max(y + 1, MIN_ROWS);
            }
        }
        const cursorX = buf.cursorX || 0;
        if (cursorX === 0 && cursorInclusive > MIN_ROWS) {
            return cursorInclusive - 1;
        }
        return cursorInclusive;
    }

    syncTermHostHeight(rows: number) {
        if (!this.termel || !this.term.element) {
            return;
        }
        // xterm sizes `.xterm-screen` from its own cell metrics; rows * cellHeightPx()
        // can disagree and leave empty space under the last line (border-box + padding).
        const screen = this.term.element.querySelector(".xterm-screen") as HTMLElement | null;
        const screenH =
            (screen && parseFloat(screen.style.height)) || screen?.getBoundingClientRect().height || 0;
        const termRows = this.term.rows || rows;
        const rowH = screenH > 0 && termRows > 0 ? screenH / termRows : this.cellHeightPx();
        const contentH = rows * rowH;
        const cs = getComputedStyle(this.termel);
        const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const next = `${contentH + pad}px`;
        if (this.termel.style.height !== next) {
            this.termel.style.height = next;
        }
    }

    writeAndFit(chunk: any) {
        const written = this.cursorInclusiveRows();
        // Grow before write so xterm does not scroll the first line into
        // scrollback. Do not fit/resize after every chunk — that flashes
        // the whole buffer while the opening lines stream in.
        if (written >= this.term.rows) {
            this.term.resize(this.term.cols || 80, written + GROW_ROWS);
        }
        this.term.write(chunk, () => {
            const needed = this.cursorInclusiveRows();
            if (needed > this.term.rows) {
                this.term.resize(this.term.cols || 80, needed + GROW_ROWS);
            }
            this.scrollLogToTop();
            this.syncTermHostHeight(this.visualRows(needed));
        });
    }

    connect(props: any) {
        if (!(props && props.session)) {
            return;
        }
        const preview = mockLivePreview(props.session, props.browser, props.mockEnabled);
        if (preview) {
            const key = `mock|${props.session}|${preview}`;
            if (key === this.currentOrigin) {
                return;
            }
            const wasLiveSocket = Boolean(this.currentOrigin && !String(this.currentOrigin).startsWith("mock|"));
            this.currentOrigin = key;
            this.closeSocket();
            this.stopMockLog();
            if (wasLiveSocket && this.term) {
                this.term.clear();
            }
            if (preview === "active") {
                this.playMockLiveLog(props.browser?.caps);
            } else if (preview === "starting") {
                this.writeAndFit(`Connecting to ws://localhost/ws/logs/${props.session}...\n\r`);
            }
            return;
        }

        if (!(props.origin && props.browser)) {
            return;
        }
        const key = `${props.origin}|${props.session}`;
        if (key === this.currentOrigin) {
            return;
        }
        this.currentOrigin = key;
        this.stopMockLog();

        const wsProxyUrl = urlTo(window.location.href);
        const wsUrl = `${isSecure(wsProxyUrl) ? "wss" : "ws"}://${wsProxyUrl.host}/ws/logs/${props.session}`;
        this.openSocket(wsUrl);
    }

    playMockLiveLog(caps: any = {}) {
        this.writeAndFit(`Connecting to ws://localhost/ws/logs/${this.props.session}...\n\r`);
        this.writeAndFit(colors.fg.getRgb(0, 2, 0) + "Connected!\n\r" + colors.reset);
        this.writeAndFit(`${mockAttachLine(caps)}\n\r`);
        for (const line of MOCK_LIVE_LOG) {
            this.writeAndFit(`${line}\n\r`);
        }
        if (import.meta.env.MODE === "test") {
            return;
        }
        let tick = 0;
        this.mockTimer = setInterval(() => {
            const line = MOCK_LIVE_TICKS[tick % MOCK_LIVE_TICKS.length];
            tick += 1;
            this.writeAndFit(`${line}\n\r`);
        }, 2500);
    }

    stopMockLog() {
        if (this.mockTimer) {
            clearInterval(this.mockTimer);
            this.mockTimer = null;
        }
    }

    openSocket(wsUrl: any) {
        // switchMap semantics: drop the previous socket before opening a new one.
        this.closeSocket();
        this.term.clear();
        this.writeAndFit(`Connecting to ${wsUrl}...\n\r`);

        const socket = new WebSocket(wsUrl);
        socket.binaryType = "arraybuffer";

        socket.onmessage = (event: any) => {
            if (event) {
                this.writeAndFit(this.decoder.decode(event.data) + "\r");
            }
        };

        socket.onopen = () => {
            this.writeAndFit(colors.fg.getRgb(0, 2, 0) + "Connected!\n\r" + colors.reset);
        };

        socket.onclose = () => {
            this.writeAndFit(colors.fg.getRgb(5, 1, 1) + "Disconnected\n\r" + colors.reset);
        };

        this.socket = socket;
    }

    closeSocket() {
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            this.socket.close();
        }
        this.socket = null;
    }

    render() {
        const { hidden, className, session, browser = {}, fullscreen, onToggleFullscreen } = this.props;
        const logFile = session ? logFileName(session, browser.caps) : "";
        const hostClass = [className, `hidden-${hidden}`, fullscreen ? "panel-host--fullscreen" : ""]
            .filter(Boolean)
            .join(" ");
        const actions = [
            ...(onToggleFullscreen ? [fullscreenAction(Boolean(fullscreen), onToggleFullscreen, "session-log-fullscreen")] : []),
            ...(logFile
                ? [
                      {
                          icon: <IconDownload />,
                          label: "Download",
                          onClick: () => {
                              void downloadWithHubAuth(
                                  `/logs/${logFile}`,
                                  logFile,
                                  resolveHubAuthToken()
                              ).catch((err: unknown) => {
                                  console.error("Can't download session log", err);
                              });
                          },
                          "data-testid": "session-log-download",
                      },
                  ]
                : []),
        ];

        return (
            <StyledLog className={hostClass}>
                <Panel
                    variant="terminal"
                    title="Session logs"
                    barChrome
                    testId="session-log-panel"
                    titleTestId="session-log-title"
                    className="log-card"
                    bodyClassName="log-card__body"
                    actions={actions.length ? actions : undefined}
                >
                    <div
                        className="term"
                        ref={(term: any) => {
                            this.termel = term;
                        }}
                    />
                </Panel>
            </StyledLog>
        );
    }
}
