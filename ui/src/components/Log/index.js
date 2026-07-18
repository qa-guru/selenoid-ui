import React, { Component } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";

import "xterm/css/xterm.css";
import { StyledLog } from "./style.css";
import colors from "ansi-256-colors";

const RESIZE_DEBOUNCE_MS = 100;

export default class Log extends Component {
    constructor(props) {
        super(props);

        const terminal = new Terminal({
            cursorBlink: false,
            tabStopWidth: 4,
            disableStdin: true,
            enableBold: false,
            fontSize: 13,
            lineHeight: 1,
            theme: {
                background: "#151515",
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
    }

    componentDidMount() {
        this.term.open(this.termel);
        this.fitAddon.fit();
        this.term.writeln(colors.fg.getRgb(2, 3, 4) + "Initialize...\n\r" + colors.reset);

        window.addEventListener("resize", this.onResize);
        this.connect(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.connect(nextProps);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
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
            this.fitAddon.fit();
        }, RESIZE_DEBOUNCE_MS);
    };

    connect(props) {
        if (!(props && props.session && props.origin && props.browser)) {
            return;
        }
        // Reconnect only when origin changes (was distinctUntilChanged on origin).
        if (props.origin === this.currentOrigin) {
            return;
        }
        this.currentOrigin = props.origin;

        const wsProxyUrl = urlTo(window.location.href);
        const wsUrl = `${isSecure(wsProxyUrl) ? "wss" : "ws"}://${wsProxyUrl.host}/ws/logs/${props.session}`;
        this.openSocket(wsUrl);
    }

    openSocket(wsUrl) {
        // switchMap semantics: drop the previous socket before opening a new one.
        this.closeSocket();
        this.term.clear();
        this.term.write(`Connecting to ${wsUrl}...\n\r`);

        const socket = new WebSocket(wsUrl);
        socket.binaryType = "arraybuffer";

        socket.onmessage = (event) => {
            if (event) {
                this.term.write(this.decoder.decode(event.data) + "\r");
            }
        };

        socket.onopen = () => {
            this.term.write(colors.fg.getRgb(0, 2, 0) + "Connected!\n\r" + colors.reset);
        };

        socket.onclose = () => {
            this.term.write(colors.fg.getRgb(5, 1, 1) + "Disconnected\n\r" + colors.reset);
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
                <div className="log-card">
                    <div className="log-card__content">
                        <div
                            className="term"
                            ref={(term) => {
                                this.termel = term;
                            }}
                        />
                    </div>
                </div>
            </StyledLog>
        );
    }
}
