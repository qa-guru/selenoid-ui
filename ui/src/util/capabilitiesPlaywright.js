/** Playwright session defaults — mirrored by the Playwright session panel. */
export const DEFAULT_PLAYWRIGHT_SESSION = {
    name: "Manual session",
    sessionTimeout: "60m",
    enableVnc: true,
    enableVideo: true,
    headless: false,
};

/** Accept "true"/"false" strings or real booleans → query string value. */
const boolStr = (value) => (typeof value === "string" ? value : value ? "true" : "false");

/**
 * selenoid:options as a query-param map for a Playwright WebSocket session.
 * The panel state is the single source of truth — snippet and Create Session
 * both flow through here so the terminal mirrors what gets launched.
 */
export const playwrightSelenoidOptions = (accessKey = "", session = {}) => {
    const s = { ...DEFAULT_PLAYWRIGHT_SESSION, ...session };
    const options = {
        name: s.name,
        sessionTimeout: s.sessionTimeout,
        enableVNC: boolStr(s.enableVnc),
        enableVideo: boolStr(s.enableVideo),
        headless: boolStr(s.headless),
        "labels.manual": "true",
    };
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
