/** Internal hub hostnames from selenoid-ui `-webdriver-uri` / docker links — not browser-reachable. */
export const INTERNAL_HUB_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "selenoid"]);

export function stripHubPath(value) {
    const raw = String(value || "")
        .trim()
        .replace(/\/$/, "");
    return raw.replace(/\/wd\/hub$/i, "");
}

export function originFromProp(origin) {
    const base = stripHubPath(origin || "");
    if (!base) {
        return "";
    }
    try {
        return new URL(base.includes("://") ? base : `http://${base}`).origin;
    } catch {
        return base;
    }
}

export function isInternalHubHost(hostname) {
    return INTERNAL_HUB_HOSTS.has(String(hostname || "").toLowerCase());
}

/**
 * Hub origin for remoteUrl display and Terminal snippets.
 * Prefer the UI page origin when backend reports an internal docker/localhost hub.
 */
export function resolveHubOrigin(origin, pageOrigin) {
    const page =
        pageOrigin ||
        (typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
            ? window.location.origin
            : "");

    const propOrigin = originFromProp(origin);
    if (!propOrigin) {
        return page;
    }

    try {
        const propHost = new URL(propOrigin).hostname;
        if (page && isInternalHubHost(propHost)) {
            return page;
        }
    } catch {
        /* fall through */
    }

    return propOrigin;
}

export function hubRemoteUrl(origin, pageOrigin) {
    const base = resolveHubOrigin(origin, pageOrigin);
    if (!base) {
        return "/wd/hub";
    }
    return `${base}/wd/hub`;
}

function parseAuthToken(token) {
    const raw = String(token || "").trim();
    if (!raw) {
        return null;
    }
    const idx = raw.indexOf(":");
    if (idx <= 0) {
        return null;
    }
    return { user: raw.slice(0, idx), pass: raw.slice(idx + 1) };
}

export function hubSessionUrl(origin, authToken, pageOrigin) {
    const base = hubRemoteUrl(origin, pageOrigin);
    const creds = parseAuthToken(authToken);
    if (!creds) {
        return base;
    }
    try {
        const url = new URL(base);
        url.username = creds.user;
        url.password = creds.pass;
        return url.toString();
    } catch {
        return base;
    }
}
