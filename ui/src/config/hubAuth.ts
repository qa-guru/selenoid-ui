/** Hub guest auth SSOT — UI duo authUser/authPass; wire formats Basic Auth + Playwright ?accessKey=. */

export type AccessKeyCreds = { user: string; pass: string };

/** Parse hub accessKey / Playwright ?accessKey= token (`user:pass`). */
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

/** Wire token for Playwright ?accessKey= and agent payload (empty user → ""). */
export const formatAccessKey = (user: unknown, pass: unknown): string => {
    const authUser = String(user || "").trim();
    if (!authUser) {
        return "";
    }
    return `${authUser}:${String(pass ?? "")}`;
};

/**
 * Build-time hub defaults (CI / ui/.env.local). Empty = manual entry in Capabilities.
 * VITE_HUB_ACCESS_KEY (`user:pass`) wins over separate VITE_HUB_AUTH_USER/PASS.
 */
export const defaultHubAccessKey = (): string => import.meta.env.VITE_HUB_ACCESS_KEY ?? "";

export const defaultHubAuthUser = (): string => {
    const parsed = parseAccessKey(defaultHubAccessKey());
    if (parsed?.user) {
        return parsed.user;
    }
    return import.meta.env.VITE_HUB_AUTH_USER ?? "";
};

export const defaultHubAuthPass = (): string => {
    const parsed = parseAccessKey(defaultHubAccessKey());
    if (parsed) {
        return parsed.pass;
    }
    return import.meta.env.VITE_HUB_AUTH_PASS ?? "";
};

/** Same guest token as Basic Auth — preferred baked key, else user:pass from AUTH_* fields. */
export const defaultPlaywrightAccessKey = (): string => {
    const key = defaultHubAccessKey();
    if (key) {
        return key;
    }
    return formatAccessKey(defaultHubAuthUser(), defaultHubAuthPass());
};

/** Split accessKey into form fields; missing parts fall back to build-time defaults. */
export const fieldsFromAccessKey = (accessKey: unknown): { authUser: string; authPass: string } => {
    const parsed = parseAccessKey(accessKey);
    return {
        authUser: parsed?.user || defaultHubAuthUser(),
        authPass: parsed?.pass ?? defaultHubAuthPass(),
    };
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
    return fetch("/wd/hub/status", {
        method: "GET",
        headers,
        credentials: "omit",
    });
};
