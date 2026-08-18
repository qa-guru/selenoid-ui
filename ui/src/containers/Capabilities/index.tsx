import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CodeHighlight from "../../components/CodeHighlight";
import "highlight.js/styles/sunburst.css";

import { StyledCapabilities } from "./style.css";

import { retainPlaywrightSocket } from "../../util/playwrightSessions";
import {
    browserProtocol,
    browserWindowOptions,
    findPlaywrightSession,
    isPlaywrightBrowser,
    pickDefaultWebdriverBrowser,
    resizeSessionWindow,
    sessionIdFrom,
    hubSessionErrorMessage,
    createSessionCatchMessage,
    CREATE_SESSION_TIMEOUT_MS,
    scheduleCreateSessionAbort,
} from "../../util/capabilitiesLogic";
import { waitForLiveSession } from "../../util/waitForLiveSession";
import { sameOriginURL } from "../../util/uiFeed";
import { DEFAULT_PLAYWRIGHT_SESSION, playwrightEndpoint, playwrightSnippet } from "../../util/capabilitiesPlaywright";
import { hubRemoteUrl, hubSessionUrl, resolveHubOrigin } from "../../util/hubOrigin.js";
import {
    defaultHubAccessKey,
    defaultHubAuthPass,
    defaultHubAuthUser,
    formatAccessKey,
    hubAuthCurlFlag,
    hubFetchInit,
    parseAccessKey,
    primeHubAuth,
} from "../../config/hubAuth";
import { rememberHubAuthToken } from "../../config/hubSessionAuth";
import { isMockSessionsEnabled, spawnCreatedMockSession } from "../../lib/mockSessions";
import { CapabilitiesLaunchActions } from "../../components/CapabilitiesLaunchActions";

import {
    IconCopy,
    IconDownload,
    IconReset,
    Panel,
    PlaqueField,
    PlaqueFieldGrid,
    PlaqueFieldSeg as PlaqueFieldSegTyped,
    PlaqueSelect,
    PlaqueTagstrip,
    highlightOutput,
    usePlaqueFieldMagnet,
} from "@zero-design-system/react";

const PlaqueFieldSeg = PlaqueFieldSegTyped as any;
import "@zero-design-system/react/styles.css";

/**
 * Capabilities session options → react-ui wrapper → hub caps key.
 * remoteUrl is display-only (hub endpoint), not a capability.
 *
 * | option           | wrapper      | layout | caps key                          |
 * |------------------|--------------|--------|-----------------------------------|
 * | remoteUrl        | PlaqueField  | solo   | — (readonly display)              |
 * | authUser         | PlaqueField  | duo    | — WD Basic Auth user              |
 * | authPass         | PlaqueField  | duo    | — WD Basic Auth password          |
 * | accessKey        | PlaqueField  | solo   | — PW ?accessKey= (Playwright only)|
 * | sessionTimeout   | PlaqueSelect | duo    | selenoid:options.sessionTimeout   |
 * | name             | PlaqueField  | duo    | selenoid:options.name             |
 * | screenResolution | PlaqueSelect | solo   | selenoid:options.screenResolution |
 * | enableVnc        | PlaqueFieldSeg | solo | enableVNC / selenoid:options      |
 * | enableVideo      | PlaqueFieldSeg | solo | enableVideo                       |
 * | videoName        | PlaqueField  | solo   | selenoid:options.videoName (cond enableVideo) |
 * | enableHar        | PlaqueFieldSeg | solo | enableHAR → hub CDP → /har/<id>.har|
 * | harContent       | PlaqueFieldSeg | solo | harContent meta|bodies (cond enableHAR; default meta = omit)|
 * | enableLog        | PlaqueFieldSeg | solo | enableLog                         |
 * | logName          | PlaqueField  | solo   | selenoid:options.logName (cond enableLog)   |
 * | headless         | PlaqueFieldSeg | solo | headless (Playwright only)        |
 * | timeZone         | PlaqueSelect | solo   | selenoid:options.timeZone         |
 * | env              | PlaqueField  | solo   | selenoid:options.env              |
 * | labels           | PlaqueField  | solo   | selenoid:options.labels           |
 * | proxyPreset      | PlaqueSelect | solo   | WD: alwaysMatch.proxy / PW: socksProxy query |
 * | proxyServer      | PlaqueField  | duo    | host half of socksProxy                      |
 * | proxyPort        | PlaqueField  | duo    | port half of socksProxy                      |
 *
 * Playwright session panel mirrors Remote hub (+ headless). Proxy panel is shared:
 * WebDriver → W3C alwaysMatch.proxy; Playwright → socksProxy WS query → hub PW_PROXY.
 *
 * Ban: closeBrowser* / gradle* / junit* / allure* / builder fields.
 *
 * Terminal bar (canon configurator / autotests-builder): Agent | Terminal | JSON
 * trail tabs, language foot rail on Terminal, vector# fingerprint +
 * IconReset (Сброс) + IconDownload (Скачать) + IconCopy (Копировать).
 */
const SESSION_TIMEOUT_OPTIONS = [
    { value: "1m" },
    { value: "2m" },
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

const TIME_ZONE_OPTIONS = [
    { value: "UTC" },
    { value: "Europe/Moscow" },
    { value: "Europe/Berlin" },
    { value: "America/New_York" },
    { value: "Asia/Tokyo" },
];

const ORIENTATION_OPTIONS = [
    { value: "PORTRAIT", label: "PORTRAIT" },
    { value: "LANDSCAPE", label: "LANDSCAPE" },
];

/** Hub HAR content depth — only meaningful with enableHAR (ADR 009 / HQ-HAR-CONTENT). */
const HAR_CONTENT_OPTIONS = [
    {
        value: "meta",
        title: "Headers/status/size/mimeType only — no content.text (hub default)",
    },
    {
        value: "bodies",
        title: "Opt-in best-effort response bodies via CDP Network.getResponseBody (≠ recordHar)",
    },
];

/** Android hub sessionTimeout — anti-flake default (cold start still bounded by hub service timeout). */
const ANDROID_DEFAULT_SESSION_TIMEOUT = "2m";

/** Android device caps beyond image DEFAULT_CAPABILITIES — mirrored by the Android panel. */
const DEFAULT_ANDROID_OPTS: Record<string, any> = {
    app: "",
    noReset: "false",
    autoGrantPermissions: "true",
    orientation: "PORTRAIT",
};

/**
 * Synthetic iOS entry — no image in browsers.json yet. Selecting it surfaces
 * the disabled "coming soon" placeholder panel (Create Session stays locked).
 * When an iOS image lands, the real versions replace this and the panel can
 * mirror Android.
 */
const IOS_PLACEHOLDER = {
    value: "ios__coming-soon",
    label: "iOS (coming soon)",
    name: "ios",
    version: "",
    protocol: "ios",
};

const PROXY_PRESET_OFF = "off";
const PROXY_PRESET_QA_GURU = "proxy.qaguru.school";
const PROXY_PRESET_CUSTOM = "custom";
/** Live EU open SOCKS5 (no auth) — P2. */
const PROXY_QA_GURU_HOST = "proxy.qaguru.school";
const PROXY_QA_GURU_PORT = "7777";
const PROXY_QA_GURU_SERVER = `${PROXY_QA_GURU_HOST}:${PROXY_QA_GURU_PORT}`;
/** Default labels CSV — editable in Remote hub (no snippet hardcode). */
const DEFAULT_LABELS_CSV = "manual=true";

const PROXY_PRESET_OPTIONS = [
    { value: PROXY_PRESET_OFF, label: "off" },
    { value: PROXY_PRESET_QA_GURU, label: "proxy.qaguru.school (EU)" },
    { value: PROXY_PRESET_CUSTOM, label: "custom" },
];

/** Join host + port → `host:port` for socksProxy (port optional). */
const joinProxyEndpoint = (host: any, port: any = "") => {
    const h = String(host || "").trim();
    if (!h) {
        return "";
    }
    const p = String(port || "").trim();
    return p ? `${h}:${p}` : h;
};

/** Split legacy `host:port` snap into fields (port = trailing digits after last `:`). */
const splitProxyEndpoint = (raw: any) => {
    const s = String(raw || "").trim();
    if (!s) {
        return { host: "", port: "" };
    }
    const idx = s.lastIndexOf(":");
    if (idx <= 0) {
        return { host: s, port: "" };
    }
    const port = s.slice(idx + 1);
    if (!/^\d+$/.test(port)) {
        return { host: s, port: "" };
    }
    return { host: s.slice(0, idx), port };
};

const resolveProxyServer = (preset: any, customHost: any = "", customPort: any = "") => {
    if (preset === PROXY_PRESET_QA_GURU) {
        return PROXY_QA_GURU_SERVER;
    }
    if (preset === PROXY_PRESET_CUSTOM) {
        return joinProxyEndpoint(customHost, customPort);
    }
    return "";
};

const buildProxyCapability = (proxyServer: any) => {
    if (!proxyServer) {
        return null;
    }
    return {
        proxyType: "manual",
        socksProxy: proxyServer,
        socksVersion: 5,
    };
};

/** CSV / newline `KEY=value` → env string[]. */
const parseEnvList = (raw: any) =>
    String(raw || "")
        .split(/[\n,]+/)
        .map((s: any) => s.trim())
        .filter(Boolean);

/** CSV / newline `key=value` → labels map. */
const parseLabelsMap = (raw: any) => {
    const out: Record<string, string> = {};
    for (const part of String(raw || "").split(/[\n,]+/)) {
        const trimmed = part.trim();
        if (!trimmed) {
            continue;
        }
        const eq = trimmed.indexOf("=");
        if (eq === -1) {
            out[trimmed] = "true";
        } else {
            const key = trimmed.slice(0, eq).trim();
            if (key) {
                out[key] = trimmed.slice(eq + 1).trim();
            }
        }
    }
    return out;
};

/** SSOT for createSession + snippets — all keys go to selenoid:options. */
const buildSelenoidOptions = ({
    sessionTimeout,
    name,
    screenResolution,
    enableVnc,
    enableVideo,
    enableHar,
    enableLog,
    timeZone,
    env,
    labels,
    videoName,
    logName,
    harName,
    harContent,
}: any) => {
    const opts: Record<string, any> = {
        enableVNC: Boolean(enableVnc),
        enableVideo: Boolean(enableVideo),
        // enableHAR: hub records browser network over CDP and writes /har/<id>.har (WebDriver Chromium)
        enableHAR: Boolean(enableHar),
        enableLog: Boolean(enableLog),
        sessionTimeout,
        name,
        screenResolution,
        timeZone: timeZone || "UTC",
        labels: typeof labels === "string" ? parseLabelsMap(labels) : labels || {},
    };
    const envList = typeof env === "string" ? parseEnvList(env) : Array.isArray(env) ? env : [];
    if (envList.length) {
        opts.env = envList;
    }
    const video = String(videoName || "").trim();
    const log = String(logName || "").trim();
    const har = String(harName || "").trim();
    if (opts.enableVideo && video) {
        opts.videoName = video;
    }
    if (opts.enableLog && log) {
        opts.logName = log;
    }
    if (opts.enableHAR && har) {
        opts.harName = har;
    }
    // harContent only when enableHAR; omit or meta ≡ hub default meta; bodies is opt-in.
    if (opts.enableHAR && String(harContent || "").trim() === "bodies") {
        opts.harContent = "bodies";
    }
    return opts;
};

/** Coerce "true"/"false" strings or booleans → boolean. */
const asBool = (value: any) => value === true || value === "true";

/** Minimal selenoid:options for a mobile (Android) session — no proxy/har/log/env/skin.
 * Skin is the image default (qaguru/android SKIN=1080x1920). Sending QVGA/HVGA
 * overrides that via hub SKIN env and crops the emulator window. */
const buildAndroidSelenoidOptions = ({ name, sessionTimeout, enableVnc, enableVideo }: any) => ({
    enableVNC: asBool(enableVnc),
    enableVideo: asBool(enableVideo),
    name,
    sessionTimeout,
});

/**
 * W3C alwaysMatch for Selenoid Android (appium:* caps). Image entrypoint sets
 * platformName / automationName / udid defaults; here we surface only the
 * caps the panel exposes. SSOT for createSession + androidCode snippets.
 */
const buildAndroidCapabilities = ({
    version,
    app,
    noReset,
    autoGrantPermissions,
    orientation,
    selenoidOptions,
}: any) => {
    const caps: Record<string, any> = {
        browserName: "android",
        browserVersion: String(version || ""),
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:noReset": asBool(noReset),
        "appium:autoGrantPermissions": asBool(autoGrantPermissions),
        "appium:orientation": orientation || DEFAULT_ANDROID_OPTS.orientation,
        "selenoid:options": selenoidOptions,
    };
    const appUrl = String(app || "").trim();
    if (appUrl) {
        caps["appium:app"] = appUrl;
    }
    return caps;
};

const VECTOR_REGISTRY_KEY = "selenoid-capabilities-vector-registry";

/** Same 8-hex fingerprint as autotests-builder / react-ui configurator demo. */
const vectorHash = (value: any) => {
    const str = JSON.stringify(value);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
    }
    return `00000000${(h >>> 0).toString(16)}`.slice(-8);
};

