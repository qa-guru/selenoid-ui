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

/** Hub / UI proxy error body → user-visible Create Session message. */
export async function hubSessionErrorMessage(response: Response): Promise<string> {
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

/** Chromium-family launch args so the window opens already at screenResolution. */
export function browserWindowOptions(
    browserName: unknown,
    screenResolution: unknown
): Record<string, { args: string[] }> | null {
    const size = parseScreenSize(screenResolution);
    if (!size) {
        return null;
    }
    const args = [`--window-size=${size.width},${size.height}`, "--window-position=0,0"];
    const name = String(browserName || "").toLowerCase();
    if (name === "chrome" || name === "chromium" || name === "opera") {
        return { "goog:chromeOptions": { args } };
    }
    if (name === "msedge" || name === "edge" || name === "microsoftedge") {
        return { "ms:edgeOptions": { args } };
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
    if (isPlaywrightBrowser(browserProtocols, name, version)) {
        return "playwright";
    }
    return browserProtocols?.[name || ""]?.[version || ""]?.protocol === "playwright" ? "playwright" : "webdriver";
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

/** First manual session default — chrome catalog default, else newest chrome, else first WD row. */
export function pickDefaultWebdriverBrowser(available: BrowserPick[]): BrowserPick | undefined {
    const webdriver = available.filter(
        (item) => item.protocol !== "playwright" && item.name !== "android" && item.name !== "ios"
    );
    if (!webdriver.length) {
        return undefined;
    }
    const preferredVersion = "149.0";
    const chromeDefault = webdriver.find((item) => item.name === "chrome" && item.version === preferredVersion);
    if (chromeDefault) {
        return chromeDefault;
    }
    const chromeNewest = webdriver
        .filter((item) => item.name === "chrome")
        .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
    return chromeNewest || webdriver[0];
}
