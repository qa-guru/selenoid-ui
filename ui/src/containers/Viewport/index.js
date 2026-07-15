import React, { useRef, useState } from "react";
import { HashRouter as Router, Route } from "react-router-dom";

import styled from "styled-components";
import { GlobalStyle, StyledViewport } from "./styles.css";

import "event-source-polyfill";

import { SelenoidAppHeader } from "../../components/SelenoidAppHeader";
import { FilterInput } from "../../components/FilterInput";
import Stats from "../../containers/Stats";
import Capabilities from "../../containers/Capabilities";
import Status from "../../components/Stats/Status";
import Sessions from "../../components/Sessions";
import Session from "../../components/Session";
import Videos from "../../components/Videos";
import Quota from "../../components/Stats/Quota";
import Queue from "../../components/Stats/Queue";
import Used from "../../components/Stats/Used";
import Separator from "../../components/Stats/Separator";
import { useUiFeed } from "../../hooks/useUiFeed";

const formatLastUpdateTitle = (version, lastUpdate) => {
    if (!lastUpdate) {
        return `Version: ${version}`;
    }

    const ago = Math.max(0, Math.round((Date.now() - lastUpdate) / 1000));
    return `Version: ${version}\nUpdated ${ago}s ago`;
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
        playwrightAccessKey,
        version,
        sseStatus,
        selenoidStatus,
        lastUpdate,
    } = useUiFeed();

    const statusTitle = formatLastUpdateTitle(version, lastUpdate);

    return (
        <>
            <SelenoidAppHeader videos={state.videos} />
            <GlobalStyle />
            <Router>
                <StatsBar>
                    <FilterInput
                        ref={select}
                        value={query}
                        onChange={(event) => onQuery(event.target.value)}
                        onClear={() => onQuery("")}
                    />

                    <Status status={sseStatus} header="sse" version={version} title={statusTitle} />
                    <Status status={selenoidStatus} header="selenoid" version={version} title={statusTitle} />

                    <Separator>&nbsp;</Separator>

                    <Used total={state.total} used={state.used} pending={state.pending} />
                    <Separator>&nbsp;</Separator>
                    <Queue queued={state.queued} />
                    <Separator>&nbsp;</Separator>
                    <Quota total={state.total} used={state.used} pending={state.pending} />
                </StatsBar>
                <StyledViewport>
                    <Route
                        exact={true}
                        path="/"
                        render={() => {
                            if (query) {
                                return null;
                            }
                            return (
                                <Stats
                                    {...{
                                        state,
                                        browsers,
                                    }}
                                />
                            );
                        }}
                    />

                    <Route exact={true} path="/" render={() => <Sessions sessions={sessions} query={query} />} />

                    <Route
                        exact={true}
                        path="/videos"
                        render={() => <Videos videos={state.videos || []} query={query} />}
                    />

                    <Route
                        exact={true}
                        path="/capabilities"
                        render={() => (
                            <Capabilities
                                browsers={state.browsers}
                                browserProtocols={browserProtocols}
                                sessions={sessions}
                                origin={origin}
                                playwrightAccessKey={playwrightAccessKey}
                            />
                        )}
                    />

                    <Route
                        path="/sessions/:session"
                        render={({ match }) => (
                            <Session
                                session={match.params.session}
                                origin={origin}
                                browser={sessions[match.params.session]}
                            />
                        )}
                    />
                </StyledViewport>
            </Router>
        </>
    );
};

export default Viewport;

const statsBgColor = "#272727";

const StatsBar = styled.div`
    height: 80px;
    background-color: ${statsBgColor};
    box-shadow: inset 0 -5px 5px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    overflow: auto;
    padding-left: 16px;
`;
