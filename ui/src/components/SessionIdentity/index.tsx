import React from "react";
import { Badge } from "@zero-design-system/react";
import type { SessionCaps } from "../../types/hub";
import type { SessionArtifacts } from "../../util/sessionIdentity";
import { sessionCapFlags, sessionName } from "../../util/sessionIdentity";

export function SessionIdentity({ caps = {} }: { caps?: SessionCaps }) {
    const { name, displayName } = sessionName(caps);
    const resolution = String(caps.screenResolution || "");
    return (
        <>
            <span className="browser">
                <span className="name">{caps.browserName}</span>
                {caps.version ? <span className="version">{caps.version}</span> : null}
                {resolution ? <span className="session__resolution">{resolution}</span> : null}
            </span>
            <span className={`session-name${displayName ? "" : " session-name_empty"}`} title={name || undefined}>
                {displayName || "—"}
            </span>
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
