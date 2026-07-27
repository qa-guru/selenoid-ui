/** Playwright session defaults — mirrored by the Playwright session panel. */
export const DEFAULT_PLAYWRIGHT_SESSION = {
    name: "Manual session",
    sessionTimeout: "60m",
    screenResolution: "1920x1080x24",
    enableVnc: true,
    enableVideo: true,
    /** Hub CDP → /har/<id>.har — not Playwright client recordHar. */
    enableHar: false,
    enableLog: false,
    timeZone: "UTC",
    env: "",
    labels: "manual=true",
    videoName: "",
    logName: "",
    /** host:port or scheme://host:port — hub normalizes to PW_PROXY for launchServer. */
    socksProxy: "",
    headless: false,
};

/** Accept "true"/"false" strings or real booleans → query string value. */
const boolStr = (value) => (typeof value === "string" ? value : value ? "true" : "false");

/** CSV / newline `KEY=value` → env string[]. */
const parseEnvList = (raw) =>
    String(raw || "")
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

/** CSV / newline `key=value` → labels map. */
const parseLabelsMap = (raw) => {
    const out = {};
    for (const part of String(raw || "").split(/[\n,]+/)) {
        const trimmed = part.trim();
        if (!trimmed) {
            continue;
        }
        const eq = trimmed.indexOf("=");
        if (eq === -1) {
            out[trimmed] = "true";
        } else {
            const key = trimmed.slice(0, eq).trim();
            if (key) {
                out[key] = trimmed.slice(eq + 1).trim();
            }
        }
    }
    return out;
};

/**
 * selenoid:options as a query-param map for a Playwright WebSocket session.
 * The panel state is the single source of truth — snippet and Create Session
 * both flow through here so the terminal mirrors what gets launched.
 *
 * Hub parse: capsFromQuery in playwright.go (name, screenResolution, sessionTimeout,
 * enableVNC/Video/HAR/Log, videoName, logName, harName, timeZone, env.*, labels.*,
 * socksProxy → PW_PROXY for image launchServer / headed VNC).
 */
export const playwrightSelenoidOptions = (accessKey = "", session = {}) => {
    const s = { ...DEFAULT_PLAYWRIGHT_SESSION, ...session };
    const options = {
        name: s.name,
        sessionTimeout: s.sessionTimeout,
        screenResolution: s.screenResolution,
        enableVNC: boolStr(s.enableVnc),
        enableVideo: boolStr(s.enableVideo),
        enableHAR: boolStr(s.enableHar),
        enableLog: boolStr(s.enableLog),
        timeZone: s.timeZone || "UTC",
        headless: boolStr(s.headless),
    };

    const labels = typeof s.labels === "string" ? parseLabelsMap(s.labels) : s.labels || {};
    for (const [key, value] of Object.entries(labels)) {
        options[`labels.${key}`] = String(value);
    }
    // Keep a stable default when the panel leaves labels empty.
    if (!Object.keys(labels).length) {
        options["labels.manual"] = "true";
    }

    for (const entry of parseEnvList(s.env)) {
        const eq = entry.indexOf("=");
        if (eq <= 0) {
            continue;
        }
        const key = entry.slice(0, eq).trim();
        if (key) {
            options[`env.${key}`] = entry.slice(eq + 1).trim();
        }
    }

    const video = String(s.videoName || "").trim();
    const log = String(s.logName || "").trim();
    if (boolStr(s.enableVideo) === "true" && video) {
        options.videoName = video;
    }
    if (boolStr(s.enableLog) === "true" && log) {
        options.logName = log;
    }

    const proxy = String(s.socksProxy || "").trim();
    if (proxy) {
        options.socksProxy = proxy;
    }

    if (accessKey) {
        options.accessKey = accessKey;
    }
    return options;
};

export const playwrightWsBase = (browser, version) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host}/playwright/${browser}/${version}`;
};

export const playwrightEndpoint = (browser, version, accessKey = "", session = {}) => {
    const params = new URLSearchParams(playwrightSelenoidOptions(accessKey, session));
    return `${playwrightWsBase(browser, version)}?${params.toString()}`;
};

export const playwrightSnippet = (browser, version, accessKey = "", session = {}) => {
    const base = playwrightWsBase(browser, version);
    const selenoidOptions = playwrightSelenoidOptions(accessKey, session);
    const query = new URLSearchParams(selenoidOptions).toString();
    return { base, selenoidOptions, query, full: `${base}?${query}` };
};
