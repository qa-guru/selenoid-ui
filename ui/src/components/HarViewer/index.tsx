import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HarViewer as HarViewerTable, IconDownload, Panel } from "@zero-design-system/react";
import type { HarDetailTab } from "@zero-design-system/react";
import { fullscreenAction } from "../fullscreenAction";
import {
    DEFAULT_STACK_AUTH_LOGIN,
    DEFAULT_STACK_AUTH_ME,
    DEFAULT_STACK_FAVICON,
    DEFAULT_STACK_LOGIN,
    DEFAULT_STACK_USER,
} from "../../lib/defaultStack";

const POLL_MS = 2500;
const MAX_ROWS = 200;

/** Live `?mock=1` layout fixture — hub only writes `/har/<id>.har` when the session ends. */
const MOCK_HAR = {
    log: {
        version: "1.2",
        creator: { name: "selenoid-ui", version: "mock" },
        entries: [
            {
                time: 86,
                request: {
                    method: "GET",
                    url: DEFAULT_STACK_LOGIN,
                    headers: [
                        { name: "Accept", value: "text/html" },
                        { name: "User-Agent", value: "selenoid" },
                    ],
                },
                response: {
                    status: 200,
                    statusText: "OK",
                    headers: [
                        { name: "Content-Type", value: "text/html; charset=utf-8" },
                        { name: "Cache-Control", value: "no-store" },
                        { name: "Set-Cookie", value: "sid=mock; Path=/" },
                    ],
                    content: {
                        size: 4096,
                        mimeType: "text/html",
                        text: "<html><body>login</body></html>",
                    },
                },
                timings: { blocked: 1, dns: 2, connect: 8, ssl: 12, send: 1, wait: 54, receive: 8 },
            },
            {
                time: 18,
                request: {
                    method: "POST",
                    url: DEFAULT_STACK_AUTH_LOGIN,
                    headers: [{ name: "Accept", value: "application/json" }],
                },
                response: {
                    status: 200,
                    statusText: "OK",
                    headers: [
                        { name: "Content-Type", value: "application/json" },
                        { name: "X-Request-Id", value: "mock-session-1" },
                    ],
                    content: {
                        size: 128,
                        mimeType: "application/json",
                        text: `{"username":"${DEFAULT_STACK_USER}"}`,
                    },
                },
                timings: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 1, wait: 14, receive: 3 },
            },
            {
                time: 42,
                request: {
                    method: "GET",
                    url: DEFAULT_STACK_AUTH_ME,
                    headers: [{ name: "Accept", value: "application/json" }],
                },
                response: {
                    status: 200,
                    statusText: "OK",
                    headers: [{ name: "Content-Type", value: "application/json" }],
                    content: {
                        size: 256,
                        mimeType: "application/json",
                        text: `{"username":"${DEFAULT_STACK_USER}"}`,
                    },
                },
                timings: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 1, wait: 36, receive: 5 },
            },
            {
                time: 31,
                request: {
                    method: "GET",
                    url: DEFAULT_STACK_FAVICON,
                    headers: [{ name: "Accept", value: "*/*" }],
                },
                response: {
                    status: 404,
                    statusText: "Not Found",
                    headers: [{ name: "Content-Type", value: "text/plain" }],
                    content: { size: 19, mimeType: "text/plain", text: "Not Found" },
                },
                timings: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 1, wait: 28, receive: 2 },
            },
        ],
    },
};

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
const HarViewer = ({
    session,
    browser = {},
    sessionAlive = true,
    file: fileProp,
    fullscreen,
    onToggleFullscreen,
    mockEnabled = false,
}: any) => {
    const caps = browser.caps || {};
    const enabled = Boolean(fileProp) || wantsHar(caps);
    const file = fileProp || harFileName(session, caps);
    const href = `/har/${file}`;
    const useMockHar = Boolean(mockEnabled && enabled && !fileProp);

    const [phase, setPhase] = useState(useMockHar ? "ready" : enabled ? "waiting" : "idle");
    const [har, setHar] = useState<any>(useMockHar ? MOCK_HAR : null);
    const [error, setError] = useState("");
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [detailTab, setDetailTab] = useState<HarDetailTab>("headers");
    const aliveRef = useRef(sessionAlive);
    aliveRef.current = sessionAlive;

    const poll = useCallback(async () => {
        if (!session || !enabled) {
            return;
        }
        if (useMockHar) {
            setHar(MOCK_HAR);
            setPhase("ready");
            setError("");
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
    }, [enabled, href, session, fileProp, useMockHar]);

    useEffect(() => {
        if (!enabled || !session) {
            setPhase("idle");
            setHar(null);
            return undefined;
        }
        if (useMockHar) {
            setHar(MOCK_HAR);
            setPhase("ready");
            setError("");
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
        <div
            className={`har-viewer${fullscreen ? " panel-host--fullscreen" : ""}`}
            data-testid="session-har-viewer"
        >
            <Panel
                variant="terminal"
                title="HAR Viewer"
                barChrome
                testId="session-har-panel"
                titleTestId="session-har-title"
                className="har-card"
                bodyClassName="har-card__body"
                actions={[
                    ...(onToggleFullscreen
                        ? [fullscreenAction(Boolean(fullscreen), onToggleFullscreen, "session-har-fullscreen")]
                        : []),
                    {
                        icon: <IconDownload />,
                        label: "Download",
                        onClick: () => {
                            const a = document.createElement("a");
                            if (useMockHar) {
                                const blob = new Blob([JSON.stringify(MOCK_HAR, null, 2)], {
                                    type: "application/json",
                                });
                                a.href = URL.createObjectURL(blob);
                            } else {
                                a.href = href;
                            }
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
