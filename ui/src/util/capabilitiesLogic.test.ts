import { describe, expect, it, vi } from "vitest";
import {
    browserWindowOptions,
    CREATE_SESSION_TIMEOUT_MS,
    createSessionCatchMessage,
    hubSessionErrorMessage,
    parseScreenSize,
    pickDefaultWebdriverBrowser,
    resizeSessionWindow,
    scheduleCreateSessionAbort,
    sessionIdFrom,
} from "./capabilitiesLogic";

describe("capabilitiesLogic", () => {
    it("handles old selenium protocol versions", () => {
        expect(
            sessionIdFrom({
                response: {
                    sessionId: "session-1",
                },
            })
        ).toBe("session-1");
    });

    it("handles new selenium protocol versions", () => {
        expect(
            sessionIdFrom({
                response: {
                    value: {
                        sessionId: "session-2",
                    },
                },
            })
        ).toBe("session-2");
    });

    it("handles wrong response as empty", () => {
        expect(
            sessionIdFrom({
                response: {},
            })
        ).toBe("");
    });

    it("parses screenResolution WxH and WxHxD", () => {
        expect(parseScreenSize("1920x1080x24")).toEqual({ width: 1920, height: 1080 });
        expect(parseScreenSize("1280x1024")).toEqual({ width: 1280, height: 1024 });
        expect(parseScreenSize("bad")).toBeNull();
        expect(parseScreenSize("")).toBeNull();
    });

    it("builds chromium/edge window launch options from screenResolution", () => {
        expect(browserWindowOptions("chrome", "1920x1080x24")).toEqual({
            "goog:chromeOptions": {
                args: ["--window-size=1920,1080", "--window-position=0,0"],
            },
        });
        expect(browserWindowOptions("msedge", "1280x1024x24")).toEqual({
            "ms:edgeOptions": {
                args: ["--window-size=1280,1024", "--window-position=0,0"],
            },
        });
        expect(browserWindowOptions("firefox", "1920x1080x24")).toBeNull();
    });

    it("sets window/rect from screenResolution", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(fetchImpl).toHaveBeenCalledWith("/wd/hub/session/sess-1/window/rect", {
            method: "POST",
            credentials: "omit",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: 0, y: 0, width: 1920, height: 1080 }),
            signal: undefined,
        });
    });

    it("sends Basic Auth on window/rect when authToken is provided", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl, "user1:1234")).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledWith(
            "/wd/hub/session/sess-1/window/rect",
            expect.objectContaining({
                credentials: "omit",
                headers: expect.objectContaining({
                    Authorization: `Basic ${btoa("user1:1234")}`,
                }),
            })
        );
    });

    it("falls back to window/current/size when rect fails with unsupported status", async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, status: 405 })
            .mockResolvedValueOnce({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenNthCalledWith(
            2,
            "/wd/hub/session/sess-1/window/current/size",
            expect.objectContaining({
                body: JSON.stringify({ width: 1920, height: 1080 }),
            })
        );
    });

    it("does not fall back when rect returns invalid session", async () => {
        const fetchImpl = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it("skips resize when sessionId or resolution is missing", async () => {
        const fetchImpl = vi.fn();
        await expect(resizeSessionWindow("", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        await expect(resizeSessionWindow("sess-1", "bad", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("formats hub session error message from W3C value", async () => {
        const response = new Response(
            JSON.stringify({
                value: {
                    error: "session not created",
                    message: "Chrome instance exited",
                },
            }),
            { status: 500 }
        );
        await expect(hubSessionErrorMessage(response)).resolves.toBe(
            "Create Session failed: HTTP 500 — Chrome instance exited"
        );
    });

    it("maps AbortError / TimeoutError to a 5m Create Session timeout, never aborted-without-reason", () => {
        const nameless = new DOMException("signal is aborted without reason", "AbortError");
        const timedOut = new DOMException("Create Session timed out after 5m waiting for POST /wd/hub/session", "TimeoutError");
        for (const err of [nameless, timedOut]) {
            const message = createSessionCatchMessage(err, { timeoutMs: CREATE_SESSION_TIMEOUT_MS });
            expect(message).toContain("timed out after 5m waiting for POST /wd/hub/session");
            expect(message).toMatch(/container logs|-session-attempt-timeout/);
            expect(message).not.toMatch(/aborted without reason/i);
            expect(message).not.toMatch(/AbortError/);
        }
    });

    it("maps network TypeError to Create Session failed, not AbortError", () => {
        expect(createSessionCatchMessage(new TypeError("Failed to fetch"))).toBe(
            "Create Session failed: Failed to fetch"
        );
    });

    it("aborts Create Session with TimeoutError reason after the wait", () => {
        vi.useFakeTimers();
        try {
            const controller = new AbortController();
            scheduleCreateSessionAbort(controller, CREATE_SESSION_TIMEOUT_MS);
            expect(controller.signal.aborted).toBe(false);
            vi.advanceTimersByTime(CREATE_SESSION_TIMEOUT_MS);
            expect(controller.signal.aborted).toBe(true);
            expect((controller.signal.reason as { name?: string }).name).toBe("TimeoutError");
        } finally {
            vi.useRealTimers();
        }
    });

    it("pickDefaultWebdriverBrowser prefers chrome 149.0", () => {
        const picked = pickDefaultWebdriverBrowser([
            { value: "chrome_148.0", name: "chrome", version: "148.0", protocol: "webdriver" },
            { value: "chrome_149.0", name: "chrome", version: "149.0", protocol: "webdriver" },
            { value: "playwright-chromium_1.61.1", name: "playwright-chromium", version: "1.61.1", protocol: "playwright" },
        ]);
        expect(picked?.value).toBe("chrome_149.0");
    });
});