const normalizeVectorId = (raw: any) => {
    let id = String(raw || "").trim();
    if (!id) return "";
    id = id
        .replace(/^vector\s*[:#]?\s*/i, "")
        .replace(/^#/, "")
        .trim();
    if (!id) return "";
    return `vector#${id}`;
};

const fingerprint = (snap: any) => `vector#${vectorHash(snap)}`;

const cloneSessionSnap = (snap: any) => ({ ...snap });

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

const persistVectorRegistry = (registry: any) => {
    try {
        const obj: Record<string, any> = {};
        registry.forEach((snap: any, id: any) => {
            obj[id] = snap;
        });
        localStorage.setItem(VECTOR_REGISTRY_KEY, JSON.stringify(obj));
    } catch {
        /* private mode / quota */
    }
};

const migrateHubAuthSnap = (snap: any) => {
    const next = { ...snap };
    if (next.hubAuthToken && !next.accessKey) {
        next.accessKey = next.hubAuthToken;
    }
    if (next.hubAuthUser != null && next.authUser == null) {
        next.authUser = next.hubAuthUser;
    }
    if (next.hubAuthPass != null && next.authPass == null) {
        next.authPass = next.hubAuthPass;
    }
    // Legacy vectors stored only joined accessKey — seed WD duo if missing.
    if (next.accessKey && (next.authUser == null || next.authPass == null)) {
        const parsed = parseAccessKey(next.accessKey);
        if (parsed) {
            if (next.authUser == null) {
                next.authUser = parsed.user;
            }
            if (next.authPass == null) {
                next.authPass = parsed.pass;
            }
        }
    }
    delete next.hubAuthToken;
    delete next.hubAuthUser;
    delete next.hubAuthPass;
    return next;
};

const javaSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    put("${key}", "${value}");`)
        .join("\n");
    return `new HashMap<String, String>() {{\n${entries}\n}}`;
};

const csharpSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    ["${key}"] = "${value}",`)
        .join("\n");
    return `new Dictionary<string, string> {\n${entries}\n}`;
};

const goSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `\t\t"${key}": "${value}",`)
        .join("\n");
    return `map[string]string{\n${entries}\n\t}`;
};

const phpSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    '${key}' => '${value}',`)
        .join("\n");
    return `[\n${entries}\n]`;
};

const rubySelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `  '${key}' => '${value}',`)
        .join("\n");
    return `{\n${entries}\n}`;
};

const kotlinSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    "${key}" to "${value}",`)
        .join("\n");
    return `mapOf(\n${entries}\n)`;
};

const swiftSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `    "${key}": "${value}",`)
        .join("\n");
    return `[\n${entries}\n]`;
};

