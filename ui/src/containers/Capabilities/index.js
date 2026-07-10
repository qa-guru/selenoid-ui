import React, { useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { ajax } from "rxjs/ajax";
import { combineLatest } from "rxjs";
import { catchError, filter, flatMap, tap } from "rxjs/operators";

import CodeHighlight from "../../components/CodeHighlight";
import "highlight.js/styles/sunburst.css";

import Select from "react-select";

import { StyledCapabilities } from "./style.css";
import BeatLoader from "react-spinners/BeatLoader";
import { useEventCallback } from "rxjs-hooks";

import Url from "url-parse";
import { retainPlaywrightSocket } from "../../util/playwrightSessions";

const defaultPlaywrightSelenoidOptions = () => ({
    name: "Session started using curl command...",
    sessionTimeout: "1m",
    enableVNC: "true",
    enableVideo: "true",
});

const manualPlaywrightSelenoidOptions = () => ({
    ...defaultPlaywrightSelenoidOptions(),
    name: "Manual session",
    sessionTimeout: "60m",
    enableVideo: "true",
    headless: "false",
    "labels.manual": "true",
});

const playwrightWsBase = (browser, version) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host}/playwright/${browser}/${version}`;
};

const playwrightEndpoint = (browser, version) => {
    const params = new URLSearchParams(manualPlaywrightSelenoidOptions());
    return `${playwrightWsBase(browser, version)}?${params.toString()}`;
};

const playwrightSnippet = (browser, version) => {
    const base = playwrightWsBase(browser, version);
    const selenoidOptions = defaultPlaywrightSelenoidOptions();
    const query = new URLSearchParams(selenoidOptions).toString();
    return { base, selenoidOptions, query, full: `${base}?${query}` };
};

const javaSelenoidOptionsBlock = selenoidOptions => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    put("${key}", "${value}");`)
        .join("\n");
    return `new HashMap<String, String>() {{\n${entries}\n}}`;
};

const csharpSelenoidOptionsBlock = selenoidOptions => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    ["${key}"] = "${value}",`)
        .join("\n");
    return `new Dictionary<string, string> {\n${entries}\n}`;
};

const goSelenoidOptionsBlock = selenoidOptions => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `\t\t"${key}": "${value}",`)
        .join("\n");
    return `map[string]string{\n${entries}\n\t}`;
};

const phpSelenoidOptionsBlock = selenoidOptions => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    '${key}' => '${value}',`)
        .join("\n");
    return `[\n${entries}\n]`;
};

const rubySelenoidOptionsBlock = selenoidOptions => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `  '${key}' => '${value}',`)
        .join("\n");
    return `{\n${entries}\n}`;
};

const PLAYWRIGHT_BROWSER_NAMES = new Set(["playwright-chromium", "playwright-webkit", "playwright-firefox", "playwright-msedge"]);

const primeBasicAuth = () =>
    ajax({
        url: "/wd/hub/status",
        method: "GET",
        withCredentials: true,
    });


const isPlaywrightBrowser = (browserProtocols, name, version) => {
    if (PLAYWRIGHT_BROWSER_NAMES.has(name)) {
        return true;
    }
    return browserProtocols?.[name]?.[version]?.protocol === "playwright";
};

const browserProtocol = (browserProtocols, name, version) => {
    if (isPlaywrightBrowser(browserProtocols, name, version)) {
        return "playwright";
    }
    return browserProtocols?.[name]?.[version]?.protocol || "webdriver";
};

