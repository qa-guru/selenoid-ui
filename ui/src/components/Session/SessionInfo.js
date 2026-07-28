import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

import BeatLoader from "react-spinners/BeatLoader";
import { Badge, IconTrash, Panel } from "@zero-design-system/react";
import { deleteSession } from "../Sessions/service";

const SessionInfo = ({ session = "", browser = { caps: {} }, finished = false, artifacts = {} }) => {
    const caps = browser.caps || {};
    const shortId = session ? session.substring(0, 8) : "";
    const navigate = useNavigate();
    const [killing, setKilling] = useState(false);

    const onKill = useCallback(() => {
        if (!session || killing) {
            return;
        }
        setKilling(true);
        deleteSession(session)
            .then(() => navigate("/"))
            .catch((e) => {
                console.error("Can't delete session", session, e);
                setKilling(false);
            });
    }, [session, killing, navigate]);

    const killActions =
        !finished && session
            ? [
                  {
                      icon: killing ? <BeatLoader size={2} color={"#fff"} /> : <IconTrash />,
                      label: "Kill session",
                      disabled: killing,
                      onClick: onKill,
                      "data-testid": "session-kill",
                  },
              ]
            : undefined;

    return (
        <Panel
            title="Session"
            testId="session-info-panel"
            titleTestId="session-info-title"
            className="session-info-panel"
            bodyClassName="session-info-panel__body"
            actions={killActions}
        >
            <div className="session-info">
                <div className="session-info__main">
                    <div className="session-browser">
                        {!finished && <BeatLoader size={5} color={"#fff"} loading={!browser.quota} />}
                        {finished ? (
                            <Link to="/sessions" className="session-info__back" data-testid="session-back">
                                ← Sessions
                            </Link>
                        ) : (
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

                    <div className="session-info__id" data-testid="session-info-id">
                        {shortId}
                    </div>
                </div>

                <div className="session-info__additional">
                    <div className="custom-capabilities">
                        {finished && <Badge variant="primary">FINISHED</Badge>}
                        {caps.name && <Badge>{caps.name}</Badge>}
                        {(caps.enableHAR || caps.enableHar || artifacts.har) && <Badge>HAR</Badge>}
                        {artifacts.video && <Badge>VIDEO</Badge>}
                        {artifacts.log && <Badge>LOG</Badge>}
                    </div>
                </div>
            </div>
        </Panel>
    );
};

SessionInfo.propTypes = {
    session: PropTypes.string,
    browser: PropTypes.shape({
        quota: PropTypes.string,
        caps: PropTypes.shape({
            browserName: PropTypes.string,
            version: PropTypes.string,
            screenResolution: PropTypes.string,
            name: PropTypes.string,
        }),
    }),
    finished: PropTypes.bool,
    artifacts: PropTypes.shape({
        video: PropTypes.string,
        log: PropTypes.string,
        har: PropTypes.string,
    }),
};

export default SessionInfo;
