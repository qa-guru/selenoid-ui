import { css } from "styled-components";

const secondaryColor = "var(--color-text-muted, #aaa)";
const manualColor = "#F0A202";
const colorBorder = "var(--color-border-strong, #555f6a)";

/** Shared live/finished-row identity: browser + version + resolution + name rail + cap badges. */
export const sessionIdentityCss = css`
    .session__fields {
        display: flex;
        align-items: center;
        gap: var(--space-4, 15px);
        flex: 1;
        min-width: 0;
        text-decoration: none;
        color: inherit;
    }

    a.session__fields:hover .name,
    a.session__fields:hover .session-name {
        color: var(--color-success, #59a781);
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

        .session__resolution {
            color: ${secondaryColor};
            font-size: 0.95em;
            font-weight: 300;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
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
    }

    .session-name:not(:first-child) {
        border-left: 2px solid ${colorBorder};
        padding-left: 8px;
    }

    .session_manual .session-name:not(:first-child) {
        border-color: ${manualColor};
    }

    .session__caps {
        display: flex;
        align-items: center;
        gap: 0.3em;
        flex-shrink: 1;
        flex-wrap: wrap;
        justify-content: flex-end;

        .badge {
            padding: 0 5px;
            font-size: 9px;
            font-weight: 600;
            line-height: 16px;
            letter-spacing: 0.04em;
        }
    }

    .session__quota {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${secondaryColor};
        font-size: 0.95em;
        font-weight: 300;
    }

    .session__quota_starting {
        display: inline-flex;
        align-items: center;
        min-width: 2.5em;
    }

    .session {
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

    .session .session__quota,
    .session-info .session__quota {
        flex: 0 1 96px;
        max-width: 120px;
    }

    .session__meta {
        display: inline-flex;
        align-items: baseline;
        gap: 0.75em;
        flex: 0 0 auto;
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
        /* 2 rows: id/quota/actions · browser/name/meta/caps — not 3 */
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

        .session__meta {
            order: 6;
        }

        .session__caps {
            order: 7;
            margin-left: 0;
            flex: 0 0 auto;
        }
    }
`;
