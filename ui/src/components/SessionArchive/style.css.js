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
        min-height: 52px;
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
        flex: 0 0 88px;
        color: var(--color-text, #fff);
        text-decoration: none;
        font-weight: 300;
        font-size: 1.05em;
        font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;

        &:hover {
            color: var(--color-success, #59a781);
        }
    }

    .archive__main {
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        flex: 1;
        min-width: 0;
        text-decoration: none;
        color: inherit;

        &:hover .archive__name {
            color: var(--color-success, #59a781);
        }
    }

    .archive__name {
        flex: 1 1 180px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 300;
        color: var(--color-text, #fff);
    }

    .archive__name_empty {
        flex: 0 0 auto;
        color: var(--color-text-muted, #aaa);
    }

    .archive__meta {
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        flex: 0 0 auto;
        margin-left: auto;
        min-width: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.92em;
        font-weight: 300;
    }

    .archive__quota,
    .archive__date,
    .archive__duration {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .archive__quota {
        flex: 0 1 96px;
        max-width: 120px;
    }

    .archive__date {
        flex: 0 0 auto;
    }

    .archive__duration {
        flex: 0 0 64px;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }

    .archive__actions {
        display: flex;
        align-items: center;
        gap: 0.35em;
        flex-shrink: 0;
        margin-left: auto;
    }

    .archive__artifacts {
        display: flex;
        align-items: center;
        gap: 0.25em;
        text-decoration: none;
        color: var(--color-text-muted, #aaa);
        min-width: 0;

        &:hover {
            color: var(--color-text, #fff);
        }
    }

    .archive__artifact-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        color: inherit;

        svg {
            width: 16px;
            height: 16px;
            display: block;
        }
    }

    .archive__empty-artifacts {
        color: var(--color-text-muted, #aaa);
        font-size: 0.9em;
        min-width: 22px;
        text-align: center;
    }

    .archive__actions .session-delete {
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

    @media (max-width: 720px) {
        .archive__row {
            flex-wrap: wrap;
            gap: 8px;
        }

        .archive__main {
            flex: 1 1 100%;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            order: 3;
        }

        .archive__meta {
            width: 100%;
            flex-wrap: wrap;
        }

        .archive__actions {
            margin-left: auto;
        }
    }
`;
