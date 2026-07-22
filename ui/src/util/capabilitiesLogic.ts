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

/** Chromium-family launch args so the window opens already at screenResolution. */
export function browserWindowOptions(browserName, screenResolution) {
    const size = parseScreenSize(screenResolution);
    if (!size) {
        return null;
    }
    const args = [`--window-size=${size.width},${size.height}`, "--window-position=0,0", "--start-maximized"];
    const name = String(browserName || "").toLowerCase();
    if (name === "chrome" || name === "chromium" || name === "opera") {
        return { "goog:chromeOptions": { args } };
    }
    if (name === "msedge" || name === "edge" || name === "microsoftedge") {
        return { "ms:edgeOptions": { args } };
    }
    return null;
}

async function postSessionCommand(sessionId, path, body, fetchImpl) {
    return fetchImpl(`/wd/hub/session/${encodeURIComponent(sessionId)}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body == null ? undefined : JSON.stringify(body),
    });
}

/**
 * Fit browser window to screenResolution after Create Session.
 * screenResolution only sizes Xvfb; browsers often keep a default window.
 * Maximize first (Firefox ignores oversized window/rect), then set rect/size.
 */
export async function resizeSessionWindow(sessionId, screenResolution, fetchImpl = fetch) {
    const size = parseScreenSize(screenResolution);
    if (!sessionId || !size) {
        return false;
    }

    const maximize = await postSessionCommand(sessionId, "/window/maximize", {}, fetchImpl);
    if (maximize && maximize.ok) {
        return true;
    }

    const rect = await postSessionCommand(
        sessionId,
        "/window/rect",
        { x: 0, y: 0, width: size.width, height: size.height },
        fetchImpl
    );
    if (rect && rect.ok) {
        return true;
    }

    // JSON Wire fallback (older drivers / some Firefox builds).
    const wire = await postSessionCommand(
        sessionId,
        "/window/current/size",
        { width: size.width, height: size.height },
        fetchImpl
    );
    return Boolean(wire && wire.ok);
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
