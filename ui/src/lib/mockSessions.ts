/**
 * Dev-only live-session fixtures for UI layout checks.
 * Activate: open UI with `?mock=1` (before or after hash).
 */

import type { LiveSession, SessionsMap } from "../types/hub";

const container = "mock-container-deadbeef";

type MockSessionOpts = {
    quota?: string;
    browserName: string;
    version?: string;
    name?: string;
    enableVNC?: boolean;
    enableVideo?: boolean;
    enableHAR?: boolean;
    enableLog?: boolean;
    manual?: boolean;
    screenResolution?: string;
    timeZone?: string;
    sessionTimeout?: string;
    /** Empty quota + spinner: session is in the hub feed but not yet fully started. */
    starting?: boolean;
    /** Fake connected VNC desktop + live logs (no hub sockets). */
    preview?: "active";
};

function session(id: string, opts: MockSessionOpts): LiveSession {
    const {
        quota = "",
        browserName,
        version = "",
        name = "",
        enableVNC = false,
        enableVideo = false,
        enableHAR = false,
        enableLog = false,
        manual = false,
        screenResolution,
        timeZone,
        sessionTimeout,
        starting = false,
        preview,
    } = opts;
    const caps = {
        browserName,
        enableVNC,
        ...(version ? { version } : {}),
        ...(name ? { name } : {}),
        ...(enableVideo ? { enableVideo: true } : {}),
        ...(enableHAR ? { enableHAR: true } : {}),
        ...(enableLog ? { enableLog: true } : {}),
        ...(screenResolution ? { screenResolution } : {}),
        ...(timeZone ? { timeZone } : {}),
        ...(sessionTimeout ? { sessionTimeout } : {}),
        ...(manual ? { labels: { manual: "true" } } : {}),
    };
    return {
        id,
        container,
        quota,
        ...(starting ? { starting: true } : {}),
        ...(preview ? { preview } : {}),
        caps,
    };
}

/** Every Create Session toggle on — layout stress for Live row + session page. */
const MOCK_MAX_CAPS: MockSessionOpts = {
    quota: "max.user",
    browserName: "chrome",
    version: "149.0",
    name: "FullSuite.loginAndCheckout",
    enableVNC: true,
    enableVideo: true,
    enableHAR: true,
    enableLog: true,
    manual: true,
    screenResolution: "1920x1080x24",
    timeZone: "Europe/Moscow",
    sessionTimeout: "60m",
};

/** Variety covering every Live sessions column / badge combo. */
export const MOCK_LIVE_SESSIONS: SessionsMap = {
    mocklive01aaaaaaaaaaaaaaaaaaaaaaa: session("mocklive01aaaaaaaaaaaaaaaaaaaaaaa", {
        quota: "alice",
        browserName: "chrome",
        version: "148.0",
        name: "Manual session",
        enableVNC: true,
        manual: true,
        screenResolution: "1920x1080x24",
    }),
    mocklive02bbbbbbbbbbbbbbbbbbbbbbb: session("mocklive02bbbbbbbbbbbbbbbbbbbbbbb", {
        quota: "bob.smith",
        browserName: "firefox",
        version: "150.0",
        name: "com.aerokube.selenoid.DemoTest.veryLongNameThatShouldTruncateInLiveRow",
        enableVNC: true,
        screenResolution: "1366x768x24",
    }),
    mocklive03ccccccccccccccccccccccc: session("mocklive03ccccccccccccccccccccccc", {
        quota: "ci-runner",
        browserName: "msedge",
        version: "145.0",
        name: "SmokeSuite.openHome",
        enableVNC: false,
        screenResolution: "1280x720x24",
    }),
    mocklive04ddddddddddddddddddddddd: session("mocklive04ddddddddddddddddddddddd", {
        quota: "unknown",
        browserName: "playwright-chromium",
        version: "1.61.1",
        name: "pw.chromium.login",
        enableVNC: true,
    }),
    mocklive05eeeeeeeeeeeeeeeeeeeeeee: session("mocklive05eeeeeeeeeeeeeeeeeeeeeee", {
        quota: "mobile-lab",
        browserName: "android",
        version: "16.0",
        name: "AndroidUi.swipeGallery",
        enableVNC: true,
        screenResolution: "1080x1920x24",
    }),
    mocklive06fffffffffffffffffffffff: session("mocklive06fffffffffffffffffffffff", {
        quota: "",
        browserName: "chrome",
        version: "149.0",
        name: "",
        enableVNC: false,
        manual: true,
    }),
    "mockmax-aaaaaaaaaaaaaaaaaaaaaaa": session("mockmax-aaaaaaaaaaaaaaaaaaaaaaa", {
        ...MOCK_MAX_CAPS,
        preview: "active",
    }),
    "mockmin-aaaaaaaaaaaaaaaaaaaaaaa": session("mockmin-aaaaaaaaaaaaaaaaaaaaaaa", {
        browserName: "chrome",
        version: "149.0",
    }),
    "mockfrz-aaaaaaaaaaaaaaaaaaaaaaa": session("mockfrz-aaaaaaaaaaaaaaaaaaaaaaa", {
        ...MOCK_MAX_CAPS,
        quota: "",
        starting: true,
    }),
};

export type MockLivePreview = "active" | "starting" | "stub";

/** How a `?mock=1` session should drive VNC/logs. `null` = real hub sockets. */
export function mockLivePreview(sessionId: string | undefined): MockLivePreview | null {
    if (!sessionId || !MOCK_LIVE_SESSIONS[sessionId]) {
        return null;
    }
    const live = MOCK_LIVE_SESSIONS[sessionId];
    if (live.starting) {
        return "starting";
    }
    if (live.preview === "active") {
        return "active";
    }
    return "stub";
}

export function isMockSessionsEnabled(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        const search = new URLSearchParams(window.location.search);
        if (search.get("mock") === "1") {
            return true;
        }
        const hash = window.location.hash || "";
        const qIndex = hash.indexOf("?");
        if (qIndex >= 0) {
            const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
            if (hashParams.get("mock") === "1") {
                return true;
            }
        }
    } catch {
        /* ignore */
    }
    return false;
}

/** Merge mock live sessions on top of real feed (mock ids win). */
export function mergeMockLiveSessions(sessions: SessionsMap = {}): SessionsMap {
    return { ...sessions, ...MOCK_LIVE_SESSIONS };
}
