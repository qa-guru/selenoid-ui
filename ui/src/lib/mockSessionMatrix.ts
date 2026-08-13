import type { LiveSession, SessionsMap } from "../types/hub";
import { pairwise, type Row } from "./pairwise";

/** UI-visible live-row / session-page factors. Pairwise covers every 2-way combo. */
export const LIVE_SESSION_FACTORS = {
    quota: ["empty", "user"] as const,
    browser: ["chrome", "firefox", "msedge", "playwright-chromium", "android"] as const,
    version: ["none", "set"] as const,
    name: ["empty", "short", "long"] as const,
    manual: ["yes", "no"] as const,
    vnc: ["yes", "no"] as const,
    video: ["yes", "no"] as const,
    har: ["yes", "no"] as const,
    log: ["yes", "no"] as const,
    resolution: ["none", "landscape", "portrait"] as const,
    /** live = normal row; starting = freeze spinner; active = fake connected VNC. */
    phase: ["live", "starting", "active"] as const,
};

export type LiveSessionFactors = typeof LIVE_SESSION_FACTORS;
export type LiveSessionRow = Row<LiveSessionFactors>;

export const MOCK_SESSION_ID = {
    max: "mockmax-aaaaaaaaaaaaaaaaaaaaaaa",
    min: "mockmin-aaaaaaaaaaaaaaaaaaaaaaa",
    freeze: "mockfrz-aaaaaaaaaaaaaaaaaaaaaaa",
} as const;

const BROWSER_VERSION: Record<LiveSessionRow["browser"], string> = {
    chrome: "149.0",
    firefox: "150.0",
    msedge: "145.0",
    "playwright-chromium": "1.61.1",
    android: "16.0",
};

const LONG_NAME = "com.aerokube.selenoid.DemoTest.veryLongNameThatShouldTruncateInLiveRow";

export const LIVE_SESSION_SEEDS: Record<"max" | "min" | "freeze", LiveSessionRow> = {
    max: {
        quota: "user",
        browser: "chrome",
        version: "set",
        name: "short",
        manual: "yes",
        vnc: "yes",
        video: "yes",
        har: "yes",
        log: "yes",
        resolution: "landscape",
        phase: "active",
    },
    min: {
        quota: "empty",
        browser: "chrome",
        version: "set",
        name: "empty",
        manual: "no",
        vnc: "no",
        video: "no",
        har: "no",
        log: "no",
        resolution: "none",
        phase: "live",
    },
    freeze: {
        quota: "empty",
        browser: "chrome",
        version: "set",
        name: "short",
        manual: "yes",
        vnc: "yes",
        video: "yes",
        har: "yes",
        log: "yes",
        resolution: "landscape",
        phase: "starting",
    },
};

export function liveSessionAllowed(row: LiveSessionRow): boolean {
    if (row.phase === "active" && row.vnc !== "yes") {
        return false;
    }
    if (row.phase === "starting" && row.quota !== "empty") {
        return false;
    }
    return true;
}

let cachedLiveRows: LiveSessionRow[] | undefined;

export function liveSessionRows(): LiveSessionRow[] {
    if (!cachedLiveRows) {
        cachedLiveRows = pairwise(LIVE_SESSION_FACTORS, {
            seeds: [LIVE_SESSION_SEEDS.max, LIVE_SESSION_SEEDS.min, LIVE_SESSION_SEEDS.freeze],
            allowed: liveSessionAllowed,
        });
    }
    return cachedLiveRows;
}

function yes(value: "yes" | "no"): boolean {
    return value === "yes";
}

function sessionName(row: LiveSessionRow): string {
    if (row.name === "empty") {
        return "";
    }
    if (row.name === "long") {
        return LONG_NAME;
    }
    if (row.manual === "yes" && row.phase !== "active" && row.phase !== "starting") {
        return "Manual session";
    }
    return "FullSuite.loginAndCheckout";
}

function screenResolution(row: LiveSessionRow): string | undefined {
    if (row.resolution === "landscape") {
        return "1920x1080x24";
    }
    if (row.resolution === "portrait") {
        return "1080x1920x24";
    }
    return undefined;
}

export function liveSessionFromRow(id: string, row: LiveSessionRow, quotaUser: string): LiveSession {
    const resolution = screenResolution(row);
    const name = sessionName(row);
    const caps = {
        browserName: row.browser,
        enableVNC: yes(row.vnc),
        ...(row.version === "set" ? { version: BROWSER_VERSION[row.browser] } : {}),
        ...(name ? { name } : {}),
        ...(yes(row.video) ? { enableVideo: true } : {}),
        ...(yes(row.har) ? { enableHAR: true } : {}),
        ...(yes(row.log) ? { enableLog: true } : {}),
        ...(resolution ? { screenResolution: resolution } : {}),
        ...(yes(row.manual) ? { labels: { manual: "true" } } : {}),
        ...(row.phase === "active"
            ? { timeZone: "Europe/Moscow", sessionTimeout: "60m" }
            : {}),
    };
    return {
        id,
        container: "mock-container-deadbeef",
        quota: row.quota === "empty" ? "" : quotaUser,
        ...(row.phase === "starting" ? { starting: true } : {}),
        ...(row.phase === "active" ? { preview: "active" as const } : {}),
        caps,
    };
}

function pairwiseId(index: number): string {
    const n = String(index).padStart(2, "0");
    return `pw${n}-aaaaaaaaaaaaaaaaaaaaaaaa`;
}

function sameRow(a: LiveSessionRow, b: LiveSessionRow): boolean {
    return (Object.keys(LIVE_SESSION_FACTORS) as (keyof LiveSessionRow)[]).every((key) => a[key] === b[key]);
}

/** Pairwise live sessions plus stable seed ids (max / min / freeze). */
export function buildMockLiveSessions(): SessionsMap {
    const rows = liveSessionRows();
    const sessions: SessionsMap = {};
    let generated = 0;
    for (const row of rows) {
        if (sameRow(row, LIVE_SESSION_SEEDS.max)) {
            sessions[MOCK_SESSION_ID.max] = liveSessionFromRow(MOCK_SESSION_ID.max, row, "max.user");
            continue;
        }
        if (sameRow(row, LIVE_SESSION_SEEDS.min)) {
            sessions[MOCK_SESSION_ID.min] = liveSessionFromRow(MOCK_SESSION_ID.min, row, "");
            continue;
        }
        if (sameRow(row, LIVE_SESSION_SEEDS.freeze)) {
            sessions[MOCK_SESSION_ID.freeze] = liveSessionFromRow(MOCK_SESSION_ID.freeze, row, "");
            continue;
        }
        const n = generated;
        generated += 1;
        const id = pairwiseId(n);
        sessions[id] = liveSessionFromRow(id, row, `u${String(n).padStart(2, "0")}`);
    }
    return sessions;
}
