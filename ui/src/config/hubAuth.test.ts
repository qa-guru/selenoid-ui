import { describe, expect, it, vi } from "vitest";

import { defaultHubAccessKey, defaultHubAuthPass, defaultHubAuthUser, defaultPlaywrightAccessKey } from "./hubAuth";

describe("hubAuth", () => {
    it("reads VITE_HUB_ACCESS_KEY and derives user/pass + Playwright accessKey", () => {
        expect(defaultHubAccessKey()).toBe("test_user:test_pass");
        expect(defaultHubAuthUser()).toBe("test_user");
        expect(defaultHubAuthPass()).toBe("test_pass");
        expect(defaultPlaywrightAccessKey()).toBe("test_user:test_pass");
    });

    it("falls back to separate VITE_HUB_AUTH_* when access key is unset", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "");
        vi.stubEnv("VITE_HUB_AUTH_USER", "solo_user");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "solo_pass");
        expect(defaultHubAccessKey()).toBe("");
        expect(defaultHubAuthUser()).toBe("solo_user");
        expect(defaultHubAuthPass()).toBe("solo_pass");
        expect(defaultPlaywrightAccessKey()).toBe("solo_user:solo_pass");
    });

    it("returns empty strings when env is unset", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "");
        vi.stubEnv("VITE_HUB_AUTH_USER", "");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "");
        expect(defaultHubAuthUser()).toBe("");
        expect(defaultHubAuthPass()).toBe("");
        expect(defaultPlaywrightAccessKey()).toBe("");
    });
});
