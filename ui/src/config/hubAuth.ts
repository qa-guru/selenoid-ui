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

/**
 * Same-origin fetch that never lets the browser cache HTTP Basic Auth.
 * credentials:omit + Authorization header — Chrome must not show a native
 * login dialog when nginx returns 401.
 */
export const hubFetch = (path: string, authToken: unknown, init: RequestInit = {}): Promise<Response> => {
    const url =
        typeof window === "undefined" || !window.location?.origin || /^https?:\/\//i.test(path)
            ? path
            : new URL(path, window.location.origin).href;
    return fetch(url, hubFetchInit(authToken, init));
};

/** Download a hub artifact via fetch+blob so <a href> cannot trigger Basic Auth. */
export const downloadWithHubAuth = async (
    path: string,
    filename: string,
    authToken: unknown
): Promise<void> => {
    const res = await hubFetch(path, authToken, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

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
