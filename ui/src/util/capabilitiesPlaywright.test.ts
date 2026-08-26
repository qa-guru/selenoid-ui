import { describe, expect, it } from "vitest";
import { playwrightSelenoidOptions, playwrightEndpoint, playwrightSnippet } from "./capabilitiesPlaywright";

describe("capabilitiesPlaywright", () => {
    it("omits accessKey from options when empty", () => {
        expect(playwrightSelenoidOptions("")).not.toHaveProperty("accessKey");
        expect(playwrightSelenoidOptions()).not.toHaveProperty("accessKey");
    });

    it("includes accessKey in options and snippet query when provided", () => {
        const key = "test_user:test_pass";
        const options = playwrightSelenoidOptions(key);
        expect(options.accessKey).toBe(key);

        const { query, full } = playwrightSnippet("playwright-chrome", "1.61.0", key);
        expect(query).toContain(`accessKey=${encodeURIComponent(key)}`);
        expect(full).toContain("/playwright/playwright-chrome/1.61.0?");
        expect(full).toContain(`accessKey=${encodeURIComponent(key)}`);
    });

    it("builds Create Session WebSocket URL with accessKey (not a free variable)", () => {
        const key = "guest:public-key";
        const url = playwrightEndpoint("playwright-chrome", "1.61.0", key);
        const parsed = new URL(url);

        expect(parsed.pathname).toBe("/playwright/playwright-chrome/1.61.0");
        expect(parsed.searchParams.get("accessKey")).toBe(key);
        expect(parsed.searchParams.get("name")).toBe("Manual session");
        expect(parsed.searchParams.get("enableVNC")).toBe("true");
    });

    it("builds Create Session WebSocket URL without accessKey when omitted", () => {
        const url = playwrightEndpoint("playwright-chromium", "1.61.1");
        const parsed = new URL(url);

        expect(parsed.searchParams.get("accessKey")).toBeNull();
        expect(parsed.searchParams.get("labels.manual")).toBe("true");
        expect(parsed.searchParams.get("headless")).toBe("false");
    });

    it("mirrors panel session options into the WebSocket query", () => {
        const url = playwrightEndpoint("playwright-chrome", "1.61.0", "", {
            name: "PW manual",
            sessionTimeout: "15m",
            screenResolution: "1280x1024x24",
            enableVnc: false,
            enableVideo: true,
            enableHar: true,
            enableLog: true,
            timeZone: "Europe/Moscow",
            env: "FOO=bar,BAZ=qux",
            labels: "manual=true,team=qa",
            videoName: "pw.mp4",
            logName: "pw.log",
            headless: true,
        });
        const parsed = new URL(url);

        expect(parsed.searchParams.get("name")).toBe("PW manual");
        expect(parsed.searchParams.get("sessionTimeout")).toBe("15m");
        expect(parsed.searchParams.get("screenResolution")).toBe("1280x1024x24");
        expect(parsed.searchParams.get("enableVNC")).toBe("false");
        expect(parsed.searchParams.get("enableVideo")).toBe("true");
        expect(parsed.searchParams.get("enableHAR")).toBe("true");
        expect(parsed.searchParams.get("enableLog")).toBe("true");
        expect(parsed.searchParams.get("timeZone")).toBe("Europe/Moscow");
        expect(parsed.searchParams.get("env.FOO")).toBe("bar");
        expect(parsed.searchParams.get("env.BAZ")).toBe("qux");
        expect(parsed.searchParams.get("labels.manual")).toBe("true");
        expect(parsed.searchParams.get("labels.team")).toBe("qa");
        expect(parsed.searchParams.get("videoName")).toBe("pw.mp4");
        expect(parsed.searchParams.get("logName")).toBe("pw.log");
        expect(parsed.searchParams.get("headless")).toBe("true");
    });

    it("defaults enableHAR to false in the WS query", () => {
        const parsed = new URL(playwrightEndpoint("playwright-chromium", "1.61.1"));
        expect(parsed.searchParams.get("enableHAR")).toBe("false");
        expect(parsed.searchParams.get("harContent")).toBeNull();
        expect(parsed.searchParams.get("screenResolution")).toBe("1920x1080x24");
        expect(parsed.searchParams.get("enableLog")).toBe("false");
        expect(parsed.searchParams.get("timeZone")).toBe("UTC");
    });

    it("omits harContent when enableHAR is on with default meta", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                enableHar: true,
                harContent: "meta",
            })
        );
        expect(parsed.searchParams.get("enableHAR")).toBe("true");
        expect(parsed.searchParams.get("harContent")).toBeNull();
    });

    it("includes harContent=bodies in the WS query only when opt-in with enableHAR", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                enableHar: true,
                harContent: "bodies",
            })
        );
        expect(parsed.searchParams.get("enableHAR")).toBe("true");
        expect(parsed.searchParams.get("harContent")).toBe("bodies");
    });

    it("ignores harContent=bodies when enableHAR is off", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                enableHar: false,
                harContent: "bodies",
            })
        );
        expect(parsed.searchParams.get("enableHAR")).toBe("false");
        expect(parsed.searchParams.get("harContent")).toBeNull();
    });

    it("omits videoName/logName when flags are off", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                enableVideo: false,
                enableLog: false,
                videoName: "ignored.mp4",
                logName: "ignored.log",
            })
        );
        expect(parsed.searchParams.get("videoName")).toBeNull();
        expect(parsed.searchParams.get("logName")).toBeNull();
    });

    it("includes socksProxy in the WS query when set", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                socksProxy: "proxy.qaguru.school:7777",
            })
        );
        expect(parsed.searchParams.get("socksProxy")).toBe("proxy.qaguru.school:7777");
    });

    it("does not send mobileDevice as a hub query param", () => {
        const parsed = new URL(
            playwrightEndpoint("playwright-chrome", "1.61.0", "", {
                screenResolution: "390x844x24",
                mobileDevice: "iphone-12-pro",
            } as any)
        );
        expect(parsed.searchParams.get("screenResolution")).toBe("390x844x24");
        expect(parsed.searchParams.get("mobileDevice")).toBeNull();
        expect(playwrightSelenoidOptions("", { mobileDevice: "iphone-12-pro" } as any)).not.toHaveProperty(
            "mobileDevice"
        );
    });
});
