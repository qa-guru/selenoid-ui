import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sources } from "eventsourcemock";

import { mergeOptimisticLiveSessions, resetOptimisticLiveSessions } from "../lib/optimisticLive";
import { sameOriginURL } from "./uiFeed";
import { waitForLiveSession } from "./waitForLiveSession";

describe("waitForLiveSession", () => {
    beforeEach(() => {
        resetOptimisticLiveSessions();
    });

    afterEach(() => {
        vi.useRealTimers();
        resetOptimisticLiveSessions();
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
        expect(mergeOptimisticLiveSessions({})["sess-1"]?.caps?.browserName).toBe("chrome");
    });

    it("resolves true when SSE delivers the session", async () => {
        const pending = waitForLiveSession("sess-live", {
            initialSessions: {},
            timeoutMs: 5_000,
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

    it("resolves false immediately when the session id is empty", async () => {
        await expect(waitForLiveSession("")).resolves.toBe(false);
        await expect(waitForLiveSession("   ")).resolves.toBe(false);
    });

    it("ignores SSE parse errors and non-status payloads until poll finds the session", async () => {
        const pending = waitForLiveSession("sess-parse", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => ({ nope: true }),
        });
        const source = sources[sameOriginURL("/events")];
        expect(source).toBeTruthy();
        source.emitMessage("not-json{");
        source.emitMessage(
            JSON.stringify({
                state: {},
                sessions: { "sess-parse": { caps: { browserName: "chrome" } } },
            })
        );
        await expect(pending).resolves.toBe(true);
    });

    it("keeps polling when fetchStatus throws", async () => {
        let calls = 0;
        const pending = waitForLiveSession("sess-throw", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => {
                calls += 1;
                if (calls < 2) {
                    throw new Error("offline");
                }
                return { state: {}, sessions: { "sess-throw": { caps: { browserName: "chrome" } } } };
            },
        });
        await expect(pending).resolves.toBe(true);
        expect(calls).toBeGreaterThanOrEqual(2);
    });

    it("still succeeds when EventSource is unavailable", async () => {
        const Original = window.EventSource;
        window.EventSource = class {
            constructor() {
                throw new Error("EventSource unavailable");
            }
        } as unknown as typeof EventSource;
        try {
            await expect(
                waitForLiveSession("sess-no-es", {
                    initialSessions: {},
                    timeoutMs: 5_000,
                    fetchStatus: async () => ({
                        state: {},
                        sessions: { "sess-no-es": { caps: { browserName: "chrome" } } },
                    }),
                })
            ).resolves.toBe(true);
        } finally {
            window.EventSource = Original;
        }
    });

    it("uses /ui/status when present", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    state: {},
                    sessions: { "sess-ui": { caps: { browserName: "chrome" } } },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            )
        );
        try {
            await expect(waitForLiveSession("sess-ui", { initialSessions: {}, timeoutMs: 5_000 })).resolves.toBe(true);
        } finally {
            fetchMock.mockRestore();
        }
    });

    it("falls back from /ui/status 404 to /status", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("/ui/status")) {
                return new Response("missing", { status: 404 });
            }
            if (url.includes("/status")) {
                return new Response(
                    JSON.stringify({
                        state: {},
                        sessions: { "sess-fallback": { caps: { browserName: "chrome" } } },
                    }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            }
            throw new Error(`unexpected ${url}`);
        });
        try {
            await expect(waitForLiveSession("sess-fallback", { initialSessions: {}, timeoutMs: 5_000 })).resolves.toBe(
                true
            );
        } finally {
            fetchMock.mockRestore();
        }
    });

    it("treats a non-ok status fetch as transient and times out", async () => {
        vi.useFakeTimers();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 500 }));
        try {
            const pending = waitForLiveSession("never", { initialSessions: {}, timeoutMs: 1_000 });
            await vi.advanceTimersByTimeAsync(1_000);
            await expect(pending).resolves.toBe(false);
        } finally {
            fetchMock.mockRestore();
        }
    });

    it("ignores a second finish after the session is already found", async () => {
        const pending = waitForLiveSession("sess-dup", {
            initialSessions: {},
            timeoutMs: 5_000,
            fetchStatus: async () => ({
                state: {},
                sessions: { "sess-dup": { caps: { browserName: "chrome" } } },
            }),
        });
        const source = sources[sameOriginURL("/events")];
        source.emitMessage(
            JSON.stringify({
                state: {},
                sessions: { "sess-dup": { caps: { browserName: "chrome" } } },
            })
        );
        source.emitMessage(
            JSON.stringify({
                state: {},
                sessions: { "sess-dup": { caps: { browserName: "chrome" } } },
            })
        );
        await expect(pending).resolves.toBe(true);
    });
});
