import { describe, expect, it } from "vitest";
import {
    MOBILE_DEVICES,
    MOBILE_DEVICE_OPTIONS,
    MOBILE_EMULATION_OFF,
    buildMobileEmulationOptions,
    chromiumOptionsKey,
    mergeChromiumOptions,
    mobileDeviceById,
    mobileEmulationPayload,
    mobileEmulationProbeUrl,
    mobileEmulationSnippetBlocks,
    mobileScreenResolution,
    playwrightMobileContextOptions,
    playwrightMobileEngine,
    playwrightPageBlocks,
    supportsMobileEmulation,
    supportsPlaywrightMobileEmulation,
} from "./capabilitiesMobileEmulation";
import { browserWindowOptions } from "./capabilitiesLogic";

describe("mobile devices catalog", () => {
    it("has 8–15 devices with deviceMetrics + userAgent", () => {
        expect(MOBILE_DEVICES.length).toBeGreaterThanOrEqual(8);
        expect(MOBILE_DEVICES.length).toBeLessThanOrEqual(15);
        const ids = MOBILE_DEVICES.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const device of MOBILE_DEVICES) {
            expect(device.id).toBeTruthy();
            expect(device.label).toBeTruthy();
            expect(device.width).toBeGreaterThan(0);
            expect(device.height).toBeGreaterThan(0);
            expect(device.pixelRatio).toBeGreaterThan(0);
            expect(device.userAgent).toMatch(/Mozilla\/5\.0/);
        }
    });

    it("starts the select with off, not a phone", () => {
        expect(MOBILE_EMULATION_OFF).toBe("off");
        expect(MOBILE_DEVICE_OPTIONS[0]).toEqual({ value: "off", label: "off" });
        expect(MOBILE_DEVICE_OPTIONS).toHaveLength(MOBILE_DEVICES.length + 1);
        expect(mobileDeviceById("off")).toBeNull();
        expect(mobileDeviceById("")).toBeNull();
        expect(mobileDeviceById("no-such-phone")).toBeNull();
    });

    it("builds a probe URL with viewport + UA for the course VNC", () => {
        const iphone = mobileDeviceById("iphone-12-pro")!;
        expect(mobileScreenResolution("off")).toBeNull();
        expect(mobileScreenResolution("iphone-12-pro")).toBe("390x844x24");
        const url = mobileEmulationProbeUrl(iphone);
        expect(url.startsWith("data:text/html")).toBe(true);
        expect(decodeURIComponent(url)).toContain("innerWidth");
        expect(decodeURIComponent(url)).toContain("userAgent");
        expect(decodeURIComponent(url)).toContain("iPhone 12 Pro");
    });
});

describe("Chrome/Edge mobileEmulation options", () => {
    it("supports chrome and msedge only (course, not grid)", () => {
        expect(supportsMobileEmulation("chrome")).toBe(true);
        expect(supportsMobileEmulation("msedge")).toBe(true);
        expect(supportsMobileEmulation("chromium")).toBe(true);
        expect(chromiumOptionsKey("chrome")).toBe("goog:chromeOptions");
        expect(chromiumOptionsKey("msedge")).toBe("ms:edgeOptions");
        expect(supportsMobileEmulation("firefox")).toBe(false);
        expect(supportsMobileEmulation("android")).toBe(false);
        expect(supportsMobileEmulation("playwright-chromium")).toBe(false);
        expect(buildMobileEmulationOptions("chrome", "off")).toBeNull();
        expect(buildMobileEmulationOptions("firefox", "iphone-12-pro")).toBeNull();
    });

    it("builds deviceMetrics + userAgent for chrome and msedge", () => {
        const iphone = mobileDeviceById("iphone-12-pro");
        expect(iphone).toBeTruthy();
        const chrome = buildMobileEmulationOptions("chrome", "iphone-12-pro");
        expect(chrome).toEqual({
            "goog:chromeOptions": { mobileEmulation: mobileEmulationPayload(iphone!) },
        });
        expect(chrome!["goog:chromeOptions"].mobileEmulation.deviceMetrics).toEqual({
            width: 390,
            height: 844,
            pixelRatio: 3,
        });
        expect(chrome!["goog:chromeOptions"].mobileEmulation.userAgent).toContain("iPhone");

        const edge = buildMobileEmulationOptions("msedge", "pixel-7");
        expect(edge!["ms:edgeOptions"].mobileEmulation.deviceMetrics.width).toBe(412);
        expect(edge!["ms:edgeOptions"].mobileEmulation.userAgent).toContain("Pixel 7");
    });

    it("merges mobileEmulation onto existing --window-size chromeOptions", () => {
        const windowOpts = browserWindowOptions("chrome", "1920x1080x24");
        const mobileOpts = buildMobileEmulationOptions("chrome", "iphone-se");
        const merged = mergeChromiumOptions(windowOpts, mobileOpts);
        expect(merged!["goog:chromeOptions"].args).toEqual([
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--window-size=1920,1080",
            "--window-position=0,0",
        ]);
        expect(merged!["goog:chromeOptions"].mobileEmulation!.deviceMetrics).toEqual({
            width: 375,
            height: 667,
            pixelRatio: 2,
        });
        expect(merged!["goog:chromeOptions"].mobileEmulation!.userAgent).toContain("iPhone");
        expect(mergeChromiumOptions(windowOpts, null)).toEqual(windowOpts);
        expect(mergeChromiumOptions(null, null)).toBeNull();
    });
});

