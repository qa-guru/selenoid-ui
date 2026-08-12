import React, { Component } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Panel } from "@zero-design-system/react";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";

import "xterm/css/xterm.css";
import { StyledLog } from "./style.css";
import colors from "ansi-256-colors";

const RESIZE_DEBOUNCE_MS = 100;
/** Matches `.term .terminal { line-height: 20px }` — fallback if cell metrics unavailable. */
const FALLBACK_CELL_HEIGHT_PX = 20;
const MIN_ROWS = 2;

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

        const cellH = this.cellHeightPx();
        // Seed height so proposeDimensions / fit can measure cols from width.
        this.termel.style.height = `${MIN_ROWS * cellH}px`;

        const proposed = this.fitAddon.proposeDimensions?.();
        const cols = proposed?.cols || this.term.cols || 80;
        const rows = Math.max(this.term.buffer.active.length, MIN_ROWS);

        this.term.resize(cols, rows);
        this.termel.style.height = `${rows * this.cellHeightPx()}px`;
    };

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
        this.term.write(chunk);
        // Grow immediately when buffer outruns rows; debounce for bursty ws frames.
        if (this.term.buffer.active.length > this.term.rows) {
            this.fitToContent();
        } else {
            this.scheduleFitToContent();
        }
    }

    connect(props: any) {
        if (!(props && props.session && props.origin && props.browser)) {
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
