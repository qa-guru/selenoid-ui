import React, { Component } from "react";
import { Link } from "react-router-dom";
import { VncWindow, WindowControl, IconClose } from "@zero-design-system/react";
import "@zero-design-system/react/styles.css";

import VncScreen from "./VncScreen";
import { parseScreenSize } from "../../util/capabilitiesLogic";

/**
 * Selenoid VNC window — design-system `VncWindow` primitive wired to the noVNC
 * RFB screen and Selenoid clipboard endpoints. Chrome, states and fullscreen
 * collapse live in @zero-design-system/react (no local styled-components).
 * Screen height follows `caps.screenResolution` aspect (default 16/9 in CSS).
 * Session kill lives on SessionInfo panel (`Panel.actions` + IconTrash), not here.
 */
export default class VncCard extends Component<any, any> {
    screen: any;
    state: any = { connection: "connecting", fullscreen: false, unlocked: false };

    connection = (connection: any) => {
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

        const screenSize = parseScreenSize(browser.caps && browser.caps.screenResolution);

        return (
            <VncWindow
                state={connection as any}
                fullscreen={fullscreen}
                unlocked={unlocked}
                screenSize={screenSize || undefined}
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
                    ref={(instance: any) => {
                        this.screen = instance;
                    }}
                    session={session}
                    origin={origin}
                    onUpdateState={(state: any) => this.connection(state)}
                />
            </VncWindow>
        );
    }
}

function copyFromDocker(sessionId: string) {
    fetch("/clipboard/" + sessionId, { method: "GET" })
        .then((response: any) => response.text())
        .then((text: any) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
            }
        })
        .catch((e: any) => console.error("Can't copy from Selenoid clipboard", e));
}

function pasteToDocker(sessionId: string) {
    if (navigator.clipboard) {
        navigator.clipboard.readText().then((text: any) => {
            fetch("/clipboard/" + sessionId, {
                method: "POST",
                body: text,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).catch((e: any) => console.error("Can't paste to Selenoid clipboard", e));
        });
    }
}
