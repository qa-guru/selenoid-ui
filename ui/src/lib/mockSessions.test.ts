import { afterEach, describe, expect, it, vi } from "vitest";

import {
    isMockSessionsEnabled,
    MOCK_SESSIONS_CHANGE,
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
