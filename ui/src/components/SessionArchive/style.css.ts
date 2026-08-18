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

    .archive__sort-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem 1rem;
        padding: 10px var(--space-5, 16px) 8px;
        border-bottom: 1px solid ${colorBorder};
        color: var(--color-text-muted, #aaa);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        box-sizing: border-box;
    }

    .archive__list {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 0 var(--space-5, 16px);
        box-sizing: border-box;
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
