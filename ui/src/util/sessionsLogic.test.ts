import { describe, expect, it } from "vitest";
import {
    filterVideoFiles,
    matchesSessionQuery,
    sessionIdShort,
    sortSessionIds,
    videoPreloadMode,
} from "./sessionsLogic";

describe("sessionsLogic", () => {
    const sessions = {
        manual: {
            quota: "1",
            caps: { browserName: "chrome", version: "120", labels: { manual: "true" }, name: "Manual" },
        },
        auto: {
            quota: "2",
            caps: { browserName: "firefox", version: "115", name: "Smoke" },
        },
    };

    it("matches session by browser name", () => {
        expect(matchesSessionQuery("manual", sessions, "chrome")).toBe(true);
        expect(matchesSessionQuery("auto", sessions, "chrome")).toBe(false);
    });

    it("sorts manual sessions first", () => {
        expect(sortSessionIds(["auto", "manual"], sessions)).toEqual(["manual", "auto"]);
    });

    it("filters video files", () => {
        expect(filterVideoFiles(["a.mp4", "b.txt"], "a")).toEqual(["a.mp4"]);
    });

    it("chooses preload mode by count", () => {
        expect(videoPreloadMode(50)).toBe("auto");
        expect(videoPreloadMode(150)).toBe("none");
    });

    it("shortens session id for display", () => {
        expect(sessionIdShort("abcdef12-xyz")).toBe("abcdef12");
        expect(sessionIdShort("12345678")).toBe("12345678");
    });
});
