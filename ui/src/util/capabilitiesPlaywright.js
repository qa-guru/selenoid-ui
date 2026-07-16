export const defaultPlaywrightSelenoidOptions = (accessKey = "") => {
    const options = {
        name: "Session started using curl command...",
        sessionTimeout: "1m",
        enableVNC: "true",
        enableVideo: "true",
    };
    if (accessKey) {
        options.accessKey = accessKey;
    }
    return options;
};

export const manualPlaywrightSelenoidOptions = (accessKey = "") => ({
    ...defaultPlaywrightSelenoidOptions(accessKey),
    name: "Manual session",
    sessionTimeout: "60m",
    enableVideo: "true",
    headless: "false",
    "labels.manual": "true",
});

export const playwrightWsBase = (browser, version) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host}/playwright/${browser}/${version}`;
};

export const playwrightEndpoint = (browser, version, accessKey = "") => {
    const params = new URLSearchParams(manualPlaywrightSelenoidOptions(accessKey));
    return `${playwrightWsBase(browser, version)}?${params.toString()}`;
};

export const playwrightSnippet = (browser, version, accessKey = "") => {
    const base = playwrightWsBase(browser, version);
    const selenoidOptions = defaultPlaywrightSelenoidOptions(accessKey);
    const query = new URLSearchParams(selenoidOptions).toString();
    return { base, selenoidOptions, query, full: `${base}?${query}` };
};