const code = (browser = "UNKNOWN", version = "", origin = "http://selenoid-uri:4444") => {
    const url = new Url(origin);
    origin = window.location.protocol + "//" + window.location.hostname + (window.location.port == "" ? "" : ":4444");
    let optionsClass = "SpecificBrowserOptions";
    switch (browser) {
        case "UNKNOWN":
        case "chrome":
            optionsClass = "ChromeOptions";
            break;
        case "firefox":
            optionsClass = "FirefoxOptions";
            break;
        case "safari":
            optionsClass = "SafariOptions";
            break;
        case "msedge":
            optionsClass = "EdgeOptions";
            break;
    }
    return {
        curl: `curl -H'Content-Type: application/json' ${origin}/wd/hub/session -d'{
    "capabilities": {
        "alwaysMatch": {
            "browserName": "${browser != "UNKNOWN" ? browser : "chrome"}",
            ${version == "" ? "" : "\"browserVersion\": \"" + version + "\","}
            "selenoid:options": {
                "name": "Session started using curl command...",
                "sessionTimeout": "1m",
                "enableVNC": true,
                "enableVideo": true
            }
        }
    }
}'
`,
        java: `${optionsClass} options = new ${optionsClass}();
${version != "" ? "options.setCapability(\"browserVersion\", \"" + version + "\");" : ""}
options.setCapability("selenoid:options", new HashMap<String, Object>() {{
    /* How to add test badge */
    put("name", "Test badge...");

    /* How to set session timeout */
    put("sessionTimeout", "15m");

    /* How to set timezone */
    put("env", new ArrayList<String>() {{
        add("TZ=UTC");
    }});

    /* How to add "trash" button */
    put("labels", new HashMap<String, Object>() {{
        put("manual", "true");
    }});

    /* How to enable VNC */
    put("enableVNC", true);

    /* How to enable video recording */
    put("enableVideo", true);
}});
RemoteWebDriver driver = new RemoteWebDriver(new URL("${origin}/wd/hub"), options);
`,
        go: `// import "github.com/tebeka/selenium"

caps := selenium.Capabilities{
        "browserName":    "${browser != "UNKNOWN" ? browser : "chrome"}",
		"browserVersion": "${version}",
		"selenoid:options": map[string]interface{}{
                /* How to add test badge */
                "name": "Test badge...",

                /* How to set session timeout */
                "sessionTimeout": "5m",

                /* How to set timezone */
                "env": []string{
                        "TZ=UTC",
                },

                /* How to add "trash" button */
                "labels": map[string]interface{}{
                        "manual": "true",
                },

                /* How to enable VNC */
                "enableVNC": true,

                /* How to enable video recording */
                "enableVideo": true,
        },
}

driver, err := selenium.NewRemote(caps, "${origin}/wd/hub")
if err != nil {
        t.Errorf("starting browser: %v", err)
}
defer driver.Quit()
`,
        "C#": `${optionsClass} options = new ${optionsClass}();
${version != "" ? "options.BrowserVersion = \"" + version + "\";" : ""}
options.AddAdditionalOption("selenoid:options", new Dictionary<string, object> {
    /* How to add test badge */
    ["name"] = "Test badge...",

    /* How to set session timeout */
    ["sessionTimeout"] = "15m",

    /* How to set timezone */
    ["env"] = new List<string>() {
        "TZ=UTC"
    },

    /* How to add "trash" button */
    ["labels"] = new Dictionary<string, object> {
        ["manual"] = "true"
    },

    /* How to enable VNC */
    ["enableVNC"] = true,

    /* How to enable video recording */
    ["enableVideo"] = true
});
IWebDriver driver = new RemoteWebDriver(new Uri("${origin}/wd/hub"), options);
`,
        python: `from selenium import webdriver
        
capabilities = {
    "browserName": "${browser != "UNKNOWN" ? browser : "chrome"}",
    "browserVersion": "${version}",
    "selenoid:options": {
        "enableVNC": True,
        "enableVideo": True
    }
}

driver = webdriver.Remote(
    command_executor="${origin}/wd/hub",
    desired_capabilities=capabilities)
`,
        javascript: `var webdriverio = require('webdriverio');
        
var options = { 
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol == "https:" ? "https" : "http"}',
    capabilities: { 
        browserName: '${browser != "UNKNOWN" ? browser : "chrome"}',
        browserVersion: '${version}',
        'selenoid:options': {
            enableVNC: true,
            enableVideo: true
        }      
    } 
};
var client = webdriverio.remote(options);
`,
        PHP: `$web_driver = RemoteWebDriver::create("${origin}/wd/hub",
array(
    "browserName"=>"${browser != "UNKNOWN" ? browser : "chrome"}",
    "browserVersion"=>"${version}",
    "selenoid:options"=>array(
        "enableVNC"=>true,
        "enableVideo"=>true
    )
)
);
`,
        ruby: `caps = Selenium::WebDriver::Remote::Capabilities.new
browserName: '${browser != "UNKNOWN" ? browser : "chrome"}',
caps["browserVersion"] = "${version}"
caps["selenoid:options"] = {
  'enableVNC' => 'true',
  'enableVideo' => 'true'
}

driver = Selenium::WebDriver.for(:remote,
  :url => "${origin}/wd/hub",
  :desired_capabilities => caps)
`,
    };
};

