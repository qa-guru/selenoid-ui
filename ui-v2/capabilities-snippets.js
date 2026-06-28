const PLAYWRIGHT_BROWSER_NAMES = new Set([
  "playwright-chromium",
  "playwright-webkit",
  "playwright-firefox",
  "playwright-msedge",
]);

export function isPlaywrightBrowser(browserProtocols, name, version) {
  if (PLAYWRIGHT_BROWSER_NAMES.has(name)) return true;
  return browserProtocols?.[name]?.[version]?.protocol === "playwright";
}

export function browserProtocol(browserProtocols, name, version) {
  if (isPlaywrightBrowser(browserProtocols, name, version)) return "playwright";
  return browserProtocols?.[name]?.[version]?.protocol || "webdriver";
}

function hubOrigin(origin) {
  if (!origin) {
    const { protocol, hostname } = window.location;
    const port = window.location.port === "" ? "" : ":4444";
    return `${protocol}//${hostname}${port}`;
  }
  try {
    const url = new URL(origin);
    return `${window.location.protocol}//${window.location.hostname}${window.location.port === "" ? "" : ":4444"}`;
  } catch {
    return origin;
  }
}

function optionsClass(browser) {
  switch (browser) {
    case "chrome":
      return "ChromeOptions";
    case "firefox":
      return "FirefoxOptions";
    case "safari":
      return "SafariOptions";
    case "msedge":
      return "EdgeOptions";
    default:
      return "SpecificBrowserOptions";
  }
}

function playwrightWsBase(browser, version) {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.host}/playwright/${browser}/${version}`;
}

function defaultPlaywrightSelenoidOptions() {
  return {
    name: "Session started using curl command...",
    sessionTimeout: "1m",
    enableVNC: "true",
    enableVideo: "true",
  };
}

function manualPlaywrightSelenoidOptions() {
  return {
    ...defaultPlaywrightSelenoidOptions(),
    name: "Manual run from ui",
    sessionTimeout: "60m",
    enableVideo: "true",
    enableVNC: "true",
    enableHar: "false",
    headless: "false",
    screenResolution: "1920x1080x24",
    "labels.manual": "true",
  };
}

export function playwrightQueryFromOptions(options = {}) {
  const params = {
    name: options.name || "Manual run from ui",
    sessionTimeout: options.sessionTimeout || "60m",
    enableVNC: String(options.enableVNC ?? true),
    enableVideo: String(options.enableVideo ?? true),
    enableHar: String(options.enableHar ?? false),
    headless: String(options.headless ?? false),
    screenResolution: options.screenResolution || "1920x1080x24",
    "labels.manual": "true",
  };
  if (options.token) {
    params.token = options.token;
  }
  return new URLSearchParams(params);
}

function playwrightClient(browser) {
  switch (browser) {
    case "playwright-webkit":
      return { js: "webkit", py: "webkit", cs: "Webkit", go: "WebKit", rb: "webkit", java: "webkit" };
    case "playwright-firefox":
      return { js: "firefox", py: "firefox", cs: "Firefox", go: "Firefox", rb: "firefox", java: "firefox" };
    default:
      return { js: "chromium", py: "chromium", cs: "Chromium", go: "Chromium", rb: "chromium", java: "chromium" };
  }
}

function buildSelenoidOptions(sessionOptions = {}, additionalCaps = null) {
  const selenoidOptions = {
    name: sessionOptions.name || "Manual run from ui",
    sessionTimeout: sessionOptions.sessionTimeout || "60m",
    enableVNC: sessionOptions.enableVNC ?? true,
    enableVideo: sessionOptions.enableVideo ?? true,
    enableHar: sessionOptions.enableHar ?? false,
    headless: sessionOptions.headless ?? false,
    screenResolution: sessionOptions.screenResolution || "1920x1080x24",
    labels: sessionOptions.labels || { manual: "true" },
  };

  if (sessionOptions.token) {
    selenoidOptions.token = sessionOptions.token;
  }

  if (additionalCaps && typeof additionalCaps === "object") {
    return { ...selenoidOptions, ...additionalCaps };
  }

  return selenoidOptions;
}

function indentBlock(value, indent = "    ") {
  return JSON.stringify(value, null, 4)
    .split("\n")
    .map((line) => indent + line)
    .join("\n");
}

function javaLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (Array.isArray(value)) {
    const items = value.map((item) => javaLiteral(item)).join(", ");
    return `new ArrayList<Object>() {{ add(${items}); }}`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => `    put("${key}", ${javaLiteral(val)});`)
      .join("\n");
    return `new HashMap<String, Object>() {{\n${entries}\n}}`;
  }
  return String(value);
}

function formatPythonValue(value) {
  return JSON.stringify(value, null, 4)
    .replace(/\btrue\b/g, "True")
    .replace(/\bfalse\b/g, "False")
    .replace(/\bnull\b/g, "None");
}

function escapeString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function goLiteral(value, depth = 1) {
  const tab = "\t".repeat(depth);
  if (value === null || value === undefined) return "nil";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${escapeString(value)}"`;
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      return `[]string{${value.map((item) => `"${escapeString(item)}"`).join(", ")}}`;
    }
    return `[]interface{}{${value.map((item) => goLiteral(item, depth + 1)).join(", ")}}`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => `${tab}"${key}": ${goLiteral(val, depth + 1)},`)
      .join("\n");
    return `map[string]interface{}{
${entries}
${"\t".repeat(depth - 1)}}`;
  }
  return String(value);
}

function csharpLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return String(value).toLowerCase();
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${escapeString(value)}"`;
  if (Array.isArray(value)) {
    const items = value.map((item) => csharpLiteral(item)).join(", ");
    return `new List<object>() { ${items} }`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => `    ["${key}"] = ${csharpLiteral(val)},`)
      .join("\n");
    return `new Dictionary<string, object> {\n${entries}\n}`;
  }
  return String(value);
}

function phpLiteral(value, indent = 1) {
  const pad = "    ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${escapeString(value)}"`;
  if (Array.isArray(value)) {
    const items = value.map((item) => `${pad}${phpLiteral(item, indent + 1)},`).join("\n");
    return `array(\n${items}\n${"    ".repeat(indent - 1)})`;
  }
  if (typeof value === "object") {
    const items = Object.entries(value)
      .map(([key, val]) => `${pad}"${key}"=>${phpLiteral(val, indent + 1)},`)
      .join("\n");
    return `array(\n${items}\n${"    ".repeat(indent - 1)})`;
  }
  return String(value);
}

function rubyLiteral(value, indent = 1) {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "nil";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `'${String(value).replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) {
    const items = value.map((item) => `${pad}${rubyLiteral(item, indent + 1)}`).join(",\n");
    return `[\n${items}\n${"  ".repeat(indent - 1)}]`;
  }
  if (typeof value === "object") {
    const items = Object.entries(value)
      .map(([key, val]) => `${pad}'${key}' => ${rubyLiteral(val, indent + 1)}`)
      .join(",\n");
    return `{\n${items}\n${"  ".repeat(indent - 1)}}`;
  }
  return String(value);
}

function javaStringMapBlock(selenoidOptions) {
  const entries = Object.entries(selenoidOptions)
    .map(([key, value]) => `    put("${key}", "${escapeString(value)}");`)
    .join("\n");
  return `new HashMap<String, String>() {{\n${entries}\n}}`;
}

function csharpStringMapBlock(selenoidOptions) {
  const entries = Object.entries(selenoidOptions)
    .map(([key, value]) => `    ["${key}"] = "${escapeString(value)}",`)
    .join("\n");
  return `new Dictionary<string, string> {\n${entries}\n}`;
}

function goStringMapBlock(selenoidOptions) {
  const entries = Object.entries(selenoidOptions)
    .map(([key, value]) => `\t\t"${key}": "${escapeString(value)}",`)
    .join("\n");
  return `map[string]string{\n${entries}\n\t}`;
}

function phpStringMapBlock(selenoidOptions) {
  const entries = Object.entries(selenoidOptions)
    .map(([key, value]) => `    '${key}' => '${String(value).replace(/'/g, "\\'")}',`)
    .join("\n");
  return `[\n${entries}\n]`;
}

