import React, { Component } from "react";
import { VncWindow } from "../../../vendor/react-ui/dist/index.js";
import "@zero-design-system/react/styles.css";

import VncScreen from "./VncScreen";
import { parseScreenSize } from "../../util/capabilitiesLogic";

function videoFileName(session: string, caps: any = {}) {
    const custom = String(caps.videoName || "").trim();
    if (custom) {
        return custom.endsWith(".mp4") ? custom : `${custom}.mp4`;
    }
    return `${session}.mp4`;
}

function triggerDownload(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
}

/**
 * Selenoid VNC window — design-system `VncWindow` primitive wired to the noVNC
 * RFB screen and Selenoid clipboard endpoints. Chrome, states and fullscreen
 * collapse live in @zero-design-system/react (no local styled-components).
 * Screen height follows `caps.screenResolution` aspect (default 16/9 in CSS).
 * Stop / delete / close live on SessionInfo (`Panel.actions`), not here.
 */
export default class VncCard extends Component<any, any> {
    screen: any;
    state: any = { connection: "connecting", fullscreen: false, unlocked: false };

    connection = (connection: any) => {
        this.setState({ connection });
    };

    handleFullscreen = () => {
        const current = this.props.fullscreen ?? this.state.fullscreen;
        const fullscreen = !current;
        this.props.onVNCFullscreenChange?.(fullscreen);
        if (this.props.fullscreen === undefined) {
            this.setState({ fullscreen });
        }
    };

    handleLock = () => {
        const unlocked = !this.state.unlocked;
        this.setState({ unlocked });
        this.screen && this.screen.lock(unlocked);
    };

    render() {
        const { origin, session, browser = {} } = this.props;
        const { connection, unlocked } = this.state;
        const fullscreen = this.props.fullscreen ?? this.state.fullscreen ?? false;

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
                onToggleLock={this.handleLock}
                onToggleFullscreen={this.handleFullscreen}
                onCopy={() => copyFromDocker(session)}
                onPaste={() => pasteToDocker(session)}
                onDownload={() => {
                    const file = videoFileName(session, browser.caps);
                    triggerDownload(`/video/${file}`, file);
                }}
                labels={{ copy: "Copy from session", paste: "Paste into session" }}
            >
                <VncScreen
                    ref={(instance: any) => {
                        this.screen = instance;
                    }}
                    session={session}
                    origin={origin}
                    browser={browser}
                    mockEnabled={this.props.mockEnabled}
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
