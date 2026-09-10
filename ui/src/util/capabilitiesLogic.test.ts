import { describe, expect, it, vi } from "vitest";
import {
    asBool,
    browserProtocol,
    browserWindowOptions,
    buildAndroidCapabilities,
    buildAndroidSelenoidOptions,
    buildSelenoidOptions,
    CREATE_SESSION_TIMEOUT_MS,
    createSessionCatchMessage,
    DEFAULT_ANDROID_ORIENTATION,
    findPlaywrightSession,
    hubSessionErrorMessage,
    HUB_SESSION_UNAUTHORIZED_MESSAGE,
    isPlaywrightBrowser,
    parseEnvList,
    parseLabelsMap,
    parseScreenSize,
    pickDefaultWebdriverBrowser,
    isMinBrowserVersion,
    minImageCapabilityError,
    resizeSessionWindow,
    openSessionUrl,
    scheduleCreateSessionAbort,
    sessionIdFrom,
} from "./capabilitiesLogic";

describe("capabilitiesLogic", () => {
    it("handles old selenium protocol versions", () => {
        expect(
            sessionIdFrom({
                response: {
                    sessionId: "session-1",
                },
            })
        ).toBe("session-1");
    });

    it("handles new selenium protocol versions", () => {
        expect(
            sessionIdFrom({
                response: {
                    value: {
                        sessionId: "session-2",
                    },
                },
            })
        ).toBe("session-2");
    });

    it("handles wrong response as empty", () => {
        expect(
            sessionIdFrom({
                response: {},
            })
        ).toBe("");
    });

    it("parses screenResolution WxH and WxHxD", () => {
        expect(parseScreenSize("1920x1080x24")).toEqual({ width: 1920, height: 1080 });
        expect(parseScreenSize("1280x1024")).toEqual({ width: 1280, height: 1024 });
        expect(parseScreenSize("bad")).toBeNull();
        expect(parseScreenSize("")).toBeNull();
    });

    it("builds chromium/edge window launch options from screenResolution", () => {
        expect(browserWindowOptions("chrome", "1920x1080x24")).toEqual({
            "goog:chromeOptions": {
                args: [
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--window-size=1920,1080",
                    "--window-position=0,0",
                ],
            },
        });
        expect(browserWindowOptions("msedge", "1280x1024x24")).toEqual({
            "ms:edgeOptions": {
                args: [
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--window-size=1280,1024",
                    "--window-position=0,0",
                ],
            },
        });
        expect(browserWindowOptions("firefox", "1920x1080x24")).toEqual({
            "moz:firefoxOptions": { args: ["--width=1920", "--height=1080"] },
        });
    });

    it("sets window/rect from screenResolution", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
        expect(fetchImpl).toHaveBeenNthCalledWith(1, "/wd/hub/session/sess-1/window/maximize", {
            method: "POST",
            credentials: "omit",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
            signal: undefined,
        });
        expect(fetchImpl).toHaveBeenNthCalledWith(2, "/wd/hub/session/sess-1/window/rect", {
            method: "POST",
            credentials: "omit",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: 0, y: 0, width: 1920, height: 1080 }),
            signal: undefined,
        });
    });

    it("sends Basic Auth on window/rect when authToken is provided", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl, "user1:1234")).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledWith(
            "/wd/hub/session/sess-1/window/rect",
            expect.objectContaining({
                credentials: "omit",
                headers: expect.objectContaining({
                    Authorization: `Basic ${btoa("user1:1234")}`,
                }),
            })
        );
    });

    it("opens a URL in the live session", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        await expect(openSessionUrl("sess-1", "data:text/html,hi", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenCalledWith("/wd/hub/session/sess-1/url", {
            method: "POST",
            credentials: "omit",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "data:text/html,hi" }),
            signal: undefined,
        });
    });

    it("falls back to window/current/size when rect fails with unsupported status", async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValueOnce({ ok: true, status: 200 })
            .mockResolvedValueOnce({ ok: false, status: 405 })
            .mockResolvedValueOnce({ ok: true, status: 200 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(true);
        expect(fetchImpl).toHaveBeenNthCalledWith(
            3,
            "/wd/hub/session/sess-1/window/current/size",
            expect.objectContaining({
                body: JSON.stringify({ width: 1920, height: 1080 }),
            })
        );
    });

    it("does not fall back when rect returns invalid session", async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 });
        await expect(resizeSessionWindow("sess-1", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    it("skips resize when sessionId or resolution is missing", async () => {
        const fetchImpl = vi.fn();
        await expect(resizeSessionWindow("", "1920x1080x24", fetchImpl)).resolves.toBe(false);
        await expect(resizeSessionWindow("sess-1", "bad", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("formats hub session error message from W3C value", async () => {
        const response = new Response(
            JSON.stringify({
                value: {
                    error: "session not created",
                    message: "Chrome instance exited",
                },
            }),
            { status: 500 }
        );
        await expect(hubSessionErrorMessage(response)).resolves.toBe(
            "Create Session failed: HTTP 500 — Chrome instance exited"
        );
    });

    it("maps 401 to a login/password rejection, never HTTP 401 or a hub-down plaque", async () => {
        const bodies = [
            new Response("", { status: 401 }),
            new Response("<html><h1>401 Authorization Required</h1></html>", { status: 401 }),
            new Response(JSON.stringify({ error: "Unauthorized", message: "token=secret-value" }), { status: 401 }),
        ];
        for (const response of bodies) {
            const message = await hubSessionErrorMessage(response);
            expect(message).toBe(HUB_SESSION_UNAUTHORIZED_MESSAGE);
            expect(message).not.toMatch(/HTTP 401/);
            expect(message).not.toMatch(/hub (crashed|down|fell)|хаб упал/i);
            expect(message).not.toMatch(/secret-value|Authorization Required/i);
        }
    });

    it("formats hub invalid-argument body from a -min image", async () => {
        const response = new Response(
            JSON.stringify({
                value: {
                    error: "invalid argument",
                    message:
                        "152.0-min is a headless CI image and does not support enableVideo — use the full image, or turn those options off",
                },
            }),
            { status: 400 }
        );
        await expect(hubSessionErrorMessage(response)).resolves.toBe(
            "Create Session failed: HTTP 400 — 152.0-min is a headless CI image and does not support enableVideo — use the full image, or turn those options off"
        );
    });

    it("maps AbortError / TimeoutError to a 5m Create Session timeout, never aborted-without-reason", () => {
        const nameless = new DOMException("signal is aborted without reason", "AbortError");
        const timedOut = new DOMException("Create Session timed out after 5m waiting for POST /wd/hub/session", "TimeoutError");
        for (const err of [nameless, timedOut]) {
            const message = createSessionCatchMessage(err, { timeoutMs: CREATE_SESSION_TIMEOUT_MS });
            expect(message).toContain("timed out after 5m waiting for POST /wd/hub/session");
            expect(message).toMatch(/container logs|-session-attempt-timeout/);
            expect(message).not.toMatch(/aborted without reason/i);
            expect(message).not.toMatch(/AbortError/);
        }
    });

    it("maps network TypeError to Create Session failed, not AbortError", () => {
        expect(createSessionCatchMessage(new TypeError("Failed to fetch"))).toBe(
            "Create Session failed: Failed to fetch"
        );
    });

    it("aborts Create Session with TimeoutError reason after the wait", () => {
        vi.useFakeTimers();
        try {
            const controller = new AbortController();
            scheduleCreateSessionAbort(controller, CREATE_SESSION_TIMEOUT_MS);
            expect(controller.signal.aborted).toBe(false);
            vi.advanceTimersByTime(CREATE_SESSION_TIMEOUT_MS);
            expect(controller.signal.aborted).toBe(true);
            expect((controller.signal.reason as { name?: string }).name).toBe("TimeoutError");
        } finally {
            vi.useRealTimers();
        }
    });

    it("pickDefaultWebdriverBrowser prefers newest chrome over older", () => {
        const picked = pickDefaultWebdriverBrowser([
            { value: "chrome_148.0", name: "chrome", version: "148.0", protocol: "webdriver" },
            { value: "chrome_149.0", name: "chrome", version: "149.0", protocol: "webdriver" },
            { value: "playwright-chromium_1.61.1", name: "playwright-chromium", version: "1.61.1", protocol: "playwright" },
        ]);
        expect(picked?.value).toBe("chrome_149.0");
    });

    it("pickDefaultWebdriverBrowser prefers newest chrome without -min", () => {
        const picked = pickDefaultWebdriverBrowser([
            { value: "chrome_151.0", name: "chrome", version: "151.0", protocol: "webdriver" },
            { value: "chrome_152.0-min", name: "chrome", version: "152.0-min", protocol: "webdriver" },
            { value: "chrome_152.0", name: "chrome", version: "152.0", protocol: "webdriver" },
        ]);
        expect(picked?.value).toBe("chrome_152.0");
    });

    it("pickDefaultWebdriverBrowser falls back to -min when no full chrome exists", () => {
        const picked = pickDefaultWebdriverBrowser([
            { value: "chrome_152.0-min", name: "chrome", version: "152.0-min", protocol: "webdriver" },
            { value: "firefox_151.0", name: "firefox", version: "151.0", protocol: "webdriver" },
        ]);
        expect(picked?.value).toBe("chrome_152.0-min");
    });

    it("pickDefaultWebdriverBrowser returns the first webdriver row when chrome is absent", () => {
        const picked = pickDefaultWebdriverBrowser([
            { value: "firefox_151.0", name: "firefox", version: "151.0", protocol: "webdriver" },
        ]);
        expect(picked?.value).toBe("firefox_151.0");
    });

    it("pickDefaultWebdriverBrowser returns undefined when only playwright/android/ios are listed", () => {
        expect(pickDefaultWebdriverBrowser([])).toBeUndefined();
        expect(
            pickDefaultWebdriverBrowser([
                { value: "playwright-chromium_1.61.0", name: "playwright-chromium", version: "1.61.0", protocol: "playwright" },
                { value: "android_16.0", name: "android", version: "16.0", protocol: "webdriver" },
                { value: "ios_18.0", name: "ios", version: "18.0", protocol: "ios" },
            ])
        ).toBeUndefined();
    });

    it("isMinBrowserVersion detects catalog -min tags", () => {
        expect(isMinBrowserVersion("152.0-min")).toBe(true);
        expect(isMinBrowserVersion("152.0")).toBe(false);
        expect(isMinBrowserVersion("")).toBe(false);
    });

    it("minImageCapabilityError rejects desktop extras on -min images", () => {
        expect(minImageCapabilityError("152.0", { enableVnc: true, enableVideo: true })).toBeNull();
        expect(minImageCapabilityError("152.0-min", {})).toBeNull();
        expect(minImageCapabilityError("152.0-min", { enableVnc: true, enableVideo: true })).toBe(
            "152.0-min is a headless CI image and does not support enableVNC, enableVideo — use the full image, or turn those options off"
        );
        expect(minImageCapabilityError("1.62.1-min", { enableHar: true })).toContain("enableHAR");
    });

    it("asBool treats the string false as false", () => {
        expect(asBool("false")).toBe(false);
        expect(asBool(false)).toBe(false);
        expect(asBool("true")).toBe(true);
        expect(asBool(true)).toBe(true);
    });

    it("parseEnvList / parseLabelsMap split CSV and flag-only tokens", () => {
        expect(parseEnvList("LANG=C, FOO=bar\nBAZ=qux")).toEqual(["LANG=C", "FOO=bar", "BAZ=qux"]);
        expect(parseEnvList("")).toEqual([]);
        expect(parseLabelsMap("manual=true,team=qa,debug")).toEqual({
            manual: "true",
            team: "qa",
            debug: "true",
        });
        expect(parseLabelsMap("=orphan")).toEqual({});
        expect(parseLabelsMap("")).toEqual({});
    });

    it("buildSelenoidOptions uses asBool so string false does not become true", () => {
        const off = buildSelenoidOptions({
            sessionTimeout: "15m",
            name: "n",
            screenResolution: "1280x1024x24",
            enableVnc: "false",
            enableVideo: "false",
            enableHar: "false",
            enableLog: "false",
            timeZone: "",
            env: "",
            labels: "manual=true",
            videoName: "ignored.mp4",
            logName: "ignored.log",
            harName: "ignored.har",
            harContent: "bodies",
        });
        expect(off.enableVNC).toBe(false);
        expect(off.enableVideo).toBe(false);
        expect(off.enableHAR).toBe(false);
        expect(off.enableLog).toBe(false);
        expect(off.timeZone).toBe("UTC");
        expect(off.videoName).toBeUndefined();
        expect(off.logName).toBeUndefined();
        expect(off.harName).toBeUndefined();
        expect(off.harContent).toBeUndefined();
        expect(off.env).toBeUndefined();
        expect(off.labels).toEqual({ manual: "true" });
    });

    it("buildSelenoidOptions includes names, env list, and harContent=bodies when flags are on", () => {
        const on = buildSelenoidOptions({
            sessionTimeout: "60m",
            name: "Manual session",
            screenResolution: "1920x1080x24",
            enableVnc: true,
            enableVideo: true,
            enableHar: true,
            enableLog: true,
            timeZone: "Europe/Moscow",
            env: ["LANG=C", "FOO=bar"],
            labels: { team: "qa" },
            videoName: " demo.mp4 ",
            logName: "demo.log",
            harName: "demo.har",
            harContent: "bodies",
        });
        expect(on.enableVNC).toBe(true);
        expect(on.enableHAR).toBe(true);
        expect(on.env).toEqual(["LANG=C", "FOO=bar"]);
        expect(on.labels).toEqual({ team: "qa" });
        expect(on.videoName).toBe("demo.mp4");
        expect(on.logName).toBe("demo.log");
        expect(on.harName).toBe("demo.har");
        expect(on.harContent).toBe("bodies");
    });

    it("buildAndroidCapabilities omits appium:app when empty and defaults orientation", () => {
        const opts = buildAndroidSelenoidOptions({
            name: "Manual session",
            sessionTimeout: "2m",
            enableVnc: "true",
            enableVideo: "false",
        });
        expect(opts).toEqual({
            enableVNC: true,
            enableVideo: false,
            name: "Manual session",
            sessionTimeout: "2m",
        });
        const caps = buildAndroidCapabilities({
            version: "16.0",
            app: "  ",
            noReset: "false",
            autoGrantPermissions: "true",
            orientation: "",
            selenoidOptions: opts,
        });
        expect(caps["appium:app"]).toBeUndefined();
        expect(caps["appium:orientation"]).toBe(DEFAULT_ANDROID_ORIENTATION);
        expect(caps["appium:noReset"]).toBe(false);
        expect(caps["appium:autoGrantPermissions"]).toBe(true);

        const withApp = buildAndroidCapabilities({
            version: "16.0",
            app: "https://example.org/app.apk",
            noReset: true,
            autoGrantPermissions: false,
            orientation: "LANDSCAPE",
            selenoidOptions: opts,
        });
        expect(withApp["appium:app"]).toBe("https://example.org/app.apk");
        expect(withApp["appium:orientation"]).toBe("LANDSCAPE");
    });

    it("formats hub session error without JSON / with error-only / with top-level message", async () => {
        await expect(hubSessionErrorMessage(new Response("not-json", { status: 502 }))).resolves.toBe(
            "Create Session failed: HTTP 502"
        );
        await expect(
            hubSessionErrorMessage(new Response(JSON.stringify({ value: { error: "unknown error" } }), { status: 500 }))
        ).resolves.toBe("Create Session failed: HTTP 500 — unknown error");
        await expect(
            hubSessionErrorMessage(new Response(JSON.stringify({ error: "bad gateway" }), { status: 502 }))
        ).resolves.toBe("Create Session failed: HTTP 502 — bad gateway");
        await expect(hubSessionErrorMessage(new Response(JSON.stringify({}), { status: 500 }))).resolves.toBe(
            "Create Session failed: HTTP 500"
        );
    });

    it("createSessionCatchMessage covers abort-like strings and empty errors", () => {
        expect(createSessionCatchMessage("The operation was aborted")).toContain("timed out after 5m");
        expect(createSessionCatchMessage("signal is aborted without reason")).toContain("timed out after 5m");
        expect(createSessionCatchMessage("")).toContain("timed out after 5m");
        expect(createSessionCatchMessage(null)).toContain("timed out after 5m");
        expect(createSessionCatchMessage(42)).toBe("Create Session failed: 42");
    });

    it("browserWindowOptions covers chromium-family aliases and firefox without size", () => {
        expect(browserWindowOptions("opera", "800x600x24")).toEqual({
            "goog:chromeOptions": {
                args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=800,600", "--window-position=0,0"],
            },
        });
        expect(browserWindowOptions("chromium", "800x600")).toHaveProperty("goog:chromeOptions");
        expect(browserWindowOptions("edge", "800x600")).toHaveProperty("ms:edgeOptions");
        expect(browserWindowOptions("microsoftedge", "800x600")).toHaveProperty("ms:edgeOptions");
        expect(browserWindowOptions("firefox", "bad")).toBeNull();
        expect(browserWindowOptions("safari", "1920x1080x24")).toBeNull();
        expect(browserWindowOptions("chrome", "")).toEqual({
            "goog:chromeOptions": { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
        });
        expect(browserWindowOptions("chrome", "0x0")).toEqual({
            "goog:chromeOptions": { args: ["--no-sandbox", "--disable-dev-shm-usage"] },
        });
        expect(parseScreenSize("0x0")).toBeNull();
    });

    it("openSessionUrl skips empty targets", async () => {
        const fetchImpl = vi.fn();
        await expect(openSessionUrl("sess-1", "  ", fetchImpl)).resolves.toBe(false);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("isPlaywrightBrowser / browserProtocol read the catalog and well-known names", () => {
        expect(isPlaywrightBrowser(undefined, undefined)).toBe(false);
        expect(isPlaywrightBrowser(undefined, "playwright-chromium")).toBe(true);
        expect(
            isPlaywrightBrowser({ chrome: { "149.0": { protocol: "playwright" } } }, "chrome", "149.0")
        ).toBe(true);
        expect(browserProtocol({ chrome: { "149.0": { protocol: "webdriver" } } }, "chrome", "149.0")).toBe(
            "webdriver"
        );
        expect(browserProtocol(undefined, "playwright-webkit")).toBe("playwright");
        expect(browserProtocol({ firefox: { "151.0": { protocol: "playwright" } } }, "firefox", "151.0")).toBe(
            "playwright"
        );
    });

    it("findPlaywrightSession matches a new id by browser/version/name", () => {
        const sessions = {
            old: { caps: { browserName: "playwright-chrome", version: "1.61.0", name: "Manual session" } },
            next: { caps: { browserName: "playwright-chrome", version: "1.61.0", name: "Manual session" } },
            other: { caps: { browserName: "chrome", version: "149.0" } },
            mismatchVer: { caps: { browserName: "playwright-chrome", version: "1.60.0", name: "Manual session" } },
            mismatchName: { caps: { browserName: "playwright-chrome", version: "1.61.0", name: "other" } },
        };
        expect(findPlaywrightSession(sessions, new Set(["old"]), "playwright-chrome", "1.61.0", "Manual session")).toBe(
            "next"
        );
        expect(findPlaywrightSession(sessions, new Set(), "playwright-chrome", "1.61.0", "nope")).toBe("");
        expect(findPlaywrightSession(undefined, new Set(), "playwright-chrome", "1.61.0")).toBe("");
    });
});
