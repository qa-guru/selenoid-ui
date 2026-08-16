import styled from "styled-components";

export const StyledDocs = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 20px var(--page-padding-x, 16px) 40px;
    color: var(--color-text, #fff);

    h1 {
        margin: 0 0 8px;
        font-size: 1.35em;
        font-weight: 400;
    }

    .docs__lead,
    .docs__meta,
    .docs__footnote {
        margin: 0 0 12px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.9em;
        font-weight: 300;
        max-width: 72ch;
    }

    .docs__meta,
    .docs__footnote {
        font-size: 0.8em;
    }

    .docs__stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin: 16px 0 20px;
    }

    @media (max-width: 768px) {
        .docs__stats {
            grid-template-columns: 1fr;
        }
    }

    .docs__stat {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        padding: 12px 14px;
        background: var(--color-surface, #2a3038);
    }

    .docs__stat-value {
        display: block;
        font-size: 1.35em;
        font-variant-numeric: tabular-nums;
        font-weight: 400;
        margin-bottom: 4px;
    }

    .docs__stat[data-tone="success"] .docs__stat-value {
        color: var(--color-success, #59a781);
    }

    .docs__stat-label {
        display: block;
        color: var(--color-text-muted, #aaa);
        font-size: 0.8em;
        font-weight: 300;
    }

    .docs__callout {
        border: 1px solid var(--color-border-strong, #555f6a);
        border-left: 3px solid var(--color-info, #5b9fd6);
        border-radius: 4px;
        padding: 12px 14px;
        margin: 0 0 24px;
        background: var(--color-surface, #2a3038);
        max-width: 88ch;
    }

    .docs__callout h2 {
        margin: 0 0 6px;
        font-size: 0.95em;
        font-weight: 400;
    }

    .docs__callout p {
        margin: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.85em;
        font-weight: 300;
    }

    .docs__section {
        margin-bottom: 28px;
    }

    .docs__section h2 {
        margin: 0 0 10px;
        font-size: 1.05em;
        font-weight: 400;
    }

    .docs__scroll {
        width: 100%;
        overflow-x: auto;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
    }

    table.docs__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82em;
        min-width: 720px;
    }

    table.docs__table--run {
        min-width: 480px;
    }

    table.docs__table th,
    table.docs__table td {
        padding: 10px 12px;
        border-bottom: 1px dashed var(--color-border-strong, #555f6a);
        text-align: left;
        vertical-align: top;
    }

    table.docs__table th {
        background: var(--color-surface, #1e242c);
        color: var(--color-text-muted, #aaa);
        font-weight: 400;
    }

    table.docs__table thead th {
        position: sticky;
        top: 0;
        z-index: 2;
    }

    table.docs__table tbody th,
    table.docs__table tbody td:first-child {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--color-surface, #1e242c);
        font-weight: 400;
        white-space: nowrap;
        min-width: 11em;
    }

    table.docs__table thead th:first-child {
        z-index: 3;
        left: 0;
    }

    table.docs__table td {
        font-weight: 300;
        min-width: 16em;
    }

    .docs-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .docs-cell__human {
        margin: 0;
        font-weight: 400;
        color: var(--color-text, #fff);
    }

    .docs-cell__tech {
        margin: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.92em;
        font-weight: 300;
    }
`;
