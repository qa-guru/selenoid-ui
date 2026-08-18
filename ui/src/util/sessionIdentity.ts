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
