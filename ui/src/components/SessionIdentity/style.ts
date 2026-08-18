import { css } from "styled-components";

const secondaryColor = "var(--color-text-muted, #aaa)";
const manualColor = "#F0A202";

/** Shared live-row identity: browser + name rail + cap badges + resolution. */
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
    }

    .session-name {
        flex: 1 1 140px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 300;
        color: var(--color-text, #fff);
        border-left: 2px solid var(--color-border-strong, #555f6a);
        padding-left: 8px;
    }

    .session-name_empty {
        flex: 0 0 auto;
        color: ${secondaryColor};
    }

    .session_manual .session-name {
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

    .session__resolution {
        color: ${secondaryColor};
        font-size: 0.95em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
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
`;
