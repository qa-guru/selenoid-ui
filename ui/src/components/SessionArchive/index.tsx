import React, { useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import BeatLoader from "react-spinners/BeatLoader";

import { StyledArchive } from "./style.css";
import { IconTrash, Panel } from "@zero-design-system/react";
import { useDeleteSession } from "./service";
import { fetchSessionPage, SESSION_PAGE_SIZE } from "./api";
import type { SessionArchiveSortField, SessionArchiveSortOrder } from "./api";
import { sessionIdShort } from "../../util/sessionsLogic";
import { sessionDetailTo } from "../../lib/sessionNav";
import { capsFromArchiveSession, hasSessionIdentity } from "../../util/sessionIdentity";
import { SessionCapBadges, SessionIdentity } from "../SessionIdentity";
import { buildArchiveSearchParams, parseArchiveUrlState } from "./archiveUrlState";
import type { ArchiveUrlState } from "./archiveUrlState";

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

function pad2(value: any) {
    return String(value).padStart(2, "0");
}

function formatSessionDate(value: any) {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatDuration(started: any, finished: any) {
    if (!started || !finished) {
        return "";
    }
    const ms = Number(new Date(finished)) - Number(new Date(started));
    if (!(ms >= 0) || Number.isNaN(ms)) {
        return "";
    }
    const totalSec = Math.round(ms / 1000);
    if (totalSec < 60) {
        return `${totalSec}s`;
    }
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    if (minutes < 60) {
        return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

const SessionArchive = ({ query = "" }: any) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listState, setListState] = React.useState<ArchiveUrlState>(() => parseArchiveUrlState(searchParams));
    const { sort: sortBy, order: sortOrder, page } = listState;
    const [sessions, setSessions] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [limit, setLimit] = React.useState(SESSION_PAGE_SIZE);
    const [loading, setLoading] = React.useState(true);
    const [reloadToken, setReloadToken] = React.useState(0);
    const noAnyRef = useRef(null);
    const queryRef = useRef(query);

    useEffect(() => {
        setListState(parseArchiveUrlState(searchParams));
    }, [searchParams]);

    useEffect(() => {
        if (import.meta.env.MODE === "test") {
            return;
        }
        const mirrored = parseArchiveUrlState(buildArchiveSearchParams(new URLSearchParams(), listState));
        const current = parseArchiveUrlState(searchParams);
        if (mirrored.sort === current.sort && mirrored.order === current.order && mirrored.page === current.page) {
            return;
        }
        setSearchParams(Object.fromEntries(buildArchiveSearchParams(new URLSearchParams(), listState).entries()), {
            replace: true,
        });
    }, [listState, searchParams, setSearchParams]);

    const patchListState = useCallback((patch: Partial<ArchiveUrlState>) => {
        setListState((current) => ({ ...current, ...patch }));
    }, []);

    useEffect(() => {
        if (queryRef.current !== query) {
            queryRef.current = query;
            patchListState({ page: 0 });
        }
    }, [query, patchListState]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchSessionPage({ page, q: query, sort: sortBy, order: sortOrder })
            .then((payload: any) => {
                if (cancelled) {
                    return;
                }
                setSessions(payload.sessions || []);
                setTotal(payload.total || 0);
                setLimit(payload.limit || SESSION_PAGE_SIZE);
            })
            .catch((err: any) => {
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
    }, [page, query, reloadToken, sortBy, sortOrder]);

    const onSort = useCallback((field: SessionArchiveSortField) => {
        setListState((current) => {
            if (current.sort === field) {
                return {
                    ...current,
                    order: current.order === "asc" ? "desc" : "asc",
                    page: 0,
                };
            }
            return {
                sort: field,
                order: field === "finished" || field === "duration" ? "desc" : "asc",
                page: 0,
            };
        });
    }, []);

    const onDeleted = useCallback(() => {
        setReloadToken((token: any) => token + 1);
    }, []);

    const setPage = useCallback((nextPage: number | ((current: number) => number)) => {
        setListState((current) => {
            const resolved = typeof nextPage === "function" ? nextPage(current.page) : nextPage;
            return { ...current, page: Math.max(0, resolved) };
        });
    }, []);

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
                <div className="archive__sort-bar" data-testid="archive-sort">
                    <SortHeader label="Session" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                    <SortHeader
                        label="Finished"
                        field="finished"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortHeader
                        label="Duration"
                        field="duration"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={onSort}
                    />
                    <SortHeader label="User" field="quota" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                    <SortHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                </div>
                {/* No TransitionGroup: page swaps would stack exit+enter and double list height. */}
                <div className="archive__list" data-testid="archive-list">
                    {sessions.map((session: any) => (
                        <SessionRow key={session.id} session={session} onDeleted={onDeleted} />
                    ))}
                </div>

                {showPager && (
                    <div className="archive__pager" data-testid="archive-pager">
                        <button
                            type="button"
                            className="archive__pager-btn"
                            data-testid="archive-pager-prev"
                            disabled={page <= 0 || loading}
                            onClick={() => setPage((current: any) => Math.max(0, current - 1))}
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
                            onClick={() => setPage((current: any) => current + 1)}
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

const SortHeader = ({
    label,
    field,
    sortBy,
    sortOrder,
    onSort,
}: {
    label: string;
    field: SessionArchiveSortField;
    sortBy: SessionArchiveSortField;
    sortOrder: SessionArchiveSortOrder;
    onSort: (field: SessionArchiveSortField) => void;
}) => {
    const active = sortBy === field;
    return (
        <button
            type="button"
            className="archive__sort"
            data-testid={`archive-sort-${field}`}
            aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
            onClick={() => onSort(field)}
        >
            {label}
        </button>
    );
};

const SessionRow = ({ session, onDeleted }: any) => {
    const [searchParams] = useSearchParams();
    const [deleting, deleteSession] = useDeleteSession(session, onDeleted);
    const detailTo = sessionDetailTo(session.id, searchParams.toString());
    const caps = capsFromArchiveSession(session);
    const quota = session.quota || "";
    const dateLabel = formatSessionDate(session.finished || session.started);
    const durationLabel = formatDuration(session.started, session.finished);
    const identity = hasSessionIdentity(caps);

    return (
        <div className="session" data-testid="session-card" data-session={session.id}>
            <Link to={detailTo} className="link id session__id" data-testid="session-detail-link" title={session.id}>
                {sessionIdShort(session.id)}
            </Link>
            <span className="session__quota" data-testid="session-quota" title={quota || undefined}>
                {quota || "—"}
            </span>
            {identity ? (
                <Link className="link identity session__fields" to={detailTo}>
                    <SessionIdentity caps={caps} />
                </Link>
            ) : (
                <span className="session__fields" />
            )}
            {dateLabel || durationLabel ? (
                <span className="session__meta">
                    {dateLabel ? (
                        <span className="session__date" data-testid="session-date">
                            {dateLabel}
                        </span>
                    ) : null}
                    {durationLabel ? (
                        <span className="session__duration" data-testid="session-duration">
                            {durationLabel}
                        </span>
                    ) : null}
                </span>
            ) : null}

            <div className="session__caps">
                <SessionCapBadges artifacts={{ video: session.video, log: session.log, har: session.har }} />
            </div>
            <div className="session__actions">
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
    );
};

export default SessionArchive;
