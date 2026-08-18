import React from "react";
import { Badge } from "@zero-design-system/react";
import type { SessionCaps } from "../../types/hub";
import type { SessionArtifacts } from "../../util/sessionIdentity";
import { sessionBrowserName, sessionCapFlags, sessionName } from "../../util/sessionIdentity";

export function SessionIdentity({ caps = {} }: { caps?: SessionCaps }) {
    const { name, displayName } = sessionName(caps);
    const browserName = sessionBrowserName(caps);
    const resolution = String(caps.screenResolution || "");
    const version = caps.version ? String(caps.version) : "";
    if (!browserName && !displayName) {
        return null;
    }
    return (
        <>
            {browserName ? (
                <span className="browser">
                    <span className="name">{browserName}</span>
                    {version ? <span className="version">{version}</span> : null}
                    {resolution ? <span className="session__resolution">{resolution}</span> : null}
                </span>
            ) : null}
            {displayName ? (
                <span className="session-name" data-testid="session-name" title={name}>
                    {displayName}
                </span>
            ) : null}
        </>
    );
}

export function SessionCapBadges({
    caps,
    artifacts,
}: {
    caps?: SessionCaps | null;
    artifacts?: SessionArtifacts | null;
}) {
    const flags = sessionCapFlags(caps, artifacts);
    return (
        <>
            {flags.manual ? <Badge variant="primary">MANUAL</Badge> : null}
            {flags.vnc ? <Badge variant="primary">VNC</Badge> : null}
            {flags.video ? <Badge>VIDEO</Badge> : null}
            {flags.har ? <Badge>HAR</Badge> : null}
            {flags.log ? <Badge>LOG</Badge> : null}
        </>
    );
}
