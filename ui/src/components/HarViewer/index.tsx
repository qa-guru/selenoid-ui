import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HarViewer as HarViewerTable, IconDownload, Panel } from "@zero-design-system/react";
import type { HarDetailTab } from "@zero-design-system/react";

const POLL_MS = 2500;
const MAX_ROWS = 200;

function harFileName(session: any, caps: any = {}) {
    const custom = String(caps.harName || caps.HARName || "").trim();
    if (custom) {
        return custom.endsWith(".har") ? custom : `${custom}.har`;
    }
    return `${session}.har`;
}

function wantsHar(caps: any = {}) {
    return Boolean(caps.enableHAR || caps.enableHar || caps.HAR);
}

/**
 * Session HAR shell: polls hub GET /har/<id>.har, Panel + download.
 * Presentational table lives in @zero-design-system/react HarViewer.
 */
const HarViewer = ({ session, browser = {}, sessionAlive = true, file: fileProp }: any) => {
    const caps = browser.caps || {};
    const enabled = Boolean(fileProp) || wantsHar(caps);
    const file = fileProp || harFileName(session, caps);
    const href = `/har/${file}`;

    const [phase, setPhase] = useState(enabled ? "waiting" : "idle");
    const [har, setHar] = useState<any>(null);
    const [error, setError] = useState("");
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [detailTab, setDetailTab] = useState<HarDetailTab>("headers");
    const aliveRef = useRef(sessionAlive);
    aliveRef.current = sessionAlive;

    const poll = useCallback(async () => {
        if (!session || !enabled) {
            return;
        }
        // While the session is live the hub may not expose /har/<id>.har yet — skip
        // fetch so Chromium does not log 404 "Failed to load resource" each poll tick.
        if (aliveRef.current && !fileProp) {
            setPhase("recording");
            setError("");
            return;
        }
        try {
            const res = await fetch(href, { cache: "no-store" });
            if (res.status === 404) {
                setPhase(aliveRef.current ? "recording" : "waiting");
                setError("");
                return;
            }
            if (!res.ok) {
                setPhase("error");
                setError(`HTTP ${res.status}`);
                return;
            }
            const data = await res.json();
            const entries = data?.log?.entries;
            if (!Array.isArray(entries)) {
                setPhase("error");
                setError("Invalid HAR (missing log.entries)");
                return;
            }
            setHar(data);
            setPhase("ready");
            setError("");
        } catch (err) {
            setPhase("error");
            setError(err instanceof Error ? err.message : "Failed to load HAR");
        }
    }, [enabled, href, session, fileProp]);

    useEffect(() => {
        if (!enabled || !session) {
            setPhase("idle");
            setHar(null);
            return undefined;
        }
        let cancelled = false;
        const tick = async () => {
            if (!cancelled) {
                await poll();
            }
        };
        tick();
        const id = setInterval(tick, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [enabled, session, poll]);

    const entries = useMemo(() => {
        const list = har?.log?.entries || [];
        return list.slice(0, MAX_ROWS);
    }, [har]);

    const toggleRow = useCallback((idx: number) => {
        setExpandedIdx((prev) => {
            if (prev === idx) {
                return null;
            }
            setDetailTab("headers");
            return idx;
        });
    }, []);

    if (!enabled) {
        return null;
    }

    let empty: React.ReactNode = null;
    if (phase !== "ready") {
        if (phase === "recording") {
            empty = "Hub is capturing network over CDP. The .har file is written when the session ends.";
        } else if (phase === "waiting") {
            empty = "Session ended — polling for the flushed HAR file…";
        } else if (phase === "error") {
            empty = error;
        }
    }

    return (
        <div className="har-viewer" data-testid="session-har-viewer">
            <Panel
                variant="terminal"
                title="HAR Viewer"
                barChrome
                testId="session-har-panel"
                titleTestId="session-har-title"
                className="har-card"
                bodyClassName="har-card__body"
                actions={[
                    {
                        icon: <IconDownload />,
                        label: "Download",
                        onClick: () => {
                            const a = document.createElement("a");
                            a.href = href;
                            a.download = file;
                            a.click();
                        },
                        "data-testid": "session-har-download",
                    },
                ]}
            >
                {phase === "ready" ? (
                    <HarViewerTable
                        entries={entries}
                        expandedIndex={expandedIdx}
                        detailTab={detailTab}
                        onToggleRow={toggleRow}
                        onDetailTabChange={setDetailTab}
                        testId="session-har-table"
                    />
                ) : (
                    <div className="har-empty" data-testid="session-har-empty">
                        {empty}
                    </div>
                )}
            </Panel>
        </div>
    );
};

export default HarViewer;
export { harFileName, wantsHar };
export { formatSize, formatTiming } from "@zero-design-system/react";
