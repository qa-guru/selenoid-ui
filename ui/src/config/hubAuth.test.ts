import { describe, expect, it, vi } from "vitest";

import {
    defaultHubAccessKey,
    defaultHubAuthPass,
    defaultHubAuthUser,
    defaultPlaywrightAccessKey,
    fieldsFromAccessKey,
    formatAccessKey,
    hubAuthCurlFlag,
    hubAuthHeaders,
    parseAccessKey,
} from "./hubAuth";

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

    it("parses and formats accessKey tokens", () => {
        expect(parseAccessKey("u:p:extra")).toEqual({ user: "u", pass: "p:extra" });
        expect(parseAccessKey("nouser")).toBeNull();
        expect(parseAccessKey(":pass")).toBeNull();
        expect(parseAccessKey("")).toBeNull();
        expect(formatAccessKey("alice", "s3cret")).toBe("alice:s3cret");
        expect(formatAccessKey("  bob  ", "")).toBe("bob:");
        expect(formatAccessKey("", "x")).toBe("");
        expect(formatAccessKey("   ", "x")).toBe("");
    });

    it("fieldsFromAccessKey falls back to defaults for missing parts", () => {
        expect(fieldsFromAccessKey("guest:secret")).toEqual({ authUser: "guest", authPass: "secret" });
        expect(fieldsFromAccessKey("")).toEqual({
            authUser: defaultHubAuthUser(),
            authPass: defaultHubAuthPass(),
        });
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
});