function rubyStringMapBlock(selenoidOptions) {
  const entries = Object.entries(selenoidOptions)
    .map(([key, value]) => `  '${key}' => '${String(value).replace(/'/g, "\\'")}',`)
    .join("\n");
  return `{\n${entries}\n}`;
}

function playwrightSelenoidOptionsObject(sessionOptions = {}) {
  return Object.fromEntries(playwrightQueryFromOptions(sessionOptions).entries());
}

export function webdriverSnippets(
  browser = "chrome",
  version = "",
  origin = "",
  sessionOptions = {},
  additionalCaps = null
) {
  const hub = hubOrigin(origin);
  const browserName = browser || "chrome";
  const options = optionsClass(browserName);
  const selenoidOptions = buildSelenoidOptions(sessionOptions, additionalCaps);
  const alwaysMatch = {
    browserName,
    ...(version ? { browserVersion: version } : {}),
    "selenoid:options": selenoidOptions,
  };
  const requestBody = { capabilities: { alwaysMatch } };
  const javaVersion =
    version === "" ? "" : `options.setCapability("browserVersion", "${version}");\n`;
  const csharpVersion =
    version === "" ? "" : `options.BrowserVersion = "${version}";\n`;
  const jsCapabilities = indentBlock(alwaysMatch, "        ");
  const goCaps = Object.entries(alwaysMatch)
    .map(([key, val]) => `\t"${key}": ${goLiteral(val, 2)},`)
    .join("\n");

  return {
    curl: `curl -H'Content-Type: application/json' ${hub}/wd/hub/session -d'${indentBlock(requestBody)}'`,
    java: `${options} options = new ${options}();
${javaVersion}options.setCapability("selenoid:options", ${javaLiteral(selenoidOptions)});
RemoteWebDriver driver = new RemoteWebDriver(new URL("${hub}/wd/hub"), options);`,
    go: `// import "github.com/tebeka/selenium"

caps := selenium.Capabilities{
${goCaps}
}

driver, err := selenium.NewRemote(caps, "${hub}/wd/hub")
if err != nil {
\tlog.Fatalf("starting browser: %v", err)
}
defer driver.Quit()`,
    "C#": `${options} options = new ${options}();
${csharpVersion}options.AddAdditionalOption("selenoid:options", ${csharpLiteral(selenoidOptions)});
IWebDriver driver = new RemoteWebDriver(new Uri("${hub}/wd/hub"), options);`,
    python: `from selenium import webdriver

capabilities = ${formatPythonValue(alwaysMatch)}

driver = webdriver.Remote(
    command_executor="${hub}/wd/hub",
    desired_capabilities=capabilities)`,
    javascript: `const { remote } = require('webdriverio');

const client = await remote({
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol === "https:" ? "https" : "http"}',
    capabilities: ${jsCapabilities}
});`,
    PHP: `$web_driver = RemoteWebDriver::create("${hub}/wd/hub",
${phpLiteral(alwaysMatch)}
);`,
    ruby: `caps = Selenium::WebDriver::Remote::Capabilities.new
caps["browserName"] = '${browserName}'${version ? `\ncaps["browserVersion"] = "${version}"` : ""}
caps["selenoid:options"] = ${rubyLiteral(selenoidOptions)}

driver = Selenium::WebDriver.for(:remote,
  :url => "${hub}/wd/hub",
  :desired_capabilities => caps)`,
  };
}

