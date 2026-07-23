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
            enableVnc: false,
            enableVideo: false,
            headless: true,
        });
        const parsed = new URL(url);

        expect(parsed.searchParams.get("name")).toBe("PW manual");
        expect(parsed.searchParams.get("sessionTimeout")).toBe("15m");
        expect(parsed.searchParams.get("enableVNC")).toBe("false");
        expect(parsed.searchParams.get("enableVideo")).toBe("false");
        expect(parsed.searchParams.get("headless")).toBe("true");
    });
});
