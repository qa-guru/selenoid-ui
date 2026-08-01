import { useCallback, useEffect, useRef, useState } from "react";

import type { BrowserProtocols, BrowsersMap, HealthStatus, HubState, SessionsMap, UiStatusPayload } from "../types/hub";
import {
    FALLBACK_POLL_MS,
    SSE_WATCHDOG_MS,
    deriveSelenoidStatus,
    isUiStatusPayload,
    reconnectDelayMs,
    refreshSseStatus,
    sameOriginURL,
} from "../util/uiFeed";
import { isMockSessionsEnabled, mergeMockLiveSessions } from "../lib/mockSessions";

const EMPTY_FEED: UiStatusPayload = {
    origin: undefined,
    state: {},
    browsers: {},
    sessions: {},
    browserProtocols: {},
    version: "unknown",
};

export type UiFeed = {
    origin: string | undefined;
    state: HubState;
    browsers: BrowsersMap;
    sessions: SessionsMap;
    browserProtocols: BrowserProtocols;
    version: string;
    sseStatus: HealthStatus;
    selenoidStatus: HealthStatus;
    lastUpdate: number | null;
};

export function useUiFeed(): UiFeed {
    const [data, setData] = useState<UiStatusPayload | null>(null);
    const [sseStatus, setSseStatus] = useState<HealthStatus>("unknown");
    const [selenoidStatus, setSelenoidStatus] = useState<HealthStatus>("unknown");
    const [lastUpdate, setLastUpdate] = useState<number | null>(null);

    const dataRef = useRef<UiStatusPayload | null>(null);
    const lastSseAtRef = useRef<number | null>(null);
    const reconnectAttemptRef = useRef(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);

    const applyPayload = useCallback((payload: unknown) => {
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
        let fallbackTimer: number | undefined;
        let watchdogTimer: number | undefined;

        const markSseActivity = () => {
            lastSseAtRef.current = Date.now();
            setSseStatus("ok");
        };

        const updateSseFromWatchdog = () => {
            const next = refreshSseStatus(lastSseAtRef.current, Boolean(dataRef.current));
            setSseStatus((prev: any) => (prev === next ? prev : next));
        };

        const loadStatus = async () => {
            try {
                // UI-shaped payload ({state,...}) lives on /ui/status; public /status
                // is the flat upstream-selenoid hub contract (student autotests).
                let response = await fetch(sameOriginURL("/ui/status"), { cache: "no-store" });
                // Dev fallback: older selenoid-ui binaries expose UI feed on /status only.
                if (response.status === 404) {
                    response = await fetch(sameOriginURL("/status"), { cache: "no-store" });
                }
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

            const es = new EventSource(sameOriginURL("/events"));
            eventSourceRef.current = es;

            es.onopen = () => {
                reconnectAttemptRef.current = 0;
                markSseActivity();
            };

            es.onmessage = (event: any) => {
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
    const sessions = isMockSessionsEnabled() ? mergeMockLiveSessions(feed.sessions || {}) : feed.sessions || {};

    return {
        origin: feed.origin,
        state: feed.state || {},
        browsers: feed.browsers || {},
        sessions,
        browserProtocols: feed.browserProtocols || {},
        version: feed.version || "unknown",
        sseStatus,
        selenoidStatus,
        lastUpdate,
    };
}
