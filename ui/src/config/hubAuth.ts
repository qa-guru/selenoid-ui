/** Parse hub accessKey / Playwright ?accessKey= token (`user:pass`). */
const parseAccessKey = (token) => {
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

/**
 * Build-time hub defaults (CI / ui/.env.local). Empty = manual entry in Capabilities.
 * VITE_HUB_ACCESS_KEY (`user:pass`) wins over separate VITE_HUB_AUTH_USER/PASS.
 */
export const defaultHubAccessKey = () => import.meta.env.VITE_HUB_ACCESS_KEY ?? "";

export const defaultHubAuthUser = () => {
    const parsed = parseAccessKey(defaultHubAccessKey());
    if (parsed?.user) {
        return parsed.user;
    }
    return import.meta.env.VITE_HUB_AUTH_USER ?? "";
};

export const defaultHubAuthPass = () => {
    const parsed = parseAccessKey(defaultHubAccessKey());
    if (parsed) {
        return parsed.pass;
    }
    return import.meta.env.VITE_HUB_AUTH_PASS ?? "";
};

/** Playwright WS ?accessKey= — same guest token as hub Basic Auth. */
export const defaultPlaywrightAccessKey = () => {
    const key = defaultHubAccessKey();
    if (key) {
        return key;
    }
    const user = defaultHubAuthUser();
    if (!user) {
        return "";
    }
    return `${user}:${defaultHubAuthPass()}`;
};
