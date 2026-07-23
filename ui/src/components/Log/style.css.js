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

    .log-card {
        /* Terminal canon: content-height (no fixed VNC screen magnet / inner scroll). */
        height: auto;
        width: 100%;
        flex: 0 1 auto;
        min-height: 0;

        .log-card__body {
            width: 100%;
            height: auto;
            flex: 0 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: visible;
            background-color: var(--panel-bg, #1a1917);
            padding: 0;
        }

        .term {
            flex: 0 0 auto;
            min-height: 40px;
            width: 100%;
            padding: var(--space-6, 20px) var(--space-6, 20px) var(--space-3, 10px);
            box-sizing: border-box;

            .terminal,
            .xterm {
                color: var(--panel-code-color, var(--color-text, #fff));
                font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
                font-size: 13px;
                line-height: 20px;
                width: 100%;

                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* Page scrolls; Log chrome must not grow inner scrollbars. */
            .xterm-viewport {
                background-color: var(--panel-bg, #1a1917);
                overflow: hidden !important;
            }

            .xterm-screen {
                overflow: hidden;
            }
        }
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
