import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import BeatLoader from "react-spinners/BeatLoader";
import { Badge, Button, Panel } from "@zero-design-system/react";
import { deleteSession } from "../Sessions/service";
import { useDeleteSession } from "../SessionArchive/service";
import { sessionsListTo } from "../../lib/sessionNav";
import { isMockLiveSession, isMockSessionsEnabled } from "../../lib/mockSessions";
import { isManualSession, sessionBrowserName, sessionName } from "../../util/sessionIdentity";
import { SessionCapBadges, SessionIdentity } from "../SessionIdentity";

const SessionInfo = ({ session = "", browser = { caps: {} }, live = false, finished = false, artifacts = {} }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const backTo = sessionsListTo(location.search);
    const caps = browser.caps || {};
    const shortId = session ? session.substring(0, 8) : "";
    const [stopping, setStopping] = useState(false);
    const hasArtifacts = Boolean(artifacts.video || artifacts.log || artifacts.har);
    const canStop = Boolean(live && session);
    const canDelete = Boolean(session && !live && hasArtifacts);
    const starting = Boolean(live && browser.starting);
    const { name, displayName } = sessionName(caps);
    const showIdentity = Boolean(browser.quota || caps.browserName || caps.version || name);
    const manual = isManualSession(caps);

    useEffect(() => {
        if (!live) {
            setStopping(false);
        }
    }, [live]);

    const onDeleted = useCallback(() => {
        navigate(backTo);
    }, [navigate, backTo]);

    const [deleting, deleteArtifacts] = useDeleteSession({ id: session, ...artifacts }, onDeleted);

    const onStop = useCallback(() => {
        if (!canStop || stopping) {
            return;
        }
        setStopping(true);
        const mockOverlay = isMockSessionsEnabled() && isMockLiveSession(session);
        deleteSession(session)
            .then(() => {
                if (mockOverlay) {
                    navigate(backTo);
                }
            })
            .catch((e: any) => {
                console.error("Can't delete session", session, e);
                setStopping(false);
            });
    }, [session, canStop, stopping, navigate, backTo]);

    const onDelete = useCallback(() => {
        if (!canDelete || deleting) {
            return;
        }
        deleteArtifacts();
    }, [canDelete, deleting, deleteArtifacts]);

    return (
        <Panel
            variant="terminal"
            barChrome
            title="Session details"
            testId="session-info-panel"
            titleTestId="session-info-title"
            className="session-info-panel"
            bodyClassName="session-info-panel__body"
        >
            <div className="session-info">
                <div className={`session-info__main${manual ? " session_manual" : ""}`}>
                    <div className="session__id session-info__id" data-testid="session-info-id">
                        {shortId}
                    </div>
                    {showIdentity || starting ? (
                        <>
                            {starting ? (
                                <span className="session__quota session__quota_starting" title="Starting…">
                                    <BeatLoader size={4} color={"#fff"} loading />
                                </span>
                            ) : (
                                <span className="session__quota" title={browser.quota || undefined}>
                                    {browser.quota || "—"}
                                </span>
                            )}
                            {(sessionBrowserName(caps) || displayName) && (
                                <div className="session__fields">
                                    <SessionIdentity caps={caps} />
                                </div>
                            )}
                        </>
                    ) : null}

                    <div className="session-info__additional session__caps">
                        <SessionCapBadges caps={caps} artifacts={artifacts} />
                    </div>

                    <div className="session-info__actions">
                        {finished ? (
                            <Badge variant="primary" data-testid="session-finished">
                                FINISHED
                            </Badge>
                        ) : (
                            <Button
                                variant="danger"
                                disabled={!canStop || stopping}
                                onClick={onStop}
                                data-testid="session-stop"
                                aria-busy={stopping || undefined}
                            >
                                Stop session
                            </Button>
                        )}
                        <Button
                            variant="danger"
                            disabled={!canDelete || deleting}
                            onClick={onDelete}
                            data-testid="session-delete"
                            aria-busy={deleting || undefined}
                        >
                            Delete session
                        </Button>
                        <Link to={backTo} className="btn btn--secondary" data-testid="session-close">
                            Close session window
                        </Link>
                    </div>
                </div>
            </div>
        </Panel>
    );
};

export default SessionInfo;
