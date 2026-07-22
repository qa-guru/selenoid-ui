import { describe, expect, it, vi } from "vitest";
import { browserWindowOptions, parseScreenSize, resizeSessionWindow, sessionIdFrom } from "./capabilitiesLogic";

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
                args: ["--window-size=1920,1080", "--window-position=0,0", "--start-maximized"],
            },
        });
        expect(browserWindowOptions("msedge", "1280x1024x24")).toEqual({
            "ms:edgeOptions": {
                args: ["--window-size=1280,1024", "--window-position=0,0", "--start-maximized"],
            },
        });
        expect(browserWindowOptions("firefox", "1920x1080x24")).toBeNull();
    });

    it("maximizes session window before falling back to window/rect", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(fetchImpl).toHaveBeenCalledWith("/wd/hub/session/sess-1/window/maximize", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
    });

    it("falls back to window/rect when maximize fails", async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, status: 404 })
            .mockResolvedValueOnce({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenNthCalledWith(
            2,
            "/wd/hub/session/sess-1/window/rect",
            expect.objectContaining({
                body: JSON.stringify({ x: 0, y: 0, width: 1920, height: 1080 }),
            })
        );
    });

    it("skips resize when sessionId or resolution is missing", async () => {
        const fetchImpl = vi.fn();
        await expect(resizeSessionWindow("", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        await expect(resizeSessionWindow("sess-1", "bad", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });
});
