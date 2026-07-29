import React from "react";
import { StatusTile } from "@zero-design-system/react";

/**
 * Dashboard status cell on DS StatusTile (variant=tile).
 * Preserves `#${header}-status` and `${header}-status-badge` for e2e / RTL.
 * Feed statuses ok/stale/error map to StatusTile; unknown → disconnected.
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

const Status = ({ status = "unknown", header, version = "unknown", title }: any) => {
    const tooltip = title || `Version: ${version}`;
    const mapped = mapStatus(status);

    return (
        <StatusTile
            id={`${header}-status`}
            label={header}
            state={mapped.state}
            status={mapped.status}
            variant="tile"
            title={tooltip}
            data-testid={`${header}-status-badge`}
            aria-label={`${header} ${mapped.state}`}
        />
    );
};

export default Status;
