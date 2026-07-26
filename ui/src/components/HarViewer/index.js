import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Panel } from "@zero-design-system/react";

import { StyledHarViewer } from "./style.css";

const POLL_MS = 2500;
const MAX_ROWS = 200;

function harFileName(session, caps = {}) {
    const custom = String(caps.harName || caps.HARName || "").trim();
    if (custom) {
        return custom.endsWith(".har") ? custom : `${custom}.har`;
    }
    return `${session}.har`;
}

function wantsHar(caps = {}) {
    return Boolean(caps.enableHAR || caps.enableHar || caps.HAR);
}

function formatSize(n) {
    const v = Number(n) || 0;
    if (v < 1024) {
        return `${v} B`;
    }
    if (v < 1024 * 1024) {
        return `${(v / 1024).toFixed(1)} KB`;
    }
    return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status) {
    if (status >= 500) {
        return "har-status--err";
    }
    if (status >= 400) {
        return "har-status--warn";
    }
    if (status >= 300) {
        return "har-status--redir";
    }
    if (status > 0) {
        return "har-status--ok";
    }
    return "har-status--muted";
}

/**
 * Full-width Session HAR panel. Polls hub GET /har/<id>.har (via UI proxy) while
 * enableHAR is on; renders entries after the hub flushes the archive on session end.
 * Hub CDP capture — not Playwright client recordHar.
 */
const HarViewer = ({ session, browser = {}, sessionAlive = true }) => {
    const caps = browser.caps || {};
    const enabled = wantsHar(caps);
    const file = harFileName(session, caps);
    const href = `/har/${file}`;

    const [phase, setPhase] = useState(enabled ? "waiting" : "idle");
    const [har, setHar] = useState(null);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState(null);
    const aliveRef = useRef(sessionAlive);
    aliveRef.current = sessionAlive;

    const poll = useCallback(async () => {
        if (!session || !enabled) {
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
            setUpdatedAt(new Date());
        } catch (err) {
            setPhase("error");
            setError(err?.message || "Failed to load HAR");
        }
    }, [enabled, href, session]);

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

    const summary = useMemo(() => {
        if (!har?.log) {
            return "";
        }
        const all = har.log.entries || [];
        const creator = har.log.creator?.name || "hub";
        return `${all.length} entries · ${creator}${all.length > MAX_ROWS ? ` · showing ${MAX_ROWS}` : ""}`;
    }, [har]);

    if (!enabled) {
        return null;
    }

    return (
        <StyledHarViewer data-testid="session-har-viewer">
            <Panel
                variant="terminal"
                title="HAR"
                testId="session-har-panel"
                titleTestId="session-har-title"
                className="har-card"
                bodyClassName="har-card__body"
            >
                <div className="har-toolbar">
                    <span className="har-toolbar__status" data-testid="session-har-status">
                        {phase === "recording" && "Recording (hub CDP)…"}
                        {phase === "waiting" && "Waiting for /har archive…"}
                        {phase === "ready" && summary}
                        {phase === "error" && `Error: ${error}`}
                        {phase === "idle" && "Idle"}
                    </span>
                    <div className="har-toolbar__actions">
                        {updatedAt && <span className="har-toolbar__meta">{updatedAt.toLocaleTimeString()}</span>}
                        <a className="har-toolbar__link" href={href} download={file} data-testid="session-har-download">
                            Download
                        </a>
                    </div>
                </div>

                {phase === "ready" ? (
                    <div className="har-table-wrap">
                        <table className="har-table">
                            <thead>
                                <tr>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>URL</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, idx) => {
                                    const req = entry.request || {};
                                    const resp = entry.response || {};
                                    const content = resp.content || {};
                                    const status = Number(resp.status) || 0;
                                    return (
                                        <tr key={`${req.url}-${idx}`}>
                                            <td className="har-method">{req.method || ""}</td>
                                            <td className={statusClass(status)}>{status || "—"}</td>
                                            <td className="har-url" title={req.url}>
                                                {req.url || ""}
                                            </td>
                                            <td className="har-mime">{content.mimeType || ""}</td>
                                            <td>{formatSize(content.size)}</td>
                                            <td>{Math.round(Number(entry.time) || 0)} ms</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="har-empty" data-testid="session-har-empty">
                        {phase === "recording" &&
                            "Hub is capturing network over CDP. The .har file is written when the session ends."}
                        {phase === "waiting" && "Session ended — polling for the flushed HAR file…"}
                        {phase === "error" && error}
                    </div>
                )}
            </Panel>
        </StyledHarViewer>
    );
};

HarViewer.propTypes = {
    session: PropTypes.string.isRequired,
    browser: PropTypes.shape({
        caps: PropTypes.object,
    }),
    sessionAlive: PropTypes.bool,
};

export default HarViewer;
export { harFileName, wantsHar };
