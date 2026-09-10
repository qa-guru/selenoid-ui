import type { BrowserProtocols, LiveSession, SessionsMap } from "../types/hub";

export const PLAYWRIGHT_BROWSER_NAMES = new Set([
    "playwright-chromium",
    "playwright-webkit",
    "playwright-firefox",
    "playwright-msedge",
]);

type SessionCreateResponse = {
    sessionId?: string;
    value?: { sessionId?: string };
};

export function sessionIdFrom({ response }: { response?: SessionCreateResponse | null }): string {
    return response?.sessionId || response?.value?.sessionId || "";
}

/**
 * nginx / validator 401 — login/password refused, not a hub crash.
 * Never echo the body (HTML or a leaked secret). Never mention HTTP 401.
 */
export const HUB_SESSION_UNAUTHORIZED_MESSAGE =
    "Create Session rejected: login and password were not accepted. Check authUser/authPass — your handle with selenoidToken, or the guest pair.";

/** Hub / UI proxy error body → user-visible Create Session message. */
export async function hubSessionErrorMessage(response: Response): Promise<string> {
    if (response.status === 401) {
        return HUB_SESSION_UNAUTHORIZED_MESSAGE;
    }
    const prefix = `Create Session failed: HTTP ${response.status}`;
    try {
        const data = await response.json();
        const value = data?.value;
        const detail =
            (typeof value === "object" &&
                value &&
                (String(value.message || "").trim() || String(value.error || "").trim())) ||
            String(data?.message || "").trim() ||
            String(data?.error || "").trim();
        return detail ? `${prefix} — ${detail}` : prefix;
    } catch {
        return prefix;
    }
}

/** Manual Create Session wait for POST /wd/hub/session (Android + WD). */
export const CREATE_SESSION_TIMEOUT_MS = 300000; // 5m

export function scheduleCreateSessionAbort(
    controller: AbortController,
    timeoutMs: number = CREATE_SESSION_TIMEOUT_MS
): ReturnType<typeof setTimeout> {
    return setTimeout(() => {
        const minutes = Math.max(1, Math.round(timeoutMs / 60000));
        controller.abort(
            new DOMException(
                `Create Session timed out after ${minutes}m waiting for POST /wd/hub/session`,
                "TimeoutError"
            )
        );
    }, timeoutMs);
}

function createSessionTimeoutPlaque(timeoutMs: number): string {
    const minutes = Math.max(1, Math.round(timeoutMs / 60000));
    return (
        `Create Session timed out after ${minutes}m waiting for POST /wd/hub/session. ` +
        `Check the container logs or Selenoid -session-attempt-timeout.`
    );
}

function errorName(err: unknown): string {
    return err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
}

function errorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message;
    }
    if (typeof err === "string") {
        return err;
    }
    return err == null ? "" : String(err);
}

function isCreateSessionAbort(err: unknown): boolean {
    const name = errorName(err);
    if (name === "AbortError" || name === "TimeoutError") {
        return true;
    }
    return /aborted without reason|The operation was aborted|The user aborted a request/i.test(errorMessage(err));
}

/** fetch() reject (timeout / network) → Create Session plaque. Never nameless AbortError. */
export function createSessionCatchMessage(
    err: unknown,
    { timeoutMs = CREATE_SESSION_TIMEOUT_MS }: { timeoutMs?: number } = {}
): string {
    if (isCreateSessionAbort(err)) {
        return createSessionTimeoutPlaque(timeoutMs);
    }
    const message = errorMessage(err);
    if (!message || /aborted without reason/i.test(message)) {
        return createSessionTimeoutPlaque(timeoutMs);
    }
    return `Create Session failed: ${message}`;
}

