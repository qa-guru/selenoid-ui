import type { SessionsMap } from "../types/hub";
import { isUiStatusPayload, sameOriginURL } from "./uiFeed";

/** Grace before Session page treats a missing live feed entry as not-found. */
export const LIVE_SESSION_GRACE_MS = 15_000;

const POLL_MS = 500;

type WaitOptions = {
    initialSessions?: SessionsMap;
    timeoutMs?: number;
    /** Override status fetch (tests). Defaults to /ui/status with /status fallback. */
    fetchStatus?: () => Promise<unknown>;
};

function hasLiveSession(sessions: SessionsMap | undefined, sessionId: string): boolean {
    return Boolean(sessionId && sessions?.[sessionId]);
}

function sessionsFromPayload(payload: unknown): SessionsMap | undefined {
    if (!isUiStatusPayload(payload)) {
        return undefined;
    }
    return payload.sessions;
}

async function defaultFetchStatus(): Promise<unknown> {
    // UI-shaped payload lives on /ui/status; /status is a standalone-ui fallback.
    let response = await fetch(sameOriginURL("/ui/status"), { cache: "no-store" });
    if (response.status === 404) {
        response = await fetch(sameOriginURL("/status"), { cache: "no-store" });
    }
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * Wait until a session id appears in the UI feed (or initial snapshot).
 * Used after Create Session so navigation does not land on a stale not-found state.
 *
 * Polls /ui/status — a second EventSource is unreliable under nginx/HTTP2 when the
 * page already holds the feed connection (stale tile / missed onmessage → 30s hang).
 * SSE remains a best-effort fast path; errors do not abort the wait.
 */
export function waitForLiveSession(sessionId: string, options: WaitOptions = {}): Promise<boolean> {
    const target = String(sessionId || "").trim();
    if (!target) {
        return Promise.resolve(false);
    }

    // Vitest has no live hub — keep an explicit short default so Create Session
    // unit tests do not sit on the 30s production grace.
    const defaultTimeoutMs = import.meta.env.MODE === "test" ? 50 : 30_000;
    const {
        initialSessions = {},
        timeoutMs = defaultTimeoutMs,
        fetchStatus = defaultFetchStatus,
    } = options;
    if (hasLiveSession(initialSessions, target)) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        let done = false;
        let eventSource: EventSource | undefined;
        let pollTimer: number | undefined;

        const finish = (found: boolean) => {
            if (done) {
                return;
            }
            done = true;
            eventSource?.close();
            if (pollTimer != null) {
                window.clearInterval(pollTimer);
            }
            window.clearTimeout(timer);
            resolve(found);
        };

        const check = (payload: unknown) => {
            const sessions = sessionsFromPayload(payload);
            if (hasLiveSession(sessions, target)) {
                finish(true);
            }
        };

        check({ state: {}, sessions: initialSessions });

        const poll = () => {
            void fetchStatus()
                .then((payload) => {
                    if (!done) {
                        check(payload);
                    }
                })
                .catch(() => {
                    // Keep polling until timeout — transient 5xx / offline must not abort.
                });
        };

        poll();
        pollTimer = window.setInterval(poll, POLL_MS);

        try {
            eventSource = new EventSource(sameOriginURL("/events"));
            eventSource.onmessage = (event) => {
                try {
                    const raw = typeof event === "string" ? event : event.data;
                    check(JSON.parse(String(raw)));
                } catch (err) {
                    console.error("[sse] waitForLiveSession parse error", err);
                }
            };
            // Do not finish(false) on EventSource error — reconnect noise / second-ES
            // failure used to abort the wait before /ui/status could confirm the session.
        } catch (err) {
            console.error("[sse] waitForLiveSession EventSource unavailable", err);
        }

        const timer = window.setTimeout(() => finish(false), timeoutMs);
    });
}
