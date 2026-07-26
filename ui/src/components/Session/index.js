import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import SessionInfo from "./SessionInfo";
import VncCard from "../VncCard";
import Log from "../Log";
import HarViewer, { wantsHar } from "../HarViewer";
import { StyledSession } from "./style.css";

/**
 * The ref object is a generic container whose current property is mutable
 * and can hold any value, similar to an instance property on a class
 */
function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    return ref.current;
}

/** Keep Session mounted briefly after quit so HarViewer can poll the flushed /har file. */
const HAR_HOLD_MS = 20_000;

const Session = ({ origin, session, browser }) => {
    const navigate = useNavigate();
    const prevBrowser = usePrevious(browser);
    const [endedCaps, setEndedCaps] = useState(null);
    const holdTimer = useRef(null);

    useEffect(() => {
        if (browser?.caps && wantsHar(browser.caps)) {
            setEndedCaps(browser.caps);
        }
    }, [browser]);

    useEffect(() => {
        if (!(prevBrowser && !browser)) {
            return undefined;
        }
        const caps = endedCaps || prevBrowser.caps || {};
        if (wantsHar(caps)) {
            // Hold the page so the full-width HAR viewer can pick up the archive.
            holdTimer.current = setTimeout(() => navigate("/"), HAR_HOLD_MS);
            return () => {
                if (holdTimer.current) {
                    clearTimeout(holdTimer.current);
                }
            };
        }
        navigate("/");
        return undefined;
    }, [browser, navigate, prevBrowser, endedCaps]);

    const [isLogHidden, onVNCFullscreenChange] = useState(false);
    const capsForHar = browser?.caps || endedCaps || {};
    const sessionAlive = Boolean(browser);

    return (
        <StyledSession>
            <SessionInfo
                {...{
                    session,
                    browser: browser || { caps: capsForHar },
                }}
            />

            {(browser || wantsHar(capsForHar)) && (
                <>
                    {browser && (
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
                    )}
                    <div className="session-har-slot">
                        <HarViewer session={session} browser={{ caps: capsForHar }} sessionAlive={sessionAlive} />
                    </div>
                </>
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
