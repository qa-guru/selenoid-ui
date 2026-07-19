import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import CodeHighlight from "../../components/CodeHighlight";
import "highlight.js/styles/sunburst.css";

import { StyledCapabilities } from "./style.css";

import { retainPlaywrightSocket } from "../../util/playwrightSessions";
import {
    browserProtocol,
    findPlaywrightSession,
    isPlaywrightBrowser,
    sessionIdFrom,
} from "../../util/capabilitiesLogic";
import { playwrightEndpoint, playwrightSnippet } from "../../util/capabilitiesPlaywright";
import { CapabilitiesLaunchActions } from "../../components/CapabilitiesLaunchActions";

import {
    IconCopy,
    IconReset,
    Panel,
    PlaqueField,
    PlaqueFieldGrid,
    PlaqueFieldSeg,
    PlaqueSelect,
    PlaqueTagstrip,
    highlightOutput,
    usePlaqueFieldMagnet,
} from "@zero-design-system/react";
import "@zero-design-system/react/styles.css";

/**
 * Capabilities session options → react-ui wrapper → hub caps key.
 * remoteUrl is display-only (hub endpoint), not a capability.
 *
 * | option           | wrapper      | layout | caps key                          |
 * |------------------|--------------|--------|-----------------------------------|
 * | remoteUrl        | PlaqueField  | solo   | — (readonly display)              |
 * | sessionTimeout   | PlaqueSelect | duo    | selenoid:options.sessionTimeout   |
 * | name             | PlaqueField  | duo    | selenoid:options.name             |
 * | screenResolution | PlaqueSelect | solo   | selenoid:options.screenResolution |
 * | enableVnc        | PlaqueFieldSeg | solo | enableVNC / selenoid:options      |
 * | enableVideo      | PlaqueFieldSeg | solo | enableVideo                       |
 * | enableHar        | PlaqueFieldSeg | solo | enableHAR                         |
 *
 * Ban: closeBrowser* / gradle* / junit* / allure* / builder fields.
 *
 * Terminal bar (canon configurator / autotests-builder): Agent | Terminal | JSON
 * trail tabs, language foot rail on Terminal, vector# fingerprint +
 * IconReset (Сброс) + IconCopy (Копировать).
 */
const SESSION_TIMEOUT_OPTIONS = [
    { value: "1m" },
    { value: "5m" },
    { value: "15m" },
    { value: "30m" },
    { value: "60m" },
];

const SCREEN_RESOLUTION_OPTIONS = [
    { value: "1920x1080x24", label: "1920×1080×24" },
    { value: "1280x1024x24", label: "1280×1024×24" },
    { value: "1366x768x24", label: "1366×768×24" },
    { value: "1920x1080", label: "1920×1080" },
];

const VECTOR_REGISTRY_KEY = "selenoid-capabilities-vector-registry";

/** Same 8-hex fingerprint as autotests-builder / react-ui configurator demo. */
const vectorHash = (value) => {
    const str = JSON.stringify(value);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
    }
    return `00000000${(h >>> 0).toString(16)}`.slice(-8);
};

const normalizeVectorId = (raw) => {
    let id = String(raw || "").trim();
    if (!id) return "";
    id = id
        .replace(/^vector\s*[:#]?\s*/i, "")
        .replace(/^#/, "")
        .trim();
    if (!id) return "";
    return `vector#${id}`;
};

const fingerprint = (snap) => `vector#${vectorHash(snap)}`;

const cloneSessionSnap = (snap) => ({ ...snap });

const loadVectorRegistry = () => {
    const map = new Map();
    try {
        const raw = localStorage.getItem(VECTOR_REGISTRY_KEY);
        if (!raw) return map;
        const parsed = JSON.parse(raw);
        for (const [id, snap] of Object.entries(parsed)) {
            if (snap && typeof snap === "object") {
                map.set(id, cloneSessionSnap(snap));
            }
        }
    } catch {
        /* corrupt / private mode */
    }
    return map;
};

const persistVectorRegistry = (registry) => {
    try {
        const obj = {};
        registry.forEach((snap, id) => {
            obj[id] = snap;
        });
        localStorage.setItem(VECTOR_REGISTRY_KEY, JSON.stringify(obj));
    } catch {
        /* private mode / quota */
    }
};

const hubRemoteUrl = (origin) => {
    if (origin) {
        return `${String(origin).replace(/\/$/, "")}/wd/hub`;
    }
    if (typeof window === "undefined") {
        return "/wd/hub";
    }
    return `${window.location.protocol}//${window.location.host}/wd/hub`;
};

const javaSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    put("${key}", "${value}");`)
        .join("\n");
    return `new HashMap<String, String>() {{\n${entries}\n}}`;
};

const csharpSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    ["${key}"] = "${value}",`)
        .join("\n");
    return `new Dictionary<string, string> {\n${entries}\n}`;
};

const goSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `\t\t"${key}": "${value}",`)
        .join("\n");
    return `map[string]string{\n${entries}\n\t}`;
};

const phpSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    '${key}' => '${value}',`)
        .join("\n");
    return `[\n${entries}\n]`;
};

const rubySelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `  '${key}' => '${value}',`)
        .join("\n");
    return `{\n${entries}\n}`;
};

const kotlinSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    "${key}" to "${value}",`)
        .join("\n");
    return `mapOf(\n${entries}\n)`;
};

const swiftSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    "${key}": "${value}",`)
        .join("\n");
    return `[\n${entries}\n]`;
};

const rustDesiredCapabilities = (browser) => {
    switch (browser) {
        case "firefox":
            return "DesiredCapabilities::firefox()";
        case "safari":
            return "DesiredCapabilities::safari()";
        case "msedge":
            return "DesiredCapabilities::edge()";
        default:
            return "DesiredCapabilities::chrome()";
    }
};

const rustSelenoidOptionsBlock = (selenoidOptions) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `        ("${key}".to_string(), "${value}".to_string()),`)
        .join("\n");
    return `[\n${entries}\n    ]`;
};

const primeBasicAuth = () =>
    fetch("/wd/hub/status", {
        method: "GET",
        credentials: "include",
    });

const DEFAULT_SESSION_OPTS = {
    sessionTimeout: "60m",
    name: "Manual session",
    screenResolution: "1920x1080x24",
    enableVnc: true,
    enableVideo: true,
    enableHar: false,
};

/** Tab order in the terminal language rail (Object.keys order is not the UI SSOT). */
const TERMINAL_LANG_ORDER = [
    "curl",
    "java",
    "kotlin",
    "swift",
    "python",
    "javascript",
    "typescript",
    "go",
    "rust",
    "C#",
    "PHP",
    "ruby",
];

/** Display labels for language tabs (snippet keys stay lowercase / legacy). */
const TERMINAL_LANG_LABELS = {
    curl: "curl",
    java: "Java",
    kotlin: "Kotlin",
    swift: "Swift",
    python: "Python",
    javascript: "Javascript",
    typescript: "Typescript",
    go: "Go",
    rust: "Rust",
    "C#": "C#",
    PHP: "PHP",
    ruby: "Ruby",
};

/** Same ids / barLabels as autotests-builder / configurator demo `OUTPUT_TABS`. */
const OUTPUT_TABS = [
    { id: "prompt", label: "Agent prompt", barLabel: "Agent" },
    { id: "gradle", label: "Terminal", barLabel: "Terminal" },
    { id: "json", label: "JSON vector", barLabel: "JSON" },
];

const langLabel = (key) => TERMINAL_LANG_LABELS[key] || key;

const orderedLangKeys = (caps) => {
    const keys = Object.keys(caps);
    const ranked = TERMINAL_LANG_ORDER.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !TERMINAL_LANG_ORDER.includes(k));
    return ranked.concat(rest);
};

/** Hub origin for prompts/snippets (same host, port 4444). */
const hubOrigin = () =>
    window.location.protocol + "//" + window.location.hostname + (window.location.port == "" ? "" : ":4444");

/** Agent prompt — markdown vector + Driver / Remote hub (configurator SSOT). */
const buildAgentPrompt = ({ vectorId, name, version, isPlaywright, sessionOpts, remoteUrl }) => {
    const browserLabel = name ? `${name}${version ? ` ${version}` : ""}` : "—";
    const payload = {
        vector: vectorId,
        browser: name || "",
        browserVersion: version || "",
        protocol: isPlaywright ? "playwright" : "webdriver",
        remoteUrl,
        sessionTimeout: sessionOpts.sessionTimeout,
        name: sessionOpts.name,
        screenResolution: sessionOpts.screenResolution,
        enableVnc: String(sessionOpts.enableVnc),
        enableVideo: String(sessionOpts.enableVideo),
        enableHar: String(sessionOpts.enableHar),
    };
    return [
        "Настрой Selenoid Capabilities со следующим вектором.",
        "",
        `## Vector \`${vectorId}\``,
        "```json",
        JSON.stringify(payload, null, 2),
        "```",
        "",
        "## Driver",
        `- browser: **${browserLabel}**`,
        `- protocol: **${payload.protocol}**`,
        "",
        "## Remote hub",
        `- remoteUrl: \`${remoteUrl}\``,
        `- sessionTimeout: **${sessionOpts.sessionTimeout}**`,
        `- name: **${sessionOpts.name}**`,
        `- screenResolution: **${sessionOpts.screenResolution}**`,
        `- enableVnc / enableVideo / enableHar: **${payload.enableVnc}** / **${payload.enableVideo}** / **${payload.enableHar}**`,
    ].join("\n");
};

/** JSON vector tab — fingerprint + caps snapshot. */
const buildCapsJson = (capsSnap, vectorId, meta = {}) =>
    JSON.stringify({ ...capsSnap, vector: vectorId, ...meta }, null, 2);

