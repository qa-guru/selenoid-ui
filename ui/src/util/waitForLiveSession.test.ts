import { afterEach, describe, expect, it, vi } from "vitest";
import { sources } from "eventsourcemock";

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
        const pending = waitForLiveSession("sess-live", { initialSessions: {} });
        const source = sources["/events"];
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

    it("resolves false after timeout when the session never appears", async () => {
        vi.useFakeTimers();
        const pending = waitForLiveSession("missing", { initialSessions: {}, timeoutMs: 5_000 });
        await vi.advanceTimersByTimeAsync(5_000);
        await expect(pending).resolves.toBe(false);
    });
});
