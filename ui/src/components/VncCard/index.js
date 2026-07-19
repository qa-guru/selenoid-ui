import React, { Component } from "react";
import { Link } from "react-router-dom";

import VncScreen from "./VncScreen";
import { StyledVNC } from "./style.css";

/** Local glyphs for VncCard chrome — dripicons off; composition only. */
function IconClose() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
    );
}

function IconDots() {
    return (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="8" r="1.25" />
            <circle cx="8" cy="8" r="1.25" />
            <circle cx="12" cy="8" r="1.25" />
        </svg>
    );
}

function IconDisconnected() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4.5 3.5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
            <path d="M6 6.5l4 4M10 6.5l-4 4" />
        </svg>
    );
}

function IconLock() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
            <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
        </svg>
    );
}

function IconLockOpen() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
            <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0" />
        </svg>
    );
}

function IconChevronUp() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 10l4-4 4 4" />
        </svg>
    );
}

function IconChevronDown() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 6l4 4 4-4" />
        </svg>
    );
}

function IconCopy() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
            <path d="M3.5 10.5v-7a1 1 0 0 1 1-1h7" />
        </svg>
    );
}

function IconUpload() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 10.5V3.5M5 6l3-3 3 3" />
            <path d="M3.5 12.5h9" />
        </svg>
    );
}

export default class VncCard extends Component {
    state = { connection: "connecting" };

    connection = (connection) => {
        this.setState({ connection: connection });
    };

    handleFullscreen = () => {
        this.props.onVNCFullscreenChange(!this.state.fullscreen);
        this.setState({ fullscreen: !this.state.fullscreen });
    };

    handleLock = () => {
        this.setState({ unlocked: !this.state.unlocked });
        this.screen && this.screen.lock(!this.state.unlocked);
    };

    render() {
        const { origin, session, browser = {}, className } = this.props;
        const { connection, fullscreen, unlocked } = this.state;
        const connected = connection === "connected";

        if (browser.caps && !browser.caps.enableVNC) {
            return <span />;
        }

        return (
            <StyledVNC className={`${className} ${fullscreen && "fullscreen"}`}>
                <div className={`vnc-card ${!connected && "vnc-card_small"} ${fullscreen && "vnc-card_fullscreen"}`}>
                    <div className="vnc-card__controls">
                        <Back />
                        <Connection connection={connection} />
                        {connected && <Lock locked={!unlocked} handleLock={this.handleLock} />}
                        {connected && <Fullscreen handleFullscreen={this.handleFullscreen} fullscreen={fullscreen} />}
                        {connected && (
                            <Clipboard
                                upload={copyFromDocker}
                                session={session}
                                title={"copyFromSelenoid"}
                                operator={"copy"}
                            />
                        )}
                        {connected && (
                            <Clipboard
                                upload={pasteToDocker}
                                session={session}
                                title={"pasteToSelenoid"}
                                operator={"upload"}
                            />
                        )}
                    </div>

                    <div className="vnc-card__content">
                        <VncScreen
                            ref={(instance) => {
                                this.screen = instance;
                            }}
                            session={session}
                            origin={origin}
                            onUpdateState={(state) => this.connection(state)}
                        />
                    </div>
                </div>

                {!connected && (
                    <div className={`vnc-connection-status vnc-connection-status_${connection}`}>VNC {connection}</div>
                )}
            </StyledVNC>
        );
    }
}
function copyFromDocker(sessionId) {
    fetch("/clipboard/" + sessionId, { method: "GET" })
        .then((response) => response.text())
        .then((text) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            }
        })
        .catch((e) => console.error("Can't copy from Selenoid clipboard", e));
}

function pasteToDocker(sessionId) {
    if (navigator.clipboard) {
        navigator.clipboard.readText().then((text) => {
            fetch("/clipboard/" + sessionId, {
                method: "POST",
                body: text,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).catch((e) => console.error("Can't paste to Selenoid clipboard", e));
        });
    }
}

function Back() {
    return (
        <Link className="icon-btn control control_back link" to="/" title="Back" aria-label="Back">
            <span className="icon" aria-hidden="true">
                <IconClose />
            </span>
        </Link>
    );
}

function Connection(props) {
    const { connection } = props;
    const Icon = connection === "disconnected" ? IconDisconnected : IconDots;

    return (
        <div className={`control control_${connection}`} title={connection} aria-label={connection}>
            <span className="icon" aria-hidden="true">
                <Icon />
            </span>
        </div>
    );
}

function Fullscreen(props) {
    const { handleFullscreen, fullscreen } = props;
    return (
        <button
            type="button"
            className="icon-btn control control_fullscreen"
            title="Fullscreen"
            aria-label="Fullscreen"
            onClick={handleFullscreen}
        >
            <span className="icon" aria-hidden="true">
                {fullscreen ? <IconChevronDown /> : <IconChevronUp />}
            </span>
        </button>
    );
}

function Clipboard(props) {
    const { upload, session, title, operator } = props;
    return (
        <button
            type="button"
            className={`icon-btn control control_${operator}`}
            title={title}
            aria-label={title}
            onClick={() => upload(session)}
        >
            <span className="icon" aria-hidden="true">
                {operator === "upload" ? <IconUpload /> : <IconCopy />}
            </span>
        </button>
    );
}

function Lock(props) {
    const { locked, handleLock } = props;
    return (
        <button
            type="button"
            className="icon-btn control control_lock"
            title="Lock/Unlock Screen"
            aria-label="Lock/Unlock Screen"
            onClick={handleLock}
        >
            <span className="icon" aria-hidden="true">
                {locked ? <IconLock /> : <IconLockOpen />}
            </span>
        </button>
    );
}