export function playwrightSnippets(browser, version, sessionOptions = {}) {
  const base = playwrightWsBase(browser, version);
  const selenoidOptions = playwrightSelenoidOptionsObject(sessionOptions);
  const query = playwrightQueryFromOptions(sessionOptions).toString();
  const pw = playwrightClient(browser);
  const jsOptions = JSON.stringify(selenoidOptions, null, 2);

  return {
    curl: `curl --websocket "${base}?${query}"`,
    java: `Playwright playwright = Playwright.create();
Map<String, String> selenoidOptions = ${javaStringMapBlock(selenoidOptions)};
String wsEndpoint = "${base}?${query}";
Browser browser = playwright.${pw.java}().connect(wsEndpoint);
Page page = browser.newPage();
page.navigate("https://example.com");
browser.close();
playwright.close();`,
    go: `selenoidOptions := ${goStringMapBlock(selenoidOptions)}
params := url.Values{}
for key, value := range selenoidOptions {
\tparams.Set(key, value)
}
wsEndpoint := "${base}?" + params.Encode()

browser, err := pw.${pw.go}.Connect(wsEndpoint)
if err != nil {
\tlog.Fatalf("connect: %v", err)
}
page, err := browser.NewPage()
defer browser.Close()`,
    "C#": `var selenoidOptions = ${csharpStringMapBlock(selenoidOptions)};
var wsEndpoint = "${base}?${query}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.${pw.cs}.ConnectAsync(wsEndpoint);
var page = await browser.NewPageAsync();
await page.GotoAsync("https://example.com");
await browser.CloseAsync();`,
    python: `from urllib.parse import urlencode
from playwright.sync_api import sync_playwright

selenoid_options = ${JSON.stringify(selenoidOptions, null, 4)}
ws_endpoint = "${base}?" + urlencode(selenoid_options)

with sync_playwright() as p:
    browser = p.${pw.py}.connect(ws_endpoint)
    page = browser.new_page()
    page.goto("https://example.com")
    browser.close()`,
    javascript: `const { ${pw.js} } = require('playwright');

const selenoidOptions = ${jsOptions};
const wsEndpoint = \`${base}?\${new URLSearchParams(selenoidOptions)}\`;

const browser = await ${pw.js}.connect(wsEndpoint);
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();`,
    PHP: `$selenoidOptions = ${phpStringMapBlock(selenoidOptions)};
$wsEndpoint = '${base}' . '?' . http_build_query($selenoidOptions);

$browser = Playwright::create()->${pw.py}()->connect($wsEndpoint);
$page = $browser->newPage();
$page->goto('https://example.com');
$browser->close();`,
    ruby: `require 'uri'

selenoid_options = ${rubyStringMapBlock(selenoidOptions)}
ws_endpoint = '${base}' + '?' + URI.encode_www_form(selenoid_options)

Playwright.create do |playwright|
  browser = playwright.${pw.rb}.connect(ws_endpoint)
  page = browser.new_page
  page.goto('https://example.com')
  browser.close
end`,
  };
}

export function getSnippets({
  name,
  version,
  protocol,
  origin,
  browserProtocols,
  sessionOptions = {},
  additionalCaps = null,
}) {
  const isPlaywright =
    protocol === "playwright" || isPlaywrightBrowser(browserProtocols, name, version);
  return isPlaywright
    ? playwrightSnippets(name, version, sessionOptions)
    : webdriverSnippets(name, version, origin, sessionOptions, additionalCaps);
}

export function playwrightEndpoint(name, version, options) {
  const params = options ? playwrightQueryFromOptions(options) : new URLSearchParams(manualPlaywrightSelenoidOptions());
  return `${playwrightWsBase(name, version)}?${params.toString()}`;
}

function browserCatalog(stateBrowsers = {}, browserProtocols = {}) {
  if (Object.keys(stateBrowsers).length > 0) {
    return stateBrowsers;
  }

  const fromConfig = {};
  for (const [name, versions] of Object.entries(browserProtocols || {})) {
    fromConfig[name] = Object.fromEntries(Object.keys(versions || {}).map((version) => [version, {}]));
  }
  return fromConfig;
}

export function listBrowserOptions(stateBrowsers = {}, browserProtocols = {}) {
  const catalog = browserCatalog(stateBrowsers, browserProtocols);
  return Object.keys(catalog)
    .sort()
    .flatMap((name) =>
      Object.keys(catalog[name] || {})
        .sort()
        .map((version) => ({
          value: `${name}_${version}`,
          label: `${name}: ${version}`,
          name,
          version,
          protocol: browserProtocol(browserProtocols, name, version),
        }))
    );
}
