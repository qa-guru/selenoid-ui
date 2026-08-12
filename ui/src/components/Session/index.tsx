import React, { useEffect, useRef, useState } from "react";

import { Panel } from "@zero-design-system/react";
import SessionInfo from "./SessionInfo";
import SessionVideo from "./SessionVideo";
import SessionLogFile from "./SessionLogFile";
import VncCard from "../VncCard";
import Log from "../Log";
import HarViewer, { wantsHar } from "../HarViewer";
import { fetchSessionById } from "../SessionArchive/api";
import { LIVE_SESSION_GRACE_MS } from "../../util/waitForLiveSession";
import { StyledSession } from "./style.css";

const ARTIFACT_POLL_MS = 2500;
const ARTIFACT_POLL_TIMEOUT_MS = 120_000;

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

function SessionVideoWaiting() {
    return (
        <Panel
            title="Video"
            testId="session-video-waiting-panel"
            titleTestId="session-video-title"
            className="session-video-card"
            bodyClassName="session-video-card__body session-video-waiting"
        >
            <span className="session-video-waiting__icon" aria-hidden="true">
                <IconHourglass />
            </span>
            <span data-testid="session-video-waiting">Waiting for recording…</span>
        </Panel>
    );
}

const Session = ({ origin, session, browser }: any) => {
    const wasLiveRef = useRef(false);
    const [endedCaps, setEndedCaps] = useState<any>(null);
    const [endedBrowser, setEndedBrowser] = useState<any>(null);
    const [artifacts, setArtifacts] = useState<any>(null);
    const [artifactsStatus, setArtifactsStatus] = useState(() => (browser ? "idle" : "loading"));

    useEffect(() => {
        if (browser) {
            wasLiveRef.current = true;
            setEndedBrowser(browser);
            if (browser.caps) {
                setEndedCaps(browser.caps);
            }
        }
    }, [browser]);

    // Live sessions appear in SSE a moment after Create Session; finished ones live
    // in /sessions/. After a live session ends, poll the archive for video/HAR.
    useEffect(() => {
        if (browser || !session) {
            if (browser) {
                setArtifactsStatus("idle");
            }
            return undefined;
        }

        let cancelled = false;
        setArtifactsStatus("loading");

        const resolveFromArchive = () =>
            fetchSessionById(session)
                .then((found: any) => {
                    if (cancelled) {
                        return found;
                    }
                    if (found) {
                        setArtifacts(found);
                        setArtifactsStatus("ready");
                    }
                    return found;
                })
                .catch((err: any) => {
                    if (!cancelled) {
                        setArtifactsStatus("error");
                    }
                    return null;
                });

        if (wasLiveRef.current) {
            resolveFromArchive();
            const pollId = window.setInterval(() => {
                resolveFromArchive();
            }, ARTIFACT_POLL_MS);
            const timeoutId = window.setTimeout(() => {
                window.clearInterval(pollId);
                if (!cancelled) {
                    setArtifactsStatus((prev: any) => (prev === "loading" ? "missing" : prev));
                }
            }, ARTIFACT_POLL_TIMEOUT_MS);

            return () => {
                cancelled = true;
                window.clearInterval(pollId);
                window.clearTimeout(timeoutId);
            };
        }

        // Cold open (/sessions/:id reload or deep link): look up archive immediately
        // so finished sessions render without waiting for the live SSE grace window.
        resolveFromArchive();

        const graceTimer = window.setTimeout(() => {
            if (!cancelled) {
                resolveFromArchive().then((found: any) => {
                    if (!cancelled && !found) {
                        setArtifacts(null);
                        setArtifactsStatus((prev: any) => (prev === "loading" ? "missing" : prev));
                    }
                });
            }
        }, LIVE_SESSION_GRACE_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(graceTimer);
        };
    }, [browser, session]);

    const [isLogHidden, onVNCFullscreenChange] = useState(false);
    const capsForHar = browser?.caps || endedCaps || {};
    const showLive = Boolean(browser);
    const showFinished = !browser && artifactsStatus === "ready" && Boolean(artifacts);
    const wasLive = wasLiveRef.current;
    const showSessionInfo = showLive || (wasLive && !browser) || showFinished;
    const keepLiveLog = wasLive && !browser && !isLogHidden;
    const displayBrowser = browser || endedBrowser || { caps: capsForHar };
    const harFile = artifacts?.har || null;
    const showHar = Boolean(harFile || wantsHar(capsForHar));
    const vncEnabled = displayBrowser?.caps?.enableVNC !== false;
    const waitingForVideo = wasLive && !browser && vncEnabled && !artifacts?.video;
    const hasMediaColumn = (showLive && vncEnabled) || Boolean(artifacts?.video) || waitingForVideo;
    const hasLogColumn = showLive || keepLiveLog || (showFinished && !keepLiveLog && artifacts?.log);
    const showInteractive = hasMediaColumn || hasLogColumn;
    const showHarSlot = showHar && (showInteractive || showFinished);
    const showColdLoading = !showLive && !wasLive && artifactsStatus === "loading";
    const showNotFound =
        !showLive && !wasLive && (artifactsStatus === "missing" || artifactsStatus === "error");
    const showEndedNotFound = wasLive && !browser && artifactsStatus === "missing";

    return (
        <StyledSession data-testid="session-page">
            {showSessionInfo && (
                <SessionInfo
                    {...{
                        session,
                        browser: displayBrowser,
                        live: showLive,
                        wasLive,
                        finished: showFinished,
                        artifacts: artifacts || {},
                    }}
                />
            )}

            {showInteractive && (
                <div className="interactive">
                    {hasMediaColumn && (
                        <div className="session-interactive-card session-media-slot" data-testid="session-media-slot">
                            {showLive ? (
                                <VncContainer
                                    {...{
                                        origin,
                                        session,
                                        browser,
                                        onVNCFullscreenChange,
                                    }}
                                />
                            ) : artifacts?.video ? (
                                <SessionVideo file={artifacts.video} />
                            ) : (
                                <SessionVideoWaiting />
                            )}
                        </div>
                    )}
                    {hasLogColumn && (
                        <div className="session-interactive-card session-log-slot">
                            {keepLiveLog || showLive ? (
                                <Log
                                    {...{
                                        origin,
                                        session,
                                        browser: displayBrowser,
                                    }}
                                    className="session-peer"
                                    hidden={isLogHidden}
                                />
                            ) : (
                                <SessionLogFile file={artifacts.log} />
                            )}
                        </div>
                    )}
                </div>
            )}

            {showHarSlot && (
                <div className="session-har-slot">
                    <HarViewer
                        session={session}
                        browser={{ caps: { ...capsForHar, enableHAR: true } }}
                        sessionAlive={showLive}
                        file={harFile || undefined}
                    />
                </div>
            )}

            {showFinished && !showHar && (
                <div className="session-har-slot">
                    <div className="session-missing" data-testid="session-no-har">
                        No HAR
                    </div>
                </div>
            )}

            {showColdLoading && (
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

            {showNotFound && (
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

            {showEndedNotFound && (
                <Panel
                    title="Session"
                    testId="session-ended-missing-panel"
                    titleTestId="session-ended-missing-title"
                    className="session-missing-panel"
                    bodyClassName="session-missing-panel__body"
                >
                    <div className="no-any" data-testid="session-artifacts-not-found">
                        <span className="icon" title="No any" aria-hidden="true">
                            <IconHourglass />
                        </span>
                        <div className="nosession-any-text">ARTIFACTS NOT FOUND</div>
                    </div>
                </Panel>
            )}
        </StyledSession>
    );
};

export default Session;

function VncContainer({ origin, session, browser = {}, onVNCFullscreenChange }: any) {
    if (browser.caps && !browser.caps.enableVNC) {
        return <span />;
    }

    return (
        <VncCard
            {...{
                origin,
                session,
                browser,
                onVNCFullscreenChange,
            }}
        />
    );
}