/** CSV / newline `KEY=value` → env string[]. Shared by WD caps and Playwright WS query. */
export function parseEnvList(raw: unknown): string[] {
    return String(raw || "")
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

/** CSV / newline `key=value` → labels map. Flag-only tokens become `"true"`. */
export function parseLabelsMap(raw: unknown): Record<string, string> {
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
}

/** Coerce `"true"`/`"false"` strings or booleans → boolean. `Boolean("false")` is true — do not use it. */
export function asBool(value: unknown): boolean {
    return value === true || value === "true";
}

export type SelenoidOptionsInput = {
    sessionTimeout?: unknown;
    name?: unknown;
    screenResolution?: unknown;
    enableVnc?: unknown;
    enableVideo?: unknown;
    enableHar?: unknown;
    enableLog?: unknown;
    timeZone?: unknown;
    env?: unknown;
    labels?: unknown;
    videoName?: unknown;
    logName?: unknown;
    harName?: unknown;
    harContent?: unknown;
};

/** SSOT for Create Session + snippets — all keys go to selenoid:options. */
export function buildSelenoidOptions({
    sessionTimeout,
    name,
    screenResolution,
    enableVnc,
    enableVideo,
    enableHar,
    enableLog,
    timeZone,
    env,
    labels,
    videoName,
    logName,
    harName,
    harContent,
}: SelenoidOptionsInput): Record<string, any> {
    const opts: Record<string, any> = {
        enableVNC: asBool(enableVnc),
        enableVideo: asBool(enableVideo),
        enableHAR: asBool(enableHar),
        enableLog: asBool(enableLog),
        sessionTimeout,
        name,
        screenResolution,
        timeZone: timeZone || "UTC",
        labels: typeof labels === "string" ? parseLabelsMap(labels) : labels || {},
    };
    const envList = typeof env === "string" ? parseEnvList(env) : Array.isArray(env) ? env : [];
    if (envList.length) {
        opts.env = envList;
    }
    const video = String(videoName || "").trim();
    const log = String(logName || "").trim();
    const har = String(harName || "").trim();
    if (opts.enableVideo && video) {
        opts.videoName = video;
    }
    if (opts.enableLog && log) {
        opts.logName = log;
    }
    if (opts.enableHAR && har) {
        opts.harName = har;
    }
    if (opts.enableHAR && String(harContent || "").trim() === "bodies") {
        opts.harContent = "bodies";
    }
    return opts;
}

export const DEFAULT_ANDROID_ORIENTATION = "PORTRAIT";

/** Minimal selenoid:options for a mobile (Android) session — no proxy/har/log/env/skin. */
export function buildAndroidSelenoidOptions({
    name,
    sessionTimeout,
    enableVnc,
    enableVideo,
}: {
    name?: unknown;
    sessionTimeout?: unknown;
    enableVnc?: unknown;
    enableVideo?: unknown;
}): Record<string, any> {
    return {
        enableVNC: asBool(enableVnc),
        enableVideo: asBool(enableVideo),
        name,
        sessionTimeout,
    };
}

/**
 * W3C alwaysMatch for Selenoid Android (appium:* caps).
 * SSOT for Create Session + androidCode snippets.
 */
export function buildAndroidCapabilities({
    version,
    app,
    noReset,
    autoGrantPermissions,
    orientation,
    selenoidOptions,
}: {
    version?: unknown;
    app?: unknown;
    noReset?: unknown;
    autoGrantPermissions?: unknown;
    orientation?: unknown;
    selenoidOptions?: unknown;
}): Record<string, any> {
    const caps: Record<string, any> = {
        browserName: "android",
        browserVersion: String(version || ""),
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:noReset": asBool(noReset),
        "appium:autoGrantPermissions": asBool(autoGrantPermissions),
        "appium:orientation": orientation || DEFAULT_ANDROID_ORIENTATION,
        "selenoid:options": selenoidOptions,
    };
    const appUrl = String(app || "").trim();
    if (appUrl) {
        caps["appium:app"] = appUrl;
    }
    return caps;
}

export type ScreenSize = { width: number; height: number };

/** Parse `1920x1080` / `1920x1080x24` → outer window size. */
export function parseScreenSize(screenResolution: unknown): ScreenSize | null {
    const match = String(screenResolution || "").match(/^(\d+)x(\d+)(?:x\d+)?$/i);
    if (!match) {
        return null;
    }
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (!width || !height) {
        return null;
    }
    return { width, height };
}

/**
 * Docker Chromium/Edge as root. Without these, ChromeDriver returns
 * "session not created: Chrome instance exited" (no X/sandbox in the container).
 */
export const CHROMIUM_CONTAINER_ARGS = ["--no-sandbox", "--disable-dev-shm-usage"];

/** Chromium-family launch args: container sandbox flags + window at screenResolution. */
export function browserWindowOptions(
    browserName: unknown,
    screenResolution: unknown
): Record<string, { args: string[] }> | null {
    const name = String(browserName || "").toLowerCase();
    const size = parseScreenSize(screenResolution);
    const args = [...CHROMIUM_CONTAINER_ARGS];
    if (size) {
        args.push(`--window-size=${size.width},${size.height}`, "--window-position=0,0");
    }
    if (name === "chrome" || name === "chromium" || name === "opera") {
        return { "goog:chromeOptions": { args } };
    }
    if (name === "msedge" || name === "edge" || name === "microsoftedge") {
        return { "ms:edgeOptions": { args } };
    }
    if (name === "firefox") {
        if (!size) {
            return null;
        }
        return {
            "moz:firefoxOptions": {
                args: [`--width=${size.width}`, `--height=${size.height}`],
            },
        };
    }
    return null;
}

async function postSessionCommand(
    sessionId: string,
    path: string,
    body: unknown,
    fetchImpl: typeof fetch,
    authToken: string,
    signal?: AbortSignal
): Promise<Response | undefined> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Basic ${btoa(String(authToken))}` } : {}),
    };
    return fetchImpl(`/wd/hub/session/${encodeURIComponent(sessionId)}${path}`, {
        method: "POST",
        credentials: "omit",
        headers,
        body: body == null ? undefined : JSON.stringify(body),
        signal,
    });
}

/**
 * Fit browser window to screenResolution after Create Session.
 * screenResolution only sizes Xvfb; browsers often keep a default window.
 * Prefer explicit window/rect (maximize is deprecated / flaky in containers).
 */
export async function resizeSessionWindow(
    sessionId: string,
    screenResolution: unknown,
    fetchImpl: typeof fetch = fetch,
    authToken: any = "",
    signal?: AbortSignal
): Promise<boolean> {
    const size = parseScreenSize(screenResolution);
    if (!sessionId || !size) {
        return false;
    }

    // Firefox often rejects a full-screen window/rect until maximize.
    // Chrome/Edge in Xvfb ignore --window-size; rect is the real resize.
    await postSessionCommand(sessionId, "/window/maximize", {}, fetchImpl, authToken, signal);

    const rect = await postSessionCommand(
        sessionId,
        "/window/rect",
        { x: 0, y: 0, width: size.width, height: size.height },
        fetchImpl,
        authToken,
        signal
    );
    if (rect && rect.ok) {
        return true;
    }
    if (rect && (rect.status >= 500 || rect.status === 404)) {
        return false;
    }

    // JSON Wire fallback (older drivers / some Firefox builds).
    const wire = await postSessionCommand(
        sessionId,
        "/window/current/size",
        { width: size.width, height: size.height },
        fetchImpl,
        authToken,
        signal
    );
    return Boolean(wire && wire.ok);
}

/** POST /session/:id/url — open a page in the live session (course probe, not a grid app). */
export async function openSessionUrl(
    sessionId: string,
    url: string,
    fetchImpl: typeof fetch = fetch,
    authToken: any = "",
    signal?: AbortSignal
): Promise<boolean> {
    if (!sessionId || !String(url || "").trim()) {
        return false;
    }
    const res = await postSessionCommand(sessionId, "/url", { url }, fetchImpl, authToken, signal);
    return Boolean(res && res.ok);
}

export function isPlaywrightBrowser(
    browserProtocols: BrowserProtocols | undefined,
    name: string | undefined,
    version?: string
): boolean {
    if (!name) {
        return false;
    }
    if (PLAYWRIGHT_BROWSER_NAMES.has(name)) {
        return true;
    }
    return browserProtocols?.[name]?.[version || ""]?.protocol === "playwright";
}

export function browserProtocol(
    browserProtocols: BrowserProtocols | undefined,
    name: string | undefined,
    version?: string
): "playwright" | "webdriver" {
    return isPlaywrightBrowser(browserProtocols, name, version) ? "playwright" : "webdriver";
}

function playwrightSessionCaps(session: LiveSession | undefined) {
    return session?.caps || {};
}

export function findPlaywrightSession(
    sessions: SessionsMap | undefined,
    existingIds: Set<string>,
    name: string,
    version: string,
    sessionName?: string
): string {
    for (const [id, session] of Object.entries(sessions || {})) {
        if (existingIds.has(id)) {
            continue;
        }
        const caps = playwrightSessionCaps(session);
        if (caps.browserName !== name) {
            continue;
        }
        if (caps.version && caps.version !== version) {
            continue;
        }
        if (sessionName && caps.name && caps.name !== sessionName) {
            continue;
        }
        return id;
    }
    return "";
}

type BrowserPick = { value: string; name: string; version: string; protocol?: string };

export function isMinBrowserVersion(version: string): boolean {
    return String(version || "").trim().endsWith("-min");
}

/** Hub/UI copy for -min + desktop extras. Hub returns the same text as W3C invalid argument. */
export function minImageCapabilityError(
    version: string,
    flags: { enableVnc?: boolean; enableVideo?: boolean; enableHar?: boolean } = {}
): string | null {
    const catalogVersion = String(version || "").trim();
    if (!isMinBrowserVersion(catalogVersion)) {
        return null;
    }
    const unsupported: string[] = [];
    if (flags.enableVnc) {
        unsupported.push("enableVNC");
    }
    if (flags.enableVideo) {
        unsupported.push("enableVideo");
    }
    if (flags.enableHar) {
        unsupported.push("enableHAR");
    }
    if (!unsupported.length) {
        return null;
    }
    return `${catalogVersion} is a headless CI image and does not support ${unsupported.join(", ")} — use the full image, or turn those options off`;
}

function newestByVersion(items: BrowserPick[]): BrowserPick | undefined {
    return [...items].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
}

/** First manual session default — newest full chrome (not -min), else newest chrome, else first WD row. */
export function pickDefaultWebdriverBrowser(available: BrowserPick[]): BrowserPick | undefined {
    const webdriver = available.filter(
        (item) => item.protocol !== "playwright" && item.name !== "android" && item.name !== "ios"
    );
    if (!webdriver.length) {
        return undefined;
    }
    const chrome = webdriver.filter((item) => item.name === "chrome");
    const chromeFull = chrome.filter((item) => !isMinBrowserVersion(item.version));
    return newestByVersion(chromeFull.length ? chromeFull : chrome) || webdriver[0];
}
