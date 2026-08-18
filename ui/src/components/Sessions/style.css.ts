import styled from "styled-components";
import { sessionIdentityCss } from "../SessionIdentity/style";

const colorBorder = "var(--color-border-strong, #555f6a)";

export const StyledSessions = styled.div`
    ${sessionIdentityCss}
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
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
        font-size: 1em;
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
    }

    .session {
        transition: opacity 0.5s;
        min-height: 44px;
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        min-width: 280px;
        border-bottom: 1px dashed ${colorBorder};
        color: var(--color-text, #fff);
        padding: 8px 0;
        font-size: 0.82em;
        overflow: hidden;

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
    }

    .session__id {
        flex: 0 0 76px;
        color: var(--color-text, #fff);
        font-weight: 300;
        font-size: 1em;
        font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
        font-variant-numeric: tabular-nums;
        text-decoration: none;

        &:hover {
            color: var(--color-success, #59a781);
        }
    }

    .session .session__quota {
        flex: 0 1 96px;
        max-width: 120px;
    }

    .session__actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-left: auto;
    }

    .session-delete {
        color: var(--color-text, #fff);
        background: transparent;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        padding: 0;
        flex-shrink: 0;

        .icon svg {
            width: 16px;
            height: 16px;
            display: block;
        }

        &:hover:not(:disabled) {
            color: var(--color-danger, #ff6e59);
        }

        &:disabled {
            opacity: 0.5;
            cursor: default;
        }
    }

    @media (max-width: 720px) {
        /* 2 rows: id/quota/actions · browser/name/caps — not 3 */
        .session {
            flex-wrap: wrap;
            column-gap: 10px;
            row-gap: 6px;
        }

        .session__id {
            order: 1;
        }

        .session .session__quota {
            order: 2;
            flex: 1 1 auto;
            max-width: none;
        }

        .session__actions {
            order: 3;
            margin-left: 0;
        }

        .session::after {
            content: "";
            order: 4;
            flex: 1 0 100%;
            height: 0;
            pointer-events: none;
        }

        .session__fields {
            order: 5;
            flex: 1 1 0;
            min-width: 0;
        }

        .session__caps {
            order: 6;
            margin-left: 0;
            flex: 0 0 auto;
        }
    }
`;
