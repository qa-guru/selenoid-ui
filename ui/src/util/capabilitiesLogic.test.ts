import { describe, expect, it, vi } from "vitest";
import { parseScreenSize, resizeSessionWindow, sessionIdFrom } from "./capabilitiesLogic";

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

    it("resizes session window to screenResolution via window/rect", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledWith("/wd/hub/session/sess-1/window/rect", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: 0, y: 0, width: 1920, height: 1080 }),
        });
    });

    it("skips resize when sessionId or resolution is missing", async () => {
        const fetchImpl = vi.fn();
        await expect(resizeSessionWindow("", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        await expect(resizeSessionWindow("sess-1", "bad", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });
});
