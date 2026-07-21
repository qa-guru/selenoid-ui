import React, { Component } from "react";
import { Link } from "react-router-dom";
import { VncWindow, WindowControl, IconClose } from "@zero-design-system/react";
import "@zero-design-system/react/styles.css";

import VncScreen from "./VncScreen";

/**
 * Selenoid VNC window — design-system `VncWindow` primitive wired to the noVNC
 * RFB screen and Selenoid clipboard endpoints. Chrome, states and fullscreen
 * collapse live in @zero-design-system/react (no local styled-components).
 */
export default class VncCard extends Component {
    state = { connection: "connecting", fullscreen: false, unlocked: false };

    connection = (connection) => {
        this.setState({ connection });
    };

    handleFullscreen = () => {
        const fullscreen = !this.state.fullscreen;
        this.props.onVNCFullscreenChange(fullscreen);
        this.setState({ fullscreen });
    };

    handleLock = () => {
        const unlocked = !this.state.unlocked;
        this.setState({ unlocked });
        this.screen && this.screen.lock(unlocked);
    };

    render() {
        const { origin, session, browser = {} } = this.props;
        const { connection, fullscreen, unlocked } = this.state;

        if (browser.caps && !browser.caps.enableVNC) {
            return <span />;
        }

        return (
            <VncWindow
                state={connection}
                fullscreen={fullscreen}
                unlocked={unlocked}
                back={
                    <WindowControl as={Link} to="/" tone="danger" title="Back" aria-label="Back">
                        <IconClose />
                    </WindowControl>
                }
                onToggleLock={this.handleLock}
                onToggleFullscreen={this.handleFullscreen}
                onCopy={() => copyFromDocker(session)}
                onPaste={() => pasteToDocker(session)}
                labels={{ copy: "Copy from Selenoid", paste: "Paste to Selenoid" }}
            >
                <VncScreen
                    ref={(instance) => {
                        this.screen = instance;
                    }}
                    session={session}
                    origin={origin}
                    onUpdateState={(state) => this.connection(state)}
                />
            </VncWindow>
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
