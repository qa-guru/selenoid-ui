/**
 * Last-known live session from Create Session wait, merged into the UI feed
 * until SSE /status catches up. Prevents a one-frame LOADING panel (different
 * height) that makes the VNC mosaic jump on navigate.
 *
 * Ended ids stay stripped from the feed even while hub SSE still lists them
 * (Stop / list trash). BroadcastChannel mirrors that across tabs.
 */

import type { LiveSession, SessionsMap } from "../types/hub";

export const OPTIMISTIC_LIVE_CHANGE = "selenoid-ui:optimistic-live";
const ENDED_LIVE_CHANNEL = "selenoid-ui-ended-live";

let optimisticLiveSessions: SessionsMap = {};
let endedLiveSessions: Record<string, true> = {};
let endedChannel: BroadcastChannel | null | undefined;

function notify(): void {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new Event(OPTIMISTIC_LIVE_CHANGE));
}

function liveEndedChannel(): BroadcastChannel | null {
    if (endedChannel !== undefined) {
        return endedChannel;
    }
    if (typeof BroadcastChannel === "undefined") {
        endedChannel = null;
        return null;
    }
    try {
        endedChannel = new BroadcastChannel(ENDED_LIVE_CHANNEL);
        endedChannel.onmessage = (event) => {
            const data = event.data;
            if (!data || typeof data.id !== "string") {
                return;
            }
            if (data.type === "ended") {
                markLiveSessionEnded(data.id, { remote: true });
            } else if (data.type === "revive") {
                reviveLiveSession(data.id, { remote: true });
            }
        };
    } catch {
        endedChannel = null;
    }
    return endedChannel;
}

function postEnded(type: "ended" | "revive", id: string): void {
    try {
        liveEndedChannel()?.postMessage({ type, id });
    } catch {
        /* ignore closed / unavailable channel */
    }
}

export function seedOptimisticLiveSession(id: string, session: LiveSession | undefined): void {
    const target = String(id || "").trim();
    if (!target || !session) {
        return;
    }
    if (endedLiveSessions[target]) {
        const nextEnded = { ...endedLiveSessions };
        delete nextEnded[target];
        endedLiveSessions = nextEnded;
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

/** Hide a live id from the feed immediately (Stop, list trash, remote tab). */
export function markLiveSessionEnded(id: string, opts: { remote?: boolean } = {}): void {
    const target = String(id || "").trim();
    if (!target) {
        return;
    }
    let changed = !endedLiveSessions[target];
    if (optimisticLiveSessions[target]) {
        const next = { ...optimisticLiveSessions };
        delete next[target];
        optimisticLiveSessions = next;
        changed = true;
    }
    endedLiveSessions = { ...endedLiveSessions, [target]: true };
    if (changed) {
        notify();
    }
    if (!opts.remote) {
        postEnded("ended", target);
    }
}

/** Undo markLiveSessionEnded when hub DELETE fails and the session is still live. */
export function reviveLiveSession(id: string, opts: { remote?: boolean } = {}): void {
    const target = String(id || "").trim();
    if (!target || !endedLiveSessions[target]) {
        return;
    }
    const next = { ...endedLiveSessions };
    delete next[target];
    endedLiveSessions = next;
    notify();
    if (!opts.remote) {
        postEnded("revive", target);
    }
}

export function resetOptimisticLiveSessions(): void {
    const hadOptimistic = Object.keys(optimisticLiveSessions).length;
    const hadEnded = Object.keys(endedLiveSessions).length;
    optimisticLiveSessions = {};
    endedLiveSessions = {};
    if (!hadOptimistic && !hadEnded) {
        return;
    }
    notify();
}

/** Feed wins when it already has the id; leftover stubs fill the gap. Ended ids stay out. */
export function mergeOptimisticLiveSessions(sessions: SessionsMap = {}): SessionsMap {
    const endedIds = Object.keys(endedLiveSessions);
    if (!Object.keys(optimisticLiveSessions).length && !endedIds.length) {
        return sessions;
    }
    const merged: SessionsMap = { ...optimisticLiveSessions, ...sessions };
    for (const id of endedIds) {
        delete merged[id];
    }
    return merged;
}

export function subscribeOptimisticLiveSessions(listener: () => void): () => void {
    if (typeof window === "undefined") {
        return () => undefined;
    }
    liveEndedChannel();
    window.addEventListener(OPTIMISTIC_LIVE_CHANGE, listener);
    return () => window.removeEventListener(OPTIMISTIC_LIVE_CHANGE, listener);
}
