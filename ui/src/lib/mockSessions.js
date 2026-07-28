/**
 * Dev-only live-session fixtures for UI layout checks.
 * Activate: open UI with `?mock=1` (before or after hash).
 */

const container = "mock-container-deadbeef";

function session(id, { quota, browserName, version, name, enableVNC = false, manual = false, screenResolution }) {
    const caps = {
        browserName,
        version,
        name,
        enableVNC,
        ...(screenResolution ? { screenResolution } : {}),
        ...(manual ? { labels: { manual: "true" } } : {}),
    };
    return {
        id,
        container,
        quota,
        caps,
    };
}

/** Variety covering every Live sessions column / badge combo. */
export const MOCK_LIVE_SESSIONS = {
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
};

export function isMockSessionsEnabled() {
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
export function mergeMockLiveSessions(sessions = {}) {
    return { ...sessions, ...MOCK_LIVE_SESSIONS };
}
