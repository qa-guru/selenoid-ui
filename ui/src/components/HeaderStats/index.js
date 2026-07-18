import React from "react";
import PropTypes from "prop-types";
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
function mapStatus(status) {
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
function usedPercent(total, used, pending) {
    return total > 0 ? Math.round(((used + pending) / total) * 100) : 0;
}

/**
 * @param {object} props
 * @param {{ total?: number, used?: number, pending?: number, queued?: number }} props.state
 * @param {string} props.sseStatus
 * @param {string} props.selenoidStatus
 * @param {string} props.version
 * @param {string} props.statusTitle
 */
const HeaderStats = ({ state, sseStatus, selenoidStatus, version, statusTitle }) => {
    const sse = mapStatus(sseStatus);
    const hub = mapStatus(selenoidStatus);
    const tooltip = statusTitle || `Version: ${version}`;
    const total = state.total ?? 0;
    const used = state.used ?? 0;
    const pending = state.pending ?? 0;
    const queued = state.queued ?? 0;

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
                quotaUsed={used}
                quotaPending={pending}
                quotaTotal={total}
                variant="header"
            />
        </div>
    );
};

HeaderStats.propTypes = {
    state: PropTypes.shape({
        total: PropTypes.number,
        used: PropTypes.number,
        pending: PropTypes.number,
        queued: PropTypes.number,
    }).isRequired,
    sseStatus: PropTypes.string,
    selenoidStatus: PropTypes.string,
    version: PropTypes.string,
    statusTitle: PropTypes.string,
};

export default HeaderStats;
