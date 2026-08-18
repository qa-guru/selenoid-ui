import { afterEach, describe, expect, it, vi } from "vitest";

import {
    isMockLiveSession,
    isMockSessionsEnabled,
    mergeMockLiveSessions,
    MOCK_SESSIONS_CHANGE,
    MOCK_SESSION_ID,
    mockDetailsSession,
    mockLivePreview,
    removeMockLiveSession,
    resetMockLiveSessionOverlay,
    setMockSessionsEnabled,
    spawnCreatedMockSession,
    subscribeMockSessions,
} from "./mockSessions";

function resetUrl() {
    window.history.replaceState(null, "", "/");
}

afterEach(() => {
    resetUrl();
    resetMockLiveSessionOverlay();
    setMockSessionsEnabled(false);
});

describe("mockSessions URL flag", () => {
    it("is off by default", () => {
        resetUrl();
        expect(isMockSessionsEnabled()).toBe(false);
    });

    it("reads ?mock=1 from search (before hash)", () => {
        window.history.replaceState(null, "", "/?mock=1#/sessions");
        expect(isMockSessionsEnabled()).toBe(true);
        expect(window.location.hash).toBe("#/sessions");
    });

    it("reads mock=1 from the hash query", () => {
        window.history.replaceState(null, "", "/#/sessions?mock=1");
        expect(isMockSessionsEnabled()).toBe(true);
    });

    it.each(["#/statistics", "#/sessions", "#/new-session", "#/benchmarks", "#/sessions/abc"])(
        "enables via replaceState without reload and keeps hash %s",
        (hash) => {
            window.history.replaceState(null, "", `/${hash}`);
            const replaceState = vi.spyOn(window.history, "replaceState");

            setMockSessionsEnabled(true);

            expect(replaceState).toHaveBeenCalled();
            expect(window.location.search).toBe("?mock=1");
            expect(window.location.hash).toBe(hash);
            expect(isMockSessionsEnabled()).toBe(true);

            replaceState.mockRestore();
            setMockSessionsEnabled(false);
        }
    );

    it("disables by stripping search and hash mock", () => {
        window.history.replaceState(null, "", "/?mock=1#/sessions?mock=1");
        setMockSessionsEnabled(false);
        expect(window.location.search).toBe("");
        expect(window.location.hash).toBe("#/sessions");
        expect(isMockSessionsEnabled()).toBe(false);
    });

    it("notifies subscribers without a popstate", () => {
        const listener = vi.fn();
        const stop = subscribeMockSessions(listener);
        setMockSessionsEnabled(true);
        expect(listener).toHaveBeenCalledTimes(1);
        stop();
        setMockSessionsEnabled(false);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("exports a stable change event name", () => {
        expect(MOCK_SESSIONS_CHANGE).toBe("selenoid-ui:mock-sessions");
    });
});

describe("mockLivePreview overlay on a hub session", () => {
    const hub = {
        id: "hub-sess-1",
        quota: "alice",
        caps: { browserName: "firefox", version: "150.0", enableVNC: true, name: "LoginTest" },
    };

    it("does not mock a hub session while the flag is off", () => {
        resetUrl();
        expect(mockLivePreview("hub-sess-1", hub, false)).toBeNull();
        expect(mockLivePreview("hub-sess-1", hub)).toBeNull();
    });

    it("uses the hub session caps when mock is on (VNC → active desktop)", () => {
        expect(mockLivePreview("hub-sess-1", hub, true)).toBe("active");
    });

    it("stays stub when that session has VNC off", () => {
        expect(
            mockLivePreview("hub-sess-1", { ...hub, caps: { ...hub.caps, enableVNC: false } }, true)
        ).toBe("stub");
    });

    it("stays starting when that session is still freezing", () => {
        expect(mockLivePreview("hub-sess-1", { ...hub, starting: true }, true)).toBe("starting");
    });

    it("keeps pairwise fixture behaviour without the flag", () => {
        resetUrl();
        expect(mockLivePreview("mockmax-aaaaaaaaaaaaaaaaaaaaaaa")).toBe("active");
        expect(mockLivePreview("mockfrz-aaaaaaaaaaaaaaaaaaaaaaa")).toBe("starting");
        expect(mockLivePreview("mockmin-aaaaaaaaaaaaaaaaaaaaaaa")).toBe("stub");
    });
});

describe("mockDetailsSession", () => {
    it("prefers the live hub session", () => {
        const live = { id: "hub-1", caps: { browserName: "firefox", enableVNC: true } };
        expect(mockDetailsSession("hub-1", live, { video: "x.mp4" })).toBe(live);
    });

    it("rebuilds caps from finished archive artifacts", () => {
        const overlay = mockDetailsSession("fin-1", undefined, {
            quota: "alice",
            name: "LoginTest",
            video: "fin-1.mp4",
            log: "fin-1.log",
        });
        expect(overlay?.quota).toBe("alice");
        expect(overlay?.caps?.browserName).toBe("chrome");
        expect(overlay?.caps?.name).toBe("LoginTest");
        expect(overlay?.caps?.enableVNC).toBe(true);
        expect(overlay?.caps?.enableVideo).toBe(true);
        expect(overlay?.caps?.enableLog).toBe(true);
        expect(overlay?.caps?.enableHAR).toBe(false);
    });

    it("returns null when there is nothing to overlay", () => {
        expect(mockDetailsSession("missing", undefined, null, null)).toBeNull();
    });
});

describe("created mock sessions from Create Session", () => {
    it("merges a form-built session on top of pairwise fixtures", () => {
        const id = spawnCreatedMockSession({
            browserName: "chrome",
            version: "149.0",
            quota: "alice",
            caps: {
                name: "RTL session",
                enableVNC: true,
                screenResolution: "1280x1024x24",
                sessionTimeout: "15m",
                labels: { manual: "true" },
            },
        });

        expect(id.startsWith("mockusr-")).toBe(true);
        expect(isMockLiveSession(id)).toBe(true);

        const merged = mergeMockLiveSessions({ hub: { id: "hub", caps: { browserName: "firefox" } } });
        expect(merged.hub?.caps?.browserName).toBe("firefox");
        expect(merged[MOCK_SESSION_ID.max]).toBeTruthy();
        expect(merged[id]?.caps?.browserName).toBe("chrome");
        expect(merged[id]?.caps?.version).toBe("149.0");
        expect(merged[id]?.caps?.name).toBe("RTL session");
        expect(merged[id]?.caps?.screenResolution).toBe("1280x1024x24");
        expect(merged[id]?.quota).toBe("alice");
    });

    it("drops a created session without touching pairwise fixtures", () => {
        const id = spawnCreatedMockSession({
            browserName: "firefox",
            version: "151.0",
            caps: { name: "gone" },
        });
        expect(removeMockLiveSession(id)).toBe(true);
        expect(mergeMockLiveSessions({})[id]).toBeUndefined();
        expect(mergeMockLiveSessions({})[MOCK_SESSION_ID.max]).toBeTruthy();
        expect(isMockLiveSession(id)).toBe(false);
    });

    it("hides a pairwise fixture until overlay reset", () => {
        expect(removeMockLiveSession(MOCK_SESSION_ID.min)).toBe(true);
        expect(mergeMockLiveSessions({})[MOCK_SESSION_ID.min]).toBeUndefined();
        expect(mergeMockLiveSessions({})[MOCK_SESSION_ID.max]).toBeTruthy();
        expect(isMockLiveSession(MOCK_SESSION_ID.min)).toBe(true);

        resetMockLiveSessionOverlay();
        expect(mergeMockLiveSessions({})[MOCK_SESSION_ID.min]).toBeTruthy();
    });
});
