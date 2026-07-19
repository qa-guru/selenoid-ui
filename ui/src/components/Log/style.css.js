import styled from "styled-components";

export const StyledLog = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    &.hidden-true {
        display: none;
    }

    .log-card {
        height: 450px;
        width: 100%;

        .log-card__body {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            min-height: 0;
            background-color: var(--panel-bg, #1a1917);
            padding: 0;
        }

        .term {
            flex: 1;
            min-height: 0;
            padding: var(--space-6, 20px) var(--space-6, 20px) var(--space-3, 10px);

            .terminal {
                color: var(--panel-code-color, var(--color-text, #fff));
                font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
                font-size: 13px;
                line-height: 20px;

                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;

                .xterm-viewport {
                    background-color: var(--panel-bg, #1a1917);
                }
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
