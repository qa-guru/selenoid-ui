export const PLAYWRIGHT_BROWSER_NAMES = new Set([
    "playwright-chromium",
    "playwright-webkit",
    "playwright-firefox",
    "playwright-msedge",
]);

export function sessionIdFrom({ response }) {
    return response?.sessionId || response?.value?.sessionId || "";
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
