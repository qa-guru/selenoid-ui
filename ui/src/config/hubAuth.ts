/**
 * Hub guest auth SSOT.
 *
 * Build-time vars:
 *   VITE_HUB_AUTH_USER / VITE_HUB_AUTH_PASS — WebDriver Basic Auth duo
 *   VITE_HUB_ACCESS_KEY — Playwright ?accessKey= (single opaque token)
 *
 * When AUTH_* are empty, WD defaults fall back to parsing ACCESS_KEY as
 * `user:pass` (prod often bakes only HUB_ACCESS_KEY). Playwright never
 * derives from AUTH_* — ACCESS_KEY only.
 *
 * formatAccessKey joins user:pass only for WD Basic Auth / curl -u wire form.
 */

export type AccessKeyCreds = { user: string; pass: string };

/** Parse Basic Auth / legacy `user:pass` token. */
export const parseAccessKey = (token: unknown): AccessKeyCreds | null => {
    const raw = String(token || "").trim();
    if (!raw) {
        return null;
    }
    const idx = raw.indexOf(":");
    if (idx <= 0) {
        return null;
    }
    return { user: raw.slice(0, idx), pass: raw.slice(idx + 1) };
};

/** WD Basic Auth wire token (`user:pass`). Empty user → "". Not used for Playwright. */
export const formatAccessKey = (user: unknown, pass: unknown): string => {
    const authUser = String(user || "").trim();
    if (!authUser) {
        return "";
    }
    return `${authUser}:${String(pass ?? "")}`;
};

/** Playwright ?accessKey= default — VITE_HUB_ACCESS_KEY only (never derived from AUTH_*). */
export const defaultHubAccessKey = (): string => String(import.meta.env.VITE_HUB_ACCESS_KEY ?? "").trim();

/** Alias — same bake-time Playwright token. */
export const defaultPlaywrightAccessKey = (): string => defaultHubAccessKey();

/**
 * WebDriver authUser default — VITE_HUB_AUTH_USER, else parse ACCESS_KEY.
 * Explicit AUTH_USER wins so duo can differ from the Playwright token.
 */
export const defaultHubAuthUser = (): string => {
    const explicit = String(import.meta.env.VITE_HUB_AUTH_USER ?? "").trim();
    if (explicit) {
        return explicit;
    }
    return parseAccessKey(defaultHubAccessKey())?.user ?? "";
};

/**
 * WebDriver authPass default — paired with AUTH_USER when that is set;
 * otherwise parse ACCESS_KEY (same bake-only-ACCESS_KEY prod path).
 */
export const defaultHubAuthPass = (): string => {
    const explicitUser = String(import.meta.env.VITE_HUB_AUTH_USER ?? "").trim();
    if (explicitUser) {
        return String(import.meta.env.VITE_HUB_AUTH_PASS ?? "");
    }
    const parsed = parseAccessKey(defaultHubAccessKey());
    if (parsed) {
        return parsed.pass;
    }
    return String(import.meta.env.VITE_HUB_AUTH_PASS ?? "");
};

export const hubAuthHeaders = (authToken: unknown): Record<string, string> => {
    const creds = parseAccessKey(authToken);
    if (!creds || typeof btoa !== "function") {
        return {};
    }
    return { Authorization: `Basic ${btoa(`${creds.user}:${creds.pass}`)}` };
};

const shellQuote = (value: string): string => String(value).replace(/'/g, "'\\''");

/** curl `-u 'user:pass' ` prefix (trailing space), or "" when no creds. */
export const hubAuthCurlFlag = (authToken: unknown): string => {
    const creds = parseAccessKey(authToken);
    if (!creds) {
        return "";
    }
    return `-u '${shellQuote(`${creds.user}:${creds.pass}`)}' `;
};

export const hubFetchInit = (authToken: unknown, init: RequestInit = {}): RequestInit => ({
    ...init,
    credentials: "omit",
    headers: {
        ...(init.headers || {}),
        ...hubAuthHeaders(authToken),
    },
});

/** Warm Basic Auth on the hub proxy before session create / Playwright WS. */
export const primeHubAuth = (authToken: unknown): Promise<Response | void> => {
    const headers = hubAuthHeaders(authToken);
    if (!headers.Authorization) {
        return Promise.resolve();
    }
    // Absolute origin avoids Chromium rejecting relative fetch when the
    // document URL embeds basic auth (https://user:pass@host/…).
    const statusURL = new URL("/wd/hub/status", window.location.origin).href;
    return fetch(statusURL, {
        method: "GET",
        headers,
        credentials: "omit",
    });
};
