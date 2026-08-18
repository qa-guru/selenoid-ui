import type { SessionCaps } from "../types/hub";

export type SessionArtifacts = {
    video?: unknown;
    log?: unknown;
    har?: unknown;
};

export type SessionCapFlags = {
    manual: boolean;
    vnc: boolean;
    video: boolean;
    har: boolean;
    log: boolean;
    resolution: string;
};

function capOn(value: unknown): boolean {
    return value === true || value === "true";
}

export function isManualSession(caps?: SessionCaps | null): boolean {
    return capOn(caps?.labels?.manual);
}

export function sessionName(caps?: SessionCaps | null): { name: string; displayName: string } {
    const name = String(caps?.name || "");
    const hideDefaultManual = isManualSession(caps) && name.trim().toLowerCase() === "manual session";
    return { name, displayName: hideDefaultManual ? "" : name };
}

export function sessionBrowserName(caps?: SessionCaps | null): string {
    return String(caps?.browserName || "").trim();
}

export function hasSessionIdentity(caps?: SessionCaps | null): boolean {
    return Boolean(sessionBrowserName(caps) || sessionName(caps).displayName);
}

/** Caps for a finished-list row. Hub `/sessions/?json` has name/quota/times/artifacts, not browser. */
export function capsFromArchiveSession(
    session?: {
        name?: unknown;
        caps?: SessionCaps | null;
        browserName?: unknown;
        version?: unknown;
        screenResolution?: unknown;
    } | null
): SessionCaps {
    const extra = session?.caps && typeof session.caps === "object" ? session.caps : {};
    const browserName = String(session?.browserName || extra.browserName || "").trim();
    const version = session?.version ?? extra.version;
    const screenResolution = session?.screenResolution ?? extra.screenResolution;
    const name = session?.name ?? extra.name;
    const caps: SessionCaps = { ...extra };
    if (browserName) {
        caps.browserName = browserName;
    } else {
        delete caps.browserName;
    }
    if (version) {
        caps.version = version as SessionCaps["version"];
    }
    if (screenResolution) {
        caps.screenResolution = String(screenResolution);
    }
    if (name) {
        caps.name = String(name);
    } else if (!extra.name) {
        delete caps.name;
    }
    return caps;
}

export function sessionCapFlags(caps?: SessionCaps | null, artifacts?: SessionArtifacts | null): SessionCapFlags {
    const extra = artifacts || {};
    return {
        manual: isManualSession(caps),
        vnc: capOn(caps?.enableVNC),
        video: capOn(caps?.enableVideo) || Boolean(extra.video),
        har: capOn(caps?.enableHAR) || capOn(caps?.enableHar) || Boolean(extra.har),
        log: capOn(caps?.enableLog) || Boolean(extra.log),
        resolution: String(caps?.screenResolution || ""),
    };
}
