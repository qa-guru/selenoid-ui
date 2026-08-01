/** SSE + /status feed constants for Selenoid UI. */

import type { HealthStatus, UiStatusPayload } from "../types/hub";

/**
 * Absolute same-origin URL for fetch/EventSource.
 * Chromium rejects relative fetch() when the document URL embeds basic auth
 * (`https://user:pass@host/…` → "URL that includes credentials").
 */
export function sameOriginURL(path: string): string {
    if (typeof window === "undefined" || !window.location?.origin) {
        return path;
    }
    return new URL(path, window.location.origin).href;
}

export const FALLBACK_POLL_MS = 4_000;
export const RECONNECT_BASE_MS = 1_000;
export const RECONNECT_MAX_MS = 30_000;
export const SSE_OK_MS = 4_000;
export const SSE_STALE_MS = 16_000;
export const SSE_WATCHDOG_MS = 2_000;

export function isUiStatusPayload(payload: unknown): payload is UiStatusPayload {
    return Boolean(payload && typeof payload === "object" && (payload as UiStatusPayload).state);
}

export function deriveSelenoidStatus(payload: unknown): HealthStatus {
    if (!payload || typeof payload !== "object") {
        return "unknown";
    }
    const p = payload as UiStatusPayload;
    if (Array.isArray(p.errors) && p.errors.length > 0) {
        return "error";
    }
    if (p.state) {
        return "ok";
    }
    return "unknown";
}

export function refreshSseStatus(
    lastSseAt: number | null | undefined,
    hasData: boolean,
    now = Date.now()
): HealthStatus {
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

export function reconnectDelayMs(attempt: number): number {
    return Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
}
