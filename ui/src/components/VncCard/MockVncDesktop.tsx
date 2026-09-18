import React from "react";
import type { SessionCaps } from "../../types/hub";
import { DEFAULT_STACK_LOGIN, DEFAULT_STACK_TITLE, DEFAULT_STACK_USER } from "../../lib/defaultStack";

/**
 * Dev-only stand-in for a live noVNC framebuffer.
 * Cheap CSS Chrome + login page — not a real browser / RFB stream.
 */
export function MockVncDesktop({ caps = {} }: { caps?: SessionCaps }) {
    const version = caps.version || "149.0";
    const url = DEFAULT_STACK_LOGIN;

    return (
        <div
            className="vnc-mock-desktop"
            data-testid="mock-vnc-desktop"
            aria-label={
                caps.browserName
                    ? `Mock VNC desktop (${caps.browserName} ${version})`
                    : "Mock VNC desktop"
            }
        >
            <div className="vnc-mock-chrome">
                <div className="vnc-mock-tabs">
                    <span className="vnc-mock-tab vnc-mock-tab--active">
                        <span className="vnc-mock-favicon" aria-hidden="true" />
                        {DEFAULT_STACK_TITLE}
                    </span>
                    <span className="vnc-mock-tab-add" aria-hidden="true">
                        +
                    </span>
                </div>
                <div className="vnc-mock-toolbar">
                    <span className="vnc-mock-nav" aria-hidden="true">
                        ← → ↻
                    </span>
                    <span className="vnc-mock-omnibox">{url}</span>
                    <span className="vnc-mock-profile" aria-hidden="true">
                        {version}
                    </span>
                </div>
                <div className="vnc-mock-page">
                    <div className="vnc-mock-card">
                        <div className="vnc-mock-brand">autotests.ai</div>
                        <h1>{DEFAULT_STACK_TITLE}</h1>
                        <label>
                            Login
                            <span className="vnc-mock-field">{DEFAULT_STACK_USER}</span>
                        </label>
                        <label>
                            Password
                            <span className="vnc-mock-field vnc-mock-field--focus">
                                ••••••••
                                <i className="vnc-mock-caret" />
                            </span>
                        </label>
                        <span className="vnc-mock-submit">
                            Login
                            <i className="vnc-mock-pointer" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
