import React, { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import BeatLoader from "react-spinners/BeatLoader";

import { StyledArchive, StyledCard } from "./style.css";
import { IconTrash, Panel } from "@zero-design-system/react";
import { useDeleteSession } from "./service";
import { fetchSessionPage, SESSION_PAGE_SIZE } from "./api";
import { videoPreloadMode, sessionIdShort } from "../../util/sessionsLogic";

/** Empty-state hourglass — composition only; dripicons off. */
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

/** Link glyph for artifact download/open — dripicons off. */
function IconLink() {
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
            <path d="M6.5 9.5l3-3" />
            <path d="M7 11.5l-.7.7a3 3 0 0 1-4.2-4.2l.7-.7" />
            <path d="M9 4.5l.7-.7a3 3 0 0 1 4.2 4.2l-.7.7" />
        </svg>
    );
}

const SessionArchive = ({ query = "" }) => {
    const [page, setPage] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(SESSION_PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);
    // React 19 removed findDOMNode; CSSTransition needs an explicit nodeRef per item.
    const nodeRefs = useRef(new Map());
    const noAnyRef = useRef(null);
    const getNodeRef = (key) => {
        let ref = nodeRefs.current.get(key);
        if (!ref) {
            ref = React.createRef();
            nodeRefs.current.set(key, ref);
        }
        return ref;
    };

    useEffect(() => {
        setPage(0);
    }, [query]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchSessionPage({ page, q: query })
            .then((payload) => {
                if (cancelled) {
                    return;
                }
                setSessions(payload.sessions || []);
                setTotal(payload.total || 0);
                setLimit(payload.limit || SESSION_PAGE_SIZE);
            })
            .catch((err) => {
                console.error("Can't load sessions", err);
                if (!cancelled) {
                    setSessions([]);
                    setTotal(0);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [page, query, reloadToken]);

    const onDeleted = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    const preloadVal = videoPreloadMode(sessions.length);
    const pageCount = Math.max(1, Math.ceil(total / limit) || 1);
    const showPager = total > limit;

    return (
        <StyledArchive>
            <Panel
                title="Finished sessions"
                testId="archive-panel"
                titleTestId="archive-title"
                className="archive-panel"
                bodyClassName="archive-panel__body"
            >
                <TransitionGroup className="archive__list">
                    {sessions.length > 0 &&
                        sessions.map((session) => {
                            const nodeRef = getNodeRef(session.id);
                            return (
                                <CSSTransition
                                    key={session.id}
                                    nodeRef={nodeRef}
                                    timeout={500}
                                    classNames="archive__card_state"
                                    unmountOnExit
                                >
                                    <SessionCard
                                        ref={nodeRef}
                                        session={session}
                                        preload={preloadVal}
                                        onDeleted={onDeleted}
                                    />
                                </CSSTransition>
                            );
                        })}
                </TransitionGroup>

                {showPager && (
                    <div className="archive__pager" data-testid="archive-pager">
                        <button
                            type="button"
                            className="archive__pager-btn"
                            data-testid="archive-pager-prev"
                            disabled={page <= 0 || loading}
                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                        >
                            Prev
                        </button>
                        <span className="archive__pager-status" data-testid="archive-pager-status">
                            {page + 1} / {pageCount}
                        </span>
                        <button
                            type="button"
                            className="archive__pager-btn"
                            data-testid="archive-pager-next"
                            disabled={loading || (page + 1) * limit >= total}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}

                <CSSTransition
                    in={!loading && sessions.length === 0}
                    nodeRef={noAnyRef}
                    timeout={500}
                    exit={false}
                    classNames="no-any_state"
                    unmountOnExit
                >
                    <div ref={noAnyRef} className="no-any">
                        <span className="icon" title="No any" aria-hidden="true">
                            <IconHourglass />
                        </span>
                        <div className="nosession-any-text">NO FINISHED SESSIONS YET :'(</div>
                    </div>
                </CSSTransition>
            </Panel>
        </StyledArchive>
    );
};

const ArtifactLink = ({ href, label, testid }) => (
    <div className="control">
        <a href={href} className="icon-btn" title={label} aria-label={label} data-testid={testid}>
            <span className="icon" aria-hidden="true">
                <IconLink />
            </span>
        </a>
    </div>
);

const SessionCard = ({ session, preload, onDeleted, ref }) => {
    const [deleting, deleteSession] = useDeleteSession(session, onDeleted);
    const videoSrc = session.video ? `/video/${session.video}` : null;

    return (
        <StyledCard ref={ref} data-testid="session-card" data-session={session.id}>
            <div className="name" title={session.id}>
                {sessionIdShort(session.id)}
            </div>
            <div className="card__body">
                <div className="controls">
                    {session.video && <ArtifactLink href={videoSrc} label="Video" testid="session-video-link" />}
                    {session.log && (
                        <ArtifactLink href={`/logs/${session.log}`} label="Log" testid="session-log-link" />
                    )}
                    {session.har && <ArtifactLink href={`/har/${session.har}`} label="HAR" testid="session-har-link" />}
                    <div className="control">
                        <button
                            type="button"
                            className="icon-btn session-delete"
                            title="Delete session"
                            aria-label="Delete session"
                            data-testid="session-delete"
                            disabled={deleting}
                            onClick={deleteSession}
                        >
                            {deleting ? (
                                <BeatLoader size={2} color={"#fff"} />
                            ) : (
                                <span className="icon" aria-hidden="true">
                                    <IconTrash />
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <div className="content">
                    {videoSrc ? (
                        <video controls preload={preload} data-testid="session-video">
                            <source src={videoSrc} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="no-video" data-testid="session-no-video">
                            <span>No video</span>
                            {session.log && <span>log available</span>}
                            {session.har && <span>HAR available</span>}
                        </div>
                    )}
                </div>
            </div>
        </StyledCard>
    );
};

export default SessionArchive;
