import React, { useEffect, useState } from "react";
import { IconDownload, Panel } from "@zero-design-system/react";

import { StyledSessionVideo } from "./style.css";

const VIDEO_PROBE_MS = 2500;

function SessionVideoWaiting() {
    return (
        <span className="session-video-waiting__inline" data-testid="session-video-probing">
            Waiting for recording…
        </span>
    );
}

/**
 * Finished-session video panel — plays `/video/<file>` from the hub artifact store.
 * Probes with HEAD before mounting <video> so a missing file does not spam console.
 */
const SessionVideo = ({ file }: any) => {
    const [ready, setReady] = useState(false);

    const href = `/video/${file}`;

    useEffect(() => {
        let cancelled = false;
        setReady(false);

        const probe = async () => {
            if (cancelled || !file) {
                return;
            }
            try {
                const res = await fetch(href, { method: "HEAD", cache: "no-store" });
                if (!cancelled && res.ok) {
                    setReady(true);
                    return;
                }
            } catch {
                /* hub may still be flushing the mp4 */
            }
            if (!cancelled) {
                window.setTimeout(probe, VIDEO_PROBE_MS);
            }
        };

        probe();
        return () => {
            cancelled = true;
        };
    }, [file, href]);

    if (!file) {
        return null;
    }

    return (
        <StyledSessionVideo data-testid="session-video-panel-wrap">
            <Panel
                title="Video"
                testId="session-video-panel"
                titleTestId="session-video-title"
                className="session-video-card"
                bodyClassName="session-video-card__body"
                actions={[
                    {
                        icon: <IconDownload />,
                        label: "Download",
                        onClick: () => {
                            const a = document.createElement("a");
                            a.href = href;
                            a.download = file;
                            a.click();
                        },
                        "data-testid": "session-video-download",
                    },
                ]}
            >
                {ready ? (
                    <video controls preload="metadata" data-testid="session-detail-video">
                        <source src={href} type="video/mp4" />
                    </video>
                ) : (
                    <SessionVideoWaiting />
                )}
            </Panel>
        </StyledSessionVideo>
    );
};

export default SessionVideo;
