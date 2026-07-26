import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SessionInfo from "./SessionInfo";
import SessionVideo from "./SessionVideo";
import SessionLogFile from "./SessionLogFile";
import VncCard from "../VncCard";
import Log from "../Log";
import HarViewer, { wantsHar } from "../HarViewer";
import { fetchSessionById } from "../SessionArchive/api";
import { StyledSession } from "./style.css";

const Session = ({ origin, session, browser }) => {
    const [endedCaps, setEndedCaps] = useState(null);
    const [artifacts, setArtifacts] = useState(null);
    const [artifactsStatus, setArtifactsStatus] = useState(() => (browser ? "idle" : "loading"));

    useEffect(() => {
        if (browser?.caps && wantsHar(browser.caps)) {
            setEndedCaps(browser.caps);
        }
    }, [browser]);

    // When the live session ends (or the route opens on a finished id), load
    // video / log / har artifacts from the hub /sessions/ listing.
    useEffect(() => {
        if (browser || !session) {
            return undefined;
        }

        let cancelled = false;
        setArtifactsStatus("loading");

        fetchSessionById(session)
            .then((found) => {
                if (cancelled) {
                    return;
                }
                if (found) {
                    setArtifacts(found);
                    setArtifactsStatus("ready");
                } else {
                    setArtifacts(null);
                    setArtifactsStatus("missing");
                }
            })
            .catch((err) => {
                console.error("Can't load session artifacts", err);
                if (!cancelled) {
                    setArtifacts(null);
                    setArtifactsStatus("error");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [browser, session]);

    const [isLogHidden, onVNCFullscreenChange] = useState(false);
    const capsForHar = browser?.caps || endedCaps || {};
    const sessionAlive = Boolean(browser);
    const finished = !browser && artifactsStatus === "ready" && Boolean(artifacts);
    const showLive = Boolean(browser);
    const showFinished = finished;
    const harFile = artifacts?.har || null;

    return (
        <StyledSession data-testid="session-page">
            {(showLive || showFinished) && (
                <SessionInfo
                    {...{
                        session,
                        browser: browser || { caps: capsForHar },
                        finished: showFinished,
                        artifacts: artifacts || {},
                    }}
                />
            )}

            {showLive && (
                <>
                    <div className="interactive">
                        <VncContainer
                            {...{
                                origin,
                                session,
                                browser,
                                onVNCFullscreenChange,
                            }}
                        />
                        <div className="session-interactive-card">
                            <Log
                                {...{
                                    origin,
                                    session,
                                    browser,
                                }}
                                hidden={isLogHidden}
                            />
                        </div>
                    </div>
                    <div className="session-har-slot">
                        <HarViewer session={session} browser={{ caps: capsForHar }} sessionAlive={sessionAlive} />
                    </div>
                </>
            )}

            {showFinished && (
                <>
                    <div className="interactive">
                        {artifacts.video ? (
                            <div className="session-interactive-card">
                                <SessionVideo file={artifacts.video} />
                            </div>
                        ) : (
                            <div className="session-interactive-card">
                                <div className="session-missing" data-testid="session-no-video">
                                    No video
                                </div>
                            </div>
                        )}
                        {artifacts.log ? (
                            <div className="session-interactive-card">
                                <SessionLogFile file={artifacts.log} />
                            </div>
                        ) : (
                            <div className="session-interactive-card">
                                <div className="session-missing" data-testid="session-no-log">
                                    No session logs
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="session-har-slot">
                        {harFile || wantsHar(capsForHar) ? (
                            <HarViewer
                                session={session}
                                browser={{ caps: { ...capsForHar, enableHAR: true } }}
                                sessionAlive={false}
                                file={harFile || undefined}
                            />
                        ) : (
                            <div className="session-missing" data-testid="session-no-har">
                                No HAR
                            </div>
                        )}
                    </div>
                </>
            )}

            {!showLive && !showFinished && artifactsStatus === "loading" && (
                <div className="session-missing" data-testid="session-loading">
                    Loading session…
                </div>
            )}

            {!showLive && !showFinished && (artifactsStatus === "missing" || artifactsStatus === "error") && (
                <div className="session-missing" data-testid="session-not-found">
                    Session not found.{" "}
                    <Link to="/sessions" data-testid="session-back-missing">
                        Back to sessions
                    </Link>
                </div>
            )}
        </StyledSession>
    );
};

export default Session;

function VncContainer({ origin, session, browser = {}, onVNCFullscreenChange }) {
    if (browser.caps && !browser.caps.enableVNC) {
        return <span />;
    }

    return (
        <div className="session-interactive-card">
            <VncCard
                {...{
                    origin,
                    session,
                    browser,
                    onVNCFullscreenChange,
                }}
            />
        </div>
    );
}
