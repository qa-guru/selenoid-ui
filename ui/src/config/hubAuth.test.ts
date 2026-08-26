import { describe, expect, it, vi } from "vitest";

import {
    defaultHubAccessKey,
    defaultHubAuthPass,
    defaultHubAuthUser,
    defaultPlaywrightAccessKey,
    formatAccessKey,
    hubAuthCurlFlag,
    hubAuthHeaders,
    hubFetch,
    parseAccessKey,
} from "./hubAuth";

describe("hubAuth", () => {
    it("reads three independent env vars when AUTH_* are set", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "pw_token");
        vi.stubEnv("VITE_HUB_AUTH_USER", "wd_user");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "wd_pass");
        expect(defaultHubAccessKey()).toBe("pw_token");
        expect(defaultPlaywrightAccessKey()).toBe("pw_token");
        expect(defaultHubAuthUser()).toBe("wd_user");
        expect(defaultHubAuthPass()).toBe("wd_pass");
    });

    it("does not derive Playwright accessKey from AUTH_USER/PASS", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "");
        vi.stubEnv("VITE_HUB_AUTH_USER", "solo_user");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "solo_pass");
        expect(defaultHubAuthUser()).toBe("solo_user");
        expect(defaultHubAuthPass()).toBe("solo_pass");
        expect(defaultPlaywrightAccessKey()).toBe("");
    });

    it("falls back WD AUTH_* from ACCESS_KEY when AUTH_USER is empty", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "from_key:secret");
        vi.stubEnv("VITE_HUB_AUTH_USER", "");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "");
        expect(defaultHubAccessKey()).toBe("from_key:secret");
        expect(defaultHubAuthUser()).toBe("from_key");
        expect(defaultHubAuthPass()).toBe("secret");
        expect(defaultPlaywrightAccessKey()).toBe("from_key:secret");
    });

    it("keeps explicit AUTH_* over ACCESS_KEY parse", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "from_key:secret");
        vi.stubEnv("VITE_HUB_AUTH_USER", "wd_only");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "wd_secret");
        expect(defaultHubAuthUser()).toBe("wd_only");
        expect(defaultHubAuthPass()).toBe("wd_secret");
        expect(defaultPlaywrightAccessKey()).toBe("from_key:secret");
    });

    it("returns empty strings when env is unset", () => {
        vi.stubEnv("VITE_HUB_ACCESS_KEY", "");
        vi.stubEnv("VITE_HUB_AUTH_USER", "");
        vi.stubEnv("VITE_HUB_AUTH_PASS", "");
        expect(defaultHubAuthUser()).toBe("");
        expect(defaultHubAuthPass()).toBe("");
        expect(defaultPlaywrightAccessKey()).toBe("");
    });

    it("parses and formats WD Basic Auth tokens", () => {
        expect(parseAccessKey("u:p:extra")).toEqual({ user: "u", pass: "p:extra" });
        expect(parseAccessKey("nouser")).toBeNull();
        expect(parseAccessKey(":pass")).toBeNull();
        expect(parseAccessKey("")).toBeNull();
        expect(formatAccessKey("alice", "s3cret")).toBe("alice:s3cret");
        expect(formatAccessKey("  bob  ", "")).toBe("bob:");
        expect(formatAccessKey("", "x")).toBe("");
        expect(formatAccessKey("   ", "x")).toBe("");
    });

    it("builds Basic Auth header and curl -u flag", () => {
        expect(hubAuthHeaders("u:p")).toEqual({
            Authorization: `Basic ${btoa("u:p")}`,
        });
        expect(hubAuthHeaders("")).toEqual({});
        expect(hubAuthCurlFlag("u:p")).toBe("-u 'u:p' ");
        expect(hubAuthCurlFlag("u:p'x")).toBe("-u 'u:p'\\''x' ");
        expect(hubAuthCurlFlag("")).toBe("");
    });

    it("fetches artifacts with Authorization and credentials=omit", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        await hubFetch("/logs/sess.log", "u:p", { cache: "no-store" });
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringMatching(/\/logs\/sess\.log$/),
            expect.objectContaining({
                cache: "no-store",
                credentials: "omit",
                headers: { Authorization: `Basic ${btoa("u:p")}` },
            })
        );

        vi.unstubAllGlobals();
    });
});
