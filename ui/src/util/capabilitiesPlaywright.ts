import type { PlaywrightSessionForm } from "../types/hub";

/** Playwright session defaults — mirrored by the Playwright session panel. */
export const DEFAULT_PLAYWRIGHT_SESSION: PlaywrightSessionForm = {
    name: "Manual session",
    sessionTimeout: "60m",
    screenResolution: "1920x1080x24",
    enableVnc: true,
    enableVideo: true,
    /** Hub CDP → /har/<id>.har — not Playwright client recordHar. */
    enableHar: false,
    /** Hub harContent meta|bodies — only sent when enableHAR; meta = omit. */
    harContent: "meta",
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

export type PlaywrightSessionInput = Partial<PlaywrightSessionForm> & Record<string, unknown>;

/** Accept "true"/"false" strings or real booleans → query string value. */
const boolStr = (value: unknown): string => (typeof value === "string" ? value : value ? "true" : "false");

/** CSV / newline `KEY=value` → env string[]. */
const parseEnvList = (raw: unknown): string[] =>
    String(raw || "")
        .split(/[\n,]+/)
        .map((s: any) => s.trim())
        .filter(Boolean);

/** CSV / newline `key=value` → labels map. */
const parseLabelsMap = (raw: unknown): Record<string, string> => {
    const out: Record<string, string> = {};
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
 */
export const playwrightSelenoidOptions = (
    accessKey = "",
    session: PlaywrightSessionInput = {}
): Record<string, string> => {
    const s = { ...DEFAULT_PLAYWRIGHT_SESSION, ...session };
    const options: Record<string, string> = {
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

    const labels = typeof s.labels === "string" ? parseLabelsMap(s.labels) : (s.labels as Record<string, string>) || {};
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
    // harContent only with enableHAR; omit/meta ≡ hub default; bodies is opt-in.
    if (boolStr(s.enableHar) === "true" && String(s.harContent || "").trim() === "bodies") {
        options.harContent = "bodies";
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

export const playwrightWsBase = (browser: string, version: string): string => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host}/playwright/${browser}/${version}`;
};

export const playwrightEndpoint = (
    browser: string,
    version: string,
    accessKey = "",
    session: PlaywrightSessionInput = {}
): string => {
    const params = new URLSearchParams(playwrightSelenoidOptions(accessKey, session));
    return `${playwrightWsBase(browser, version)}?${params.toString()}`;
};

export const playwrightSnippet = (
    browser: string,
    version: string,
    accessKey = "",
    session: PlaywrightSessionInput = {}
): { base: string; selenoidOptions: Record<string, string>; query: string; full: string } => {
    const base = playwrightWsBase(browser, version);
    const selenoidOptions = playwrightSelenoidOptions(accessKey, session);
    const query = new URLSearchParams(selenoidOptions).toString();
    return { base, selenoidOptions, query, full: `${base}?${query}` };
};
