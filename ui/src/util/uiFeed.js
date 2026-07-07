/** SSE + /status feed constants for legacy React UI. */

export const FALLBACK_POLL_MS = 4_000;
export const RECONNECT_BASE_MS = 1_000;
export const RECONNECT_MAX_MS = 30_000;
// Backend ticks every ~4–5s (-period); allow one missed tick before STALE.
export const SSE_OK_MS = 4_000;
export const SSE_STALE_MS = 16_000;
export const SSE_WATCHDOG_MS = 2_000;

export function isUiStatusPayload(payload) {
    return Boolean(payload && typeof payload === "object" && payload.state);
}

export function deriveSelenoidStatus(payload) {
    if (!payload || typeof payload !== "object") {
        return "unknown";
    }
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        return "error";
    }
    if (payload.state) {
        return "ok";
    }
    return "unknown";
}

export function refreshSseStatus(lastSseAt, hasData, now = Date.now()) {
    if (lastSseAt == null) {
        return hasData ? "stale" : "unknown";
    }

    const age = now - lastSseAt;
    if (age <= SSE_OK_MS) {
        return "ok";
    }
    if (age <= SSE_STALE_MS) {
        return "stale";
    }
    return hasData ? "stale" : "error";
}

export function reconnectDelayMs(attempt) {
    return Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
}
