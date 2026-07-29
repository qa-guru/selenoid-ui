import React from "react";
import { Panel } from "@zero-design-system/react";

import { StyledSessionVideo } from "./style.css";

/**
 * Finished-session video panel — plays `/video/<file>` from the hub artifact store.
 */
const SessionVideo = ({ file }: any) => {
    if (!file) {
        return null;
    }

    const href = `/video/${file}`;

    return (
        <StyledSessionVideo data-testid="session-video-panel-wrap">
            <Panel
                title="Video"
                testId="session-video-panel"
                titleTestId="session-video-title"
                className="session-video-card"
                bodyClassName="session-video-card__body"
            >
                <div className="session-video-toolbar">
                    <a
                        className="session-video-toolbar__link"
                        href={href}
                        download={file}
                        data-testid="session-video-download"
                    >
                        Download
                    </a>
                </div>
                <video controls preload="metadata" data-testid="session-detail-video">
                    <source src={href} type="video/mp4" />
                </video>
            </Panel>
        </StyledSessionVideo>
    );
};

export default SessionVideo;
