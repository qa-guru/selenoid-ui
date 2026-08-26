import catalog from "./mobile-devices.json";

/** Off = desktop Chrome/Edge. Course catalog, not Android/iOS grid. */
export const MOBILE_EMULATION_OFF = "off";

export type MobileDevice = {
    id: string;
    label: string;
    width: number;
    height: number;
    pixelRatio: number;
    userAgent: string;
};

export type MobileEmulation = {
    deviceMetrics: {
        width: number;
        height: number;
        pixelRatio: number;
    };
    userAgent: string;
};

type ChromiumOptionsKey = "goog:chromeOptions" | "ms:edgeOptions";

const CHROME_FAMILY = new Set(["chrome", "chromium"]);
const EDGE_FAMILY = new Set(["msedge", "edge", "microsoftedge"]);

export const MOBILE_DEVICES: MobileDevice[] = (catalog.devices as MobileDevice[]).map((device) => ({
    id: String(device.id),
    label: String(device.label),
    width: Number(device.width),
    height: Number(device.height),
    pixelRatio: Number(device.pixelRatio),
    userAgent: String(device.userAgent),
}));

const DEVICE_BY_ID = new Map(MOBILE_DEVICES.map((device) => [device.id, device]));

export function mobileDeviceById(id: unknown): MobileDevice | null {
    const key = String(id || "").trim();
    if (!key || key === MOBILE_EMULATION_OFF) {
        return null;
    }
    return DEVICE_BY_ID.get(key) || null;
}

export function mobileDeviceSelectOptions(): { value: string; label: string }[] {
    return [{ value: MOBILE_EMULATION_OFF, label: "off" }].concat(
        MOBILE_DEVICES.map((device) => ({ value: device.id, label: device.label }))
    );
}

export const MOBILE_DEVICE_OPTIONS = mobileDeviceSelectOptions();

export function supportsMobileEmulation(browserName: unknown): boolean {
    return chromiumOptionsKey(browserName) != null;
}

export function chromiumOptionsKey(browserName: unknown): ChromiumOptionsKey | null {
    const name = String(browserName || "").toLowerCase();
    if (CHROME_FAMILY.has(name)) {
        return "goog:chromeOptions";
    }
    if (EDGE_FAMILY.has(name)) {
        return "ms:edgeOptions";
    }
    return null;
}

export function mobileEmulationPayload(device: MobileDevice): MobileEmulation {
    return {
        deviceMetrics: {
            width: device.width,
            height: device.height,
            pixelRatio: device.pixelRatio,
        },
        userAgent: device.userAgent,
    };
}

/** Xvfb + --window-size so VNC is phone-shaped, not 1920×1080 desktop. */
export function mobileScreenResolution(deviceId: unknown): string | null {
    const device = mobileDeviceById(deviceId);
    if (!device) {
        return null;
    }
    return `${device.width}x${device.height}x24`;
}

