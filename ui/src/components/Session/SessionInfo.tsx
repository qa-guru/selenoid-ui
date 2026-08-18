import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import BeatLoader from "react-spinners/BeatLoader";
import { Badge, IconClose, IconStop, IconTrash, Panel } from "@zero-design-system/react";
import { deleteSession } from "../Sessions/service";
import { useDeleteSession } from "../SessionArchive/service";
import { sessionsListTo } from "../../lib/sessionNav";

const SessionInfo = ({
    session = "",
    browser = { caps: {} },
    live = false,
    wasLive = false,
    finished = false,
    artifacts = {},
}: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const backTo = sessionsListTo(location.search);
    const caps = browser.caps || {};
    const shortId = session ? session.substring(0, 8) : "";
    const [stopping, setStopping] = useState(false);
    const hasArtifacts = Boolean(artifacts.video || artifacts.log || artifacts.har);
    const canStop = Boolean(live && session);
    const canDelete = Boolean(session && !live && hasArtifacts);

    useEffect(() => {
        if (!live) {
            setStopping(false);
        }
    }, [live]);

    const onDeleted = useCallback(() => {
        navigate(backTo);
    }, [navigate, backTo]);

    const [deleting, deleteArtifacts] = useDeleteSession(
        { id: session, ...artifacts },
        onDeleted
    );

    const onStop = useCallback(() => {
        if (!canStop || stopping) {
            return;
        }
        setStopping(true);
        deleteSession(session).catch((e: any) => {
            console.error("Can't delete session", session, e);
            setStopping(false);
        });
    }, [session, canStop, stopping]);

    const onDelete = useCallback(() => {
        if (!canDelete || deleting) {
            return;
        }
        deleteArtifacts();
    }, [canDelete, deleting, deleteArtifacts]);

    const actions = [
        {
            icon: stopping ? <BeatLoader size={2} color={"#fff"} /> : <IconStop />,
            label: "Stop session",
            disabled: !canStop || stopping,
            onClick: onStop,
            "data-testid": "session-stop",
        },
        {
            icon: deleting ? <BeatLoader size={2} color={"#fff"} /> : <IconTrash />,
            label: "Delete session",
            disabled: !canDelete || deleting,
            onClick: onDelete,
            "data-testid": "session-delete",
        },
        {
            as: Link,
            to: backTo,
            icon: <IconClose />,
            label: "Close window",
            "data-testid": "session-close",
        },
    ];

    return (
        <Panel
            title="Session details"
            testId="session-info-panel"
            titleTestId="session-info-title"
            className="session-info-panel"
            bodyClassName="session-info-panel__body"
            actions={actions}
        >
            <div className="session-info">
                <div className="session-info__main">
                    <div className="session-browser">
                        {live || wasLive ? (
                            live && !browser.quota ? (
                                <BeatLoader size={5} color={"#fff"} loading />
                            ) : (
                                <span className="session-browser__loader-slot" aria-hidden="true" />
                            )
                        ) : null}
                        {!finished && (
                            <>
                                <span className="session-browser__quota">{browser.quota}</span>
                                {browser.quota && <span className="session-browser__version-separator">/</span>}
                                <span className="session-browser__name">{caps.browserName}</span>
                                {caps.browserName && <span className="session-browser__version-separator">/</span>}
                                <span className="session-browser__version">{caps.version}</span>
                                {caps.version && caps.screenResolution && (
                                    <span className="session-browser__version-separator">/</span>
                                )}
                                {caps.screenResolution && <Badge>{caps.screenResolution}</Badge>}
                            </>
                        )}
                    </div>

                    <div className="session-info__additional">
                        <div className="custom-capabilities">
                            {finished && <Badge variant="primary">FINISHED</Badge>}
                            {caps.name && <Badge>{caps.name}</Badge>}
                            {(caps.enableHAR || caps.enableHar || artifacts.har) && <Badge>HAR</Badge>}
                            {(caps.enableVideo || artifacts.video) && <Badge>VIDEO</Badge>}
                            {(caps.enableLog || artifacts.log) && <Badge>LOG</Badge>}
                        </div>
                    </div>

                    <div className="session-info__id" data-testid="session-info-id">
                        {shortId}
                    </div>
                </div>
            </div>
        </Panel>
    );
};

export default SessionInfo;
