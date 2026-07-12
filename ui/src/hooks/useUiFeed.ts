import { useCallback, useEffect, useRef, useState } from "react";

import {
    FALLBACK_POLL_MS,
    SSE_WATCHDOG_MS,
    deriveSelenoidStatus,
    isUiStatusPayload,
    reconnectDelayMs,
    refreshSseStatus,
} from "../util/uiFeed";

const EMPTY_FEED = {
    origin: undefined,
    state: {},
    browsers: {},
    sessions: {},
    browserProtocols: {},
    version: "unknown",
};

export function useUiFeed() {
    const [data, setData] = useState(null);
    const [sseStatus, setSseStatus] = useState("unknown");
    const [selenoidStatus, setSelenoidStatus] = useState("unknown");
    const [lastUpdate, setLastUpdate] = useState(null);

    const dataRef = useRef(null);
    const lastSseAtRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const eventSourceRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const applyPayload = useCallback((payload) => {
        if (!isUiStatusPayload(payload)) {
            return;
        }

        dataRef.current = payload;
        setData(payload);
        setLastUpdate(Date.now());
        setSelenoidStatus(deriveSelenoidStatus(payload));
    }, []);

    useEffect(() => {
        let cancelled = false;
        let fallbackTimer;
        let watchdogTimer;

        const markSseActivity = () => {
            lastSseAtRef.current = Date.now();
            setSseStatus("ok");
        };

        const updateSseFromWatchdog = () => {
            const next = refreshSseStatus(lastSseAtRef.current, Boolean(dataRef.current));
            setSseStatus((prev) => (prev === next ? prev : next));
        };

        const loadStatus = async () => {
            try {
                const response = await fetch("/status", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const payload = await response.json();
                if (!isUiStatusPayload(payload)) {
                    return;
                }

                if (!cancelled) {
                    applyPayload(payload);
                }
            } catch (err) {
                console.error("[status] fetch failed", err);
                if (!cancelled && !dataRef.current) {
                    setSelenoidStatus("error");
                }
            }
        };

        const connectSSE = () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            const es = new EventSource("/events");
            eventSourceRef.current = es;

            es.onopen = () => {
                reconnectAttemptRef.current = 0;
                markSseActivity();
            };

            es.onmessage = (event) => {
                markSseActivity();
                try {
                    const payload = JSON.parse(event.data);
                    if (!cancelled) {
                        applyPayload(payload);
                    }
                } catch (err) {
                    console.error("[sse] parse error", err);
                }
            };

            es.onerror = () => {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }

                const delay = reconnectDelayMs(reconnectAttemptRef.current);
                reconnectAttemptRef.current += 1;

                if (reconnectTimerRef.current != null) {
                    window.clearTimeout(reconnectTimerRef.current);
                }
                reconnectTimerRef.current = window.setTimeout(() => {
                    if (!cancelled) {
                        connectSSE();
                    }
                }, delay);
            };
        };

        loadStatus();
        connectSSE();
        watchdogTimer = window.setInterval(updateSseFromWatchdog, SSE_WATCHDOG_MS);
        fallbackTimer = window.setInterval(loadStatus, FALLBACK_POLL_MS);

        return () => {
            cancelled = true;
            window.clearInterval(fallbackTimer);
            window.clearInterval(watchdogTimer);
            if (reconnectTimerRef.current != null) {
                window.clearTimeout(reconnectTimerRef.current);
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [applyPayload]);

    const feed = data || EMPTY_FEED;

    return {
        origin: feed.origin,
        state: feed.state || {},
        browsers: feed.browsers || {},
        sessions: feed.sessions || {},
        browserProtocols: feed.browserProtocols || {},
        version: feed.version || "unknown",
        sseStatus,
        selenoidStatus,
        lastUpdate,
    };
}