const playwrightClient = browser => {
    switch (browser) {
        case "playwright-webkit":
            return { js: "webkit", py: "webkit", cs: "Webkit", go: "WebKit", rb: "webkit", java: "webkit" };
        case "playwright-firefox":
            return { js: "firefox", py: "firefox", cs: "Firefox", go: "Firefox", rb: "firefox", java: "firefox" };
        case "playwright-chromium":
        case "playwright-msedge":
        default:
            return { js: "chromium", py: "chromium", cs: "Chromium", go: "Chromium", rb: "chromium", java: "chromium" };
    }
};

const playwrightCode = (browser, version) => {
    const { base, selenoidOptions, query } = playwrightSnippet(browser, version);
    const pw = playwrightClient(browser);
    const jsSelenoidOptions = JSON.stringify(selenoidOptions, null, 2);
    const pySelenoidOptions = JSON.stringify(selenoidOptions, null, 4);
    return {
        curl: `curl --websocket "${base}?${query}"`,
        java: `Playwright playwright = Playwright.create();
Map<String, String> selenoidOptions = ${javaSelenoidOptionsBlock(selenoidOptions)};
String wsEndpoint = "${base}" + "?${query}";
Browser browser = playwright.${pw.java}().connect(wsEndpoint);
Page page = browser.newPage();
page.navigate("https://example.com");
browser.close();
playwright.close();
`,
        go: `selenoidOptions := ${goSelenoidOptionsBlock(selenoidOptions)}
params := url.Values{}
for key, value := range selenoidOptions {
\tparams.Set(key, value)
}
wsEndpoint := "${base}" + "?" + params.Encode()

browser, err := pw.${pw.go}.Connect(wsEndpoint)
if err != nil {
\tlog.Fatalf("connect: %v", err)
}
page, err := browser.NewPage()
defer browser.Close()
`,
        "C#": `var selenoidOptions = ${csharpSelenoidOptionsBlock(selenoidOptions)};
var wsEndpoint = "${base}" + "?${query}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.${pw.cs}.ConnectAsync(wsEndpoint);
var page = await browser.NewPageAsync();
await page.GotoAsync("https://example.com");
await browser.CloseAsync();
`,
        python: `from urllib.parse import urlencode
from playwright.sync_api import sync_playwright

selenoid_options = ${pySelenoidOptions}
ws_endpoint = "${base}?" + urlencode(selenoid_options)

with sync_playwright() as p:
    browser = p.${pw.py}.connect(ws_endpoint)
    page = browser.new_page()
    page.goto("https://example.com")
    browser.close()
`,
        javascript: `const { ${pw.js} } = require('playwright');

const selenoidOptions = ${jsSelenoidOptions};
const wsEndpoint = \`${base}?\${new URLSearchParams(selenoidOptions)}\`;

const browser = await ${pw.js}.connect(wsEndpoint);
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
`,
        PHP: `$selenoidOptions = ${phpSelenoidOptionsBlock(selenoidOptions)};
$wsEndpoint = '${base}' . '?' . http_build_query($selenoidOptions);

$browser = Playwright::create()->${pw.py}()->connect($wsEndpoint);
$page = $browser->newPage();
$page->goto('https://example.com');
$browser->close();
`,
        ruby: `require 'uri'

selenoid_options = ${rubySelenoidOptionsBlock(selenoidOptions)}
ws_endpoint = '${base}' + '?' + URI.encode_www_form(selenoid_options)

Playwright.create do |playwright|
  browser = playwright.${pw.rb}.connect(ws_endpoint)
  page = browser.new_page
  page.goto('https://example.com')
  browser.close
end
`,
    };
};

