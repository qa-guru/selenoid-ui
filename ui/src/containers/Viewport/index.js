import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Route, Routes, useParams } from "react-router-dom";

import { GlobalStyle, StyledViewport } from "./styles.css";

import "event-source-polyfill";

import { FilterInput } from "../../components/FilterInput";
import HeaderStats from "../../components/HeaderStats";
import Stats from "../../containers/Stats";
import Capabilities from "../../containers/Capabilities";
import Sessions from "../../components/Sessions";
import Session from "../../components/Session";
import Videos from "../../components/Videos";
import { useUiFeed } from "../../hooks/useUiFeed";
import { useHeaderSlot } from "../../hooks/useHeaderSlot";

const formatLastUpdateTitle = (version, lastUpdate) => {
    if (!lastUpdate) {
        return `Version: ${version}`;
    }

    const ago = Math.max(0, Math.round((Date.now() - lastUpdate) / 1000));
    return `Version: ${version}\nUpdated ${ago}s ago`;
};

const SessionRoute = ({ origin, sessions }) => {
    const { session } = useParams();
    return <Session session={session} origin={origin} browser={sessions[session]} />;
};

const Viewport = () => {
    const [query, onQuery] = useState("");
    const select = useRef(null);

    const {
        origin,
        state,
        browsers,
        sessions,
        browserProtocols,
        accessKey,
        version,
        sseStatus,
        selenoidStatus,
        lastUpdate,
    } = useUiFeed();

    const statusTitle = formatLastUpdateTitle(version, lastUpdate);

    // Single-row header: the filter lives in the canonical `.header__search`
    // slot and the live stats in `.header__slot`, both rendered by js/header.js.
    const searchSlot = useHeaderSlot(".header__search", { clear: true });
    const statsSlot = useHeaderSlot(".header__slot", { clear: true });

    return (
        <>
            <GlobalStyle />

            {searchSlot &&
                createPortal(
                    <FilterInput
                        ref={select}
                        value={query}
                        onChange={(event) => onQuery(event.target.value)}
                        onClear={() => onQuery("")}
                    />,
                    searchSlot
                )}

            {statsSlot &&
                createPortal(
                    <HeaderStats
                        state={state}
                        sseStatus={sseStatus}
                        selenoidStatus={selenoidStatus}
                        version={version}
                        statusTitle={statusTitle}
                    />,
                    statsSlot
                )}

            <StyledViewport>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                {query ? null : (
                                    <Stats
                                        {...{
                                            state,
                                            browsers,
                                        }}
                                    />
                                )}
                                <Sessions sessions={sessions} query={query} />
                            </>
                        }
                    />

                    <Route path="/videos" element={<Videos query={query} />} />

                    <Route
                        path="/capabilities"
                        element={
                            <Capabilities
                                browsers={state.browsers}
                                browserProtocols={browserProtocols}
                                sessions={sessions}
                                origin={origin}
                                accessKey={accessKey}
                            />
                        }
                    />

                    <Route path="/sessions/:session" element={<SessionRoute origin={origin} sessions={sessions} />} />
                </Routes>
            </StyledViewport>
        </>
    );
};

export default Viewport;
