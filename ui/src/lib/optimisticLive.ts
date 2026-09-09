/**
 * Last-known live session from Create Session wait, merged into the UI feed
 * until SSE /status catches up. Prevents a one-frame LOADING panel (different
 * height) that makes the VNC mosaic jump on navigate.
 */

import type { LiveSession, SessionsMap } from "../types/hub";

export const OPTIMISTIC_LIVE_CHANGE = "selenoid-ui:optimistic-live";

let optimisticLiveSessions: SessionsMap = {};

function notify(): void {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new Event(OPTIMISTIC_LIVE_CHANGE));
}

export function seedOptimisticLiveSession(id: string, session: LiveSession | undefined): void {
    const target = String(id || "").trim();
    if (!target || !session) {
        return;
    }
    optimisticLiveSessions = { ...optimisticLiveSessions, [target]: { ...session, id: target } };
    notify();
}

export function clearOptimisticLiveSession(id: string): void {
    const target = String(id || "").trim();
    if (!target || !optimisticLiveSessions[target]) {
        return;
    }
    const next = { ...optimisticLiveSessions };
    delete next[target];
    optimisticLiveSessions = next;
    notify();
}

export function resetOptimisticLiveSessions(): void {
    if (!Object.keys(optimisticLiveSessions).length) {
        return;
    }
    optimisticLiveSessions = {};
    notify();
}

/** Feed wins when it already has the id; leftover stubs fill the gap. */
export function mergeOptimisticLiveSessions(sessions: SessionsMap = {}): SessionsMap {
    if (!Object.keys(optimisticLiveSessions).length) {
        return sessions;
    }
    return { ...optimisticLiveSessions, ...sessions };
}

export function subscribeOptimisticLiveSessions(listener: () => void): () => void {
    if (typeof window === "undefined") {
        return () => undefined;
    }
    window.addEventListener(OPTIMISTIC_LIVE_CHANGE, listener);
    return () => window.removeEventListener(OPTIMISTIC_LIVE_CHANGE, listener);
}
