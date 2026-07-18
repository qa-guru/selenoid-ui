import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { StyledSessions } from "./style.css";
import BeatLoader from "react-spinners/BeatLoader";

import styled from "styled-components";
import { useSessionDelete } from "./service";
import { matchesSessionQuery, sessionIdShort, sortSessionIds } from "../../util/sessionsLogic";

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
            <div className={`section-title section-title_hidden-${!!query}`}>Sessions</div>
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
                    <div title="No any" className="icon dripicons-hourglass" />
                    <div className="nosession-any-text">NO SESSIONS YET :'(</div>
                </div>
            </CSSTransition>
        </StyledSessions>
    );
};

const Session = ({ id, session: { quota, caps }, ref }) => {
    const [deleting, deleteSession] = useSessionDelete(id);

    return (
        <div ref={ref} className={`session ${(caps.labels && caps.labels.manual && "session_manual") || ""}`}>
            <SessionId>
                <span className="quota">{quota}</span> /{" "}
                <Link to={deleting ? `#` : `/sessions/${id}`} className="id">
                    {sessionIdShort(id)}
                </Link>
            </SessionId>
            <Link className="identity" to={deleting ? `#` : `/sessions/${id}`}>
                <div className="browser">
                    <span className="name">{caps.browserName}</span>
                    <span className="version">{caps.version}</span>
                </div>

                {caps.name && (
                    <div className="session-name" title={caps.name}>
                        {caps.name}
                    </div>
                )}
            </Link>

            <Capabilities>
                {caps.labels && caps.labels.manual && <span className="capability capability__manual">MANUAL</span>}
                {caps.enableVNC && <span className="capability">VNC</span>}
                {caps.screenResolution && (
                    <span className="capability  capability__resolution">{caps.screenResolution}</span>
                )}
            </Capabilities>
            <Actions>
                {caps.labels && caps.labels.manual && (
                    <div className="capability capability__session-delete" onClick={deleteSession}>
                        {deleting ? (
                            <BeatLoader size={2} color={"#fff"} />
                        ) : (
                            <span title="Delete" className="icon dripicons-trash" />
                        )}
                    </div>
                )}
            </Actions>
        </div>
    );
};

const primaryColor = "#fff";
const secondaryColor = "#aaa";

const SessionId = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-basis: 140px;
    padding-right: 5px;

    .quota {
        color: ${secondaryColor};
        margin-right: 3px;
    }

    .id {
        margin-left: 3px;
        text-decoration: none;
        color: ${primaryColor};
    }
`;

const Capabilities = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
`;

export default Sessions;
