import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import BeatLoader from "react-spinners/BeatLoader";
import { Badge, IconTrash, Panel } from "@zero-design-system/react";
import { deleteSession } from "../Sessions/service";
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
    const backTo = sessionsListTo(location.search);
    const caps = browser.caps || {};
    const shortId = session ? session.substring(0, 8) : "";
    const [killing, setKilling] = useState(false);

    useEffect(() => {
        if (!live) {
            setKilling(false);
        }
    }, [live]);

    const onKill = useCallback(() => {
        if (!session || killing) {
            return;
        }
        setKilling(true);
        deleteSession(session).catch((e: any) => {
            console.error("Can't delete session", session, e);
            setKilling(false);
        });
    }, [session, killing]);

    const killActions =
        live && session
            ? [
                  {
                      icon: killing ? <BeatLoader size={2} color={"#fff"} /> : <IconTrash />,
                      label: "Kill session",
                      disabled: killing,
                      onClick: onKill,
                      "data-testid": "session-kill",
                  },
              ]
            : wasLive && session
              ? [
                    {
                        icon: <span className="session-kill-placeholder" aria-hidden="true" />,
                        label: "Kill session",
                        disabled: true,
                        onClick: () => {},
                        "data-testid": "session-kill-placeholder",
                    },
                ]
              : undefined;

    return (
        <Panel
            title="Session details"
            testId="session-info-panel"
            titleTestId="session-info-title"
            className="session-info-panel"
            bodyClassName="session-info-panel__body"
            actions={killActions}
        >
            <div className="session-info">
                <div className="session-info__main">
                    <div className="session-browser">
                        <Link
                            to={backTo}
                            className="btn btn--secondary session-info__back"
                            data-testid="session-back"
                        >
                            ← Sessions
                        </Link>
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
