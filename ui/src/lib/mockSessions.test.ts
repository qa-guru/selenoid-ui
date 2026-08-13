import { afterEach, describe, expect, it, vi } from "vitest";

import {
    isMockSessionsEnabled,
    MOCK_SESSIONS_CHANGE,
    mockDetailsSession,
    mockLivePreview,
    setMockSessionsEnabled,
    subscribeMockSessions,
} from "./mockSessions";

function resetUrl() {
    window.history.replaceState(null, "", "/");
}

afterEach(() => {
    resetUrl();
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

    it("enables via replaceState without reload and keeps the hash route", () => {
        window.history.replaceState(null, "", "/#/sessions");
        const replaceState = vi.spyOn(window.history, "replaceState");

        setMockSessionsEnabled(true);

        expect(replaceState).toHaveBeenCalled();
        expect(window.location.search).toBe("?mock=1");
        expect(window.location.hash).toBe("#/sessions");
        expect(isMockSessionsEnabled()).toBe(true);

        replaceState.mockRestore();
    });

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