describe("Java / Python / JS snippets", () => {
    it("emits deviceMetrics + userAgent for chrome; empty when off", () => {
        const off = mobileEmulationSnippetBlocks("chrome", "off");
        expect(off.java).toBe("");
        expect(off.python).toBe("");
        expect(off.javascript).toBe("");

        const on = mobileEmulationSnippetBlocks("chrome", "iphone-12-pro");
        expect(on.java).toContain('setExperimentalOption("mobileEmulation"');
        expect(on.java).toContain('put("width", 390)');
        expect(on.java).toContain('put("height", 844)');
        expect(on.java).toContain('put("pixelRatio", 3)');
        expect(on.java).toContain("userAgent");
        expect(on.java).toContain("iPhone");

        expect(on.python).toContain('"goog:chromeOptions"');
        expect(on.python).toContain('"deviceMetrics"');
        expect(on.python).toContain('"width": 390');
        expect(on.python).toContain('"userAgent"');

        expect(on.javascript).toContain('"goog:chromeOptions"');
        expect(on.javascript).toContain('"deviceMetrics"');
        expect(on.javascript).toContain('"userAgent"');

        const edge = mobileEmulationSnippetBlocks("msedge", "pixel-7");
        expect(edge.java).toContain("setExperimentalOption");
        expect(edge.python).toContain('"ms:edgeOptions"');
        expect(edge.javascript).toContain('"ms:edgeOptions"');
        expect(mobileEmulationSnippetBlocks("firefox", "iphone-12-pro").java).toBe("");
    });
});

describe("Playwright newContext mobile catalog", () => {
    it("is a client context, not goog:chromeOptions", () => {
        expect(supportsPlaywrightMobileEmulation("playwright-chrome")).toBe(true);
        expect(supportsPlaywrightMobileEmulation("playwright-chromium")).toBe(true);
        expect(supportsPlaywrightMobileEmulation("playwright-firefox")).toBe(true);
        expect(supportsPlaywrightMobileEmulation("chrome")).toBe(false);
        expect(playwrightMobileEngine("playwright-firefox")).toBe("firefox");
        expect(playwrightMobileEngine("playwright-webkit")).toBe("webkit");
        expect(playwrightMobileEngine("playwright-chrome")).toBe("chromium");
        expect(playwrightMobileContextOptions("playwright-chrome", "off")).toBeNull();
    });

    it("builds viewport + UA + DPR; omits isMobile on Firefox and desktop UA", () => {
        const iphone = playwrightMobileContextOptions("playwright-chrome", "iphone-12-pro");
        expect(iphone).toEqual({
            viewport: { width: 390, height: 844 },
            userAgent: mobileDeviceById("iphone-12-pro")!.userAgent,
            deviceScaleFactor: 3,
            hasTouch: true,
            isMobile: true,
        });

        const firefox = playwrightMobileContextOptions("playwright-firefox", "iphone-12-pro");
        expect(firefox!.viewport).toEqual({ width: 390, height: 844 });
        expect(firefox!.isMobile).toBeUndefined();
        expect(firefox!.hasTouch).toBe(true);

        const surface = playwrightMobileContextOptions("playwright-chrome", "surface-pro-7");
        expect(surface!.isMobile).toBeUndefined();
        expect(surface!.viewport.width).toBe(912);
    });

    it("emits newContext in JS/Python/Java and newPage when off", () => {
        const off = playwrightPageBlocks("playwright-chrome", "off");
        expect(off.javascript).toBe("const page = await browser.newPage();\n");
        expect(off.python).toContain("browser.new_page()");
        expect(off.java).toBe("Page page = browser.newPage();\n");

        const on = playwrightPageBlocks("playwright-chrome", "iphone-12-pro");
        expect(on.javascript).toContain("browser.newContext");
        expect(on.javascript).toContain('"width": 390');
        expect(on.javascript).toContain("isMobile");
        expect(on.javascript).toContain(mobileDeviceById("iphone-12-pro")!.userAgent);
        expect(on.python).toContain("browser.new_context");
        expect(on.python).toContain("user_agent=");
        expect(on.python).toContain("is_mobile=True");
        expect(on.java).toContain("browser.newContext");
        expect(on.java).toContain("setViewportSize(390, 844)");
        expect(on.java).toContain("setIsMobile(true)");

        const fx = playwrightPageBlocks("playwright-firefox", "iphone-12-pro");
        expect(fx.javascript).toContain("newContext");
        expect(fx.javascript).not.toContain("isMobile");
        expect(fx.python).not.toContain("is_mobile");
        expect(fx.java).not.toContain("setIsMobile");
    });
});
