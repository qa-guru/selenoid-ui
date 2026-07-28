import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Panel } from "@zero-design-system/react";

import { StyledHarViewer } from "./style.css";

const POLL_MS = 2500;
const MAX_ROWS = 200;
const TIMING_KEYS = ["blocked", "dns", "connect", "ssl", "send", "wait", "receive"];
const TABS = [
    { id: "headers", label: "Headers" },
    { id: "timings", label: "Timings" },
    { id: "response", label: "Response" },
];

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
    const v = Number(n);
    if (!Number.isFinite(v) || v <= 0) {
        return "—";
    }
    if (v < 1024) {
        return `${v} B`;
    }
    if (v < 1024 * 1024) {
        return `${(v / 1024).toFixed(1)} KB`;
    }
    return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTiming(n) {
    const v = Number(n);
    if (!Number.isFinite(v) || v < 0) {
        return "—";
    }
    return `${Math.round(v)} ms`;
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

function headerPairs(headers) {
    if (!Array.isArray(headers)) {
        return [];
    }
    return headers
        .filter((h) => h && (h.name != null || h.value != null))
        .map((h) => ({ name: String(h.name || ""), value: String(h.value ?? "") }));
}

function HeaderKv({ title, headers }) {
    const pairs = headerPairs(headers);
    return (
        <div className="har-section">
            <div className="har-section__title">{title}</div>
            {pairs.length === 0 ? (
                <div className="har-muted">No headers captured.</div>
            ) : (
                <div className="har-kv">
                    {pairs.map((h, i) => (
                        <React.Fragment key={`${h.name}-${i}`}>
                            <div className="har-kv__k">{h.name}</div>
                            <div className="har-kv__v">{h.value || "—"}</div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}

HeaderKv.propTypes = {
    title: PropTypes.string.isRequired,
    headers: PropTypes.array,
};

function EntryDetail({ entry, tab, onTabChange }) {
    const req = entry.request || {};
    const resp = entry.response || {};
    const content = resp.content || {};
    const timings = entry.timings || {};
    const status = Number(resp.status) || 0;
    const statusText = resp.statusText || "";
    const mime = content.mimeType || "—";
    const size = formatSize(content.size);
    const bodyText = typeof content.text === "string" ? content.text : "";
    const bodyNote = bodyText ? bodyText : "Body not captured (meta / headers + size only).";

    return (
        <div className="har-detail" data-testid="session-har-detail">
            <div className="har-tabs" role="tablist" aria-label="HAR entry details">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        className={tab === t.id ? "har-tab har-tab--active" : "har-tab"}
                        aria-selected={tab === t.id}
                        data-testid={`session-har-tab-${t.id}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTabChange(t.id);
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "headers" && (
                <div className="har-tab-panel" role="tabpanel" data-testid="session-har-panel-headers">
                    <HeaderKv title="Response Headers" headers={resp.headers} />
                    <HeaderKv title="Request Headers" headers={req.headers} />
                </div>
            )}

            {tab === "timings" && (
                <div className="har-tab-panel" role="tabpanel" data-testid="session-har-panel-timings">
                    <div className="har-kv">
                        {TIMING_KEYS.map((key) => (
                            <React.Fragment key={key}>
                                <div className="har-kv__k">{key}</div>
                                <div className="har-kv__v">{formatTiming(timings[key])}</div>
                            </React.Fragment>
                        ))}
                        <div className="har-kv__k">total</div>
                        <div className="har-kv__v">{formatTiming(entry.time)}</div>
                    </div>
                </div>
            )}

            {tab === "response" && (
                <div className="har-tab-panel" role="tabpanel" data-testid="session-har-panel-response">
                    <div className="har-kv">
                        <div className="har-kv__k">status</div>
                        <div className="har-kv__v">
                            {status || "—"}
                            {statusText ? ` ${statusText}` : ""}
                        </div>
                        <div className="har-kv__k">mimeType</div>
                        <div className="har-kv__v">{mime}</div>
                        <div className="har-kv__k">size</div>
                        <div className="har-kv__v">{size}</div>
                    </div>
                    <div className="har-section">
                        <div className="har-section__title">Body</div>
                        <pre className={bodyText ? "har-body" : "har-body har-muted"}>{bodyNote}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

EntryDetail.propTypes = {
    entry: PropTypes.object.isRequired,
    tab: PropTypes.oneOf(["headers", "timings", "response"]).isRequired,
    onTabChange: PropTypes.func.isRequired,
};

/**
 * Full-width Session HAR panel. Polls hub GET /har/<id>.har (via UI proxy) while
 * enableHAR is on; renders entries after the hub flushes the archive on session end.
 * Hub CDP capture — not Playwright client recordHar.
 */
const HarViewer = ({ session, browser = {}, sessionAlive = true, file: fileProp }) => {
    const caps = browser.caps || {};
    const enabled = Boolean(fileProp) || wantsHar(caps);
    const file = fileProp || harFileName(session, caps);
    const href = `/har/${file}`;

    const [phase, setPhase] = useState(enabled ? "waiting" : "idle");
    const [har, setHar] = useState(null);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState(null);
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [detailTab, setDetailTab] = useState("headers");
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

    const toggleRow = useCallback((idx) => {
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
                                    const open = expandedIdx === idx;
                                    const rowId = `har-row-${idx}`;
                                    return (
                                        <React.Fragment key={`${req.method || "GET"}-${req.url || ""}-${idx}`}>
                                            <tr
                                                id={rowId}
                                                className={open ? "har-row har-row--open" : "har-row"}
                                                tabIndex={0}
                                                role="button"
                                                aria-expanded={open}
                                                aria-controls={`har-detail-${idx}`}
                                                data-testid={`session-har-row-${idx}`}
                                                onClick={() => toggleRow(idx)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        toggleRow(idx);
                                                    }
                                                }}
                                            >
                                                <td className="har-method">{req.method || ""}</td>
                                                <td className={statusClass(status)}>{status || "—"}</td>
                                                <td className="har-url" title={req.url}>
                                                    {req.url || ""}
                                                </td>
                                                <td className="har-mime">{content.mimeType || "—"}</td>
                                                <td>{formatSize(content.size)}</td>
                                                <td>{Math.round(Number(entry.time) || 0)} ms</td>
                                            </tr>
                                            {open && (
                                                <tr
                                                    id={`har-detail-${idx}`}
                                                    className="har-detail-row"
                                                    data-testid={`session-har-detail-row-${idx}`}
                                                >
                                                    <td colSpan={6} onClick={(e) => e.stopPropagation()}>
                                                        <EntryDetail
                                                            entry={entry}
                                                            tab={detailTab}
                                                            onTabChange={setDetailTab}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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
    /** Explicit artifact file name (finished sessions); bypasses caps.enableHAR gate. */
    file: PropTypes.string,
};

export default HarViewer;
export { harFileName, wantsHar, formatSize, formatTiming };
