import { afterEach, describe, expect, it } from "vitest";

import {
    clearOptimisticLiveSession,
    markLiveSessionEnded,
    mergeOptimisticLiveSessions,
    resetOptimisticLiveSessions,
    reviveLiveSession,
    seedOptimisticLiveSession,
    subscribeOptimisticLiveSessions,
} from "./optimisticLive";

describe("optimisticLive", () => {
    afterEach(() => {
        resetOptimisticLiveSessions();
    });

    it("fills a missing feed id and lets the hub snapshot win", () => {
        seedOptimisticLiveSession("sess-1", { caps: { browserName: "firefox" }, quota: "qa" });
        expect(mergeOptimisticLiveSessions({})["sess-1"]?.quota).toBe("qa");
        expect(mergeOptimisticLiveSessions({ "sess-1": { caps: { browserName: "chrome" }, quota: "hub" } })["sess-1"]?.quota).toBe(
            "hub"
        );
    });

    it("notifies subscribers on seed and clear", () => {
        const listener = { n: 0 };
        const off = subscribeOptimisticLiveSessions(() => {
            listener.n += 1;
        });
        seedOptimisticLiveSession("sess-2", { caps: { browserName: "chrome" } });
        clearOptimisticLiveSession("sess-2");
        off();
        seedOptimisticLiveSession("sess-2", { caps: { browserName: "chrome" } });
        expect(listener.n).toBe(2);
    });

    it("strips an ended id even when the hub snapshot still lists it", () => {
        seedOptimisticLiveSession("sess-3", { caps: { browserName: "chrome" } });
        markLiveSessionEnded("sess-3");
        expect(mergeOptimisticLiveSessions({ "sess-3": { caps: { browserName: "chrome" } } })["sess-3"]).toBeUndefined();
        reviveLiveSession("sess-3");
        expect(mergeOptimisticLiveSessions({ "sess-3": { caps: { browserName: "chrome" }, quota: "hub" } })["sess-3"]?.quota).toBe(
            "hub"
        );
    });

    it("ignores empty ids and no-ops a revive of an unknown session", () => {
        markLiveSessionEnded("");
        reviveLiveSession("missing");
        clearOptimisticLiveSession("");
        seedOptimisticLiveSession("", { caps: { browserName: "chrome" } });
        expect(mergeOptimisticLiveSessions({})).toEqual({});
    });

    it("attaches a live subscriber", () => {
        const off = subscribeOptimisticLiveSessions(() => undefined);
        off();
    });
});
