import React, { useEffect, useState } from "react";

import { Panel } from "@zero-design-system/react";
import SessionInfo from "./SessionInfo";
import SessionVideo from "./SessionVideo";
import SessionLogFile from "./SessionLogFile";
import VncCard from "../VncCard";
import Log from "../Log";
import HarViewer, { wantsHar } from "../HarViewer";
import { fetchSessionById } from "../SessionArchive/api";
import { StyledSession } from "./style.css";

/** Empty-state hourglass — same composition as Sessions / Archive. */
function IconHourglass() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3.5 2.5h9M3.5 13.5h9" />
            <path d="M4.5 2.5c0 3 3.5 4 3.5 5.5S4.5 11 4.5 13.5" />
            <path d="M11.5 2.5c0 3-3.5 4-3.5 5.5s3.5 3 3.5 5.5" />
        </svg>
    );
}

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
                    {(artifacts.video || artifacts.log) && (
                        <div className="interactive">
                            {artifacts.video && (
                                <div className="session-interactive-card">
                                    <SessionVideo file={artifacts.video} />
                                </div>
                            )}
                            {artifacts.log && (
                                <div className="session-interactive-card">
                                    <SessionLogFile file={artifacts.log} />
                                </div>
                            )}
                        </div>
                    )}
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
                <Panel
                    title="Session"
                    testId="session-loading-panel"
                    titleTestId="session-loading-title"
                    className="session-missing-panel"
                    bodyClassName="session-missing-panel__body"
                >
                    <div className="no-any" data-testid="session-loading">
                        <span className="icon" title="Loading" aria-hidden="true">
                            <IconHourglass />
                        </span>
                        <div className="nosession-any-text">LOADING SESSION…</div>
                    </div>
                </Panel>
            )}

            {!showLive && !showFinished && (artifactsStatus === "missing" || artifactsStatus === "error") && (
                <Panel
                    title="Session"
                    testId="session-missing-panel"
                    titleTestId="session-missing-title"
                    className="session-missing-panel"
                    bodyClassName="session-missing-panel__body"
                >
                    <div className="no-any" data-testid="session-not-found">
                        <span className="icon" title="No any" aria-hidden="true">
                            <IconHourglass />
                        </span>
                        <div className="nosession-any-text">{"SESSION NOT FOUND :'("}</div>
                    </div>
                </Panel>
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