const rustDesiredCapabilities = (browser: any) => {
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

const rustSelenoidOptionsBlock = (selenoidOptions: any) => {
    const entries = Object.entries(selenoidOptions)
        .map(([key, value]) => `        ("${key}".to_string(), "${value}".to_string()),`)
        .join("\n");
    return `[\n${entries}\n    ]`;
};

const DEFAULT_SESSION_OPTS: Record<string, any> = {
    authUser: defaultHubAuthUser(),
    authPass: defaultHubAuthPass(),
    accessKey: defaultHubAccessKey(),
    sessionTimeout: "60m",
    name: "Manual session",
    screenResolution: "1920x1080x24",
    enableVnc: true,
    enableVideo: true,
    enableHar: false,
    /** Hub harContent — only sent when enableHAR; meta default = omit from caps. */
    harContent: "meta",
    enableLog: false,
    timeZone: "UTC",
    env: "",
    labels: DEFAULT_LABELS_CSV,
    videoName: "",
    logName: "",
    proxyPreset: PROXY_PRESET_OFF,
    proxyServer: "",
    proxyPort: "",
    headless: DEFAULT_PLAYWRIGHT_SESSION.headless ? "true" : "false",
    androidApp: DEFAULT_ANDROID_OPTS.app,
    androidNoReset: DEFAULT_ANDROID_OPTS.noReset,
    androidAutoGrantPermissions: DEFAULT_ANDROID_OPTS.autoGrantPermissions,
    androidOrientation: DEFAULT_ANDROID_OPTS.orientation,
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

const langLabel = (key: any) => (TERMINAL_LANG_LABELS as any)[key] || key;

const orderedLangKeys = (caps: any) => {
    const keys = Object.keys(caps);
    const ranked = TERMINAL_LANG_ORDER.filter((k: any) => keys.includes(k));
    const rest = keys.filter((k: any) => !TERMINAL_LANG_ORDER.includes(k));
    return ranked.concat(rest);
};

/** Agent prompt — markdown vector + Driver + per-family config (configurator SSOT). */
const buildAgentPrompt = ({ vectorId, name, version, family = "webdriver", sessionOpts, remoteUrl }: any) => {
    const browserLabel = name ? `${name}${version ? ` ${version}` : ""}` : "—";
    const proxyEndpoint = resolveProxyServer(sessionOpts.proxyPreset, sessionOpts.proxyServer, sessionOpts.proxyPort);
    const wdBasicAuth = formatAccessKey(sessionOpts.authUser, sessionOpts.authPass);
    const payload: Record<string, any> = {
        vector: vectorId,
        browser: name || "",
        browserVersion: version || "",
        protocol: family,
        remoteUrl,
        accessKey: family === "playwright" ? sessionOpts.accessKey || "" : wdBasicAuth,
        sessionTimeout: sessionOpts.sessionTimeout,
        name: sessionOpts.name,
        enableVnc: String(sessionOpts.enableVnc),
        enableVideo: String(sessionOpts.enableVideo),
    };
    if (family === "webdriver") {
        Object.assign(payload, {
            screenResolution: sessionOpts.screenResolution,
            enableHar: String(sessionOpts.enableHar),
            enableLog: String(sessionOpts.enableLog),
            timeZone: sessionOpts.timeZone || "UTC",
            env: sessionOpts.env || "",
            labels: sessionOpts.labels || DEFAULT_LABELS_CSV,
            videoName: sessionOpts.videoName || "",
            logName: sessionOpts.logName || "",
            proxyPreset: sessionOpts.proxyPreset || PROXY_PRESET_OFF,
            proxyServer: sessionOpts.proxyServer || "",
            proxyPort: sessionOpts.proxyPort || "",
            proxyEndpoint: proxyEndpoint || "",
        });
        if (sessionOpts.enableHar) {
            payload.harContent = sessionOpts.harContent || "meta";
        }
    } else if (family === "playwright") {
        Object.assign(payload, {
            screenResolution: sessionOpts.screenResolution,
            enableHar: String(sessionOpts.enableHar),
            enableLog: String(sessionOpts.enableLog),
            timeZone: sessionOpts.timeZone || "UTC",
            env: sessionOpts.env || "",
            labels: sessionOpts.labels || DEFAULT_LABELS_CSV,
            videoName: sessionOpts.videoName || "",
            logName: sessionOpts.logName || "",
            headless: String(sessionOpts.headless),
            proxyPreset: sessionOpts.proxyPreset || PROXY_PRESET_OFF,
            proxyServer: sessionOpts.proxyServer || "",
            proxyPort: sessionOpts.proxyPort || "",
            proxyEndpoint: proxyEndpoint || "",
        });
        if (sessionOpts.enableHar) {
            payload.harContent = sessionOpts.harContent || "meta";
        }
    } else if (family === "android") {
        Object.assign(payload, {
            app: sessionOpts.androidApp || "",
            noReset: String(sessionOpts.androidNoReset),
            autoGrantPermissions: String(sessionOpts.androidAutoGrantPermissions),
            orientation: sessionOpts.androidOrientation,
        });
    }

    const head = [
        "Настрой Selenoid Capabilities со следующим вектором.",
        "",
        `## Vector \`${vectorId}\``,
        "```json",
        JSON.stringify(payload, null, 2),
        "```",
        "",
        "## Browser / device image",
        `- browser: **${browserLabel}**`,
        `- protocol: **${payload.protocol}**`,
        "",
    ];

    if (family === "playwright") {
        return head
            .concat([
                "## Session options",
                `- remoteUrl: \`${remoteUrl}\``,
                `- accessKey: \`${sessionOpts.accessKey || ""}\``,
                `- sessionTimeout: **${sessionOpts.sessionTimeout}**`,
                `- name: **${sessionOpts.name}**`,
                `- screenResolution: **${sessionOpts.screenResolution}**`,
                `- timeZone: **${payload.timeZone}**`,
                `- enableVnc / enableVideo / enableLog: **${payload.enableVnc}** / **${payload.enableVideo}** / **${payload.enableLog}**`,
                `- enableHar: **${payload.enableHar}** (hub CDP → /har/<id>.har)`,
                ...(payload.enableHar === "true"
                    ? [`- harContent: **${payload.harContent || "meta"}** (meta default / bodies opt-in)`]
                    : []),
                `- headless: **${payload.headless}**`,
                `- env: **${payload.env || "—"}**`,
                `- labels: **${payload.labels || "—"}**`,
                `- videoName / logName: **${payload.videoName || "—"}** / **${payload.logName || "—"}**`,
                "",
                "## Browser proxy",
                `- proxyPreset: **${payload.proxyPreset}**`,
                `- proxyServer / proxyPort: **${payload.proxyServer || "—"}** / **${payload.proxyPort || "—"}**`,
                `- socksProxy: **${payload.proxyEndpoint || "—"}** (hub → PW_PROXY → launchServer)`,
            ])
            .join("\n");
    }
    if (family === "android") {
        return head
            .concat([
                "## Session options",
                `- remoteUrl: \`${remoteUrl}\``,
                `- authUser / authPass: \`${sessionOpts.authUser || ""}\` / \`${sessionOpts.authPass || ""}\``,
                `- name: **${sessionOpts.name}**`,
                `- sessionTimeout: **${sessionOpts.sessionTimeout}**`,
                `- enableVnc / enableVideo: **${payload.enableVnc}** / **${payload.enableVideo}**`,
                `- app: **${payload.app || "—"}**`,
                `- noReset / autoGrantPermissions: **${payload.noReset}** / **${payload.autoGrantPermissions}**`,
                `- orientation: **${payload.orientation}**`,
            ])
            .join("\n");
    }
    if (family === "ios") {
        return head.concat(["## Session options", "- статус: **coming soon** (образ iOS ещё не поднят)"]).join("\n");
    }
    return head
        .concat([
            "## Session options",
            `- remoteUrl: \`${remoteUrl}\``,
            `- authUser / authPass: \`${sessionOpts.authUser || ""}\` / \`${sessionOpts.authPass || ""}\``,
            `- sessionTimeout: **${sessionOpts.sessionTimeout}**`,
            `- name: **${sessionOpts.name}**`,
            `- screenResolution: **${sessionOpts.screenResolution}**`,
            `- timeZone: **${payload.timeZone}**`,
            `- enableVnc / enableVideo / enableLog: **${payload.enableVnc}** / **${payload.enableVideo}** / **${payload.enableLog}**`,
            `- enableHar: **${payload.enableHar}** (hub CDP → /har/<id>.har; WebDriver Chromium)`,
            ...(payload.enableHar === "true"
                ? [`- harContent: **${payload.harContent || "meta"}** (meta default / bodies opt-in)`]
                : []),
            `- env: **${payload.env || "—"}**`,
            `- labels: **${payload.labels || "—"}**`,
            `- videoName / logName: **${payload.videoName || "—"}** / **${payload.logName || "—"}**`,
            "",
            "## Browser proxy",
            `- proxyPreset: **${payload.proxyPreset}**`,
            `- proxyServer / proxyPort: **${payload.proxyServer || "—"}** / **${payload.proxyPort || "—"}**`,
            `- socksProxy: **${payload.proxyEndpoint || "—"}**`,
        ])
        .join("\n");
};

/** JSON vector tab — fingerprint + caps snapshot. */
const buildCapsJson = (capsSnap: any, vectorId: any, meta: any = {}) =>
    JSON.stringify({ ...capsSnap, vector: vectorId, ...meta }, null, 2);

/** Indent a multi-line JSON fragment for curl alwaysMatch nesting. */
const indentJsonLines = (json: any, spaces: any) => {
    const pad = " ".repeat(spaces);
    return json
        .split("\n")
        .map((line: any, i: any) => (i === 0 ? line : pad + line))
        .join("\n");
};

const javaEnvPut = (envList: any) => {
    if (!envList.length) {
        return "";
    }
    return `    put("env", new ArrayList<String>() {{
${envList.map((e: any) => `        add(${JSON.stringify(e)});`).join("\n")}
    }});
`;
};

const javaLabelsPut = (labelsMap: any) => `    put("labels", new HashMap<String, Object>() {{
${Object.entries(labelsMap)
    .map(([k, v]) => `        put(${JSON.stringify(k)}, ${JSON.stringify(String(v))});`)
    .join("\n")}
    }});
`;

const kotlinEnvEntry = (envList: any) =>
    envList.length ? `\n        "env" to listOf(${envList.map((e: any) => JSON.stringify(e)).join(", ")}),` : "";

const kotlinLabelsEntry = (labelsMap: any) => {
    const entries = Object.entries(labelsMap)
        .map(([k, v]) => `${JSON.stringify(k)} to ${JSON.stringify(String(v))}`)
        .join(", ");
    return `\n        "labels" to mapOf(${entries}),`;
};

const goEnvBlock = (envList: any) => {
    if (!envList.length) {
        return "";
    }
    return `
                "env": []string{
${envList.map((e: any) => `                        ${JSON.stringify(e)},`).join("\n")}
                },`;
};

const goLabelsBlock = (labelsMap: any) => {
    const entries = Object.entries(labelsMap)
        .map(([k, v]) => `                        ${JSON.stringify(k)}: ${JSON.stringify(String(v))},`)
        .join("\n");
    return `
                "labels": map[string]interface{}{
${entries}
                },`;
};

const rustEnvBlock = (envList: any) => (envList.length ? `\n            "env": ${JSON.stringify(envList)},` : "");

const rustLabelsBlock = (labelsMap: any) => `\n            "labels": ${JSON.stringify(labelsMap)},`;

const csharpEnvBlock = (envList: any) => {
    if (!envList.length) {
        return "";
    }
    return `
    ["env"] = new List<string>() {
${envList.map((e: any) => `        ${JSON.stringify(e)}`).join(",\n")}
    },`;
};

const csharpLabelsBlock = (labelsMap: any) => {
    const entries = Object.entries(labelsMap)
        .map(([k, v]) => `        [${JSON.stringify(k)}] = ${JSON.stringify(String(v))}`)
        .join(",\n");
    return `
    ["labels"] = new Dictionary<string, object> {
${entries}
    },`;
};

const pythonEnvBlock = (envList: any) => (envList.length ? `\n        "env": ${JSON.stringify(envList)},` : "");

const pythonLabelsBlock = (labelsMap: any) => `\n        "labels": ${JSON.stringify(labelsMap)},`;

const jsEnvBlock = (envList: any) => (envList.length ? `\n            env: ${JSON.stringify(envList)},` : "");

const jsLabelsBlock = (labelsMap: any) => `\n            labels: ${JSON.stringify(labelsMap)},`;

const phpEnvBlock = (envList: any) => {
    if (!envList.length) {
        return "";
    }
    const items = envList.map((e: any) => JSON.stringify(e)).join(", ");
    return `\n        "env"=>array(${items}),`;
};

const phpLabelsBlock = (labelsMap: any) => {
    const entries = Object.entries(labelsMap)
        .map(([k, v]) => `${JSON.stringify(k)}=>${JSON.stringify(String(v))}`)
        .join(", ");
    return `\n        "labels"=>array(${entries}),`;
};

const rubyEnvBlock = (envList: any) => (envList.length ? `\n  'env' => ${JSON.stringify(envList)},` : "");

const rubyLabelsBlock = (labelsMap: any) => {
    const entries = Object.entries(labelsMap)
        .map(([k, v]) => `'${k}' => ${JSON.stringify(String(v))}`)
        .join(", ");
    return `\n  'labels' => { ${entries} },`;
};

const swiftEnvBlock = (envList: any) => (envList.length ? `\n        "env": ${JSON.stringify(envList)},` : "");

const swiftLabelsBlock = (labelsMap: any) => `\n        "labels": ${JSON.stringify(labelsMap)},`;

/** Terminal snippets mirror Remote hub + Browser capabilities (createSession SSOT). */
const code = (browser = "UNKNOWN", version = "", origin = "", session: any = {}) => {
    const hubBase = resolveHubOrigin(origin);
    const {
        authUser = DEFAULT_SESSION_OPTS.authUser,
        authPass = DEFAULT_SESSION_OPTS.authPass,
        sessionTimeout = DEFAULT_SESSION_OPTS.sessionTimeout,
        name: sessionName = DEFAULT_SESSION_OPTS.name,
        screenResolution = DEFAULT_SESSION_OPTS.screenResolution,
        enableVnc = DEFAULT_SESSION_OPTS.enableVnc,
        enableVideo = DEFAULT_SESSION_OPTS.enableVideo,
        enableHar = DEFAULT_SESSION_OPTS.enableHar,
        enableLog = DEFAULT_SESSION_OPTS.enableLog,
        timeZone = DEFAULT_SESSION_OPTS.timeZone,
        env = DEFAULT_SESSION_OPTS.env,
        labels = DEFAULT_SESSION_OPTS.labels,
        videoName = DEFAULT_SESSION_OPTS.videoName,
        logName = DEFAULT_SESSION_OPTS.logName,
        harContent = DEFAULT_SESSION_OPTS.harContent,
        proxyPreset = DEFAULT_SESSION_OPTS.proxyPreset,
        proxyServer: customProxyHost = DEFAULT_SESSION_OPTS.proxyServer,
        proxyPort: customProxyPort = DEFAULT_SESSION_OPTS.proxyPort,
    } = session;
    const accessKey = formatAccessKey(authUser, authPass);
    const hubUrl = hubSessionUrl(origin, accessKey);
    const hubSessionEndpoint = `${hubBase}/wd/hub/session`;
    const proxyServer = resolveProxyServer(proxyPreset, customProxyHost, customProxyPort);
    const proxy = buildProxyCapability(proxyServer);
    const selenoidOpts = buildSelenoidOptions({
        sessionTimeout,
        name: sessionName,
        screenResolution,
        enableVnc,
        enableVideo,
        enableHar,
        enableLog,
        timeZone,
        env,
        labels,
        videoName,
        logName,
        harContent,
    });
    const envList = selenoidOpts.env || [];
    const labelsMap = selenoidOpts.labels || {};
    const timeZoneJson = JSON.stringify(selenoidOpts.timeZone);
    const videoNameJson = selenoidOpts.videoName ? JSON.stringify(selenoidOpts.videoName) : null;
    const logNameJson = selenoidOpts.logName ? JSON.stringify(selenoidOpts.logName) : null;
    const harContentJson = selenoidOpts.harContent ? JSON.stringify(selenoidOpts.harContent) : null;
    const curlProxyBlock = proxy
        ? `"proxy": {
                "proxyType": "manual",
                "socksProxy": "${proxyServer}",
                "socksVersion": 5
            },
            `
        : "";
    const javaProxyBlock = proxy
        ? `options.setCapability("proxy", new HashMap<String, Object>() {{
    put("proxyType", "manual");
    put("socksProxy", "${proxyServer}");
    put("socksVersion", 5);
}});
`
        : "";
    const kotlinProxyBlock = proxy
        ? `options.setCapability(
    "proxy",
    mapOf(
        "proxyType" to "manual",
        "socksProxy" to "${proxyServer}",
        "socksVersion" to 5
    )
)
`
        : "";
    const goProxyBlock = proxy
        ? `
		"proxy": map[string]interface{}{
				"proxyType":    "manual",
				"socksProxy":   "${proxyServer}",
				"socksVersion": 5,
		},`
        : "";
    const rustProxyBlock = proxy
        ? `
    caps.add(
        "proxy",
        json!({
            "proxyType": "manual",
            "socksProxy": "${proxyServer}",
            "socksVersion": 5
        }),
    )?;`
        : "";
    const csharpProxyBlock = proxy
        ? `options.AddAdditionalOption("proxy", new Dictionary<string, object> {
    ["proxyType"] = "manual",
    ["socksProxy"] = "${proxyServer}",
    ["socksVersion"] = 5
});
`
        : "";
    const pythonProxyBlock = proxy
        ? `
    "proxy": {
        "proxyType": "manual",
        "socksProxy": "${proxyServer}",
        "socksVersion": 5
    },`
        : "";
    const jsProxyBlock = proxy
        ? `
        proxy: {
            proxyType: 'manual',
            socksProxy: '${proxyServer}',
            socksVersion: 5
        },`
        : "";
    const phpProxyBlock = proxy
        ? `
    "proxy"=>array(
        "proxyType"=>"manual",
        "socksProxy"=>"${proxyServer}",
        "socksVersion"=>5
    ),`
        : "";
    const rubyProxyBlock = proxy
        ? `
caps["proxy"] = {
  'proxyType' => 'manual',
  'socksProxy' => '${proxyServer}',
  'socksVersion' => 5
}`
        : "";
    const swiftProxyBlock = proxy
        ? `
    "proxy": [
        "proxyType": "manual",
        "socksProxy": "${proxyServer}",
        "socksVersion": 5
    ],`
        : "";
    const browserName = browser != "UNKNOWN" ? browser : "chrome";
    const nameJson = JSON.stringify(sessionName);
    const timeoutJson = JSON.stringify(sessionTimeout);
    const resolutionJson = JSON.stringify(screenResolution);
    const curlSelenoidJson = indentJsonLines(JSON.stringify(selenoidOpts, null, 4), 12);
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
    const javaOptionalPuts =
        javaEnvPut(envList) +
        javaLabelsPut(labelsMap) +
        (videoNameJson ? `    put("videoName", ${videoNameJson});\n` : "") +
        (logNameJson ? `    put("logName", ${logNameJson});\n` : "") +
        (harContentJson ? `    put("harContent", ${harContentJson});\n` : "");
    const kotlinOptional =
        kotlinEnvEntry(envList) +
        kotlinLabelsEntry(labelsMap) +
        (videoNameJson ? `\n        "videoName" to ${videoNameJson},` : "") +
        (logNameJson ? `\n        "logName" to ${logNameJson},` : "") +
        (harContentJson ? `\n        "harContent" to ${harContentJson},` : "");
    const goOptional =
        goEnvBlock(envList) +
        goLabelsBlock(labelsMap) +
        (videoNameJson ? `\n                "videoName": ${videoNameJson},` : "") +
        (logNameJson ? `\n                "logName": ${logNameJson},` : "") +
        (harContentJson ? `\n                "harContent": ${harContentJson},` : "");
    const rustOptional =
        rustEnvBlock(envList) +
        rustLabelsBlock(labelsMap) +
        (videoNameJson ? `\n            "videoName": ${videoNameJson},` : "") +
        (logNameJson ? `\n            "logName": ${logNameJson},` : "") +
        (harContentJson ? `\n            "harContent": ${harContentJson},` : "");
    const csharpOptional =
        csharpEnvBlock(envList) +
        csharpLabelsBlock(labelsMap) +
        (videoNameJson ? `\n    ["videoName"] = ${videoNameJson},` : "") +
        (logNameJson ? `\n    ["logName"] = ${logNameJson},` : "") +
        (harContentJson ? `\n    ["harContent"] = ${harContentJson},` : "");
    const pythonOptional =
        pythonEnvBlock(envList) +
        pythonLabelsBlock(labelsMap) +
        (videoNameJson ? `\n        "videoName": ${videoNameJson},` : "") +
        (logNameJson ? `\n        "logName": ${logNameJson},` : "") +
        (harContentJson ? `\n        "harContent": ${harContentJson},` : "");
    const jsOptional =
        jsEnvBlock(envList) +
        jsLabelsBlock(labelsMap) +
        (videoNameJson ? `\n            videoName: ${videoNameJson},` : "") +
        (logNameJson ? `\n            logName: ${logNameJson},` : "") +
        (harContentJson ? `\n            harContent: ${harContentJson},` : "");
    const phpOptional =
        phpEnvBlock(envList) +
        phpLabelsBlock(labelsMap) +
        (videoNameJson ? `\n        "videoName"=>${videoNameJson},` : "") +
        (logNameJson ? `\n        "logName"=>${logNameJson},` : "") +
        (harContentJson ? `\n        "harContent"=>${harContentJson},` : "");
    const rubyOptional =
        rubyEnvBlock(envList) +
        rubyLabelsBlock(labelsMap) +
        (videoNameJson ? `\n  'videoName' => ${videoNameJson},` : "") +
        (logNameJson ? `\n  'logName' => ${logNameJson},` : "") +
        (harContentJson ? `\n  'harContent' => ${harContentJson},` : "");
    const swiftOptional =
        swiftEnvBlock(envList) +
        swiftLabelsBlock(labelsMap) +
        (videoNameJson ? `\n        "videoName": ${videoNameJson},` : "") +
        (logNameJson ? `\n        "logName": ${logNameJson},` : "") +
        (harContentJson ? `\n        "harContent": ${harContentJson},` : "");
    return {
        curl: `curl ${hubAuthCurlFlag(accessKey)}-H 'Content-Type: application/json' ${hubSessionEndpoint} -d '{
    "capabilities": {
        "alwaysMatch": {
            "browserName": "${browserName}",
            ${version == "" ? "" : '"browserVersion": "' + version + '",'}
            ${curlProxyBlock}"selenoid:options": ${curlSelenoidJson}
        }
    }
}'
`,
        java: `${optionsClass} options = new ${optionsClass}();
${version != "" ? 'options.setCapability("browserVersion", "' + version + '");' : ""}
${javaProxyBlock}options.setCapability("selenoid:options", new HashMap<String, Object>() {{
    put("name", ${nameJson});
    put("sessionTimeout", ${timeoutJson});
    put("screenResolution", ${resolutionJson});
    put("timeZone", ${timeZoneJson});
${javaOptionalPuts}    put("enableVNC", ${enableVnc});
    put("enableVideo", ${enableVideo});
    put("enableHAR", ${Boolean(enableHar)});
    put("enableLog", ${enableLog});
}});
RemoteWebDriver driver = new RemoteWebDriver(new URL("${hubUrl}"), options);
`,
        kotlin: `val options = ${optionsClass}()
${version != "" ? 'options.setCapability("browserVersion", "' + version + '")' : ""}
${kotlinProxyBlock}options.setCapability(
    "selenoid:options",
    mapOf(
        "name" to ${nameJson},
        "sessionTimeout" to ${timeoutJson},
        "screenResolution" to ${resolutionJson},
        "timeZone" to ${timeZoneJson},${kotlinOptional}
        "enableVNC" to ${enableVnc},
        "enableVideo" to ${enableVideo},
        "enableHAR" to ${Boolean(enableHar)},
        "enableLog" to ${enableLog}
    )
)
val driver = RemoteWebDriver(URL("${hubUrl}"), options)
`,
        go: `// import "github.com/tebeka/selenium"

caps := selenium.Capabilities{
        "browserName":    "${browserName}",
		"browserVersion": "${version}",${goProxyBlock}
		"selenoid:options": map[string]interface{}{
                "name": ${nameJson},
                "sessionTimeout": ${timeoutJson},
                "screenResolution": ${resolutionJson},
                "timeZone": ${timeZoneJson},${goOptional}
                "enableVNC": ${enableVnc},
                "enableVideo": ${enableVideo},
                "enableHAR": ${Boolean(enableHar)},
                "enableLog": ${enableLog},
        },
}

driver, err := selenium.NewRemote(caps, "${hubUrl}")
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
            "timeZone": ${timeZoneJson},${rustOptional}
            "enableVNC": ${enableVnc},
            "enableVideo": ${enableVideo},
            "enableHAR": ${Boolean(enableHar)},
            "enableLog": ${enableLog}
        }),
    )?;${rustProxyBlock}

    let driver = WebDriver::new("${hubUrl}", caps).await?;
    driver.quit().await?;
    Ok(())
}
`,
        "C#": `${optionsClass} options = new ${optionsClass}();
${version != "" ? 'options.BrowserVersion = "' + version + '";' : ""}
${csharpProxyBlock}options.AddAdditionalOption("selenoid:options", new Dictionary<string, object> {
    ["name"] = ${nameJson},
    ["sessionTimeout"] = ${timeoutJson},
    ["screenResolution"] = ${resolutionJson},
    ["timeZone"] = ${timeZoneJson},${csharpOptional}
    ["enableVNC"] = ${enableVnc},
    ["enableVideo"] = ${enableVideo},
    ["enableHAR"] = ${Boolean(enableHar)},
    ["enableLog"] = ${enableLog}
});
IWebDriver driver = new RemoteWebDriver(new Uri("${hubUrl}"), options);
`,
        python: `from selenium import webdriver
        
capabilities = {
    "browserName": "${browserName}",
    "browserVersion": "${version}",${pythonProxyBlock}
    "selenoid:options": {
        "name": ${nameJson},
        "sessionTimeout": ${timeoutJson},
        "screenResolution": ${resolutionJson},
        "timeZone": ${timeZoneJson},${pythonOptional}
        "enableVNC": ${enableVnc ? "True" : "False"},
        "enableVideo": ${enableVideo ? "True" : "False"},
        "enableHAR": ${enableHar ? "True" : "False"},
        "enableLog": ${enableLog ? "True" : "False"}
    }
}

driver = webdriver.Remote(
    command_executor="${hubUrl}",
    desired_capabilities=capabilities)
`,
        javascript: `var webdriverio = require('webdriverio');
        
var options = { 
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol == "https:" ? "https" : "http"}',
    capabilities: { 
        browserName: '${browserName}',
        browserVersion: '${version}',${jsProxyBlock}
        'selenoid:options': {
            name: ${nameJson},
            sessionTimeout: ${timeoutJson},
            screenResolution: ${resolutionJson},
            timeZone: ${timeZoneJson},${jsOptional}
            enableVNC: ${enableVnc},
            enableVideo: ${enableVideo},
            enableHAR: ${Boolean(enableHar)},
            enableLog: ${enableLog}
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
        browserVersion: '${version}',${jsProxyBlock}
        'selenoid:options': {
            name: ${nameJson},
            sessionTimeout: ${timeoutJson},
            screenResolution: ${resolutionJson},
            timeZone: ${timeZoneJson},${jsOptional}
            enableVNC: ${enableVnc},
            enableVideo: ${enableVideo},
            enableHAR: ${Boolean(enableHar)},
            enableLog: ${enableLog}
        }
    }
};
const client = await remote(options);
`,
        PHP: `$web_driver = RemoteWebDriver::create("${hubUrl}",
array(
    "browserName"=>"${browserName}",
    "browserVersion"=>"${version}",${phpProxyBlock}
    "selenoid:options"=>array(
        "name"=>${nameJson},
        "sessionTimeout"=>${timeoutJson},
        "screenResolution"=>${resolutionJson},
        "timeZone"=>${timeZoneJson},${phpOptional}
        "enableVNC"=>${enableVnc ? "true" : "false"},
        "enableVideo"=>${enableVideo ? "true" : "false"},
        "enableHAR"=>${enableHar ? "true" : "false"},
        "enableLog"=>${enableLog ? "true" : "false"}
    )
)
);
`,
        ruby: `caps = Selenium::WebDriver::Remote::Capabilities.new
browserName: '${browserName}',
caps["browserVersion"] = "${version}"${rubyProxyBlock}
caps["selenoid:options"] = {
  'name' => ${nameJson},
  'sessionTimeout' => ${timeoutJson},
  'screenResolution' => ${resolutionJson},
  'timeZone' => ${timeZoneJson},${rubyOptional}
  'enableVNC' => ${enableVnc},
  'enableVideo' => ${enableVideo},
  'enableHAR' => ${Boolean(enableHar)},
  'enableLog' => ${enableLog}
}

driver = Selenium::WebDriver.for(:remote,
  :url => "${hubUrl}",
  :desired_capabilities => caps)
`,
        swift: `import Foundation
import Selenium

var caps: [String: Any] = [
    "browserName": "${browserName}",
    "browserVersion": "${version}",${swiftProxyBlock}
    "selenoid:options": [
        "name": ${nameJson},
        "sessionTimeout": ${timeoutJson},
        "screenResolution": ${resolutionJson},
        "timeZone": ${timeZoneJson},${swiftOptional}
        "enableVNC": ${enableVnc},
        "enableVideo": ${enableVideo},
        "enableHAR": ${Boolean(enableHar)},
        "enableLog": ${enableLog}
    ]
]

let driver = try RemoteWebDriver(
    with: URL(string: "${hubUrl}")!,
    desiredCapabilities: caps
)
`,
    };
};

const playwrightClient = (browser: any) => {
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

const playwrightCode = (browser: any, version: any, accessKey = "", session: any = {}) => {
    const { base, selenoidOptions, query } = playwrightSnippet(browser, version, accessKey, session);
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

/** Terminal snippets for Selenoid Android (appium:* caps → /wd/hub). */
const androidCode = (version = "", origin = "", session: any = {}, android: any = {}) => {
    const hubBase = resolveHubOrigin(origin);
    const {
        authUser = DEFAULT_SESSION_OPTS.authUser,
        authPass = DEFAULT_SESSION_OPTS.authPass,
        name: sessionName = DEFAULT_SESSION_OPTS.name,
        sessionTimeout = DEFAULT_SESSION_OPTS.sessionTimeout,
        enableVnc = DEFAULT_SESSION_OPTS.enableVnc,
        enableVideo = DEFAULT_SESSION_OPTS.enableVideo,
    } = session;
    const accessKey = formatAccessKey(authUser, authPass);
    const hubUrl = hubSessionUrl(origin, accessKey);
    const hubSessionEndpoint = `${hubBase}/wd/hub/session`;
    const {
        app = DEFAULT_ANDROID_OPTS.app,
        noReset = DEFAULT_ANDROID_OPTS.noReset,
        autoGrantPermissions = DEFAULT_ANDROID_OPTS.autoGrantPermissions,
        orientation = DEFAULT_ANDROID_OPTS.orientation,
    } = android;

    const selenoidOptions = buildAndroidSelenoidOptions({
        name: sessionName,
        sessionTimeout,
        enableVnc,
        enableVideo,
    });
    const alwaysMatch = buildAndroidCapabilities({
        version,
        app,
        noReset,
        autoGrantPermissions,
        orientation,
        selenoidOptions,
    });
    const alwaysMatchJson = JSON.stringify(alwaysMatch, null, 4);
    const appUrl = alwaysMatch["appium:app"];
    const noResetBool = asBool(noReset);
    const autoGrantBool = asBool(autoGrantPermissions);
    const vnc = asBool(enableVnc);
    const video = asBool(enableVideo);
    const nameJson = JSON.stringify(sessionName);
    const timeoutJson = JSON.stringify(sessionTimeout);
    const orientationJson = JSON.stringify(orientation || DEFAULT_ANDROID_OPTS.orientation);
    const appJson = appUrl ? JSON.stringify(appUrl) : null;

    const javaSelenoid = `caps.setCapability("selenoid:options", new HashMap<String, Object>() {{
    put("enableVNC", ${vnc});
    put("enableVideo", ${video});
    put("name", ${nameJson});
    put("sessionTimeout", ${timeoutJson});
}});`;

    return {
        curl: `curl ${hubAuthCurlFlag(accessKey)}-H 'Content-Type: application/json' ${hubSessionEndpoint} -d '{
    "capabilities": {
        "alwaysMatch": ${indentJsonLines(alwaysMatchJson, 8)}
    }
}'
`,
        java: `DesiredCapabilities caps = new DesiredCapabilities();
caps.setCapability("browserName", "android");
caps.setCapability("browserVersion", "${version}");
caps.setCapability("platformName", "Android");
caps.setCapability("appium:automationName", "UiAutomator2");
${appJson ? `caps.setCapability("appium:app", ${appJson});\n` : ""}caps.setCapability("appium:noReset", ${noResetBool});
caps.setCapability("appium:autoGrantPermissions", ${autoGrantBool});
caps.setCapability("appium:orientation", ${orientationJson});
${javaSelenoid}
AndroidDriver driver = new AndroidDriver(new URL("${hubUrl}"), caps);
`,
        python: `from appium import webdriver
from appium.options.common import AppiumOptions

capabilities = ${indentJsonLines(JSON.stringify(alwaysMatch, null, 4), 0)}

options = AppiumOptions().load_capabilities(capabilities)
driver = webdriver.Remote("${hubUrl}", options=options)
`,
        javascript: `const { remote } = require('webdriverio');

const options = {
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol == "https:" ? "https" : "http"}',
    path: '/wd/hub',
    capabilities: ${indentJsonLines(JSON.stringify(alwaysMatch, null, 4), 4)}
};
const driver = await remote(options);
`,
        typescript: `import { remote, type RemoteOptions } from 'webdriverio';

const options: RemoteOptions = {
    hostname: '${window.location.hostname}',
    port: 4444,
    protocol: '${window.location.protocol == "https:" ? "https" : "http"}',
    path: '/wd/hub',
    capabilities: ${indentJsonLines(JSON.stringify(alwaysMatch, null, 4), 4)}
};
const driver = await remote(options);
`,
    };
};

const Capabilities = ({ browsers = {}, browserProtocols = {}, sessions = {}, origin }: any) => {
    const navigate = useNavigate();
    const [browser, onBrowserChange] = useState<any>({});
    const [lang, onLanguageChange] = useState("curl");
    const [outputTab, setOutputTab] = useState("gradle");
    const [authUser, setAuthUser] = useState(() => DEFAULT_SESSION_OPTS.authUser);
    const [authPass, setAuthPass] = useState(() => DEFAULT_SESSION_OPTS.authPass);
    const [accessKey, setAccessKey] = useState(() => DEFAULT_SESSION_OPTS.accessKey);
    // Session options live here so Terminal snippets mirror Remote hub (createSession SSOT).
    const [enableVnc, setEnableVnc] = useState("true");
    const [enableVideo, setEnableVideo] = useState("true");
    const [enableHar, setEnableHar] = useState("false");
    const [harContent, setHarContent] = useState(DEFAULT_SESSION_OPTS.harContent);
    const [enableLog, setEnableLog] = useState("false");
    const [sessionTimeout, setSessionTimeout] = useState(DEFAULT_SESSION_OPTS.sessionTimeout);
    const [sessionName, setSessionName] = useState(DEFAULT_SESSION_OPTS.name);
    const [screenResolution, setScreenResolution] = useState(DEFAULT_SESSION_OPTS.screenResolution);
    const [timeZone, setTimeZone] = useState(DEFAULT_SESSION_OPTS.timeZone);
    const [env, setEnv] = useState(DEFAULT_SESSION_OPTS.env);
    const [labels, setLabels] = useState(DEFAULT_SESSION_OPTS.labels);
    const [videoName, setVideoName] = useState(DEFAULT_SESSION_OPTS.videoName);
    const [logName, setLogName] = useState(DEFAULT_SESSION_OPTS.logName);
    const [proxyPreset, setProxyPreset] = useState(DEFAULT_SESSION_OPTS.proxyPreset);
    const [proxyServer, setProxyServer] = useState(DEFAULT_SESSION_OPTS.proxyServer);
    const [proxyPort, setProxyPort] = useState(DEFAULT_SESSION_OPTS.proxyPort);
    // Playwright-only headless; Android-only appium caps. name/timeout/vnc/video are shared.
    const [headless, setHeadless] = useState(DEFAULT_SESSION_OPTS.headless);
    const [androidApp, setAndroidApp] = useState(DEFAULT_SESSION_OPTS.androidApp);
    const [androidNoReset, setAndroidNoReset] = useState(DEFAULT_SESSION_OPTS.androidNoReset);
    const [androidAutoGrantPermissions, setAndroidAutoGrantPermissions] = useState(
        DEFAULT_SESSION_OPTS.androidAutoGrantPermissions
    );
    const [androidOrientation, setAndroidOrientation] = useState(DEFAULT_SESSION_OPTS.androidOrientation);
    const [vectorDraft, setVectorDraft] = useState<any>(null);
    const [vectorMiss, setVectorMiss] = useState(false);
    const registryRef = useRef<any>(null);
    if (registryRef.current === null) {
        registryRef.current = loadVectorRegistry();
    }

    const available: any[] = ([] as any[]).concat(
        ...Object.keys(browsers).map((name: any) =>
            Object.keys(browsers[name]).map((version: any) => {
                // Playwright strip already says "Playwright" — drop the redundant prefix
                // so chips stay short enough for several per wrap row.
                const chipName = name.startsWith("playwright-") ? name.slice("playwright-".length) : name;
                return {
                    value: `${name}_${version}`,
                    label: `${chipName}: ${version}`,
                    name,
                    version,
                    protocol: browserProtocol(browserProtocols, name, version),
                };
            })
        )
    );

    const { name, version, value, protocol } = browser || {};
    const isPlaywright = protocol === "playwright" || isPlaywrightBrowser(browserProtocols, name, version);
    const isAndroid = name === "android";
    const isIos = name === "ios";
    const isWebdriver = Boolean(name) && !isPlaywright && !isAndroid && !isIos;
    const family = isPlaywright ? "playwright" : isAndroid ? "android" : isIos ? "ios" : "webdriver";
    const pwSession = {
        name: sessionName,
        sessionTimeout,
        screenResolution,
        enableVnc: enableVnc === "true",
        enableVideo: enableVideo === "true",
        enableHar: enableHar === "true",
        harContent,
        enableLog: enableLog === "true",
        timeZone,
        env,
        labels,
        videoName,
        logName,
        socksProxy: resolveProxyServer(proxyPreset, proxyServer, proxyPort),
        headless: headless === "true",
    };
    const androidSession = {
        authUser,
        authPass,
        name: sessionName,
        sessionTimeout,
        enableVnc,
        enableVideo,
    };
    const androidOpts = {
        app: androidApp,
        noReset: androidNoReset,
        autoGrantPermissions: androidAutoGrantPermissions,
        orientation: androidOrientation,
    };
    const sessionOpts = {
        authUser,
        authPass,
        accessKey,
        sessionTimeout,
        name: sessionName,
        screenResolution,
        enableVnc: enableVnc === "true",
        enableVideo: enableVideo === "true",
        enableHar: enableHar === "true",
        harContent,
        enableLog: enableLog === "true",
        timeZone,
        env,
        labels,
        videoName,
        logName,
        proxyPreset,
        proxyServer,
        proxyPort,
        headless: headless === "true",
        androidApp,
        androidNoReset: androidNoReset === "true",
        androidAutoGrantPermissions: androidAutoGrantPermissions === "true",
        androidOrientation,
    };
    const capsSnap = {
        authUser,
        authPass,
        accessKey,
        browserValue: value || "",
        sessionTimeout,
        sessionName,
        screenResolution,
        enableVnc,
        enableVideo,
        enableHar,
        harContent,
        enableLog,
        timeZone,
        env,
        labels,
        videoName,
        logName,
        proxyPreset,
        proxyServer,
        proxyPort,
        headless,
        androidApp,
        androidNoReset,
        androidAutoGrantPermissions,
        androidOrientation,
    };
    const vectorId = fingerprint(capsSnap);
    const displayVector = vectorDraft ?? vectorId;
    const remoteUrl = hubRemoteUrl(origin);
    const caps = isPlaywright
        ? playwrightCode(name, version, accessKey, pwSession)
        : isAndroid
        ? androidCode(version, origin, androidSession, androidOpts)
        : code(name, version, origin, sessionOpts);
    const langKeys = orderedLangKeys(caps);
    const activeLang = langKeys.includes(lang) ? lang : langKeys[0] || "curl";
    const activeSnippet = (caps as any)[activeLang] || "";
    const capsJson = buildCapsJson(capsSnap, vectorId, {
        browser: name || "",
        browserVersion: version || "",
        protocol: family,
        remoteUrl,
    });
    const agentPrompt = buildAgentPrompt({
        vectorId,
        name,
        version,
        family,
        sessionOpts,
        remoteUrl,
    });
    const outputs = {
        prompt: agentPrompt,
        gradle: activeSnippet,
        json: capsJson,
    };
    const activeOutput = (outputs as any)[outputTab] || activeSnippet;
    const isTerminalTab = outputTab === "gradle";
    /** Agent/JSON + curl → library tokens (vscode); other Terminal langs → hljs. */
    const useLibraryHighlight = !isTerminalTab || activeLang === "curl";
    const highlightKind = isTerminalTab ? "curl" : outputTab === "json" ? "json" : "markdown";

    const remember = (snap: any) => {
        const id = fingerprint(snap);
        const registry = registryRef.current!;
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
    }, [name, version, family]);

    const applyCapsSnap = (snap: any) => {
        const next = migrateHubAuthSnap(cloneSessionSnap(snap));
        remember(next);
        setSessionTimeout(next.sessionTimeout);
        setSessionName(next.sessionName);
        setAuthUser(next.authUser ?? DEFAULT_SESSION_OPTS.authUser);
        setAuthPass(next.authPass ?? DEFAULT_SESSION_OPTS.authPass);
        setAccessKey(next.accessKey ?? DEFAULT_SESSION_OPTS.accessKey);
        setScreenResolution(next.screenResolution);
        setEnableVnc(next.enableVnc);
        setEnableVideo(next.enableVideo);
        setEnableHar(next.enableHar);
        setHarContent(next.harContent || DEFAULT_SESSION_OPTS.harContent);
        setEnableLog(next.enableLog || "false");
        setTimeZone(next.timeZone || DEFAULT_SESSION_OPTS.timeZone);
        setEnv(next.env || "");
        setLabels(next.labels || DEFAULT_LABELS_CSV);
        setVideoName(next.videoName || "");
        setLogName(next.logName || "");
        setProxyPreset(next.proxyPreset || PROXY_PRESET_OFF);
        let nextHost = next.proxyServer || "";
        let nextPort = next.proxyPort || "";
        // Legacy vectors stored host:port in proxyServer only.
        if (!next.proxyPort && nextHost.includes(":")) {
            const split = splitProxyEndpoint(nextHost);
            nextHost = split.host;
            nextPort = split.port;
        }
        setProxyServer(nextHost);
        setProxyPort(nextPort);
        setHeadless(next.headless || DEFAULT_SESSION_OPTS.headless);
        setAndroidApp(next.androidApp || DEFAULT_ANDROID_OPTS.app);
        setAndroidNoReset(next.androidNoReset || DEFAULT_ANDROID_OPTS.noReset);
        setAndroidAutoGrantPermissions(next.androidAutoGrantPermissions || DEFAULT_ANDROID_OPTS.autoGrantPermissions);
        setAndroidOrientation(next.androidOrientation || DEFAULT_ANDROID_OPTS.orientation);
        if (next.browserValue) {
            const found = selectableBrowsers.find((item: any) => item.value === next.browserValue);
            onBrowserChange(found || {});
        } else {
            onBrowserChange({});
        }
        setVectorDraft(null);
        setVectorMiss(false);
    };

    const resetCaps = () => {
        const defaultBrowser = pickDefaultWebdriverBrowser(available);
        applyCapsSnap({
            authUser: DEFAULT_SESSION_OPTS.authUser,
            authPass: DEFAULT_SESSION_OPTS.authPass,
            accessKey: DEFAULT_SESSION_OPTS.accessKey,
            // Match initial auto-pick: Сброс restores default chrome, not empty Driver.
            browserValue: defaultBrowser?.value || "",
            sessionTimeout: DEFAULT_SESSION_OPTS.sessionTimeout,
            sessionName: DEFAULT_SESSION_OPTS.name,
            screenResolution: DEFAULT_SESSION_OPTS.screenResolution,
            enableVnc: "true",
            enableVideo: "true",
            enableHar: "false",
            harContent: DEFAULT_SESSION_OPTS.harContent,
            enableLog: "false",
            timeZone: DEFAULT_SESSION_OPTS.timeZone,
            env: "",
            labels: DEFAULT_LABELS_CSV,
            videoName: "",
            logName: "",
            proxyPreset: PROXY_PRESET_OFF,
            proxyServer: "",
            proxyPort: "",
            headless: DEFAULT_SESSION_OPTS.headless,
            androidApp: DEFAULT_ANDROID_OPTS.app,
            androidNoReset: DEFAULT_ANDROID_OPTS.noReset,
            androidAutoGrantPermissions: DEFAULT_ANDROID_OPTS.autoGrantPermissions,
            androidOrientation: DEFAULT_ANDROID_OPTS.orientation,
        });
    };

    const touchOptions = () => setVectorMiss(false);

    const commitVector = (raw: any) => {
        const normalized = normalizeVectorId(raw);
        setVectorDraft(null);
        if (!normalized || normalized === vectorId) {
            setVectorMiss(false);
            return;
        }
        const snap = registryRef.current!.get(normalized);
        if (!snap) {
            setVectorMiss(true);
            return;
        }
        applyCapsSnap(snap);
    };

    const toBrowserOptions = (items: any) =>
        items.map((item: any) => ({
            value: item.value,
            label: item.label,
            title: item.label,
        }));

    // Protocol / platform rows in Driver (exclusive Tagstrip → createSession).
    const webdriverAvailable = available.filter(
        (item: any) => item.protocol !== "playwright" && item.name !== "android" && item.name !== "ios"
    );
    const playwrightAvailable = available.filter((item: any) => item.protocol === "playwright");
    const androidAvailable = available.filter((item: any) => item.name === "android");
    const iosAvailable = available.filter((item: any) => item.name === "ios");
    // todo: Windows
    // todo: Linux
    // todo: Mac

    const webdriverOptions = toBrowserOptions(webdriverAvailable);
    const playwrightOptions = toBrowserOptions(playwrightAvailable);
    const androidOptions = toBrowserOptions(androidAvailable);
    // No real iOS image yet → show one selectable "coming soon" chip → placeholder panel.
    const iosOptions = iosAvailable.length
        ? toBrowserOptions(iosAvailable)
        : [{ value: IOS_PLACEHOLDER.value, label: IOS_PLACEHOLDER.label, title: IOS_PLACEHOLDER.label }];
    const selectableBrowsers: any[] = iosAvailable.length ? available : available.concat(IOS_PLACEHOLDER as any);

    const onBrowserToggle = (optionValue: any) => {
        touchOptions();
        if (value === optionValue) {
            onBrowserChange({});
            return;
        }
        const next = selectableBrowsers.find((item: any) => item.value === optionValue);
        if (next) {
            if (next.name === "android") {
                setSessionTimeout(ANDROID_DEFAULT_SESSION_TIMEOUT);
            }
            onBrowserChange(next);
        }
    };

    useEffect(() => {
        if (value || !webdriverAvailable.length) {
            return;
        }
        const picked = pickDefaultWebdriverBrowser(available);
        if (picked) {
            onBrowserChange(picked);
        }
    }, [value, available, webdriverAvailable.length]);

    const driverStripAria = (groupItems: any, loadedLabel: any) =>
        groupItems.length ? loadedLabel : origin ? "No information about browsers" : "Loading browsers";

    // Config panels default: magnet aligns label|divider across stack rows.
    usePlaqueFieldMagnet({
        enabled: true,
        syncKey: [
            webdriverOptions.length,
            playwrightOptions.length,
            androidOptions.length,
            iosOptions.length,
            value || "",
        ].join(":"),
    });

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

    const downloadSnippet = () => {
        const text = activeOutput;
        const filename =
            outputTab === "json"
                ? "capabilities.json"
                : outputTab === "prompt"
                ? "agent-prompt.md"
                : `capabilities.${activeLang === "curl" ? "sh" : activeLang || "txt"}`;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <StyledCapabilities>
            <div className="capabilities-body">
                <div className="setup" data-testid="capabilities-setup">
                    <Panel
                        title="Browser / device image"
                        testId="capabilities-driver-panel"
                        titleTestId="capabilities-driver-title"
                        className="capabilities-config-panel"
                    >
                        {/*
                          Driver rows → createSession: exclusive Tagstrip (library
                          PlaqueTagstrip; ≠ react-select). Selection unlocks Launch.
                          Magnet stack — dividers flush on longest label (Webdriver).
                          Tagstrips still wrap chips (--many); magnet does not lock 32px.
                          todo: Windows · Linux · Mac
                        */}
                        <div
                            className="plaque-field-grid-stack plaque-field-grid-stack--magnet"
                            data-testid="capabilities-driver-browsers"
                        >
                            <PlaqueFieldGrid
                                layout="solo"
                                aria-label="WebDriver"
                                data-testid="capabilities-driver-webdriver"
                            >
                                <PlaqueTagstrip
                                    label="WebDriver"
                                    paramId="webdriver"
                                    className="capabilities-browser-select"
                                    options={webdriverOptions}
                                    values={value ? [value] : []}
                                    onToggle={onBrowserToggle}
                                    aria-label={driverStripAria(webdriverAvailable, "WebDriver browsers")}
                                    data-testid="capabilities-browser-select"
                                />
                            </PlaqueFieldGrid>
                            <PlaqueFieldGrid
                                layout="solo"
                                aria-label="Playwright"
                                data-testid="capabilities-driver-playwright"
                            >
                                <PlaqueTagstrip
                                    label="Playwright"
                                    paramId="playwright"
                                    className="capabilities-browser-select"
                                    options={playwrightOptions}
                                    values={value ? [value] : []}
                                    onToggle={onBrowserToggle}
                                    aria-label={driverStripAria(playwrightAvailable, "Playwright browsers")}
                                    data-testid="capabilities-browser-select-playwright"
                                />
                            </PlaqueFieldGrid>
                            <PlaqueFieldGrid
                                layout="solo"
                                aria-label="Android"
                                data-testid="capabilities-driver-android"
                            >
                                <PlaqueTagstrip
                                    label="Android"
                                    paramId="android"
                                    className="capabilities-browser-select"
                                    options={androidOptions}
                                    values={value ? [value] : []}
                                    onToggle={onBrowserToggle}
                                    aria-label={driverStripAria(androidAvailable, "Android devices")}
                                    data-testid="capabilities-browser-select-android"
                                />
                            </PlaqueFieldGrid>
                            <PlaqueFieldGrid layout="solo" aria-label="iOS" data-testid="capabilities-driver-ios">
                                <PlaqueTagstrip
                                    label="iOS"
                                    paramId="ios"
                                    className="capabilities-browser-select"
                                    options={iosOptions}
                                    values={value ? [value] : []}
                                    onToggle={onBrowserToggle}
                                    aria-label={driverStripAria(iosAvailable, "iOS devices")}
                                    data-testid="capabilities-browser-select-ios"
                                />
                            </PlaqueFieldGrid>
                        </div>
                    </Panel>
                    <Launch
                        browser={browser}
                        navigate={navigate}
                        sessions={sessions}
                        isPlaywright={isPlaywright}
                        isAndroid={isAndroid}
                        isIos={isIos}
                        isWebdriver={isWebdriver}
                        pwSession={pwSession}
                        androidCaps={androidOpts}
                        origin={origin}
                        headless={headless}
                        setHeadless={(v: any) => {
                            touchOptions();
                            setHeadless(v);
                        }}
                        androidApp={androidApp}
                        setAndroidApp={(v: any) => {
                            touchOptions();
                            setAndroidApp(v);
                        }}
                        androidNoReset={androidNoReset}
                        setAndroidNoReset={(v: any) => {
                            touchOptions();
                            setAndroidNoReset(v);
                        }}
                        androidAutoGrantPermissions={androidAutoGrantPermissions}
                        setAndroidAutoGrantPermissions={(v: any) => {
                            touchOptions();
                            setAndroidAutoGrantPermissions(v);
                        }}
                        androidOrientation={androidOrientation}
                        setAndroidOrientation={(v: any) => {
                            touchOptions();
                            setAndroidOrientation(v);
                        }}
                        enableVnc={enableVnc}
                        setEnableVnc={(v: any) => {
                            touchOptions();
                            setEnableVnc(v);
                        }}
                        enableVideo={enableVideo}
                        setEnableVideo={(v: any) => {
                            touchOptions();
                            setEnableVideo(v);
                        }}
                        enableHar={enableHar}
                        setEnableHar={(v: any) => {
                            touchOptions();
                            setEnableHar(v);
                        }}
                        harContent={harContent}
                        setHarContent={(v: any) => {
                            touchOptions();
                            setHarContent(v);
                        }}
                        enableLog={enableLog}
                        setEnableLog={(v: any) => {
                            touchOptions();
                            setEnableLog(v);
                        }}
                        sessionTimeout={sessionTimeout}
                        setSessionTimeout={(v: any) => {
                            touchOptions();
                            setSessionTimeout(v);
                        }}
                        sessionName={sessionName}
                        setSessionName={(v: any) => {
                            touchOptions();
                            setSessionName(v);
                        }}
                        screenResolution={screenResolution}
                        setScreenResolution={(v: any) => {
                            touchOptions();
                            setScreenResolution(v);
                        }}
                        timeZone={timeZone}
                        setTimeZone={(v: any) => {
                            touchOptions();
                            setTimeZone(v);
                        }}
                        env={env}
                        setEnv={(v: any) => {
                            touchOptions();
                            setEnv(v);
                        }}
                        labels={labels}
                        setLabels={(v: any) => {
                            touchOptions();
                            setLabels(v);
                        }}
                        videoName={videoName}
                        setVideoName={(v: any) => {
                            touchOptions();
                            setVideoName(v);
                        }}
                        logName={logName}
                        setLogName={(v: any) => {
                            touchOptions();
                            setLogName(v);
                        }}
                        proxyPreset={proxyPreset}
                        setProxyPreset={(v: any) => {
                            touchOptions();
                            setProxyPreset(v);
                            if (v === PROXY_PRESET_OFF || v === PROXY_PRESET_CUSTOM) {
                                setProxyServer("");
                                setProxyPort("");
                            } else if (v === PROXY_PRESET_QA_GURU) {
                                setProxyServer(PROXY_QA_GURU_HOST);
                                setProxyPort(PROXY_QA_GURU_PORT);
                            }
                        }}
                        proxyServer={proxyServer}
                        setProxyServer={(v: any) => {
                            touchOptions();
                            setProxyServer(v);
                        }}
                        proxyPort={proxyPort}
                        setProxyPort={(v: any) => {
                            touchOptions();
                            setProxyPort(v);
                        }}
                        authUser={authUser}
                        setAuthUser={(v: any) => {
                            touchOptions();
                            setAuthUser(v);
                        }}
                        authPass={authPass}
                        setAuthPass={(v: any) => {
                            touchOptions();
                            setAuthPass(v);
                        }}
                        accessKey={accessKey}
                        setAccessKey={(v: any) => {
                            touchOptions();
                            setAccessKey(v);
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
                                {OUTPUT_TABS.map((tab: any) => (
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
                                    {langKeys.map((next: any) => (
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
                                id="capabilities-terminal-vector"
                                name="capabilities-terminal-vector"
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
                                onChange={(e: any) => {
                                    setVectorDraft(e.target.value);
                                    setVectorMiss(false);
                                }}
                                onBlur={(e: any) => commitVector(e.target.value)}
                                onKeyDown={(e: any) => {
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
                                icon: <IconDownload />,
                                label: "Скачать",
                                onClick: downloadSnippet,
                                "data-testid": "capabilities-terminal-download",
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
    isAndroid,
    isIos,
    isWebdriver,
    pwSession = {},
    androidCaps = {},
    origin,
    headless,
    setHeadless,
    androidApp,
    setAndroidApp,
    androidNoReset,
    setAndroidNoReset,
    androidAutoGrantPermissions,
    setAndroidAutoGrantPermissions,
    androidOrientation,
    setAndroidOrientation,
    enableVnc,
    setEnableVnc,
    enableVideo,
    setEnableVideo,
    enableHar,
    setEnableHar,
    harContent,
    setHarContent,
    enableLog,
    setEnableLog,
    sessionTimeout,
    setSessionTimeout,
    sessionName,
    setSessionName,
    screenResolution,
    setScreenResolution,
    timeZone,
    setTimeZone,
    env,
    setEnv,
    labels,
    setLabels,
    videoName,
    setVideoName,
    logName,
    setLogName,
    proxyPreset,
    setProxyPreset,
    proxyServer,
    setProxyServer,
    proxyPort,
    setProxyPort,
    authUser,
    setAuthUser,
    authPass,
    setAuthPass,
    accessKey,
    setAccessKey,
}: any) => {
    const [loading, onLoading] = useState(false);
    const [error, onError] = useState("");
    const remoteUrl = hubRemoteUrl(origin);
    /** WD / Android Basic Auth wire token — never used to invent Playwright accessKey. */
    const wdAuthToken = formatAccessKey(authUser, authPass);
    const playwrightSocket = useRef<WebSocket | null>(null);
    // Config stacks (Remote hub / Playwright / Android) share the magnet; iOS placeholder has no fields.
    usePlaqueFieldMagnet({ enabled: Boolean(name) && !isIos });

    const createSession = useCallback(async () => {
        onError("");
        onLoading(true);

        const vnc = enableVnc === "true";
        const video = enableVideo === "true";

        if (isAndroid) {
            const androidSelenoidOptions = buildAndroidSelenoidOptions({
                name: sessionName,
                sessionTimeout,
                enableVnc: vnc,
                enableVideo: video,
            });
            const androidAlwaysMatch = buildAndroidCapabilities({
                version,
                app: androidApp,
                noReset: androidNoReset,
                autoGrantPermissions: androidAutoGrantPermissions,
                orientation: androidOrientation,
                selenoidOptions: androidSelenoidOptions,
            });
            if (isMockSessionsEnabled()) {
                const sessionId = spawnCreatedMockSession({
                    browserName: "android",
                    version,
                    quota: String(authUser || "").trim(),
                    caps: { ...androidSelenoidOptions },
                });
                navigate(`/sessions/${sessionId}`);
                onLoading(false);
                return;
            }
            const androidController = new AbortController();
            const androidTimeout = scheduleCreateSessionAbort(androidController);
            try {
                await primeHubAuth(wdAuthToken);
                const response = await fetch(
                    sameOriginURL("/wd/hub/session"),
                    hubFetchInit(wdAuthToken, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        signal: androidController.signal,
                        body: JSON.stringify({
                            capabilities: {
                                alwaysMatch: androidAlwaysMatch,
                                firstMatch: [{}],
                            },
                        }),
                    })
                );
                if (response.status === 200) {
                    const data = await response.json();
                    const sessionId = sessionIdFrom({ response: data });
                    rememberHubAuthToken(wdAuthToken);
                    await waitForLiveSession(sessionId, { initialSessions: sessions });
                    navigate(`/sessions/${sessionId}`);
                    onLoading(false);
                } else {
                    onError(await hubSessionErrorMessage(response));
                    onLoading(false);
                }
            } catch (err) {
                const message = createSessionCatchMessage(err, { timeoutMs: CREATE_SESSION_TIMEOUT_MS });
                console.error(message, err);
                onError(message);
                onLoading(false);
            } finally {
                clearTimeout(androidTimeout);
            }
            return;
        }

        const log = enableLog === "true";
        const har = enableHar === "true";
        const resolvedProxy = resolveProxyServer(proxyPreset, proxyServer, proxyPort);
        const proxy = buildProxyCapability(resolvedProxy);
        const selenoidOptions = buildSelenoidOptions({
            sessionTimeout,
            name: sessionName,
            screenResolution,
            enableVnc: vnc,
            enableVideo: video,
            enableHar: har,
            enableLog: log,
            timeZone,
            env,
            labels,
            videoName,
            logName,
            harContent,
        });
        let desiredCapabilities: Record<string, any> = {
            browserName: `${name}`,
            version: `${version}`,
            enableVNC: vnc,
            enableVideo: video,
            enableHAR: har,
            enableLog: log,
            timeZone: selenoidOptions.timeZone,
            labels: selenoidOptions.labels,
            sessionTimeout,
            name: sessionName,
            screenResolution,
        };
        if (selenoidOptions.env) {
            desiredCapabilities.env = selenoidOptions.env;
        }
        if (selenoidOptions.videoName) {
            desiredCapabilities.videoName = selenoidOptions.videoName;
        }
        if (selenoidOptions.logName) {
            desiredCapabilities.logName = selenoidOptions.logName;
        }
        if (selenoidOptions.harContent) {
            desiredCapabilities.harContent = selenoidOptions.harContent;
        }

        if (proxy) {
            desiredCapabilities = Object.assign(desiredCapabilities, { proxy });
        }

        const alwaysMatch: Record<string, any> = {
            browserName: `${name}`,
            browserVersion: `${version}`,
            "selenoid:options": selenoidOptions,
        };
        if (proxy) {
            alwaysMatch.proxy = proxy;
        }
        const windowOpts = browserWindowOptions(name, screenResolution);
        if (windowOpts) {
            Object.assign(alwaysMatch, windowOpts);
            Object.assign(desiredCapabilities, windowOpts);
        }

        if (isMockSessionsEnabled()) {
            const sessionId = spawnCreatedMockSession({
                browserName: `${name}`,
                version: `${version}`,
                quota: String(authUser || "").trim(),
                caps: { ...selenoidOptions },
            });
            navigate(`/sessions/${sessionId}`);
            onLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeout = scheduleCreateSessionAbort(controller);

        try {
            await primeHubAuth(wdAuthToken);
            const response = await fetch(
                sameOriginURL("/wd/hub/session"),
                hubFetchInit(wdAuthToken, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        desiredCapabilities,
                        capabilities: {
                            alwaysMatch,
                            firstMatch: [{}],
                        },
                    }),
                })
            );

            if (response.status === 200) {
                const data = await response.json();
                const sessionId = sessionIdFrom({ response: data });
                rememberHubAuthToken(wdAuthToken);
                try {
                    // Chromium/Edge already get --window-size via browserWindowOptions; only
                    // POST window/rect for drivers that ignore launch args (e.g. Firefox).
                    if (!windowOpts) {
                        const resizeController = new AbortController();
                        await Promise.race([
                            resizeSessionWindow(
                                sessionId,
                                screenResolution,
                                fetch,
                                wdAuthToken,
                                resizeController.signal
                            ),
                            new Promise((resolve: any) =>
                                setTimeout(() => {
                                    resizeController.abort();
                                    resolve(undefined);
                                }, 8000)
                            ),
                        ]);
                    }
                } catch (resizeErr) {
                    if (!(resizeErr instanceof DOMException && resizeErr.name === "AbortError")) {
                        console.warn("Can't resize session window to screenResolution", resizeErr);
                    }
                }
                await waitForLiveSession(sessionId, { initialSessions: sessions });
                navigate(`/sessions/${sessionId}`);
                onLoading(false);
            } else {
                onError(await hubSessionErrorMessage(response));
                onLoading(false);
            }
        } catch (err) {
            const message = createSessionCatchMessage(err, { timeoutMs: CREATE_SESSION_TIMEOUT_MS });
            console.error(message, err);
            onError(message);
            onLoading(false);
        } finally {
            clearTimeout(timeout);
        }
    }, [
        name,
        version,
        navigate,
        isAndroid,
        androidApp,
        androidNoReset,
        androidAutoGrantPermissions,
        androidOrientation,
        enableVnc,
        enableVideo,
        enableHar,
        harContent,
        enableLog,
        sessionTimeout,
        sessionName,
        screenResolution,
        timeZone,
        env,
        labels,
        videoName,
        logName,
        proxyPreset,
        proxyServer,
        proxyPort,
        authUser,
        authPass,
        wdAuthToken,
        sessions,
    ]);

    const createPlaywrightSession = () => {
        if (!name || !version) {
            return;
        }

        onError("");
        onLoading(true);

        if (isMockSessionsEnabled()) {
            const opts = buildSelenoidOptions({
                sessionTimeout: pwSession.sessionTimeout,
                name: pwSession.name,
                screenResolution: pwSession.screenResolution,
                enableVnc: pwSession.enableVnc,
                enableVideo: pwSession.enableVideo,
                enableHar: pwSession.enableHar,
                enableLog: pwSession.enableLog,
                timeZone: pwSession.timeZone,
                env: pwSession.env,
                labels: pwSession.labels,
                videoName: pwSession.videoName,
                logName: pwSession.logName,
                harContent: pwSession.harContent,
            });
            const sessionId = spawnCreatedMockSession({
                browserName: name,
                version,
                quota: String(authUser || "").trim(),
                caps: { ...opts, headless: Boolean(pwSession.headless) },
            });
            navigate(`/sessions/${sessionId}`);
            onLoading(false);
            return;
        }

        const existingIds = new Set(Object.keys(sessions || {}));
        const wsUrl = playwrightEndpoint(name, version, accessKey, pwSession);
        // Prime proxy with WD Basic Auth when available; else try accessKey if it is user:pass.
        const primeToken = wdAuthToken || (parseAccessKey(accessKey) ? accessKey : "");
        let navigated = false;
        let eventSource: EventSource | undefined;
        let pollTimer: number | undefined;
        let timeoutTimer: number | undefined;

        const stopWatching = () => {
            if (eventSource) {
                eventSource.close();
                eventSource = undefined;
            }
            if (pollTimer != null) {
                window.clearInterval(pollTimer);
                pollTimer = undefined;
            }
            if (timeoutTimer != null) {
                window.clearTimeout(timeoutTimer);
                timeoutTimer = undefined;
            }
        };

        const finish = (message: any, closeSocket: any) => {
            if (closeSocket && playwrightSocket.current) {
                playwrightSocket.current.close();
                playwrightSocket.current = null;
            }
            stopWatching();
            onLoading(false);
            if (message) {
                onError(message);
            }
        };

        const tryNavigate = (data: any) => {
            if (navigated) {
                return;
            }
            const sessionId = findPlaywrightSession(data.sessions, existingIds, name, version, pwSession.name);
            if (!sessionId) {
                return;
            }
            navigated = true;
            stopWatching();
            // Prefer Playwright accessKey when it is user:pass — WD duo state may
            // still hold bake-time defaults while the form only edited accessKey.
            rememberHubAuthToken(parseAccessKey(accessKey) ? accessKey : primeToken);
            retainPlaywrightSocket(sessionId, playwrightSocket.current!);
            navigate(`/sessions/${sessionId}`);
            onLoading(false);
        };

        const pollStatus = () => {
            void fetch(sameOriginURL("/ui/status"), { cache: "no-store" })
                .then(async (response) => {
                    if (response.status === 404) {
                        return fetch(sameOriginURL("/status"), { cache: "no-store" });
                    }
                    return response;
                })
                .then((response) => (response.ok ? response.json() : null))
                .then((payload) => {
                    if (payload) {
                        tryNavigate(payload);
                    }
                })
                .catch(() => {
                    // Keep polling until timeout — second EventSource is flaky under nginx.
                });
        };

        try {
            eventSource = new EventSource(sameOriginURL("/events"));
            eventSource.onmessage = (e: any) => {
                try {
                    tryNavigate(JSON.parse(e.data));
                } catch (err) {
                    console.error("Can't parse SSE event", err);
                }
            };
            // Do not abort on EventSource error — /ui/status poll is the source of truth.
        } catch (err) {
            console.error("Playwright EventSource unavailable", err);
        }

        tryNavigate({ sessions });
        pollStatus();
        pollTimer = window.setInterval(pollStatus, 500);
        timeoutTimer = window.setTimeout(() => {
            if (!navigated) {
                finish("Timed out waiting for Playwright session", true);
            }
        }, 120_000);

        const openWebSocket = () => {
            const ws = new WebSocket(wsUrl);
            playwrightSocket.current = ws;

            ws.onerror = () => {
                // Do not abort immediately — transient proxy blips happen while the
                // hub still registers the session; /ui/status poll remains in charge.
                console.warn("Playwright WebSocket error while starting session");
            };
            ws.onclose = () => {
                if (navigated) {
                    return;
                }
                // Grace: session often appears in /ui/status a moment after the
                // browser WS handshake; aborting here caused flaky Create Session.
                window.setTimeout(() => {
                    if (!navigated) {
                        finish("Playwright session closed before it was ready", true);
                    }
                }, 15_000);
            };
        };

        primeHubAuth(primeToken)
            .then(() => openWebSocket())
            .catch((err: any) => {
                console.error("Playwright auth failed", err);
                finish("Authentication failed", true);
            });
    };

    const onCreateSession = () => {
        if (isIos) {
            return;
        }
        if (isPlaywright) {
            createPlaywrightSession();
            return;
        }
        createSession();
    };

    const proxyOff = proxyPreset === PROXY_PRESET_OFF;
    const proxyPresetLocked = proxyPreset === PROXY_PRESET_QA_GURU;

    const renderWdAuthRow = () => (
        <PlaqueFieldGrid layout="duo" aria-label="Hub authentication" data-testid="capabilities-caps-auth">
            <PlaqueField
                label="authUser"
                paramId="authUser"
                labelVariant="param"
                type="text"
                value={authUser}
                onChange={(e: any) => setAuthUser(e.target.value)}
                autoComplete="username"
                data-testid="capabilities-caps-auth-user"
            />
            <PlaqueField
                label="authPass"
                paramId="authPass"
                labelVariant="param"
                type="password"
                value={authPass}
                onChange={(e: any) => setAuthPass(e.target.value)}
                autoComplete="current-password"
                data-testid="capabilities-caps-auth-pass"
            />
        </PlaqueFieldGrid>
    );

    const renderPlaywrightAccessKey = () => (
        <PlaqueFieldGrid layout="solo" aria-label="Playwright access key" data-testid="capabilities-caps-access-key">
            <PlaqueField
                label="accessKey"
                paramId="accessKey"
                labelVariant="param"
                type="password"
                value={accessKey}
                onChange={(e: any) => setAccessKey(e.target.value)}
                autoComplete="off"
                data-testid="capabilities-caps-access-key-field"
            />
        </PlaqueFieldGrid>
    );

    return (
        <div className="capabilities-launch">
            {isWebdriver ? (
                <Panel
                    title="Session options"
                    testId="capabilities-remote-panel"
                    titleTestId="capabilities-remote-title"
                    className="capabilities-config-panel"
                >
                    {/*
                      presets #remote-hub: magnet stack →
                      solo(remoteUrl) + duo(authUser|authPass) + duo(sessionTimeout|name) + solo(screenResolution) +
                      solo(enableVnc|enableVideo|videoName?|enableHar) +
                      conditional solo(harContent) + solo(enableLog|logName?) +
                      solo(timeZone) + solo(env) + solo(labels).
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

                        {renderWdAuthRow()}

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
                                onChange={(e: any) => setSessionName(e.target.value)}
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
                            aria-label="Session options flags"
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
                            {enableVideo === "true" ? (
                                <PlaqueField
                                    label="videoName"
                                    paramId="videoName"
                                    labelVariant="param"
                                    type="text"
                                    value={videoName}
                                    placeholder="session.mp4"
                                    onChange={(e: any) => setVideoName(e.target.value)}
                                    data-testid="caps-video-name"
                                />
                            ) : null}
                            <PlaqueFieldSeg
                                label="enableHar"
                                paramId="enableHar"
                                value={enableHar}
                                onValueChange={setEnableHar}
                                stretch
                                data-testid="caps-enable-har"
                                aria-label="enableHar — hub records network over CDP → /har/<id>.har"
                                options={[
                                    {
                                        value: "true",
                                        title:
                                            "Hub records browser network over CDP → download /har/<id>.har (Chrome/Edge WebDriver)",
                                    },
                                    {
                                        value: "false",
                                        title: "Do not record HAR",
                                    },
                                ]}
                            />
                        </PlaqueFieldGrid>

                        {enableHar === "true" ? (
                            <PlaqueFieldGrid
                                layout="solo"
                                aria-label="HAR content depth"
                                data-testid="capabilities-caps-har"
                            >
                                <PlaqueFieldSeg
                                    label="harContent"
                                    paramId="harContent"
                                    value={harContent}
                                    onValueChange={setHarContent}
                                    stretch
                                    data-testid="caps-har-content"
                                    aria-label="harContent — meta (default) or bodies (opt-in response text)"
                                    options={HAR_CONTENT_OPTIONS}
                                />
                            </PlaqueFieldGrid>
                        ) : null}

                        <PlaqueFieldGrid layout="solo" aria-label="Browser log" data-testid="capabilities-caps-log">
                            <PlaqueFieldSeg
                                label="enableLog"
                                paramId="enableLog"
                                value={enableLog}
                                onValueChange={setEnableLog}
                                stretch
                                data-testid="caps-enable-log"
                            />
                            {enableLog === "true" ? (
                                <PlaqueField
                                    label="logName"
                                    paramId="logName"
                                    labelVariant="param"
                                    type="text"
                                    value={logName}
                                    placeholder="session.log"
                                    onChange={(e: any) => setLogName(e.target.value)}
                                    data-testid="caps-log-name"
                                />
                            ) : null}
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid layout="solo" aria-label="Time zone" data-testid="capabilities-caps-timezone">
                            <PlaqueSelect
                                label="timeZone"
                                paramId="timeZone"
                                value={timeZone}
                                options={TIME_ZONE_OPTIONS}
                                onChange={setTimeZone}
                                data-testid="caps-time-zone"
                            />
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid layout="solo" aria-label="Container env" data-testid="capabilities-caps-env">
                            <PlaqueField
                                label="env"
                                paramId="env"
                                labelVariant="param"
                                type="text"
                                value={env}
                                placeholder="KEY=value,KEY2=value"
                                onChange={(e: any) => setEnv(e.target.value)}
                                data-testid="caps-env"
                            />
                        </PlaqueFieldGrid>

                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Session labels"
                            data-testid="capabilities-caps-labels"
                        >
                            <PlaqueField
                                label="labels"
                                paramId="labels"
                                labelVariant="param"
                                type="text"
                                value={labels}
                                placeholder="key=value,key2=value"
                                onChange={(e: any) => setLabels(e.target.value)}
                                data-testid="caps-labels"
                            />
                        </PlaqueFieldGrid>
                    </div>
                </Panel>
            ) : null}
            {isPlaywright && name ? (
                <Panel
                    title="Session options"
                    testId="capabilities-playwright-panel"
                    titleTestId="capabilities-playwright-title"
                    className="capabilities-config-panel"
                >
                    {/*
                      selenoid:options → WS query (parity with Remote hub + headless).
                      Proxy panel renders below (same order as WebDriver Remote hub → Browser capabilities).
                    */}
                    <div
                        className="plaque-field-grid-stack plaque-field-grid-stack--magnet"
                        data-testid="capabilities-playwright-caps"
                    >
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Remote URL"
                            data-testid="capabilities-playwright-remote-url"
                        >
                            <PlaqueField
                                label="remoteUrl"
                                paramId="remoteUrl"
                                labelVariant="param"
                                type="text"
                                value={remoteUrl}
                                readOnly
                                data-testid="caps-playwright-remote-url"
                            />
                        </PlaqueFieldGrid>
                        {renderPlaywrightAccessKey()}
                        <PlaqueFieldGrid
                            layout="duo"
                            aria-label="Session identity"
                            data-testid="capabilities-playwright-session"
                        >
                            <PlaqueSelect
                                label="sessionTimeout"
                                paramId="sessionTimeout"
                                value={sessionTimeout}
                                options={SESSION_TIMEOUT_OPTIONS}
                                onChange={setSessionTimeout}
                                data-testid="caps-playwright-session-timeout"
                            />
                            <PlaqueField
                                label="name"
                                paramId="name"
                                labelVariant="param"
                                type="text"
                                value={sessionName}
                                onChange={(e: any) => setSessionName(e.target.value)}
                                data-testid="caps-playwright-session-name"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Screen resolution"
                            data-testid="capabilities-playwright-resolution"
                        >
                            <PlaqueSelect
                                label="screenResolution"
                                paramId="screenResolution"
                                value={screenResolution}
                                options={SCREEN_RESOLUTION_OPTIONS}
                                onChange={setScreenResolution}
                                data-testid="caps-playwright-screen-resolution"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Playwright flags"
                            data-testid="capabilities-playwright-flags"
                        >
                            <PlaqueFieldSeg
                                label="enableVnc"
                                paramId="enableVnc"
                                value={enableVnc}
                                onValueChange={setEnableVnc}
                                stretch
                                data-testid="caps-playwright-enable-vnc"
                            />
                            <PlaqueFieldSeg
                                label="enableVideo"
                                paramId="enableVideo"
                                value={enableVideo}
                                onValueChange={setEnableVideo}
                                stretch
                                data-testid="caps-playwright-enable-video"
                            />
                            {enableVideo === "true" ? (
                                <PlaqueField
                                    label="videoName"
                                    paramId="videoName"
                                    labelVariant="param"
                                    type="text"
                                    value={videoName}
                                    placeholder="session.mp4"
                                    onChange={(e: any) => setVideoName(e.target.value)}
                                    data-testid="caps-playwright-video-name"
                                />
                            ) : null}
                            <PlaqueFieldSeg
                                label="enableHar"
                                paramId="enableHar"
                                value={enableHar}
                                onValueChange={setEnableHar}
                                stretch
                                data-testid="caps-playwright-enable-har"
                                aria-label="enableHar — hub CDP → /har/<id>.har (not client recordHar)"
                                options={[
                                    {
                                        value: "true",
                                        title:
                                            "Hub records network over CDP → /har/<id>.har (needs DevTools :7070 on the image)",
                                    },
                                    {
                                        value: "false",
                                        title: "Do not record hub HAR (use client recordHar in autotests)",
                                    },
                                ]}
                            />
                        </PlaqueFieldGrid>
                        {enableHar === "true" ? (
                            <PlaqueFieldGrid
                                layout="solo"
                                aria-label="HAR content depth"
                                data-testid="capabilities-playwright-har"
                            >
                                <PlaqueFieldSeg
                                    label="harContent"
                                    paramId="harContent"
                                    value={harContent}
                                    onValueChange={setHarContent}
                                    stretch
                                    data-testid="caps-playwright-har-content"
                                    aria-label="harContent — meta (default) or bodies (opt-in response text)"
                                    options={HAR_CONTENT_OPTIONS}
                                />
                            </PlaqueFieldGrid>
                        ) : null}
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Browser log"
                            data-testid="capabilities-playwright-log"
                        >
                            <PlaqueFieldSeg
                                label="enableLog"
                                paramId="enableLog"
                                value={enableLog}
                                onValueChange={setEnableLog}
                                stretch
                                data-testid="caps-playwright-enable-log"
                            />
                            {enableLog === "true" ? (
                                <PlaqueField
                                    label="logName"
                                    paramId="logName"
                                    labelVariant="param"
                                    type="text"
                                    value={logName}
                                    placeholder="session.log"
                                    onChange={(e: any) => setLogName(e.target.value)}
                                    data-testid="caps-playwright-log-name"
                                />
                            ) : null}
                            <PlaqueFieldSeg
                                label="headless"
                                paramId="headless"
                                value={headless}
                                onValueChange={setHeadless}
                                stretch
                                data-testid="caps-playwright-headless"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Time zone"
                            data-testid="capabilities-playwright-timezone"
                        >
                            <PlaqueSelect
                                label="timeZone"
                                paramId="timeZone"
                                value={timeZone}
                                options={TIME_ZONE_OPTIONS}
                                onChange={setTimeZone}
                                data-testid="caps-playwright-time-zone"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Container env"
                            data-testid="capabilities-playwright-env"
                        >
                            <PlaqueField
                                label="env"
                                paramId="env"
                                labelVariant="param"
                                type="text"
                                value={env}
                                placeholder="KEY=value,KEY2=value"
                                onChange={(e: any) => setEnv(e.target.value)}
                                data-testid="caps-playwright-env"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Session labels"
                            data-testid="capabilities-playwright-labels"
                        >
                            <PlaqueField
                                label="labels"
                                paramId="labels"
                                labelVariant="param"
                                type="text"
                                value={labels}
                                placeholder="key=value,key2=value"
                                onChange={(e: any) => setLabels(e.target.value)}
                                data-testid="caps-playwright-labels"
                            />
                        </PlaqueFieldGrid>
                    </div>
                </Panel>
            ) : null}
            {isWebdriver || isPlaywright ? (
                <Panel
                    title="Browser proxy"
                    testId="capabilities-browser-panel"
                    titleTestId="capabilities-browser-title"
                    className="capabilities-config-panel"
                >
                    <div
                        className="plaque-field-grid-stack plaque-field-grid-stack--magnet"
                        data-testid="capabilities-browser-caps"
                    >
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Proxy preset"
                            data-testid="capabilities-browser-proxy-preset"
                        >
                            <PlaqueSelect
                                label="proxyPreset"
                                paramId="proxyPreset"
                                value={proxyPreset}
                                options={PROXY_PRESET_OPTIONS}
                                onChange={setProxyPreset}
                                data-testid="caps-proxy-preset"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="duo"
                            aria-label="Proxy endpoint"
                            data-testid="capabilities-browser-proxy"
                        >
                            <PlaqueField
                                label="proxyServer"
                                paramId="proxyServer"
                                labelVariant="param"
                                type="text"
                                value={proxyOff ? "" : proxyServer}
                                placeholder="host"
                                readOnly={proxyOff || proxyPresetLocked}
                                disabled={proxyOff}
                                onChange={(e: any) => setProxyServer(e.target.value)}
                                data-testid="caps-proxy-server"
                            />
                            <PlaqueField
                                label="proxyPort"
                                paramId="proxyPort"
                                labelVariant="param"
                                type="text"
                                value={proxyOff ? "" : proxyPort}
                                placeholder="port"
                                readOnly={proxyOff || proxyPresetLocked}
                                disabled={proxyOff}
                                onChange={(e: any) => setProxyPort(e.target.value)}
                                data-testid="caps-proxy-port"
                            />
                        </PlaqueFieldGrid>
                    </div>
                </Panel>
            ) : null}
            {isAndroid ? (
                <Panel
                    title="Session options"
                    testId="capabilities-android-panel"
                    titleTestId="capabilities-android-title"
                    className="capabilities-config-panel"
                >
                    {/* appium:* caps beyond image defaults + minimal selenoid:options. */}
                    <div
                        className="plaque-field-grid-stack plaque-field-grid-stack--magnet"
                        data-testid="capabilities-android-caps"
                    >
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Remote URL"
                            data-testid="capabilities-android-remote-url"
                        >
                            <PlaqueField
                                label="remoteUrl"
                                paramId="remoteUrl"
                                labelVariant="param"
                                type="text"
                                value={remoteUrl}
                                readOnly
                                data-testid="caps-android-remote-url"
                            />
                        </PlaqueFieldGrid>
                        {renderWdAuthRow()}
                        <PlaqueFieldGrid
                            layout="duo"
                            aria-label="Session identity"
                            data-testid="capabilities-android-session"
                        >
                            <PlaqueSelect
                                label="sessionTimeout"
                                paramId="sessionTimeout"
                                value={sessionTimeout}
                                options={SESSION_TIMEOUT_OPTIONS}
                                onChange={setSessionTimeout}
                                data-testid="caps-android-session-timeout"
                            />
                            <PlaqueField
                                label="name"
                                paramId="name"
                                labelVariant="param"
                                type="text"
                                value={sessionName}
                                onChange={(e: any) => setSessionName(e.target.value)}
                                data-testid="caps-android-session-name"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Android flags"
                            data-testid="capabilities-android-flags"
                        >
                            <PlaqueFieldSeg
                                label="enableVnc"
                                paramId="enableVnc"
                                value={enableVnc}
                                onValueChange={setEnableVnc}
                                stretch
                                data-testid="caps-android-enable-vnc"
                            />
                            <PlaqueFieldSeg
                                label="enableVideo"
                                paramId="enableVideo"
                                value={enableVideo}
                                onValueChange={setEnableVideo}
                                stretch
                                data-testid="caps-android-enable-video"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid layout="solo" aria-label="App" data-testid="capabilities-android-app">
                            <PlaqueField
                                label="app"
                                paramId="app"
                                labelVariant="param"
                                type="text"
                                value={androidApp}
                                placeholder="https://…/app-debug.apk"
                                onChange={(e: any) => setAndroidApp(e.target.value)}
                                data-testid="caps-android-app"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Android reset flags"
                            data-testid="capabilities-android-reset"
                        >
                            <PlaqueFieldSeg
                                label="noReset"
                                paramId="noReset"
                                value={androidNoReset}
                                onValueChange={setAndroidNoReset}
                                stretch
                                data-testid="caps-android-no-reset"
                            />
                            <PlaqueFieldSeg
                                label="autoGrantPermissions"
                                paramId="autoGrantPermissions"
                                value={androidAutoGrantPermissions}
                                onValueChange={setAndroidAutoGrantPermissions}
                                stretch
                                data-testid="caps-android-auto-grant"
                            />
                        </PlaqueFieldGrid>
                        <PlaqueFieldGrid
                            layout="solo"
                            aria-label="Orientation"
                            data-testid="capabilities-android-orientation"
                        >
                            <PlaqueSelect
                                label="orientation"
                                paramId="orientation"
                                value={androidOrientation}
                                options={ORIENTATION_OPTIONS}
                                onChange={setAndroidOrientation}
                                data-testid="caps-android-orientation"
                            />
                        </PlaqueFieldGrid>
                    </div>
                </Panel>
            ) : null}
            {isIos ? (
                <Panel
                    title="Session options"
                    testId="capabilities-ios-panel"
                    titleTestId="capabilities-ios-title"
                    className="capabilities-config-panel capabilities-config-panel--placeholder"
                >
                    {/* Placeholder — no iOS image yet. Mirror Android panel once it lands. */}
                    <div className="capabilities-ios-placeholder" data-testid="capabilities-ios-placeholder">
                        <p className="capabilities-ios-placeholder__title">iOS — coming soon</p>
                        <p className="capabilities-ios-placeholder__hint">
                            Образ iOS ещё не поднят. Конфигурация появится здесь, когда устройство станет доступно.
                        </p>
                    </div>
                </Panel>
            ) : null}
            <CapabilitiesLaunchActions
                loading={loading}
                disabled={!name || loading || isIos}
                error={error}
                onCreateSession={onCreateSession}
                onClearError={() => onError("")}
            />
        </div>
    );
};

export default Capabilities;