/** Terminal snippets mirror Remote hub session options (createSession SSOT). */
const code = (browser = "UNKNOWN", version = "", origin = "http://selenoid-uri:4444", session = {}) => {
    origin = window.location.protocol + "//" + window.location.hostname + (window.location.port == "" ? "" : ":4444");
    const {
        sessionTimeout = DEFAULT_SESSION_OPTS.sessionTimeout,
        name: sessionName = DEFAULT_SESSION_OPTS.name,
        screenResolution = DEFAULT_SESSION_OPTS.screenResolution,
        enableVnc = DEFAULT_SESSION_OPTS.enableVnc,
        enableVideo = DEFAULT_SESSION_OPTS.enableVideo,
        enableHar = DEFAULT_SESSION_OPTS.enableHar,
    } = session;
    const browserName = browser != "UNKNOWN" ? browser : "chrome";
    const nameJson = JSON.stringify(sessionName);
    const timeoutJson = JSON.stringify(sessionTimeout);
    const resolutionJson = JSON.stringify(screenResolution);
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
        curl: `curl -H 'Content-Type: application/json' ${origin}/wd/hub/session -d '{
    "capabilities": {
        "alwaysMatch": {
            "browserName": "${browserName}",
            ${version == "" ? "" : '"browserVersion": "' + version + '",'}
            "selenoid:options": {
                "name": ${nameJson},
                "sessionTimeout": ${timeoutJson},
                "screenResolution": ${resolutionJson},
                "enableVNC": ${enableVnc},
                "enableVideo": ${enableVideo},
                "enableHAR": ${enableHar}
            }
        }
    }
}'
`,
        java: `${optionsClass} options = new ${optionsClass}();
${version != "" ? 'options.setCapability("browserVersion", "' + version + '");' : ""}
options.setCapability("selenoid:options", new HashMap<String, Object>() {{
    put("name", ${nameJson});
    put("sessionTimeout", ${timeoutJson});
    put("screenResolution", ${resolutionJson});
    put("env", new ArrayList<String>() {{
        add("TZ=UTC");
    }});
    put("labels", new HashMap<String, Object>() {{
        put("manual", "true");
    }});
    put("enableVNC", ${enableVnc});
    put("enableVideo", ${enableVideo});
    put("enableHAR", ${enableHar});
}});
RemoteWebDriver driver = new RemoteWebDriver(new URL("${origin}/wd/hub"), options);
`,
        kotlin: `val options = ${optionsClass}()
${version != "" ? 'options.setCapability("browserVersion", "' + version + '")' : ""}
options.setCapability(
    "selenoid:options",
    mapOf(
        "name" to ${nameJson},
        "sessionTimeout" to ${timeoutJson},
        "screenResolution" to ${resolutionJson},
        "env" to listOf("TZ=UTC"),
        "labels" to mapOf("manual" to "true"),
        "enableVNC" to ${enableVnc},
        "enableVideo" to ${enableVideo},
        "enableHAR" to ${enableHar}
    )
)
val driver = RemoteWebDriver(URL("${origin}/wd/hub"), options)
`,
        go: `// import "github.com/tebeka/selenium"

caps := selenium.Capabilities{
        "browserName":    "${browserName}",
		"browserVersion": "${version}",
		"selenoid:options": map[string]interface{}{
                "name": ${nameJson},
                "sessionTimeout": ${timeoutJson},
                "screenResolution": ${resolutionJson},
                "env": []string{
                        "TZ=UTC",
                },
                "labels": map[string]interface{}{
                        "manual": "true",
                },
                "enableVNC": ${enableVnc},
                "enableVideo": ${enableVideo},
                "enableHAR": ${enableHar},
        },
}

driver, err := selenium.NewRemote(caps, "${origin}/wd/hub")
if err != nil {
        t.Errorf("starting browser: %v", err)
}
defer driver.Quit()
`,
        rust: `// cargo add thirtyfour tokio serde_json --features thirtyfour/rustls-tls,tokio/macros,tokio/rt-multi-thread
use serde_json::json;
use thirtyfour::prelude::*;

#[tokio::main]
async fn main() -> WebDriverResult<()> {
    let mut caps = ${rustDesiredCapabilities(browser)};
${version != "" ? '    caps.set_browser_version("' + version + '")?;\n' : ""}    caps.add(
        "selenoid:options",
        json!({
            "name": ${nameJson},
            "sessionTimeout": ${timeoutJson},
            "screenResolution": ${resolutionJson},
            "env": ["TZ=UTC"],
            "labels": { "manual": "true" },
            "enableVNC": ${enableVnc},
            "enableVideo": ${enableVideo},
            "enableHAR": ${enableHar}
        }),
    )?;

    let driver = WebDriver::new("${origin}/wd/hub", caps).await?;
    driver.quit().await?;
    Ok(())
}
`,
        "C#": `${optionsClass} options = new ${optionsClass}();
${version != "" ? 'options.BrowserVersion = "' + version + '";' : ""}
options.AddAdditionalOption("selenoid:options", new Dictionary<string, object> {
    ["name"] = ${nameJson},
    ["sessionTimeout"] = ${timeoutJson},
    ["screenResolution"] = ${resolutionJson},
    ["env"] = new List<string>() {
        "TZ=UTC"
    },
    ["labels"] = new Dictionary<string, object> {
        ["manual"] = "true"
    },
    ["enableVNC"] = ${enableVnc},
    ["enableVideo"] = ${enableVideo},
    ["enableHAR"] = ${enableHar}
});
IWebDriver driver = new RemoteWebDriver(new Uri("${origin}/wd/hub"), options);
`,
        python: `from selenium import webdriver
        
capabilities = {
    "browserName": "${browserName}",
    "browserVersion": "${version}",
    "selenoid:options": {
        "name": ${nameJson},
        "sessionTimeout": ${timeoutJson},
        "screenResolution": ${resolutionJson},
        "enableVNC": ${enableVnc ? "True" : "False"},
        "enableVideo": ${enableVideo ? "True" : "False"},
        "enableHAR": ${enableHar ? "True" : "False"}
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
        browserName: '${browserName}',
        browserVersion: '${version}',
        'selenoid:options': {
            name: ${nameJson},
            sessionTimeout: ${timeoutJson},
            screenResolution: ${resolutionJson},
            enableVNC: ${enableVnc},
            enableVideo: ${enableVideo},
            enableHAR: ${enableHar}
        }      
    } 
};
var client = webdriverio.remote(options);
`,
        typescript: `import { remote, type RemoteOptions } from 'webdriverio';

const options: RemoteOptions = {
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol == "https:" ? "https" : "http"}',
    capabilities: {
        browserName: '${browserName}',
        browserVersion: '${version}',
        'selenoid:options': {
            name: ${nameJson},
            sessionTimeout: ${timeoutJson},
            screenResolution: ${resolutionJson},
            enableVNC: ${enableVnc},
            enableVideo: ${enableVideo},
            enableHAR: ${enableHar}
        }
    }
};
const client = await remote(options);
`,
        PHP: `$web_driver = RemoteWebDriver::create("${origin}/wd/hub",
array(
    "browserName"=>"${browserName}",
    "browserVersion"=>"${version}",
    "selenoid:options"=>array(
        "name"=>${nameJson},
        "sessionTimeout"=>${timeoutJson},
        "screenResolution"=>${resolutionJson},
        "enableVNC"=>${enableVnc ? "true" : "false"},
        "enableVideo"=>${enableVideo ? "true" : "false"},
        "enableHAR"=>${enableHar ? "true" : "false"}
    )
)
);
`,
        ruby: `caps = Selenium::WebDriver::Remote::Capabilities.new
browserName: '${browserName}',
caps["browserVersion"] = "${version}"
caps["selenoid:options"] = {
  'name' => ${nameJson},
  'sessionTimeout' => ${timeoutJson},
  'screenResolution' => ${resolutionJson},
  'enableVNC' => ${enableVnc},
  'enableVideo' => ${enableVideo},
  'enableHAR' => ${enableHar}
}

driver = Selenium::WebDriver.for(:remote,
  :url => "${origin}/wd/hub",
  :desired_capabilities => caps)
`,
        swift: `import Foundation
import Selenium

var caps: [String: Any] = [
    "browserName": "${browserName}",
    "browserVersion": "${version}",
    "selenoid:options": [
        "name": ${nameJson},
        "sessionTimeout": ${timeoutJson},
        "screenResolution": ${resolutionJson},
        "enableVNC": ${enableVnc},
        "enableVideo": ${enableVideo},
        "enableHAR": ${enableHar}
    ]
]

let driver = try RemoteWebDriver(
    with: URL(string: "${origin}/wd/hub")!,
    desiredCapabilities: caps
)
`,
    };
};

