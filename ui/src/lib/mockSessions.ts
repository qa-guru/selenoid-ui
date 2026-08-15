/**
 * Dev-only live-session fixtures for UI layout checks.
 * Activate: open UI with `?mock=1` (before or after hash), or the header
 * toggle at the end of nav (after Benchmarks; own burger row). The toggle
 * uses `history.replaceState` so the HashRouter route stays put.
 *
 * The set is a pairwise covering of live-row factors (badges, quota, name,
 * browser, freeze/active) plus stable seeds mockmax / mockmin / mockfrz.
 */

import type { LiveSession, SessionCaps, SessionsMap } from "../types/hub";
import { buildMockLiveSessions, MOCK_SESSION_ID } from "./mockSessionMatrix";

export { MOCK_SESSION_ID } from "./mockSessionMatrix";

export const MOCK_LIVE_SESSIONS: SessionsMap = buildMockLiveSessions();

export type MockLivePreview = "active" | "starting" | "stub";

function capOn(value: unknown): boolean {
    return value !== false && value !== "false";
}

function previewFromFixture(session: LiveSession): MockLivePreview {
    if (session.starting) {
        return "starting";
    }
    if (session.preview === "active") {
        return "active";
    }
    return "stub";
}

/** Hub session on the details page: mock VNC/logs from that session's caps. */
function previewFromLiveSession(session: LiveSession): MockLivePreview {
    if (session.starting) {
        return "starting";
    }
    if (!capOn(session.caps?.enableVNC)) {
        return "stub";
    }
    return "active";
}

/**
 * How mock mode should drive VNC/logs. `null` = real hub sockets.
 * Pairwise fixture ids always mock (visual snapshots). Any other live session
 * mocks only when `?mock=1` is on, using that session's caps — so details of a
 * hub session can toggle in place without changing the route.
 */
export function mockLivePreview(
    sessionId: string | undefined,
    live?: LiveSession | null,
    mockEnabled: boolean = isMockSessionsEnabled()
): MockLivePreview | null {
    if (!sessionId) {
        return null;
    }
    const fixture = MOCK_LIVE_SESSIONS[sessionId];
    if (fixture) {
        return previewFromFixture(fixture);
    }
    if (!mockEnabled || !live) {
        return null;
    }
    return previewFromLiveSession(live);
}

/** Finished-session row from GET /sessions/?json — enough to rebuild caps for mock details. */
export type SessionArchiveEntry = {
    id?: string;
    quota?: string;
    name?: string;
    video?: string;
    log?: string;
    har?: string;
    caps?: SessionCaps;
    browserName?: string;
    version?: string;
};

/**
 * Session object for the details page in mock mode: hub live entry wins,
 * otherwise ended live caps, otherwise archive artifacts (video/log/har/name).
 */
export function mockDetailsSession(
    sessionId: string | undefined,
    live?: LiveSession | null,
    archive?: SessionArchiveEntry | null,
    ended?: LiveSession | null
): LiveSession | null {
    if (live) {
        return live;
    }
    const archiveCaps = archive?.caps || {};
    const endedCaps = ended?.caps || {};
    const hasArchive = Boolean(archive && (archive.video || archive.log || archive.har || archive.name || archive.quota));
    if (!ended && !hasArchive) {
        return null;
    }
    const vncOff = endedCaps.enableVNC === false || endedCaps.enableVNC === "false";
    const caps: SessionCaps = {
        ...archiveCaps,
        ...endedCaps,
        browserName: endedCaps.browserName || archiveCaps.browserName || archive?.browserName || "chrome",
        version: endedCaps.version || archiveCaps.version || archive?.version,
        name: endedCaps.name || archiveCaps.name || archive?.name,
        enableVNC: vncOff ? false : true,
        enableVideo: Boolean(endedCaps.enableVideo) || Boolean(archive?.video),
        enableLog: Boolean(endedCaps.enableLog) || Boolean(archive?.log),
        enableHAR: Boolean(endedCaps.enableHAR) || Boolean(archive?.har),
    };
    return {
        ...(ended || {}),
        id: sessionId,
        quota: ended?.quota || archive?.quota || "",
        caps,
    };
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
