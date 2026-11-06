import React from "react";

import { Panel } from "@zero-design-system/react";
import type { PoolSlot } from "../../types/hub";

function slotLabel(slot: PoolSlot) {
    return slot.browser || slot.id || "unknown";
}

function slotProtocol(slot: PoolSlot) {
    return slot.protocol || "—";
}

function isReserved(slot: PoolSlot) {
    return Boolean(slot.reservedBy);
}

function formatAge(ageSec: number | undefined) {
    if (ageSec == null || ageSec < 0) return "—";
    if (ageSec < 60) return `${ageSec}s`;
    const min = Math.floor(ageSec / 60);
    if (min < 60) return `${min}m`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h${min % 60 ? `${min % 60}m` : ""}`;
    const days = Math.floor(hours / 24);
    return `${days}d${hours % 24 ? `${hours % 24}h` : ""}`;
}

function statusText(slot: PoolSlot) {
    if (slot.recycling) return "Recycling";
    if (isReserved(slot)) return `Reserved: ${slot.reservedBy}`;
    if (slot.recyclePending) return "Ready (recycle due)";
    return "Ready";
}

function statusTitle(slot: PoolSlot) {
    const parts: string[] = [];
    if (slot.reservedBy) parts.push(`owner: ${slot.reservedBy}`);
    if (slot.leaseExpiresAt) parts.push(`lease until: ${slot.leaseExpiresAt}`);
    if (slot.recyclePending) parts.push("recycle pending");
    return parts.join("; ");
}

const PoolSlots = ({
    title,
    testId,
    titleTestId,
    slots,
}: {
    title: string;
    testId: string;
    titleTestId: string;
    slots: PoolSlot[] | undefined;
}) => {
    const rows = Array.isArray(slots) ? slots : [];

    return (
        <div className="browsers">
            <Panel title={title} testId={testId} titleTestId={titleTestId} className="browsers-panel" bodyClassName="browsers-panel__body">
                <div className="browsers-table-wrap">
                    <table className="browsers-table">
                        <thead>
                            <tr>
                                <th scope="col">Browser</th>
                                <th scope="col">Protocol</th>
                                <th scope="col">Age</th>
                                <th scope="col">Sessions</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr data-testid="pool-slot-empty">
                                    <td className="empty" colSpan={5}>
                                        No slots
                                    </td>
                                </tr>
                            ) : (
                                rows.map((slot: PoolSlot, index: number) => {
                                    const busy = isReserved(slot) || Boolean(slot.recycling);
                                    return (
                                        <tr key={slot.id || `${slotLabel(slot)}-${index}`} data-testid="pool-slot-row">
                                            <td className="name">{slotLabel(slot)}</td>
                                            <td className="protocol">{slotProtocol(slot)}</td>
                                            <td className="protocol">{formatAge(slot.ageSec)}</td>
                                            <td className="protocol">{slot.sessionCount ?? "—"}</td>
                                            <td
                                                className={busy ? "status status--reserved" : "status status--ready"}
                                                title={statusTitle(slot) || undefined}
                                            >
                                                {statusText(slot)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </div>
    );
};

export default PoolSlots;
