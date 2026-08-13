import React, { Component } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Panel } from "@zero-design-system/react";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";
import { mockLivePreview } from "../../lib/mockSessions";

import "xterm/css/xterm.css";
import { StyledLog } from "./style.css";
import colors from "ansi-256-colors";

const RESIZE_DEBOUNCE_MS = 100;
/** Matches `.term .terminal { line-height: 20px }` — fallback if cell metrics unavailable. */
const FALLBACK_CELL_HEIGHT_PX = 20;
const MIN_ROWS = 2;

const MOCK_LIVE_LOG = [
    "[selenoid] attached chrome 149.0 session",
    "[chromedriver] ChromeDriver was started successfully.",
    "POST /session 200",
    "POST /session/url https://shop.example/login 200",
    "POST /session/element {using: css selector, value: #email}",
    "POST /session/element/value alice@shop.example",
    "POST /session/element {using: css selector, value: #password}",
];

const MOCK_LIVE_TICKS = [
    "GET https://shop.example/api/session 200 18ms",
    "GET https://shop.example/api/cart 200 42ms",
    "[devtools] Runtime.consoleAPICalled",
];

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
    fitTimer: ReturnType<typeof setTimeout> | null;
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
        this.fitTimer = null;
        this.decoder = new TextDecoder("utf8");
        this.mockTimer = null;
    }

    componentDidMount() {
        this.term.open(this.termel as HTMLElement);
        decorateXtermTextarea(this.term);
        this.fitToContent();
        this.term.writeln(colors.fg.getRgb(2, 3, 4) + "Initialize...\n\r" + colors.reset);
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
        if (this.fitTimer) {
            clearTimeout(this.fitTimer);
            this.fitTimer = null;
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
     * Width → cols via FitAddon; height → buffer line count (content hug, no inner scroll).
     */
    fitToContent = () => {
        if (!this.termel || !this.term.element) {
            return;
        }

        // Measure cols from current width. Do not collapse height first —
        // that flashes the first line ("Initialize...") and jitters the panel.
        const proposed = this.fitAddon.proposeDimensions?.();
        const cols = proposed?.cols || this.term.cols || 80;
        // buffer.length is the viewport (default 24 rows), not written lines.
        const buf = this.term.buffer?.active;
        const written = buf ? (buf.baseY || 0) + (buf.cursorY || 0) + 1 : MIN_ROWS;
        const rows = Math.max(written, MIN_ROWS);

        this.term.resize(cols, rows);
        this.term.scrollToTop();
        this.syncTermHostHeight(rows);
    };

    syncTermHostHeight(rows: number) {
        if (!this.termel || !this.term.element) {
            return;
        }
        // xterm sizes `.xterm-screen` from its own cell metrics; rows * cellHeightPx()
        // can disagree and leave empty space under the last line (border-box + padding).
        const screen = this.term.element.querySelector(".xterm-screen") as HTMLElement | null;
        const screenH =
            (screen && parseFloat(screen.style.height)) || screen?.getBoundingClientRect().height || 0;
        const contentH = screenH > 0 ? screenH : rows * this.cellHeightPx();
        const cs = getComputedStyle(this.termel);
        const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        this.termel.style.height = `${contentH + pad}px`;
    }

    scheduleFitToContent() {
        if (this.fitTimer) {
            clearTimeout(this.fitTimer);
        }
        this.fitTimer = setTimeout(() => {
            this.fitTimer = null;
            this.fitToContent();
        }, RESIZE_DEBOUNCE_MS);
    }

    writeAndFit(chunk: any) {
        const buf = this.term.buffer?.active;
        const written = buf ? (buf.baseY || 0) + (buf.cursorY || 0) + 1 : MIN_ROWS;
        // Grow a spare row before write so xterm does not scroll the first
        // line ("Initialize...") into scrollback while the chunk is parsed.
        if (written >= this.term.rows) {
            const rows = written + 1;
            this.term.resize(this.term.cols || 80, rows);
            this.syncTermHostHeight(rows);
        }
        this.term.write(chunk, () => {
            this.scheduleFitToContent();
        });
    }

    connect(props: any) {
        if (!(props && props.session)) {
            return;
        }
        const preview = mockLivePreview(props.session);
        if (preview) {
            const key = `mock|${props.session}|${preview}`;
            if (key === this.currentOrigin) {
                return;
            }
            this.currentOrigin = key;
            this.closeSocket();
            this.stopMockLog();
            if (preview === "active") {
                this.playMockLiveLog(props.session);
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

        const wsProxyUrl = urlTo(window.location.href);
        const wsUrl = `${isSecure(wsProxyUrl) ? "wss" : "ws"}://${wsProxyUrl.host}/ws/logs/${props.session}`;
        this.openSocket(wsUrl);
    }

    playMockLiveLog(sessionId: string) {
        this.writeAndFit(`Connecting to ws://localhost/ws/logs/${sessionId}...\n\r`);
        this.writeAndFit(colors.fg.getRgb(0, 2, 0) + "Connected!\n\r" + colors.reset);
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
        const { hidden, className } = this.props;

        return (
            <StyledLog className={`${className} hidden-${hidden}`}>
                <Panel
                    variant="terminal"
                    title="Session logs"
                    testId="session-log-panel"
                    titleTestId="session-log-title"
                    className="log-card"
                    bodyClassName="log-card__body"
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
