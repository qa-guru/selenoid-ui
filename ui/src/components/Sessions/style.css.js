import styled from "styled-components";

const colorBorder = "var(--color-border-strong, #555f6a)";
const secondaryColor = "var(--color-text-muted, #aaa)";
const manualColor = "#F0A202";

export const StyledSessions = styled.div`
    box-sizing: border-box;
    width: 100%;
    overflow: auto;
    padding: var(--wt-post-gap, 14px) var(--wt-post-gap, 14px) 0;

    .sessions-panel {
        width: 100%;
    }

    .sessions-panel__body {
        padding: 0;
        min-height: 60px;
    }

    .no-any {
        color: var(--color-text, #fff);
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        gap: var(--space-3, 10px);
        font-size: 1.2em;
        min-height: 60px;
        padding: 10px var(--space-5, 16px);
        box-sizing: border-box;
        white-space: nowrap;

        .icon {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            line-height: 0;

            svg {
                width: 1.1em;
                height: 1.1em;
                display: block;
            }
        }

        .nosession-any-text {
            margin: 0;
        }

        // don't show until all sessions are gone
        &_state-enter-active {
            display: none;
        }
    }

    .sessions__list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0 var(--space-5, 16px);
        box-sizing: border-box;

        .session {
            transition: all 0.5s;
            min-height: 60px;
            display: flex;
            justify-content: flex-start;
            min-width: 280px;
            border-bottom: 1px dashed ${colorBorder};
            color: var(--color-text, #fff);
            padding: 10px 0 0;
            overflow: auto;

            &_state-enter {
                opacity: 0.01;
            }

            &_state-enter-active {
                opacity: 1;
                transition: opacity 500ms ease-in;
            }

            &_state-exit {
                opacity: 1;
            }

            &_state-exit-active {
                opacity: 0.01;
                transition: opacity 500ms ease-out;
            }

            .identity {
                display: flex;
                flex-direction: column;
                max-width: 50%;
                flex: 0 0 50%;
                padding-right: 15px;

                .browser {
                    display: flex;

                    .name {
                        text-transform: uppercase;
                        font-weight: 300;
                        line-height: 30px;
                    }

                    .version {
                        font-weight: 300;
                        text-transform: lowercase;
                        font-size: 0.8em;
                        color: ${secondaryColor};
                        margin-left: 5px;
                    }
                }

                .session-name {
                    overflow: hidden;
                    border-left: 2px solid ${colorBorder};
                    color: ${secondaryColor};
                    font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;

                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    padding-left: 5px;
                }
            }

            &_manual {
                .identity {
                    .session-name {
                        border-color: ${manualColor};
                    }
                }
            }

            .session-delete {
                color: var(--color-text, #fff);
                flex-shrink: 0;
            }
        }
    }
`;
