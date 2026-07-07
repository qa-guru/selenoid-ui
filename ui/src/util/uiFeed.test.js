import {
    deriveSelenoidStatus,
    isUiStatusPayload,
    reconnectDelayMs,
    refreshSseStatus,
} from "./uiFeed";

describe("uiFeed", () => {
    it("detects UI-shaped /status payload", () => {
        expect(isUiStatusPayload({ state: { total: 1 } })).toBe(true);
        expect(isUiStatusPayload({ total: 1 })).toBe(false);
    });

    it("derives selenoid status from payload", () => {
        expect(deriveSelenoidStatus({ state: { total: 1 }, errors: [] })).toBe("ok");
        expect(deriveSelenoidStatus({ errors: [{ msg: "x" }] })).toBe("error");
    });

    it("uses age-based SSE status", () => {
        const now = 1_000_000;
        expect(refreshSseStatus(now - 2_000, true, now)).toBe("ok");
        expect(refreshSseStatus(now - 8_000, true, now)).toBe("stale");
        expect(refreshSseStatus(null, true, now)).toBe("stale");
        expect(refreshSseStatus(null, false, now)).toBe("unknown");
    });

    it("caps reconnect backoff", () => {
        expect(reconnectDelayMs(0)).toBe(1_000);
        expect(reconnectDelayMs(10)).toBe(30_000);
    });
});
