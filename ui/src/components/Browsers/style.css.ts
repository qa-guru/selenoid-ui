import styled from "styled-components";

export const StyledBrowsers = styled.div`
    color: var(--color-text, #fff);
    width: 100%;
    max-width: 520px;
    flex: 1 1 280px;
    min-width: 0;

    .browsers-panel {
        width: 100%;
    }

    .browsers-panel__body {
        padding: 0;
    }

    .browsers-table-wrap {
        overflow-x: auto;
        overflow-y: auto;
        width: 100%;
    }

    .browsers-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        line-height: 1.35;
        color: var(--color-text, #fff);
    }

    .browsers-table th,
    .browsers-table td {
        padding: 10px 14px;
        border-bottom: 1px solid var(--color-border, #3d444c);
        text-align: left;
        vertical-align: middle;
    }

    .browsers-table th {
        color: var(--color-text-muted, #999);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: var(--panel-bar-bg, transparent);
    }

    .browsers-table tbody tr:last-child td {
        border-bottom: none;
    }

    .browsers-table tbody tr:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .browsers-table .name {
        letter-spacing: 0.5px;
        word-break: break-word;
        white-space: normal;
    }

    .browsers-table .count {
        font-size: 1.35em;
        font-variant-numeric: tabular-nums;
        width: 72px;
        white-space: nowrap;
    }

    .browsers-table .share {
        width: 96px;
        white-space: nowrap;
    }

    .browsers-table .percent {
        font-size: 0.85em;
        color: var(--color-text-muted, #aaa);
        font-variant-numeric: tabular-nums;
    }

    .browsers-table .protocol {
        color: var(--color-text-muted, #aaa);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .browsers-table .status {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }

    .browsers-table .status--ready {
        color: var(--color-info, #5b9fd6);
    }

    .browsers-table .status--reserved {
        color: var(--color-warning, #e3b341);
    }

    .browsers-table .empty {
        color: var(--color-text-muted, #aaa);
        font-style: italic;
    }

    .usage-track {
        margin-top: 6px;
        height: 2px;
        width: 100%;
        min-width: 56px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
    }

    .usage-bar {
        height: 100%;
        transition: width 300ms ease-in, background-color 300ms ease-in;
    }
`;
