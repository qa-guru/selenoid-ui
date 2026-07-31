import type { SessionsMap } from "../types/hub";
import { isUiStatusPayload } from "./uiFeed";

/** Grace before Session page treats a missing live feed entry as not-found. */
export const LIVE_SESSION_GRACE_MS = 15_000;

type WaitOptions = {
    initialSessions?: SessionsMap;
    timeoutMs?: number;
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

/**
 * Wait until a session id appears in the UI SSE feed (or initial snapshot).
 * Used after Create Session so navigation does not land on a stale not-found state.
 */
export function waitForLiveSession(sessionId: string, options: WaitOptions = {}): Promise<boolean> {
    const target = String(sessionId || "").trim();
    if (!target) {
        return Promise.resolve(false);
    }

    const { initialSessions = {}, timeoutMs = 30_000 } = options;
    if (hasLiveSession(initialSessions, target)) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        let done = false;
        let eventSource: EventSource | undefined;

        const finish = (found: boolean) => {
            if (done) {
                return;
            }
            done = true;
            eventSource?.close();
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

        eventSource = new EventSource("/events");
        eventSource.onmessage = (event) => {
            try {
                const raw = typeof event === "string" ? event : event.data;
                check(JSON.parse(String(raw)));
            } catch (err) {
                console.error("[sse] waitForLiveSession parse error", err);
            }
        };

        const timer = window.setTimeout(() => finish(false), timeoutMs);
    });
}