const playwrightClient = (browser) => {
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

const playwrightCode = (browser, version, accessKey = "") => {
    const { base, selenoidOptions, query } = playwrightSnippet(browser, version, accessKey);
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
        kotlin: `val playwright = Playwright.create()
val selenoidOptions = ${kotlinSelenoidOptionsBlock(selenoidOptions)}
val wsEndpoint = "${base}?${query}"
val browser = playwright.${pw.java}().connect(wsEndpoint)
val page = browser.newPage()
page.navigate("https://example.com")
browser.close()
playwright.close()
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
        rust: `use std::collections::HashMap;
use url::Url;

let selenoid_options: HashMap<String, String> = HashMap::from(${rustSelenoidOptionsBlock(selenoidOptions)});
let mut endpoint = Url::parse("${base}").expect("ws endpoint");
endpoint.query_pairs_mut().extend_pairs(selenoid_options.iter());

// Playwright has no official Rust client — connect over the CDP WebSocket:
println!("{}", endpoint);
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
        typescript: `import { ${pw.js} } from 'playwright';

const selenoidOptions: Record<string, string> = ${jsSelenoidOptions};
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
        swift: `import Foundation

let selenoidOptions: [String: String] = ${swiftSelenoidOptionsBlock(selenoidOptions)}
let query = selenoidOptions
    .map { "\\($0.key)=\\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
    .joined(separator: "&")
let wsEndpoint = "${base}?" + query

// Playwright has no official Swift client — connect over the CDP WebSocket:
print(wsEndpoint)
`,
    };
};

const Capabilities = ({ browsers = {}, browserProtocols = {}, sessions = {}, origin, playwrightAccessKey = "" }) => {
    const navigate = useNavigate();
    const [browser, onBrowserChange] = useState({});
    const [lang, onLanguageChange] = useState("curl");
    const [outputTab, setOutputTab] = useState("gradle");
    // Session options live here so Terminal snippets mirror Remote hub (createSession SSOT).
    const [enableVnc, setEnableVnc] = useState("true");
    const [enableVideo, setEnableVideo] = useState("true");
    const [enableHar, setEnableHar] = useState("false");
    const [sessionTimeout, setSessionTimeout] = useState(DEFAULT_SESSION_OPTS.sessionTimeout);
    const [sessionName, setSessionName] = useState(DEFAULT_SESSION_OPTS.name);
    const [screenResolution, setScreenResolution] = useState(DEFAULT_SESSION_OPTS.screenResolution);
    const [vectorDraft, setVectorDraft] = useState(null);
    const [vectorMiss, setVectorMiss] = useState(false);
    const registryRef = useRef(null);
    if (registryRef.current === null) {
        registryRef.current = loadVectorRegistry();
    }

    const available = [].concat(
        ...Object.keys(browsers).map((name) =>
            Object.keys(browsers[name]).map((version) => {
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
    const sessionOpts = {
        sessionTimeout,
        name: sessionName,
        screenResolution,
        enableVnc: enableVnc === "true",
        enableVideo: enableVideo === "true",
        enableHar: enableHar === "true",
    };
    const capsSnap = {
        browserValue: value || "",
        sessionTimeout,
        sessionName,
        screenResolution,
        enableVnc,
        enableVideo,
        enableHar,
    };
    const vectorId = fingerprint(capsSnap);
    const displayVector = vectorDraft ?? vectorId;
    const remoteUrl = hubOrigin();
    const caps = isPlaywright
        ? playwrightCode(name, version, playwrightAccessKey)
        : code(name, version, origin, sessionOpts);
    const langKeys = orderedLangKeys(caps);
    const activeLang = langKeys.includes(lang) ? lang : langKeys[0] || "curl";
    const activeSnippet = caps[activeLang] || "";
    const capsJson = buildCapsJson(capsSnap, vectorId, {
        browser: name || "",
        browserVersion: version || "",
        protocol: isPlaywright ? "playwright" : "webdriver",
        remoteUrl,
    });
    const agentPrompt = buildAgentPrompt({
        vectorId,
        name,
        version,
        isPlaywright,
        sessionOpts,
        remoteUrl,
    });
    const outputs = {
        prompt: agentPrompt,
        gradle: activeSnippet,
        json: capsJson,
    };
    const activeOutput = outputs[outputTab] || activeSnippet;
    const isTerminalTab = outputTab === "gradle";
    /** Agent/JSON + curl → library tokens (vscode); other Terminal langs → hljs. */
    const useLibraryHighlight = !isTerminalTab || activeLang === "curl";
    const highlightKind = isTerminalTab ? "curl" : outputTab === "json" ? "json" : "markdown";

    const remember = (snap) => {
        const id = fingerprint(snap);
        const registry = registryRef.current;
        registry.set(id, cloneSessionSnap(snap));
        persistVectorRegistry(registry);
        return id;
    };

    useEffect(() => {
        remember(capsSnap);
    }, [vectorId]);

    useEffect(() => {
        if (!langKeys.includes(lang)) {
            onLanguageChange(langKeys[0] || "curl");
        }
    }, [name, version, isPlaywright]);

    const applyCapsSnap = (snap) => {
        const next = cloneSessionSnap(snap);
        remember(next);
        setSessionTimeout(next.sessionTimeout);
        setSessionName(next.sessionName);
        setScreenResolution(next.screenResolution);
        setEnableVnc(next.enableVnc);
        setEnableVideo(next.enableVideo);
        setEnableHar(next.enableHar);
        if (next.browserValue) {
            const found = available.find((item) => item.value === next.browserValue);
            onBrowserChange(found || {});
        } else {
            onBrowserChange({});
        }
        setVectorDraft(null);
        setVectorMiss(false);
    };

    const resetCaps = () => {
        applyCapsSnap({
            browserValue: "",
            sessionTimeout: DEFAULT_SESSION_OPTS.sessionTimeout,
            sessionName: DEFAULT_SESSION_OPTS.name,
            screenResolution: DEFAULT_SESSION_OPTS.screenResolution,
            enableVnc: "true",
            enableVideo: "true",
            enableHar: "false",
        });
    };

    const touchOptions = () => setVectorMiss(false);

    const commitVector = (raw) => {
        const normalized = normalizeVectorId(raw);
        setVectorDraft(null);
        if (!normalized || normalized === vectorId) {
            setVectorMiss(false);
            return;
        }
        const snap = registryRef.current.get(normalized);
        if (!snap) {
            setVectorMiss(true);
            return;
        }
        applyCapsSnap(snap);
    };

    const browserOptions = available.map((item) => ({
        value: item.value,
        label: item.label,
        title: item.label,
    }));

    const onBrowserToggle = (optionValue) => {
        touchOptions();
        if (value === optionValue) {
            onBrowserChange({});
            return;
        }
        const next = available.find((item) => item.value === optionValue);
        if (next) {
            onBrowserChange(next);
        }
    };

    const copySnippet = () => {
        const text = activeOutput;
        if (navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(text);
            return;
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
    };

    return (
        <StyledCapabilities>
            <div className="capabilities-body">
                <div className="setup" data-testid="capabilities-setup">
                    <Panel
                        title="Driver"
                        testId="capabilities-driver-panel"
                        titleTestId="capabilities-driver-title"
                        className="capabilities-config-panel"
                    >
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Available browsers"
                            data-testid="capabilities-driver-browsers"
                        >
                            {/*
                              available → createSession: exclusive Tagstrip (library
                              PlaqueTagstrip; ≠ react-select). Selection unlocks Launch.
                              PlaqueSelect is the duo/solo alternative for ≤few options —
                              Capabilities keeps Tagstrip for the full hub catalog.
                              Solo without magnet — tagstrip wrap/density (magnet --nowrap
                              would lock shell 32px and shove pills off-viewport).
                            */}
                            <PlaqueTagstrip
                                label="available"
                                paramId="available"
                                className="capabilities-browser-select"
                                options={browserOptions}
                                values={value ? [value] : []}
                                onToggle={onBrowserToggle}
                                aria-label={
                                    available.length
                                        ? "Available browsers"
                                        : origin
                                        ? "No information about browsers"
                                        : "Loading browsers"
                                }
                                data-testid="capabilities-browser-select"
                            />
                        </PlaqueFieldGrid>
                    </Panel>
                    <Launch
                        browser={browser}
                        navigate={navigate}
                        sessions={sessions}
                        isPlaywright={isPlaywright}
                        playwrightAccessKey={playwrightAccessKey}
                        origin={origin}
                        enableVnc={enableVnc}
                        setEnableVnc={(v) => {
                            touchOptions();
                            setEnableVnc(v);
                        }}
                        enableVideo={enableVideo}
                        setEnableVideo={(v) => {
                            touchOptions();
                            setEnableVideo(v);
                        }}
                        enableHar={enableHar}
                        setEnableHar={(v) => {
                            touchOptions();
                            setEnableHar(v);
                        }}
                        sessionTimeout={sessionTimeout}
                        setSessionTimeout={(v) => {
                            touchOptions();
                            setSessionTimeout(v);
                        }}
                        sessionName={sessionName}
                        setSessionName={(v) => {
                            touchOptions();
                            setSessionName(v);
                        }}
                        screenResolution={screenResolution}
                        setScreenResolution={(v) => {
                            touchOptions();
                            setScreenResolution(v);
                        }}
                    />
                </div>
                <div className="code-panel">
                    <Panel
                        variant="terminal"
                        testId="capabilities-terminal-panel"
                        bodyClassName="capabilities-terminal-body"
                        className={useLibraryHighlight ? "ch-theme--vscode" : undefined}
                        trail={
                            <div
                                className="tabs"
                                role="tablist"
                                aria-label="Формат вывода"
                                data-testid="capabilities-terminal-tabs"
                            >
                                {OUTPUT_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={"tab" + (outputTab === tab.id ? " tab--active" : "")}
                                        role="tab"
                                        aria-selected={outputTab === tab.id}
                                        data-tab={tab.id}
                                        data-testid={`capabilities-terminal-tab-${tab.id}`}
                                        onClick={() => setOutputTab(tab.id)}
                                    >
                                        {tab.barLabel}
                                    </button>
                                ))}
                            </div>
                        }
                        footPlacement={isTerminalTab ? "rail" : "bottom"}
                        foot={
                            isTerminalTab ? (
                                <div className="tabs" role="tablist" aria-label="Language">
                                    {langKeys.map((next) => (
                                        <button
                                            key={next}
                                            type="button"
                                            role="tab"
                                            aria-selected={next === activeLang}
                                            className={`tab${next === activeLang ? " tab--active" : ""}`}
                                            onClick={() => onLanguageChange(next)}
                                        >
                                            {langLabel(next)}
                                        </button>
                                    ))}
                                </div>
                            ) : null
                        }
                        barEnd={
                            <input
                                type="text"
                                className={
                                    "badge badge--primary capabilities-vector-input" +
                                    (vectorMiss ? " capabilities-vector-input--miss" : "")
                                }
                                value={displayVector}
                                size={Math.max(12, displayVector.length)}
                                spellCheck={false}
                                autoComplete="off"
                                aria-label="Vector id"
                                aria-invalid={vectorMiss || undefined}
                                title={
                                    vectorMiss
                                        ? "Не найден в localStorage — сначала получи этот vector, меняя опции"
                                        : "Отпечаток конфига · вставь известный vector# + Enter — подтянуть"
                                }
                                data-testid="capabilities-terminal-vector"
                                onChange={(e) => {
                                    setVectorDraft(e.target.value);
                                    setVectorMiss(false);
                                }}
                                onBlur={(e) => commitVector(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.currentTarget.blur();
                                    }
                                    if (e.key === "Escape") {
                                        setVectorDraft(null);
                                        setVectorMiss(false);
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        }
                        actions={[
                            {
                                icon: <IconReset />,
                                label: "Сброс",
                                onClick: resetCaps,
                                "data-testid": "capabilities-terminal-reset",
                            },
                            {
                                icon: <IconCopy />,
                                label: "Копировать",
                                onClick: copySnippet,
                                "data-testid": "capabilities-terminal-copy",
                            },
                        ]}
                    >
                        {useLibraryHighlight ? (
                            <pre
                                className="panel__code ch-code"
                                data-testid="capabilities-terminal-output"
                                dangerouslySetInnerHTML={{
                                    __html: highlightOutput(activeOutput, highlightKind),
                                }}
                            />
                        ) : (
                            <CodeHighlight className="panel__code" language={activeLang}>
                                {activeSnippet}
                            </CodeHighlight>
                        )}
                    </Panel>
                </div>
            </div>
        </StyledCapabilities>
    );
};

const Launch = ({
    browser: { name, version },
    navigate,
    sessions,
    isPlaywright,
    playwrightAccessKey = "",
    origin,
    enableVnc,
    setEnableVnc,
    enableVideo,
    setEnableVideo,
    enableHar,
    setEnableHar,
    sessionTimeout,
    setSessionTimeout,
    sessionName,
    setSessionName,
    screenResolution,
    setScreenResolution,
}) => {
    const defaultAdditionalCaps = { operaOptions: { binary: "/usr/bin/opera" } };

    const [loading, onLoading] = useState(false);
    const [error, onError] = useState("");
    const [useMoreCaps, toggleMoreCaps] = useState(false);
    const [moreCapsError, onMoreCapsError] = useState(false);
    const [moreCaps, setMoreCaps] = useState(JSON.stringify(defaultAdditionalCaps));
    const remoteUrl = hubRemoteUrl(origin);
    const playwrightSocket = useRef(null);
    // Multi-row remote-hub stack (URL, timeout|name, resolution, Vnc|Video, Har) —
    // presets #remote-hub; magnet skips --pair measurement but still mounts the stack shell + script.
    usePlaqueFieldMagnet({ enabled: Boolean(name) && !isPlaywright });

    const createSession = useCallback(async () => {
        onError("");
        onLoading(true);

        const vnc = enableVnc === "true";
        const video = enableVideo === "true";
        const har = enableHar === "true";
        let desiredCapabilities = {
            browserName: `${name}`,
            version: `${version}`,
            enableVNC: vnc,
            enableVideo: video,
            enableHAR: har,
            labels: { manual: "true" },
            sessionTimeout,
            name: sessionName,
            screenResolution,
        };
        let selenoidOptions = {
            enableVNC: vnc,
            enableVideo: video,
            enableHAR: har,
            sessionTimeout,
            name: sessionName,
            screenResolution,
            labels: { manual: "true" },
        };

        if (useMoreCaps && !moreCapsError) {
            const additionalCaps = JSON.parse(moreCaps);
            desiredCapabilities = Object.assign(desiredCapabilities, additionalCaps);
            selenoidOptions = Object.assign(selenoidOptions, additionalCaps);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 300000);

        try {
            await primeBasicAuth();
            const response = await fetch("/wd/hub/session", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify({
                    desiredCapabilities,
                    capabilities: {
                        alwaysMatch: {
                            browserName: `${name}`,
                            browserVersion: `${version}`,
                            "selenoid:options": selenoidOptions,
                        },
                        firstMatch: [{}],
                    },
                }),
            });

            if (response.status === 200) {
                const data = await response.json();
                navigate(`/sessions/${sessionIdFrom({ response: data })}`);
            }
        } catch (err) {
            console.error("Can't start session manually", err);
            onError(err);
            onLoading(false);
        } finally {
            clearTimeout(timeout);
        }
    }, [
        name,
        version,
        navigate,
        useMoreCaps,
        moreCapsError,
        moreCaps,
        enableVnc,
        enableVideo,
        enableHar,
        sessionTimeout,
        sessionName,
        screenResolution,
    ]);

    const createPlaywrightSession = () => {
        if (!name || !version) {
            return;
        }

        onError("");
        onLoading(true);

        const existingIds = new Set(Object.keys(sessions || {}));
        const wsUrl = playwrightEndpoint(name, version, playwrightAccessKey);
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

        const tryNavigate = (data) => {
            if (navigated) {
                return;
            }
            const sessionId = findPlaywrightSession(data.sessions, existingIds, name, version);
            if (!sessionId) {
                return;
            }
            navigated = true;
            retainPlaywrightSocket(sessionId, playwrightSocket.current);
            navigate(`/sessions/${sessionId}`);
            onLoading(false);
        };

        eventSource = new EventSource("/events");
        eventSource.onmessage = (e) => {
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

        primeBasicAuth()
            .then(() => openWebSocket())
            .catch((err) => {
                console.error("Playwright auth failed", err);
                finish("Authentication failed", true);
            });
    };

    const onCreateSession = () => {
        if (isPlaywright) {
            createPlaywrightSession();
            return;
        }
        createSession();
    };

    const onTextareaUpdate = (e) => {
        setMoreCaps(e.target.value);
        try {
            JSON.parse(e.target.value);
            onMoreCapsError(false);
        } catch (e) {
            onMoreCapsError(e);
        }
    };

    return (
        <div className="capabilities-launch">
            {!isPlaywright && name ? (
                <Panel
                    title="Remote hub"
                    testId="capabilities-remote-panel"
                    titleTestId="capabilities-remote-title"
                    className="capabilities-config-panel"
                >
                    {/*
                      presets #remote-hub: magnet stack →
                      solo(remoteUrl) + duo(sessionTimeout|name) + solo(screenResolution) +
                      solo(enableVnc|enableVideo|enableHar) full-width stretch 50/50.
                    */}
                    <div
                        className="plaque-field-grid-stack plaque-field-grid-stack--magnet"
                        data-testid="capabilities-caps"
                    >
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Remote URL"
                            data-testid="capabilities-caps-remote-url"
                        >
                            <PlaqueField
                                label="remoteUrl"
                                paramId="remoteUrl"
                                labelVariant="param"
                                type="text"
                                value={remoteUrl}
                                readOnly
                                data-testid="caps-remote-url"
                            />
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid
                            layout="duo"
                            aria-label="Session identity"
                            data-testid="capabilities-caps-session"
                        >
                            <PlaqueSelect
                                label="sessionTimeout"
                                paramId="sessionTimeout"
                                value={sessionTimeout}
                                options={SESSION_TIMEOUT_OPTIONS}
                                onChange={setSessionTimeout}
                                data-testid="caps-session-timeout"
                            />
                            <PlaqueField
                                label="name"
                                paramId="name"
                                labelVariant="param"
                                type="text"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                data-testid="caps-session-name"
                            />
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Screen resolution"
                            data-testid="capabilities-caps-resolution"
                        >
                            <PlaqueSelect
                                label="screenResolution"
                                paramId="screenResolution"
                                value={screenResolution}
                                options={SCREEN_RESOLUTION_OPTIONS}
                                onChange={setScreenResolution}
                                data-testid="caps-screen-resolution"
                            />
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Remote hub flags"
                            data-testid="capabilities-caps-flags"
                        >
                            <PlaqueFieldSeg
                                label="enableVnc"
                                paramId="enableVnc"
                                value={enableVnc}
                                onValueChange={setEnableVnc}
                                stretch
                                data-testid="caps-enable-vnc"
                            />
                            <PlaqueFieldSeg
                                label="enableVideo"
                                paramId="enableVideo"
                                value={enableVideo}
                                onValueChange={setEnableVideo}
                                stretch
                                data-testid="caps-enable-video"
                            />
                            <PlaqueFieldSeg
                                label="enableHar"
                                paramId="enableHar"
                                value={enableHar}
                                onValueChange={setEnableHar}
                                stretch
                                data-testid="caps-enable-har"
                            />
                        </PlaqueFieldGrid>
                    </div>
                </Panel>
            ) : null}
            <CapabilitiesLaunchActions
                loading={loading}
                disabled={!name || loading}
                error={error}
                showMoreCapabilities={!isPlaywright && Boolean(name) && !loading}
                useMoreCaps={useMoreCaps}
                onCreateSession={onCreateSession}
                onToggleMoreCaps={() => toggleMoreCaps(!useMoreCaps)}
                onClearError={() => onError("")}
            />
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
    playwrightAccessKey: PropTypes.string,
};

export default Capabilities;
