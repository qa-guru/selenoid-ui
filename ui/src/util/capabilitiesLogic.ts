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
    authToken: string
): Promise<Response | undefined> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Basic ${btoa(String(authToken))}` } : {}),
    };
    return fetchImpl(`/wd/hub/session/${encodeURIComponent(sessionId)}${path}`, {
        method: "POST",
        // Prefer explicit Basic Auth (prod nginx). credentials:include alone hangs headless
        // browsers on auth challenges after Create Session succeeds.
        credentials: "omit",
        headers,
        body: body == null ? undefined : JSON.stringify(body),
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
    authToken: any = ""
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
        authToken
    );
    if (rect && rect.ok) {
        return true;
    }

    // JSON Wire fallback (older drivers / some Firefox builds).
    const wire = await postSessionCommand(
        sessionId,
        "/window/current/size",
        { width: size.width, height: size.height },
        fetchImpl,
        authToken
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
    version: string
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
        if (caps.name && caps.name !== "Manual session") {
            continue;
        }
        return id;
    }
    return "";
}
