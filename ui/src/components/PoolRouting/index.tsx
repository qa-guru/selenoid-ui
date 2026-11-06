import React from "react";

import { Panel } from "@zero-design-system/react";
import type { PoolRoute, PoolRouting } from "../../types/hub";

function routeLabel(route: PoolRoute) {
    const served = route.pool || "cold";
    const requested = route.requested || "auto";
    return requested === served ? served : `${requested} → ${served}`;
}

function shortSession(id: string | undefined) {
    if (!id) return "—";
    return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

const PoolRoutingPanel = ({ routing }: { routing: PoolRouting | undefined }) => {
    const recent = Array.isArray(routing?.recent) ? routing!.recent! : [];

    return (
        <div className="browsers">
            <Panel
                title="Pool routing"
                testId="pool-routing-panel"
                titleTestId="pool-routing-title"
                className="browsers-panel"
                bodyClassName="browsers-panel__body"
            >
                <div className="browsers-table-wrap">
                    <table className="browsers-table" data-testid="pool-routing-counters">
                        <tbody>
                            <tr>
                                <td className="name">Served warm</td>
                                <td className="protocol">{routing?.warmServed ?? 0}</td>
                            </tr>
                            <tr>
                                <td className="name">Served cold</td>
                                <td className="protocol">{routing?.coldServed ?? 0}</td>
                            </tr>
                            <tr>
                                <td className="name">Warm fallbacks</td>
                                <td className="protocol">{routing?.warmFallbacks ?? 0}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="browsers-table">
                        <thead>
                            <tr>
                                <th scope="col">Session</th>
                                <th scope="col">Route</th>
                                <th scope="col">Slot</th>
                                <th scope="col">Reason</th>
                                <th scope="col">At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.length === 0 ? (
                                <tr data-testid="pool-routing-empty">
                                    <td className="empty" colSpan={5}>
                                        No routed sessions yet
                                    </td>
                                </tr>
                            ) : (
                                recent.map((route: PoolRoute, index: number) => (
                                    <tr key={`${route.session || "session"}-${index}`} data-testid="pool-route-row">
                                        <td className="name" title={route.session || undefined}>
                                            {shortSession(route.session)}
                                        </td>
                                        <td className="protocol">{routeLabel(route)}</td>
                                        <td className="protocol">{route.slot || "—"}</td>
                                        <td className="protocol">{route.reason || "—"}</td>
                                        <td className="protocol">{route.at || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </div>
    );
};

export default PoolRoutingPanel;
