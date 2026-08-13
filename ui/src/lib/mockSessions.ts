/**
 * Dev-only live-session fixtures for UI layout checks.
 * Activate: open UI with `?mock=1` (before or after hash), or the header
 * toggle next to Sessions. The toggle uses `history.replaceState` so the
 * HashRouter route stays put and the live list can fade in place.
 *
 * The set is a pairwise covering of live-row factors (badges, quota, name,
 * browser, freeze/active) plus stable seeds mockmax / mockmin / mockfrz.
 */

import type { SessionsMap } from "../types/hub";
import { buildMockLiveSessions, MOCK_SESSION_ID } from "./mockSessionMatrix";

export { MOCK_SESSION_ID } from "./mockSessionMatrix";

export const MOCK_LIVE_SESSIONS: SessionsMap = buildMockLiveSessions();

export type MockLivePreview = "active" | "starting" | "stub";

/** How a `?mock=1` session should drive VNC/logs. `null` = real hub sockets. */
export function mockLivePreview(sessionId: string | undefined): MockLivePreview | null {
    if (!sessionId) {
        return null;
    }
    const live = MOCK_LIVE_SESSIONS[sessionId];
    if (!live) {
        return null;
    }
    if (live.starting) {
        return "starting";
    }
    if (live.preview === "active") {
        return "active";
    }
    return "stub";
}

export function isMockSessionsEnabled(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        const search = new URLSearchParams(window.location.search);
        if (search.get("mock") === "1") {
            return true;
        }
        const hash = window.location.hash || "";
        const qIndex = hash.indexOf("?");
        if (qIndex >= 0) {
            const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
            if (hashParams.get("mock") === "1") {
                return true;
            }
        }
    } catch {
        /* ignore */
    }
    return false;
}

/** Fired after `setMockSessionsEnabled` (and on `popstate`) so React can re-render without a reload. */
export const MOCK_SESSIONS_CHANGE = "selenoid-ui:mock-sessions";

function hashWithoutMock(hash: string): string {
    const qIndex = hash.indexOf("?");
    if (qIndex < 0) {
        return hash;
    }
    const path = hash.slice(0, qIndex);
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    params.delete("mock");
    const rest = params.toString();
    return rest ? `${path}?${rest}` : path;
}

/**
 * Turn mock live sessions on or off. Updates `?mock=1` via `replaceState`
 * (no navigation, no reload) and notifies subscribers.
 */
export function setMockSessionsEnabled(enabled: boolean): void {
    if (typeof window === "undefined") {
        return;
    }
    const url = new URL(window.location.href);
    if (enabled) {
        url.searchParams.set("mock", "1");
    } else {
        url.searchParams.delete("mock");
    }
    url.hash = hashWithoutMock(url.hash || "");
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
        window.history.replaceState(window.history.state, "", next);
    }
    window.dispatchEvent(new Event(MOCK_SESSIONS_CHANGE));
}

export function subscribeMockSessions(listener: () => void): () => void {
    if (typeof window === "undefined") {
        return () => undefined;
    }
    window.addEventListener(MOCK_SESSIONS_CHANGE, listener);
    window.addEventListener("popstate", listener);
    return () => {
        window.removeEventListener(MOCK_SESSIONS_CHANGE, listener);
        window.removeEventListener("popstate", listener);
    };
}

/** Merge mock live sessions on top of real feed (mock ids win). */
export function mergeMockLiveSessions(sessions: SessionsMap = {}): SessionsMap {
    return { ...sessions, ...MOCK_LIVE_SESSIONS };
}

export const MOCK_MAX_ID = MOCK_SESSION_ID.max;
export const MOCK_MIN_ID = MOCK_SESSION_ID.min;
export const MOCK_FREEZE_ID = MOCK_SESSION_ID.freeze;