export const sessionIdFrom = ({ response }) => {
    return response.sessionId || (response.value && response.value.sessionId) || "";
};

const findPlaywrightSession = (sessions, existingIds, name, version) => {
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
};

const Capabilities = ({ browsers = {}, browserProtocols = {}, sessions = {}, origin, history }) => {
    const [browser, onBrowserChange] = useState({});
    const [lang, onLanguageChange] = useState("curl");

    const available = [].concat(
        ...Object.keys(browsers).map(name =>
            Object.keys(browsers[name]).map(version => {
                return {
                    value: `${name}_${version}`,
                    label: `${name}: ${version}`,
                    name,
                    version,
                    protocol: browserProtocol(browserProtocols, name, version),
                };
            })
        )
    );

    const { name, version, value, protocol } = browser || {};
    const isPlaywright = protocol === "playwright" || isPlaywrightBrowser(browserProtocols, name, version);
    const caps = isPlaywright ? playwrightCode(name, version) : code(name, version, origin);
    const langKeys = Object.keys(caps);
    const activeLang = langKeys.includes(lang) ? lang : langKeys[0] || "curl";

    useEffect(() => {
        if (!langKeys.includes(lang)) {
            onLanguageChange(langKeys[0] || "curl");
        }
    }, [name, version, isPlaywright]);

    return (
        <StyledCapabilities>
            <div className="section-title">Capabilities</div>
            <div className="capabilities-body">
                <div className="setup">
                    <Select
                        className="capabilities-browser-select"
                        name="browsers"
                        value={available.find(item => item.value === value)}
                        options={available}
                        onChange={browser => onBrowserChange(browser)}
                        placeholder="Select browser..."
                        isLoading={!origin}
                        clearable={false}
                        noResultsText="No information about browsers"
                    />
                    <Launch
                        browser={browser}
                        history={history}
                        sessions={sessions}
                        isPlaywright={isPlaywright}
                    />
                </div>
                <div className="code-panel">
                    <CodeHighlight language={activeLang}>{caps[activeLang] || ""}</CodeHighlight>
                </div>
                <div className="lang-selector">
                    <div className="capabilities-langs">
                        {langKeys.map(next => (
                            <div
                                key={next}
                                className={`capabilities-lang ${next === activeLang && "capabilities-lang_active"}`}
                                onClick={() => onLanguageChange(next)}
                            >
                                {next}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StyledCapabilities>
    );
};

const Launch = ({ browser: { name, version }, history, sessions, isPlaywright }) => {
    const defaultAdditionalCaps = { operaOptions: { binary: "/usr/bin/opera" } };

    const [loading, onLoading] = useState(false);
    const [error, onError] = useState("");
    const [useMoreCaps, toggleMoreCaps] = useState(false);
    const [moreCapsError, onMoreCapsError] = useState(false);
    const [moreCaps, setMoreCaps] = useState(JSON.stringify(defaultAdditionalCaps));
    const playwrightSocket = useRef(null);

    const [createSession] = useEventCallback(
        (event$, inputs$) =>
            combineLatest(event$, inputs$).pipe(
                tap(() => {
                    onError("");
                    onLoading(true);
                }),
                flatMap(([_, [name, version, history, useMoreCaps, moreCapsError, moreCaps]]) => {
                    let desiredCapabilities = {
                        browserName: `${name}`,
                        version: `${version}`,
                        enableVNC: true,
                        enableVideo: true,
                        labels: { manual: "true" },
                        sessionTimeout: "60m",
                        name: "Manual session",
                    };
                    let selenoidOptions = {
                        enableVNC: true,
                        enableVideo: true,
                        sessionTimeout: "60m",
                        labels: { manual: "true" },
                    };

                    if (useMoreCaps && !moreCapsError) {
                        const additionalCaps = JSON.parse(moreCaps);
                        desiredCapabilities = Object.assign(desiredCapabilities, additionalCaps);
                        selenoidOptions = Object.assign(selenoidOptions, additionalCaps);
                    }

                    return primeBasicAuth().pipe(
                        flatMap(() =>
                            ajax({
                                url: "/wd/hub/session",
                                method: "POST",
                                withCredentials: true,
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                timeout: 300000,
                                body: {
                                    desiredCapabilities,
                                    capabilities: {
                                        alwaysMatch: {
                                            browserName: `${name}`,
                                            browserVersion: `${version}`,
                                            "selenoid:options": selenoidOptions,
                                        },
                                        firstMatch: [{}],
                                    },
                                },
                            })
                        ),
                        filter(({ status }) => status === 200),
                        tap(res => history.push(`/sessions/${sessionIdFrom(res)}`))
                    );
                }),
                catchError((err, caught) => {
                    console.error("Can't start session manually", err);
                    onError(err);
                    onLoading(false);
                    return caught;
                })
            ),
        [name, version, history],
        [name, version, history, useMoreCaps, moreCapsError, moreCaps]
    );

    const createPlaywrightSession = () => {
        if (!name || !version) {
            return;
        }

        onError("");
        onLoading(true);

        const existingIds = new Set(Object.keys(sessions || {}));
        const wsUrl = playwrightEndpoint(name, version);
        let navigated = false;
        let eventSource;

        const finish = (message, closeSocket) => {
            if (closeSocket && playwrightSocket.current) {
                playwrightSocket.current.close();
                playwrightSocket.current = null;
            }
            if (eventSource) {
                eventSource.close();
            }
            onLoading(false);
            if (message) {
                onError(message);
            }
        };

        const tryNavigate = data => {
            if (navigated) {
                return;
            }
            const sessionId = findPlaywrightSession(data.sessions, existingIds, name, version);
            if (!sessionId) {
                return;
            }
            navigated = true;
            retainPlaywrightSocket(sessionId, playwrightSocket.current);
            history.push(`/sessions/${sessionId}`);
            onLoading(false);
        };

        eventSource = new EventSource("/events");
        eventSource.onmessage = e => {
            try {
                tryNavigate(JSON.parse(e.data));
            } catch (err) {
                console.error("Can't parse SSE event", err);
            }
        };
        eventSource.onerror = () => {
            if (!navigated) {
                finish("Lost connection to events stream", true);
            }
        };

        tryNavigate({ sessions });

        const openWebSocket = () => {
            const ws = new WebSocket(wsUrl);
            playwrightSocket.current = ws;

            ws.onerror = () => {
                if (!navigated) {
                    finish("Failed to start Playwright session", true);
                }
            };
            ws.onclose = () => {
                if (!navigated) {
                    finish("Playwright session closed before it was ready", true);
                }
            };
        };

        primeBasicAuth().subscribe({
            next: () => openWebSocket(),
            error: err => {
                console.error("Playwright auth failed", err);
                finish("Authentication failed", true);
            },
        });
    };

    const onCreateSession = () => {
        if (isPlaywright) {
            createPlaywrightSession();
            return;
        }
        createSession();
    };

    const onTextareaUpdate = e => {
        setMoreCaps(e.target.value);
        try {
            JSON.parse(e.target.value);
            onMoreCapsError(false);
        } catch (e) {
            onMoreCapsError(e);
        }
    };

    return (
        <div>
            <button
                onClick={onCreateSession}
                disabled={!name || loading}
                className={`new-session disabled-${!name || loading} error-${!!error}`}
                onMouseLeave={() => onError("")}
                title={error}
            >
                {loading ? <BeatLoader size={3} color={"#fff"} /> : `Create Session`}
            </button>
            {!isPlaywright && (!name || loading ? null : (
                <button onClick={() => toggleMoreCaps(!useMoreCaps)} className={"new-session-more-capabilities"}>
                    More capabilities
                </button>
            ))}
            {!useMoreCaps || isPlaywright ? null : (
                <textarea
                    spellCheck={false}
                    rows={7}
                    onChange={onTextareaUpdate}
                    className={`more-capabilities error-${!!moreCapsError}`}
                    defaultValue={JSON.stringify(defaultAdditionalCaps, null, 2)}
                />
            )}
        </div>
    );
};

Capabilities.propTypes = {
    browsers: PropTypes.object,
    browserProtocols: PropTypes.object,
    sessions: PropTypes.object,
    origin: PropTypes.string,
};

export default withRouter(Capabilities);
