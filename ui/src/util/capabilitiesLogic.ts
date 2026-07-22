export const PLAYWRIGHT_BROWSER_NAMES = new Set([
    "playwright-chromium",
    "playwright-webkit",
    "playwright-firefox",
    "playwright-msedge",
]);

export function sessionIdFrom({ response }) {
    return response?.sessionId || response?.value?.sessionId || "";
}

/** Parse `1920x1080` / `1920x1080x24` → outer window size. */
export function parseScreenSize(screenResolution) {
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
 * Resize browser window to screenResolution after Create Session.
 * screenResolution only sets Xvfb; without this the browser stays at default size.
 */
export async function resizeSessionWindow(sessionId, screenResolution, fetchImpl = fetch) {
    const size = parseScreenSize(screenResolution);
    if (!sessionId || !size) {
        return false;
    }
    const response = await fetchImpl(`/wd/hub/session/${encodeURIComponent(sessionId)}/window/rect`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: 0, y: 0, width: size.width, height: size.height }),
    });
    return Boolean(response && response.ok);
}

export function isPlaywrightBrowser(browserProtocols, name, version) {
    if (!name) {
        return false;
    }
    if (PLAYWRIGHT_BROWSER_NAMES.has(name)) {
        return true;
    }
    return browserProtocols?.[name]?.[version || ""]?.protocol === "playwright";
}

export function browserProtocol(browserProtocols, name, version) {
    if (isPlaywrightBrowser(browserProtocols, name, version)) {
        return "playwright";
    }
    return browserProtocols?.[name || ""]?.[version || ""]?.protocol === "playwright" ? "playwright" : "webdriver";
}

export function findPlaywrightSession(sessions, existingIds, name, version) {
    for (const [id, session] of Object.entries(sessions || {})) {
        if (existingIds.has(id)) {
            continue;
        }
        const caps = session.caps || {};
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
