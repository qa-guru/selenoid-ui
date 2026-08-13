import styled from "styled-components";

export const StyledLog = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: start;
    width: 100%;

    &.hidden-true {
        display: none;
    }

    &.session-peer {
        align-items: stretch;
        flex: 1 0 auto;
        min-height: var(--session-media-height);
        height: auto;

        .log-card {
            flex: 1 0 auto;
            min-height: var(--session-media-height);
            height: auto;
            align-self: stretch;

            .log-card__body {
                flex: 1 1 auto;
                min-height: 0;
                height: auto;
                display: flex;
                flex-direction: column;
                overflow: visible;
            }

            .term {
                flex: 0 0 auto;
                min-height: 0;
                overflow: hidden;
            }

            .log-file-pre {
                flex: 0 0 auto;
                min-height: 0;
                max-height: none;
                overflow: visible;
            }

            .log-file-empty {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 0;
            }
        }
    }

    .log-card {
        /* Terminal canon: content-height (no fixed VNC screen magnet / inner scroll). */
        height: auto;
        width: 100%;
        flex: 0 1 auto;
        align-self: start;
        min-height: 0;

        .log-card__body {
            width: 100%;
            height: auto;
            flex: 0 1 auto;
            min-height: 0;
            display: block;
            overflow: visible;
            padding: 0;
        }

        /* xterm mount — not a second panel; same surface as panel--terminal body. */
        .term {
            min-height: 40px;
            width: 100%;
            padding: var(--space-3, 12px);
            padding-bottom: 0;
            box-sizing: border-box;
            overflow: hidden;
            background: transparent;

            .terminal,
            .xterm {
                color: var(--panel-code-color, var(--color-text, #fff));
                font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
                font-size: 13px;
                line-height: 20px;
                width: 100%;
                background-color: transparent;

                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* Page scrolls; Log chrome must not grow inner scrollbars. */
            .xterm-viewport {
                background-color: transparent !important;
                overflow: hidden !important;
            }

            .xterm-screen {
                overflow: hidden;
            }
        }
    }

    .log-file-pre {
        margin: 0;
        padding: var(--space-3, 12px);
        max-height: none;
        overflow: visible;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--panel-code-color, var(--color-text, #fff));
        font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
        font-size: 13px;
        line-height: 20px;
    }

    .log-file-empty {
        padding: 24px 16px;
        color: var(--color-text-muted, #999);
        font-size: 13px;
        text-align: center;
    }

    .log-info {
        display: inline-flex;
        margin: auto;
        justify-content: center;
        line-height: 20px;
        width: 200px;
        color: var(--color-text-muted, #999);

        &__version-separator {
            margin-right: var(--space-1, 4px);
            margin-left: var(--space-1, 4px);
            font-size: 0.6em;
            color: var(--color-text, #fff);
        }

        &__session {
            line-height: 20px;
            font-size: 0.8em;
            color: var(--color-text-muted, #999);
            text-align: center;
        }
    }
`;