/** data: page that prints viewport + UA — default `data:,` looks like “nothing happened”. */
export function mobileEmulationProbeUrl(device: MobileDevice): string {
    const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${device.label}</title>
<body style="margin:16px;font:16px/1.4 ui-sans-serif,system-ui,sans-serif;background:#111;color:#eee">
<h1 style="margin:0 0 8px">${device.label}</h1>
<p style="margin:0 0 12px;opacity:.8">Chrome mobileEmulation · deviceMetrics + UA</p>
<pre id="p" style="white-space:pre-wrap;word-break:break-word"></pre>
<script>
document.getElementById("p").textContent = JSON.stringify({
  innerWidth: innerWidth,
  innerHeight: innerHeight,
  devicePixelRatio: devicePixelRatio,
  userAgent: navigator.userAgent
}, null, 2);
</script>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export function buildMobileEmulationOptions(
    browserName: unknown,
    deviceId: unknown
): Record<ChromiumOptionsKey, { mobileEmulation: MobileEmulation }> | null {
    const key = chromiumOptionsKey(browserName);
    const device = mobileDeviceById(deviceId);
    if (!key || !device) {
        return null;
    }
    return {
        [key]: { mobileEmulation: mobileEmulationPayload(device) },
    } as Record<ChromiumOptionsKey, { mobileEmulation: MobileEmulation }>;
}

/** Merge --window-size args with mobileEmulation on the same goog:/ms: options object. */
export function mergeChromiumOptions(
    windowOpts: Record<string, { args?: string[] }> | null | undefined,
    mobileOpts: Record<string, { mobileEmulation?: MobileEmulation }> | null | undefined
): Record<string, { args?: string[]; mobileEmulation?: MobileEmulation }> | null {
    if (!windowOpts && !mobileOpts) {
        return null;
    }
    if (!mobileOpts) {
        return windowOpts ? { ...windowOpts } : null;
    }
    if (!windowOpts) {
        return { ...mobileOpts };
    }
    const key = Object.keys(mobileOpts)[0] || Object.keys(windowOpts)[0];
    if (!key) {
        return null;
    }
    const win = (windowOpts as any)[key] || {};
    const mob = (mobileOpts as any)[key] || {};
    const merged: { args?: string[]; mobileEmulation?: MobileEmulation } = { ...win, ...mob };
    if (win.args || mob.args) {
        merged.args = [...(win.args || []), ...(mob.args || [])];
    }
    return { [key]: merged };
}

export type MobileEmulationSnippets = {
    java: string;
    python: string;
    javascript: string;
    typescript: string;
    curl: string;
};

const EMPTY_SNIPPETS: MobileEmulationSnippets = {
    java: "",
    python: "",
    javascript: "",
    typescript: "",
    curl: "",
};

function indentJson(value: unknown, spaces: number): string {
    const pad = " ".repeat(spaces);
    return JSON.stringify(value, null, 4)
        .split("\n")
        .map((line, i) => (i === 0 ? line : pad + line))
        .join("\n");
}

export function mobileEmulationSnippetBlocks(browserName: unknown, deviceId: unknown): MobileEmulationSnippets {
    const key = chromiumOptionsKey(browserName);
    const device = mobileDeviceById(deviceId);
    if (!key || !device) {
        return EMPTY_SNIPPETS;
    }
    const payload = mobileEmulationPayload(device);
    const uaJson = JSON.stringify(device.userAgent);
    const java = `Map<String, Object> mobileEmulation = new HashMap<String, Object>() {{
    put("deviceMetrics", new HashMap<String, Object>() {{
        put("width", ${device.width});
        put("height", ${device.height});
        put("pixelRatio", ${device.pixelRatio});
    }});
    put("userAgent", ${uaJson});
}};
options.setExperimentalOption("mobileEmulation", mobileEmulation);
`;
    const optionsJson = indentJson({ mobileEmulation: payload }, 4);
    const python = `
    ${JSON.stringify(key)}: ${optionsJson},`;
    const jsInner = indentJson({ mobileEmulation: payload }, 8);
    const javascript = `
        ${JSON.stringify(key)}: ${jsInner},`;
    const curlInner = indentJson({ mobileEmulation: payload }, 12);
    const curl = `${JSON.stringify(key)}: ${curlInner},
            `;
    return {
        java,
        python,
        javascript,
        typescript: javascript,
        curl,
    };
}

export type PlaywrightMobileEngine = "chromium" | "firefox" | "webkit";

/** playwright-chrome / playwright-chromium / playwright-msedge → chromium. */
export function playwrightMobileEngine(browserName: unknown): PlaywrightMobileEngine {
    const name = String(browserName || "").toLowerCase();
    if (name.includes("firefox")) {
        return "firefox";
    }
    if (name.includes("webkit")) {
        return "webkit";
    }
    return "chromium";
}

export function supportsPlaywrightMobileEmulation(browserName: unknown): boolean {
    return String(browserName || "")
        .toLowerCase()
        .startsWith("playwright-");
}

function deviceLooksMobile(device: MobileDevice): boolean {
    return /Mobile|iPhone|iPad|Android/i.test(device.userAgent);
}

export type PlaywrightMobileContext = {
    viewport: { width: number; height: number };
    userAgent: string;
    deviceScaleFactor: number;
    hasTouch: boolean;
    isMobile?: boolean;
};

/** Client newContext payload. Hub query stays screenResolution only — no image rebuild. */
export function playwrightMobileContextOptions(
    browserName: unknown,
    deviceId: unknown
): PlaywrightMobileContext | null {
    const device = mobileDeviceById(deviceId);
    if (!device) {
        return null;
    }
    const ctx: PlaywrightMobileContext = {
        viewport: { width: device.width, height: device.height },
        userAgent: device.userAgent,
        deviceScaleFactor: device.pixelRatio,
        hasTouch: true,
    };
    // Playwright Firefox throws if isMobile is set.
    if (playwrightMobileEngine(browserName) !== "firefox" && deviceLooksMobile(device)) {
        ctx.isMobile = true;
    }
    return ctx;
}

export type PlaywrightPageBlocks = {
    java: string;
    kotlin: string;
    go: string;
    csharp: string;
    python: string;
    javascript: string;
    typescript: string;
    php: string;
    ruby: string;
};

const PLAYWRIGHT_DESKTOP_PAGE_BLOCKS: PlaywrightPageBlocks = {
    java: `Page page = browser.newPage();
`,
    kotlin: `val page = browser.newPage()
`,
    go: `page, err := browser.NewPage()
`,
    csharp: `var page = await browser.NewPageAsync();
`,
    python: `    page = browser.new_page()
`,
    javascript: `const page = await browser.newPage();
`,
    typescript: `const page = await browser.newPage();
`,
    php: `$page = $browser->newPage();
`,
    ruby: `  page = browser.new_page
`,
};

function javaContextOptions(ctx: PlaywrightMobileContext): string {
    const uaJson = JSON.stringify(ctx.userAgent);
    const mobile = ctx.isMobile ? "\n    .setIsMobile(true)" : "";
    return `new Browser.NewContextOptions()
    .setViewportSize(${ctx.viewport.width}, ${ctx.viewport.height})
    .setUserAgent(${uaJson})
    .setDeviceScaleFactor(${ctx.deviceScaleFactor})${mobile}
    .setHasTouch(true)`;
}

function pythonContextArgs(ctx: PlaywrightMobileContext): string {
    const uaJson = JSON.stringify(ctx.userAgent);
    const mobile = ctx.isMobile ? ",\n        is_mobile=True" : "";
    return `viewport={"width": ${ctx.viewport.width}, "height": ${ctx.viewport.height}},
        user_agent=${uaJson},
        device_scale_factor=${ctx.deviceScaleFactor},
        has_touch=True${mobile}`;
}

function jsContextObject(ctx: PlaywrightMobileContext): string {
    const payload: Record<string, unknown> = {
        viewport: ctx.viewport,
        userAgent: ctx.userAgent,
        deviceScaleFactor: ctx.deviceScaleFactor,
        hasTouch: ctx.hasTouch,
    };
    if (ctx.isMobile) {
        payload.isMobile = true;
    }
    return indentJson(payload, 0);
}

function csharpContextOptions(ctx: PlaywrightMobileContext): string {
    const uaJson = JSON.stringify(ctx.userAgent);
    const mobile = ctx.isMobile ? "\n    IsMobile = true," : "";
    return `new BrowserNewContextOptions {
    ViewportSize = new ViewportSize { Width = ${ctx.viewport.width}, Height = ${ctx.viewport.height} },
    UserAgent = ${uaJson},
    DeviceScaleFactor = ${ctx.deviceScaleFactor},${mobile}
    HasTouch = true
}`;
}

function goContextOptions(ctx: PlaywrightMobileContext): string {
    const uaJson = JSON.stringify(ctx.userAgent);
    const mobile = ctx.isMobile ? "\n\t\tIsMobile:          playwright.Bool(true)," : "";
    return `playwright.BrowserNewContextOptions{
		Viewport:          &playwright.Size{Width: ${ctx.viewport.width}, Height: ${ctx.viewport.height}},
		UserAgent:         playwright.String(${uaJson}),
		DeviceScaleFactor: playwright.Float(${ctx.deviceScaleFactor}),
		HasTouch:          playwright.Bool(true),${mobile}
	}`;
}

function phpContextArray(ctx: PlaywrightMobileContext): string {
    const payload: Record<string, unknown> = {
        viewport: ctx.viewport,
        userAgent: ctx.userAgent,
        deviceScaleFactor: ctx.deviceScaleFactor,
        hasTouch: true,
    };
    if (ctx.isMobile) {
        payload.isMobile = true;
    }
    return indentJson(payload, 0);
}

function rubyContextArgs(ctx: PlaywrightMobileContext): string {
    const uaJson = JSON.stringify(ctx.userAgent);
    const mobile = ctx.isMobile ? ",\n    is_mobile: true" : "";
    return `viewport: { width: ${ctx.viewport.width}, height: ${ctx.viewport.height} },
    user_agent: ${uaJson},
    device_scale_factor: ${ctx.deviceScaleFactor},
    has_touch: true${mobile}`;
}

export function playwrightPageBlocks(browserName: unknown, deviceId: unknown): PlaywrightPageBlocks {
    const ctx = playwrightMobileContextOptions(browserName, deviceId);
    if (!ctx) {
        return PLAYWRIGHT_DESKTOP_PAGE_BLOCKS;
    }
    const jsObject = jsContextObject(ctx);
    return {
        java: `BrowserContext context = browser.newContext(${javaContextOptions(ctx)});
Page page = context.newPage();
`,
        kotlin: `val context = browser.newContext(${javaContextOptions(ctx)})
val page = context.newPage()
`,
        go: `context, err := browser.NewContext(${goContextOptions(ctx)})
if err != nil {
	log.Fatalf("context: %v", err)
}
page, err := context.NewPage()
`,
        csharp: `var context = await browser.NewContextAsync(${csharpContextOptions(ctx)});
var page = await context.NewPageAsync();
`,
        python: `    context = browser.new_context(
        ${pythonContextArgs(ctx)},
    )
    page = context.new_page()
`,
        javascript: `const context = await browser.newContext(${jsObject});
const page = await context.newPage();
`,
        typescript: `const context = await browser.newContext(${jsObject});
const page = await context.newPage();
`,
        php: `$context = $browser->newContext(${phpContextArray(ctx)});
$page = $context->newPage();
`,
        ruby: `  context = browser.new_context(
    ${rubyContextArgs(ctx)}
  )
  page = context.new_page
`,
    };
}
