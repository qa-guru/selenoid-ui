import styled from "styled-components";
import { sessionIdentityCss } from "../SessionIdentity/style";

const colorBorder = "var(--color-border-strong, #555f6a)";

export const StyledArchive = styled.div`
    ${sessionIdentityCss}
    box-sizing: border-box;
    width: 100%;
    padding: var(--wt-post-gap, 14px);

    .archive-panel {
        width: 100%;
    }

    .archive-panel__body {
        padding: 0;
        min-height: 52px;
    }

    /* rem/px only — em would follow header 0.72rem vs row 0.82em and drift. */
    --archive-cols: 76px 96px minmax(0, 1fr) 110px 90px 120px 22px;

    .archive__grid-wrap {
        overflow-x: auto;
        padding: 0 var(--space-5, 16px);
        box-sizing: border-box;
    }

    .archive__sort-bar,
    .archive__list .archive__row {
        display: grid;
        grid-template-columns: var(--archive-cols);
        column-gap: var(--space-4, 15px);
        align-items: center;
        min-width: 720px;
        box-sizing: border-box;
    }

    .archive__sort-bar {
        padding: 10px 0 8px;
        border-bottom: 1px solid ${colorBorder};
        color: var(--color-text-muted, #aaa);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }

    .archive__list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0;
        box-sizing: border-box;
    }

    .archive__list .archive__row {
        flex-wrap: nowrap;
        overflow: hidden;
    }

    .archive__list .archive__row::after {
        content: none;
        display: none;
    }

    .archive__list .archive__row .session__id,
    .archive__list .archive__row .session__quota,
    .archive__list .archive__row .session__fields,
    .archive__list .archive__row .session__date,
    .archive__list .archive__row .session__duration,
    .archive__list .archive__row .session__caps,
    .archive__list .archive__row .session__actions {
        order: 0;
        margin-left: 0;
        min-width: 0;
    }

    .archive__list .archive__row .session__quota {
        flex: none;
        max-width: none;
    }

    .archive__list .archive__row .session__date,
    .archive__list .archive__row .session__duration {
        color: var(--color-text-muted, #aaa);
        font-size: 0.95em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .archive__list .archive__row .session__caps {
        justify-self: end;
        flex-wrap: nowrap;
    }

    .archive__list .archive__row .session__actions {
        justify-self: end;
    }

    @media (max-width: 720px) {
        .archive__list .archive__row {
            flex-wrap: nowrap;
        }

        .archive__list .archive__row .session__quota {
            flex: none;
            max-width: none;
        }
    }

    .archive__sort {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0;
        margin: 0;
        border: 0;
        background: none;
        font: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        color: inherit;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
        justify-self: start;

        &:hover {
            color: var(--color-text, #fff);

            &::after {
                color: var(--color-text, #fff);
                opacity: 1;
            }
        }

        &:focus {
            outline: none;
        }

        &:focus-visible {
            box-shadow: inset 0 0 0 1px var(--color-success, #59a781);
            border-radius: 2px;
        }

        &::after {
            content: "↕";
            flex-shrink: 0;
            font-size: 0.68rem;
            line-height: 1;
            color: var(--color-text-muted, #aaa);
            opacity: 0.9;
        }

        &[aria-sort="ascending"] {
            color: var(--color-success, #59a781);

            &::after {
                content: "↑";
                color: var(--color-success, #59a781);
                opacity: 1;
            }
        }

        &[aria-sort="descending"] {
            color: var(--color-success, #59a781);

            &::after {
                content: "↓";
                color: var(--color-success, #59a781);
                opacity: 1;
            }
        }
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
        min-height: 52px;
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
