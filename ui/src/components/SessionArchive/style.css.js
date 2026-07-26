import styled from "styled-components";

const colorBorder = "var(--color-border-strong, #555f6a)";

export const StyledArchive = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: var(--wt-post-gap, 14px);

    .archive-panel {
        width: 100%;
    }

    .archive-panel__body {
        padding: 0;
        min-height: 120px;
    }

    .archive__list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0 var(--space-5, 16px);
        box-sizing: border-box;
    }

    .archive__row {
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        border-bottom: 1px dashed ${colorBorder};
        color: var(--color-text, #fff);
        padding: 10px 0;
        min-width: 280px;
    }

    .archive__row_state {
        &-enter {
            opacity: 0.01;
        }
        &-enter-active {
            opacity: 1;
            transition: opacity 500ms ease-in;
        }
        &-exit {
            opacity: 1;
        }
        &-exit-active {
            opacity: 0.01;
            transition: opacity 500ms ease-out;
        }
    }

    .archive__id {
        flex: 0 0 120px;
        color: var(--color-text, #fff);
        text-decoration: none;
        font-weight: 300;
        font-size: 1.05em;
        font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;

        &:hover {
            color: var(--color-success, #59a781);
        }
    }

    .archive__artifacts {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 0.5em;
        flex-wrap: wrap;
        text-decoration: none;
        color: inherit;
        min-width: 0;
    }

    .archive__empty-artifacts {
        color: var(--color-text-muted, #aaa);
        font-size: 0.9em;
    }

    .archive__actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;

        .session-delete {
            color: var(--color-text, #fff);
            background: transparent;
            border: none;
            cursor: pointer;

            &:hover:not(:disabled) {
                color: var(--color-danger, #ff6e59);
            }

            &:disabled {
                opacity: 0.5;
                cursor: default;
            }
        }
    }

    .no-any {
        color: var(--color-text, #fff);
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: center;
        font-size: 1.2em;
        justify-content: center;
        padding: var(--space-8, 30px) var(--space-4, 15px);

        .nosession-any-text {
            margin: var(--space-3, 10px);
        }

        &_state-enter-active {
            display: none;
        }
    }

    .archive__pager {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--space-5, 16px);
        margin: var(--space-3, 10px) 0 var(--space-8, 30px);
        color: var(--color-text, #fff);
        font-size: 0.95em;
    }

    .archive__pager-btn {
        background: transparent;
        border: 1px solid var(--color-border-strong, #555f6a);
        color: var(--color-text, #fff);
        padding: 6px 14px;
        cursor: pointer;

        &:hover:not(:disabled) {
            border-color: var(--color-success, #59a781);
            color: var(--color-success, #59a781);
        }

        &:disabled {
            opacity: 0.4;
            cursor: default;
        }
    }

    .archive__pager-status {
        min-width: 64px;
        text-align: center;
        color: var(--color-text, #fff);
    }
`;
