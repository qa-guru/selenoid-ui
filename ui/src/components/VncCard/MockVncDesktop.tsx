import React from "react";
import styled from "styled-components";
import type { SessionCaps } from "../../types/hub";

/**
 * Dev-only stand-in for a live noVNC framebuffer.
 * Cheap CSS Chrome + login page — not a real browser / RFB stream.
 */
export function MockVncDesktop({ caps = {} }: { caps?: SessionCaps }) {
    const version = caps.version || "149.0";
    const url = "https://shop.example/login";

    return (
        <StyledMockDesktop data-testid="mock-vnc-desktop" aria-label="Mock VNC desktop">
            <div className="vnc-mock-chrome">
                <div className="vnc-mock-tabs">
                    <span className="vnc-mock-tab vnc-mock-tab--active">
                        <span className="vnc-mock-favicon" aria-hidden="true" />
                        Sign in — Shop
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
                        <div className="vnc-mock-brand">Shop</div>
                        <h1>Sign in</h1>
                        <label>
                            Email
                            <span className="vnc-mock-field">alice@shop.example</span>
                        </label>
                        <label>
                            Password
                            <span className="vnc-mock-field vnc-mock-field--focus">
                                ••••••••
                                <i className="vnc-mock-caret" />
                            </span>
                        </label>
                        <span className="vnc-mock-submit">
                            Sign in
                            <i className="vnc-mock-pointer" />
                        </span>
                    </div>
                </div>
            </div>
        </StyledMockDesktop>
    );
}

const StyledMockDesktop = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #1b1b1b;
    user-select: none;
    pointer-events: none;
    font-family: system-ui, "Segoe UI", sans-serif;

    .vnc-mock-chrome {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #fff;
        color: #202124;
    }

    .vnc-mock-tabs {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 34px;
        padding: 6px 8px 0;
        background: #dfe1e5;
        flex-shrink: 0;
    }

    .vnc-mock-tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 220px;
        height: 28px;
        padding: 0 12px;
        border-radius: 8px 8px 0 0;
        font-size: 11px;
        color: #3c4043;
        white-space: nowrap;
        overflow: hidden;
    }

    .vnc-mock-tab--active {
        background: #fff;
        color: #202124;
    }

    .vnc-mock-favicon {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        background: #1a73e8;
        flex-shrink: 0;
    }

    .vnc-mock-tab-add {
        width: 22px;
        height: 22px;
        margin: 0 4px 4px;
        border-radius: 50%;
        color: #5f6368;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
    }

    .vnc-mock-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 10px 6px;
        background: #fff;
        border-bottom: 1px solid #e8eaed;
        flex-shrink: 0;
    }

    .vnc-mock-nav {
        color: #5f6368;
        font-size: 12px;
        letter-spacing: 4px;
        flex-shrink: 0;
    }

    .vnc-mock-omnibox {
        flex: 1;
        min-width: 0;
        height: 26px;
        padding: 0 12px;
        border-radius: 13px;
        background: #f1f3f4;
        color: #3c4043;
        font-size: 12px;
        line-height: 26px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .vnc-mock-profile {
        flex-shrink: 0;
        color: #80868b;
        font-size: 10px;
        font-variant-numeric: tabular-nums;
    }

    .vnc-mock-page {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #f8f9fa 0%, #eef1f4 100%);
    }

    .vnc-mock-card {
        width: min(280px, 86%);
        padding: 18px 20px 20px;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(60, 64, 67, 0.16), 0 4px 12px rgba(60, 64, 67, 0.08);
    }

    .vnc-mock-brand {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #1a73e8;
        margin-bottom: 6px;
    }

    h1 {
        margin: 0 0 14px;
        font-size: 20px;
        font-weight: 500;
        letter-spacing: -0.02em;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 10px;
        font-size: 11px;
        color: #5f6368;
    }

    .vnc-mock-field {
        position: relative;
        display: block;
        height: 32px;
        padding: 0 10px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        color: #202124;
        font-size: 13px;
        line-height: 30px;
    }

    .vnc-mock-field--focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 1px #1a73e8;
    }

    .vnc-mock-caret {
        display: inline-block;
        width: 1px;
        height: 14px;
        margin-left: 1px;
        background: #202124;
        vertical-align: middle;
        animation: vnc-mock-blink 1s step-end infinite;
    }

    .vnc-mock-submit {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 4px;
        height: 32px;
        padding: 0 18px;
        border-radius: 4px;
        background: #1a73e8;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
    }

    .vnc-mock-pointer {
        position: absolute;
        right: -10px;
        bottom: -14px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 11px 18px 0;
        border-color: transparent #111 transparent transparent;
        filter: drop-shadow(1px 1px 0 #fff);
        transform: rotate(-20deg);
    }

    @keyframes vnc-mock-blink {
        50% {
            opacity: 0;
        }
    }
`;
