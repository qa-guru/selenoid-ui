import styled from "styled-components";

export const StyledHarViewer = styled.div`
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    padding: 0 var(--wt-post-gap, 14px) var(--wt-post-gap, 14px);
    margin: 0;

    .har-card {
        width: 100%;
    }

    .har-card__body {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 160px;
        max-height: min(48vh, 520px);
        padding: 0;
        overflow: hidden;
    }

    .har-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 8px 12px;
        border-bottom: 1px solid var(--color-border, #3d444c);
        color: var(--color-text-muted, #999);
        font-size: 12px;
    }

    .har-toolbar__status {
        color: var(--color-text, #ccc);
    }

    .har-toolbar__actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .har-toolbar__link {
        color: var(--color-accent, #6cb6ff);
        text-decoration: none;
    }

    .har-toolbar__link:hover {
        text-decoration: underline;
    }

    .har-empty {
        padding: 24px 16px;
        color: var(--color-text-muted, #999);
        font-size: 13px;
        line-height: 1.45;
        text-align: center;
    }

    .har-table-wrap {
        overflow: auto;
        flex: 1;
    }

    .har-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        line-height: 1.35;
        color: var(--color-text, #ccc);
    }

    .har-table th,
    .har-table td {
        padding: 4px 8px;
        border-bottom: 1px solid var(--color-border, #3d444c);
        text-align: left;
        vertical-align: top;
        white-space: nowrap;
    }

    .har-table th {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--panel-bg, #1a1917);
        color: var(--color-text-muted, #999);
        font-weight: 600;
    }

    .har-table tbody tr:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .har-method {
        font-weight: 600;
        color: #89d185;
    }

    .har-url {
        max-width: 0;
        width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .har-mime {
        color: var(--color-text-muted, #999);
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .har-status--ok {
        color: #89d185;
    }
    .har-status--redir {
        color: #6cb6ff;
    }
    .har-status--warn {
        color: #cca700;
    }
    .har-status--err {
        color: #f48771;
    }
    .har-status--muted {
        color: var(--color-text-muted, #999);
    }
`;
