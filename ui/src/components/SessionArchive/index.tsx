import React, { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import BeatLoader from "react-spinners/BeatLoader";

import { StyledArchive } from "./style.css";
import { IconTrash, Panel } from "@zero-design-system/react";
import { useDeleteSession } from "./service";
import {
    fetchSessionPage,
    SESSION_PAGE_SIZE,
    type SessionArchiveSortField,
    type SessionArchiveSortOrder,
} from "./api";
import { sessionIdShort } from "../../util/sessionsLogic";
import { buildArchiveSearchParams, parseArchiveUrlState, type ArchiveUrlState } from "./archiveUrlState";

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

function IconVideo() {
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
            <rect x="2.5" y="4" width="8" height="8" rx="1.5" />
            <path d="M10.5 7.25 13.5 5.5v5L10.5 8.75" />
        </svg>
    );
}

function IconLog() {
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
            <path d="M4 2.5h5l3 3v8H4z" />
            <path d="M9 2.5v3h3M6 8.5h4M6 11h3" />
        </svg>
    );
}

function IconHar() {
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
            <circle cx="8" cy="8" r="5.5" />
            <path d="M2.5 8h11M8 2.5c1.6 1.8 1.6 9.2 0 11M8 2.5c-1.6 1.8-1.6 9.2 0 11" />
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
        const mirrored = parseArchiveUrlState(
            buildArchiveSearchParams(new URLSearchParams(), listState)
        );
        const current = parseArchiveUrlState(searchParams);
        if (
            mirrored.sort === current.sort &&
            mirrored.order === current.order &&
            mirrored.page === current.page
        ) {
            return;
        }
        setSearchParams(
            Object.fromEntries(buildArchiveSearchParams(new URLSearchParams(), listState).entries()),
            { replace: true }
        );
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
                {/* No TransitionGroup: page swaps would stack exit+enter and double list height. */}
                <div className="archive__table-wrap">
                    <table className="archive__table" data-testid="archive-table">
                        <colgroup>
                            <col className="archive__col_id" />
                            <col className="archive__col_date" />
                            <col className="archive__col_duration" />
                            <col className="archive__col_quota" />
                            <col className="archive__col_name" />
                            <col className="archive__col_actions" />
                        </colgroup>
                        <thead data-testid="archive-head">
                            <tr>
                                <th scope="col" className="archive__col_id">
                                    <SortHeader
                                        label="Session"
                                        field="id"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                </th>
                                <th scope="col" className="archive__col_date">
                                    <SortHeader
                                        label="Finished"
                                        field="finished"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                </th>
                                <th scope="col" className="archive__col_duration">
                                    <SortHeader
                                        label="Duration"
                                        field="duration"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                </th>
                                <th scope="col" className="archive__col_quota">
                                    <SortHeader
                                        label="User"
                                        field="quota"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                </th>
                                <th scope="col" className="archive__col_name">
                                    <SortHeader
                                        label="Name"
                                        field="name"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                </th>
                                <th scope="col" className="archive__col_actions" aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session: any) => (
                                <SessionRow key={session.id} session={session} onDeleted={onDeleted} />
                            ))}
                        </tbody>
                    </table>
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
    const navigate = useNavigate();
    const [deleting, deleteSession] = useDeleteSession(session, onDeleted);
    const detailHref = `/sessions/${session.id}`;
    const name = session.name || "";
    const quota = session.quota || "";
    const dateLabel = formatSessionDate(session.finished || session.started);
    const durationLabel = formatDuration(session.started, session.finished);
    const hasArtifacts = Boolean(session.video || session.log || session.har);

    const openDetail = useCallback(() => {
        if (!deleting) {
            navigate(detailHref);
        }
    }, [deleting, detailHref, navigate]);

    const onRowKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTableRowElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDetail();
            }
        },
        [openDetail]
    );

    const stopRowAction = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
    }, []);

    return (
        <tr
            className="archive__row archive__row_clickable"
            data-testid="session-card"
            data-session={session.id}
            tabIndex={0}
            onClick={openDetail}
            onKeyDown={onRowKeyDown}
        >
            <td className="archive__col_id">
                <Link
                    to={detailHref}
                    className="archive__id archive__row-link"
                    data-testid="session-detail-link"
                    title={session.id}
                    onClick={stopRowAction}
                >
                    {sessionIdShort(session.id)}
                </Link>
            </td>
            <td className="archive__col_date">
                <span className="archive__date" data-testid="session-date">
                    {dateLabel}
                </span>
            </td>
            <td className="archive__col_duration">
                <span className="archive__duration" data-testid="session-duration">
                    {durationLabel}
                </span>
            </td>
            <td className="archive__col_quota">
                <span
                    className={`archive__quota${quota ? "" : " archive__quota_empty"}`}
                    data-testid="session-quota"
                    title={quota || undefined}
                >
                    {quota || "—"}
                </span>
            </td>
            <td className="archive__col_name">
                <span
                    className={`archive__name${name ? "" : " archive__name_empty"}`}
                    data-testid="session-name"
                    title={name || undefined}
                >
                    {name || "—"}
                </span>
            </td>
            <td className="archive__col_actions" onClick={stopRowAction}>
                <div className="archive__actions">
                <Link
                    to={detailHref}
                    className="archive__artifacts"
                    data-testid="session-detail-artifacts"
                    aria-label="Session artifacts"
                >
                    {session.video && (
                        <span className="archive__artifact-icon" title="VIDEO" data-testid="artifact-video">
                            <IconVideo />
                        </span>
                    )}
                    {session.log && (
                        <span className="archive__artifact-icon" title="LOG" data-testid="artifact-log">
                            <IconLog />
                        </span>
                    )}
                    {session.har && (
                        <span className="archive__artifact-icon" title="HAR" data-testid="artifact-har">
                            <IconHar />
                        </span>
                    )}
                    {!hasArtifacts && <span className="archive__empty-artifacts">—</span>}
                </Link>

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
            </td>
        </tr>
    );
};

export default SessionArchive;
