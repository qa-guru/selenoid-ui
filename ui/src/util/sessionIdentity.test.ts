import { describe, expect, it } from "vitest";
import {
    capsFromArchiveSession,
    hasSessionIdentity,
    isManualSession,
    sessionCapFlags,
    sessionName,
} from "./sessionIdentity";

describe("sessionIdentity", () => {
    it("hides the default Create Session name next to MANUAL", () => {
        const caps = { name: "Manual session", labels: { manual: "true" } };
        expect(isManualSession(caps)).toBe(true);
        expect(sessionName(caps)).toEqual({ name: "Manual session", displayName: "" });
    });

    it("keeps a real session name", () => {
        const caps = { name: "FullSuite.loginAndCheckout", labels: { manual: true } };
        expect(sessionName(caps).displayName).toBe("FullSuite.loginAndCheckout");
    });

    it("reads cap flags from caps and artifacts", () => {
        expect(
            sessionCapFlags(
                {
                    enableVNC: true,
                    enableVideo: "true",
                    enableHAR: false,
                    enableLog: false,
                    screenResolution: "1920x1080x24",
                    labels: { manual: true },
                },
                { har: "s.har", log: "s.log" }
            )
        ).toEqual({
            manual: true,
            vnc: true,
            video: true,
            har: true,
            log: true,
            resolution: "1920x1080x24",
        });
    });

    it("treats string false as off", () => {
        expect(sessionCapFlags({ enableVNC: "false", enableVideo: false })).toEqual({
            manual: false,
            vnc: false,
            video: false,
            har: false,
            log: false,
            resolution: "",
        });
    });

    it("maps archive payload without inventing browser caps", () => {
        expect(capsFromArchiveSession({ id: "s1", name: "LoginTest", video: "s1.mp4" } as any)).toEqual({
            name: "LoginTest",
        });
        expect(hasSessionIdentity(capsFromArchiveSession({ name: "LoginTest" }))).toBe(true);
        expect(hasSessionIdentity(capsFromArchiveSession({}))).toBe(false);
        expect(capsFromArchiveSession({ browserName: "firefox", version: "150.0" }).browserName).toBe("firefox");
    });
});
