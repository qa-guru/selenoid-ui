import React from "react";
import { StatusTile, SelenoidMetrics } from "@zero-design-system/react";

/**
 * Compact live-stats cluster portaled into the canonical header `.header__slot`.
 *
 * Canon: design-system `status-tile--header` + `selenoid-metrics--header`
 * (`preview/header-variant-selenoid.html`) via `@zero-design-system/react`.
 * Preserves `#sse-status` / `#selenoid-status` and `*-status-badge` testids
 * for e2e / Viewport RTL.
 */

/** @param {string | undefined} status */
function mapStatus(status: any): any {
    switch (status) {
        case "ok":
            return { status: "ok", state: "Connected" };
        case "stale":
            return { status: "stale", state: "Stale" };
        case "error":
            return { status: "error", state: "Issue" };
        default:
            return { status: "disconnected", state: "Unknown" };
    }
}

/** @param {number} total @param {number} used @param {number} pending */
function usedPercent(total: any, used: any, pending: any) {
    return total > 0 ? Math.round(((used + pending) / total) * 100) : 0;
}

/**
 * @param {object} props
 * @param {{ total?: number, used?: number, pending?: number, queued?: number, warmReady?: number, warmTotal?: number, hotReady?: number, hotTotal?: number }} props.state
 * @param {string} props.sseStatus
 * @param {string} props.selenoidStatus
 * @param {string} props.version
 * @param {string} props.statusTitle
 */
const HeaderStats = ({ state, sseStatus, selenoidStatus, version, statusTitle }: any) => {
    const sse = mapStatus(sseStatus);
    const hub = mapStatus(selenoidStatus);
    const tooltip = statusTitle || `Version: ${version}`;
    const total = state.total ?? 0;
    const used = state.used ?? 0;
    const pending = state.pending ?? 0;
    const queued = state.queued ?? 0;
    const warmReady = state.warmReady ?? 0;
    const warmTotal = state.warmTotal ?? 0;
    const hotReady = state.hotReady ?? 0;
    const hotTotal = state.hotTotal ?? 0;

    return (
        <div className="selenoid-header-group" data-testid="header-live-stats">
            <span className="plaque-divider" aria-hidden="true" />
            <StatusTile
                id="sse-status"
                label="SSE"
                state={sse.state}
                status={sse.status}
                variant="header"
                title={tooltip}
                data-testid="sse-status-badge"
                aria-label={`SSE ${sse.state}`}
            />
            <span className="plaque-divider" aria-hidden="true" />
            <StatusTile
                id="selenoid-status"
                label="Selenoid"
                state={hub.state}
                status={hub.status}
                variant="header"
                title={tooltip}
                data-testid="selenoid-status-badge"
                aria-label={`Selenoid ${hub.state}`}
            />
            <span className="plaque-divider" aria-hidden="true" />
            <SelenoidMetrics
                usedPercent={usedPercent(total, used, pending)}
                queued={queued}
                warmReady={warmReady}
                warmTotal={warmTotal}
                hotReady={hotReady}
                hotTotal={hotTotal}
                quotaUsed={used}
                quotaPending={pending}
                quotaTotal={total}
                variant="header"
            />
        </div>
    );
};

export default HeaderStats;
