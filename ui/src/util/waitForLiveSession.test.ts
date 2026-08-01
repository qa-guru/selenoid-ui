import { afterEach, describe, expect, it, vi } from "vitest";
import { sources } from "eventsourcemock";

import { sameOriginURL } from "./uiFeed";
import { waitForLiveSession } from "./waitForLiveSession";

describe("waitForLiveSession", () => {
    afterEach(() => {
        vi.useRealTimers();
        Object.keys(sources).forEach((url) => {
            sources[url]?.close();
            delete sources[url];
        });
    });

    it("resolves true when the session is already in the initial snapshot", async () => {
        await expect(
            waitForLiveSession("sess-1", {
                initialSessions: { "sess-1": { caps: { browserName: "chrome" } } },
            })
        ).resolves.toBe(true);
    });

    it("resolves true when SSE delivers the session", async () => {
        const pending = waitForLiveSession("sess-live", {
            initialSessions: {},
            fetchStatus: async () => ({ state: {}, sessions: {} }),
        });
        const source = sources[sameOriginURL("/events")];
        expect(source).toBeTruthy();

        source.emitMessage(
            JSON.stringify({
                state: {},
                sessions: { "sess-live": { caps: { browserName: "chrome" } } },
            })
        );

        await expect(pending).resolves.toBe(true);
        expect(source.readyState).toBe(2);
    });

    it("resolves true when /ui/status poll sees the session", async () => {
        let calls = 0;
        const pending = waitForLiveSession("sess-poll", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => {
                calls += 1;
                if (calls < 2) {
                    return { state: {}, sessions: {} };
                }
                return {
                    state: {},
                    sessions: { "sess-poll": { caps: { browserName: "chrome" } } },
                };
            },
        });

        await expect(pending).resolves.toBe(true);
        expect(calls).toBeGreaterThanOrEqual(2);
    });

    it("keeps waiting when EventSource errors (poll can still succeed)", async () => {
        let calls = 0;
        const pending = waitForLiveSession("sess-after-sse-error", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => {
                calls += 1;
                if (calls < 3) {
                    return { state: {}, sessions: {} };
                }
                return {
                    state: {},
                    sessions: { "sess-after-sse-error": { caps: { browserName: "chrome" } } },
                };
            },
        });
        const source = sources[sameOriginURL("/events")];
        expect(source).toBeTruthy();
        source.emitError();

        await expect(pending).resolves.toBe(true);
    });

    it("resolves false after timeout when the session never appears", async () => {
        vi.useFakeTimers();
        const pending = waitForLiveSession("missing", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => ({ state: {}, sessions: {} }),
        });
        await vi.advanceTimersByTimeAsync(5_000);
        await expect(pending).resolves.toBe(false);
    });
});
