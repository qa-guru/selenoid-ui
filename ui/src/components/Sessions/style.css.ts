import styled from "styled-components";

const colorBorder = "var(--color-border-strong, #555f6a)";
const secondaryColor = "var(--color-text-muted, #aaa)";
const manualColor = "#F0A202";

export const StyledSessions = styled.div`
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
    padding: var(--wt-post-gap, 14px) var(--wt-post-gap, 14px) 0;

    .sessions-panel {
        width: 100%;

        .panel__title {
            font-size: 0.625rem;
        }
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

    .session__quota {
        flex: 0 1 96px;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${secondaryColor};
        font-size: 0.95em;
        font-weight: 300;
    }

    .session__fields {
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        flex: 1;
        min-width: 0;
        text-decoration: none;
        color: inherit;

        &:hover .name,
        &:hover .session-name {
            color: var(--color-success, #59a781);
        }
    }

    .browser {
        display: inline-flex;
        align-items: baseline;
        gap: 0.35em;
        flex: 0 0 auto;
        white-space: nowrap;

        .name {
            text-transform: uppercase;
            font-weight: 300;
            line-height: 1.2;
            color: var(--color-text, #fff);
        }

        .version {
            font-weight: 300;
            font-size: 0.95em;
            color: ${secondaryColor};
        }
    }

    .session-name {
        flex: 1 1 140px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 300;
        color: var(--color-text, #fff);
        border-left: 2px solid ${colorBorder};
        padding-left: 8px;
    }

    .session-name_empty {
        flex: 0 0 auto;
        color: ${secondaryColor};
    }

    .session_manual .session-name {
        border-color: ${manualColor};
    }

    .session__quota_starting {
        display: inline-flex;
        align-items: center;
        min-width: 2.5em;
    }

    .session__caps {
        display: flex;
        align-items: center;
        gap: 0.4em;
        flex-shrink: 1;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .session__resolution {
        color: ${secondaryColor};
        font-size: 0.95em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
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

        .session__quota {
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
