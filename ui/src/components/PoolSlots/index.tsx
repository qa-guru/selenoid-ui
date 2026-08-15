import React from "react";

import { Panel } from "@zero-design-system/react";
import { StyledBrowsers } from "../Browsers/style.css";
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
        <StyledBrowsers>
            <Panel title={title} testId={testId} titleTestId={titleTestId} className="browsers-panel" bodyClassName="browsers-panel__body">
                <div className="browsers-table-wrap">
                    <table className="browsers-table">
                        <thead>
                            <tr>
                                <th scope="col">Browser</th>
                                <th scope="col">Protocol</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr data-testid="pool-slot-empty">
                                    <td className="empty" colSpan={3}>
                                        No slots
                                    </td>
                                </tr>
                            ) : (
                                rows.map((slot: PoolSlot, index: number) => {
                                    const reserved = isReserved(slot);
                                    return (
                                        <tr key={slot.id || `${slotLabel(slot)}-${index}`} data-testid="pool-slot-row">
                                            <td className="name">{slotLabel(slot)}</td>
                                            <td className="protocol">{slotProtocol(slot)}</td>
                                            <td className={reserved ? "status status--reserved" : "status status--ready"}>
                                                {reserved ? "Reserved" : "Ready"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </StyledBrowsers>
    );
};

export default PoolSlots;
