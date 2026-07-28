import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { StyledSessions } from "./style.css";
import BeatLoader from "react-spinners/BeatLoader";

import { Badge, IconTrash, Panel } from "@zero-design-system/react";
import { useSessionDelete } from "./service";
import { matchesSessionQuery, sessionIdShort, sortSessionIds } from "../../util/sessionsLogic";

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

const Sessions = ({ sessions = {}, query = "" }) => {
    const ids = sortSessionIds(
        Object.keys(sessions).filter((id) => matchesSessionQuery(id, sessions, query)),
        sessions
    );
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

    return (
        <StyledSessions>
            <Panel
                title="Live sessions"
                testId="sessions-panel"
                titleTestId="sessions-title"
                className="sessions-panel"
                bodyClassName="sessions-panel__body"
            >
                <TransitionGroup className="sessions__list">
                    {ids.map((id) => {
                        const nodeRef = getNodeRef(id);
                        return (
                            <CSSTransition
                                key={id}
                                nodeRef={nodeRef}
                                timeout={500}
                                classNames="session_state"
                                unmountOnExit
                            >
                                <Session ref={nodeRef} id={id} session={sessions[id]} />
                            </CSSTransition>
                        );
                    })}
                </TransitionGroup>
                <CSSTransition
                    in={!ids.length}
                    nodeRef={noAnyRef}
                    timeout={500}
                    exit={false}
                    classNames="sessions__no-any_state"
                    unmountOnExit
                >
                    <div ref={noAnyRef} className="no-any">
                        <span className="icon" title="No any" aria-hidden="true">
                            <IconHourglass />
                        </span>
                        <div className="nosession-any-text">NO SESSIONS YET :'(</div>
                    </div>
                </CSSTransition>
            </Panel>
        </StyledSessions>
    );
};

const Session = ({ id, session: { quota, caps }, ref }) => {
    const [deleting, deleteSession] = useSessionDelete(id);
    const href = deleting ? `#` : `/sessions/${id}`;
    const manual = Boolean(caps.labels && caps.labels.manual);
    const name = caps.name || "";

    return (
        <div ref={ref} className={`session${manual ? " session_manual" : ""}`}>
            <Link to={href} className="link id session__id" title={id}>
                {sessionIdShort(id)}
            </Link>
            <span className="session__quota" title={quota || undefined}>
                {quota || "—"}
            </span>
            <Link className="link identity session__fields" to={href}>
                <span className="browser">
                    <span className="name">{caps.browserName}</span>
                    {caps.version && <span className="version">{caps.version}</span>}
                </span>
                <span className={`session-name${name ? "" : " session-name_empty"}`} title={name || undefined}>
                    {name || "—"}
                </span>
            </Link>

            <div className="session__caps">
                {manual && <Badge variant="primary">MANUAL</Badge>}
                {caps.enableVNC && <Badge variant="primary">VNC</Badge>}
                {caps.screenResolution && <span className="session__resolution">{caps.screenResolution}</span>}
            </div>
            <div className="session__actions">
                {manual && (
                    <button
                        type="button"
                        className="icon-btn session-delete"
                        title="Delete"
                        aria-label="Delete"
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
                )}
            </div>
        </div>
    );
};

export default Sessions;
