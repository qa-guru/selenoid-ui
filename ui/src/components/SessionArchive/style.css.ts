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

    .archive__table-wrap {
        padding: 0 var(--space-5, 16px);
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
    }

    .archive__table {
        width: 100%;
        min-width: 640px;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 0.82em;
    }

    .archive__col_id {
        width: 76px;
    }

    .archive__col_date {
        width: 8.75em;
    }

    .archive__col_duration {
        width: 7.5em;
    }

    .archive__col_quota {
        width: 96px;
    }

    .archive__col_name {
        width: auto;
    }

    .archive__col_actions {
        /* video + log + har (3×22px) + gaps + delete — 72px clipped the trash icon */
        width: 104px;
    }

    .archive__table thead th {
        padding: 10px 0 8px;
        border-bottom: 1px solid ${colorBorder};
        color: var(--color-text-muted, #aaa);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        text-align: left;
        vertical-align: middle;
        white-space: nowrap;
    }

    .archive__table tbody td {
        padding: 8px 0;
        border-bottom: 1px dashed ${colorBorder};
        color: var(--color-text, #fff);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .archive__table tbody tr:hover .archive__id,
    .archive__table tbody tr:hover .archive__name {
        color: var(--color-success, #59a781);
    }

    .archive__row_clickable {
        cursor: pointer;
    }

    .archive__row_clickable:focus {
        outline: none;
    }

    .archive__row_clickable:focus-visible {
        box-shadow: inset 0 0 0 1px var(--color-success, #59a781);
    }

    .archive__row-link {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-decoration: none;
        color: inherit;
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
            font-size: 0.62rem;
            opacity: 0.35;
        }

        &[aria-sort="ascending"] {
            color: var(--color-success, #59a781);

            &::after {
                content: "↑";
                opacity: 1;
            }
        }

        &[aria-sort="descending"] {
            color: var(--color-success, #59a781);

            &::after {
                content: "↓";
                opacity: 1;
            }
        }
    }

    .archive__id {
        color: var(--color-text, #fff);
        font-weight: 300;
        font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
        font-variant-numeric: tabular-nums;
    }

    .archive__date,
    .archive__duration,
    .archive__quota {
        color: var(--color-text-muted, #aaa);
        font-size: 0.95em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
    }

    .archive__quota_empty,
    .archive__name_empty {
        color: var(--color-text-muted, #aaa);
    }

    .archive__name {
        font-weight: 300;
        color: var(--color-text, #fff);
    }

    .archive__table tbody td.archive__col_actions {
        overflow: visible;
    }

    .archive__col_actions {
        text-align: right;
    }

    .archive__actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.35em;
        flex-shrink: 0;
    }

    .archive__artifacts {
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
        text-decoration: none;
        color: var(--color-text-muted, #aaa);

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
`;
