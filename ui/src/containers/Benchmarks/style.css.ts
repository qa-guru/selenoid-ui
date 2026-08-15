import styled from "styled-components";

export const StyledBenchmarks = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 20px var(--page-padding-x, 16px) 40px;
    color: var(--color-text, #fff);

    h1 {
        margin: 0 0 8px;
        font-size: 1.35em;
        font-weight: 400;
    }

    .benchmarks__lead {
        margin: 0 0 20px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.9em;
        font-weight: 300;
        max-width: 72ch;
    }

    .benchmarks__filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        margin-bottom: 24px;
        align-items: end;
    }

    .benchmarks__filter {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.75em;
        color: var(--color-text-muted, #aaa);
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .benchmarks__filter select {
        min-width: 7.5em;
        background: var(--color-surface, #2a3038);
        color: var(--color-text, #fff);
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 0.95em;
        text-transform: none;
        letter-spacing: 0;
    }

    .benchmarks__section {
        margin-bottom: 28px;
    }

    .benchmarks__section h2 {
        margin: 0 0 6px;
        font-size: 1.05em;
        font-weight: 400;
    }

    .benchmarks__hint {
        margin: 0 0 10px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.8em;
        font-weight: 300;
    }

    .benchmarks__scroll {
        width: 100%;
        overflow-x: auto;
        border: 1px solid var(--color-border-strong, #555f6a);
        border-radius: 4px;
    }

    table.benchmarks__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82em;
        font-variant-numeric: tabular-nums;
        min-width: 720px;
    }

    table.benchmarks__table th,
    table.benchmarks__table td {
        padding: 8px 10px;
        border-bottom: 1px dashed var(--color-border-strong, #555f6a);
        text-align: left;
        white-space: nowrap;
    }

    table.benchmarks__table th {
        position: sticky;
        top: 0;
        background: var(--color-surface, #1e242c);
        color: var(--color-text-muted, #aaa);
        font-weight: 400;
        z-index: 1;
    }

    table.benchmarks__table td {
        font-weight: 300;
    }

    table.benchmarks__table tr[data-status="pending"] td,
    table.benchmarks__table tr[data-status="n/a"] td,
    table.benchmarks__table tr[data-status="stub"] td {
        color: var(--color-text-muted, #888);
    }

    .benchmarks__har a,
    .benchmarks__table a,
    .benchmarks__hint a {
        color: var(--color-success, #59a781);
        text-decoration: none;
    }

    .benchmarks__har a:hover,
    .benchmarks__table a:hover,
    .benchmarks__hint a:hover {
        text-decoration: underline;
    }

    .benchmarks__empty {
        padding: 16px;
        color: var(--color-text-muted, #aaa);
        font-size: 0.85em;
    }
`;
