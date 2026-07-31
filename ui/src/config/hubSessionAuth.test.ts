import { afterEach, describe, expect, it, vi } from "vitest";

describe("hubSessionAuth", () => {
    afterEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("remembers Create Session token for later DELETE", async () => {
        vi.stubEnv("VITE_HUB_AUTH_USER", "baked");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "secret");
        const mod = await import("./hubSessionAuth");
        expect(mod.resolveHubAuthToken()).toBe("baked:secret");
        mod.rememberHubAuthToken("user1:1234");
        expect(mod.resolveHubAuthToken()).toBe("user1:1234");
    });

    it("ignores empty remember payloads", async () => {
        vi.stubEnv("VITE_HUB_AUTH_USER", "baked");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "secret");
        const mod = await import("./hubSessionAuth");
        mod.rememberHubAuthToken("user1:1234");
        mod.rememberHubAuthToken("");
        expect(mod.resolveHubAuthToken()).toBe("user1:1234");
    });
});
