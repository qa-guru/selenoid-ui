import React from "react";
import PropTypes from "prop-types";

import BeatLoader from "react-spinners/BeatLoader";
import { Badge } from "@zero-design-system/react";

const SessionInfo = ({ session = "", browser = { caps: {} } }) => {
    const caps = browser.caps || {};

    return (
        <div className="session-info">
            <div className="session-info__main">
                <div className="session-browser">
                    <BeatLoader size={5} color={"#fff"} loading={!browser.quota} />
                    <span className="session-browser__quota">{browser.quota}</span>
                    {browser.quota && <span className="session-browser__version-separator">/</span>}
                    <span className="session-browser__name">{caps.browserName}</span>
                    {caps.browserName && <span className="session-browser__version-separator">/</span>}
                    <span className="session-browser__version">{caps.version}</span>
                    {caps.version && caps.screenResolution && (
                        <span className="session-browser__version-separator">/</span>
                    )}
                    {caps.screenResolution && <Badge>{caps.screenResolution}</Badge>}
                </div>

                <div className="session-info__id">{session.substring(0, 8)}</div>
            </div>

            <div className="session-info__additional">
                <div className="custom-capabilities">{caps.name && <Badge>{caps.name}</Badge>}</div>
            </div>
        </div>
    );
};

SessionInfo.propTypes = {
    session: PropTypes.string,
    browser: PropTypes.shape({
        quota: PropTypes.string,
        caps: PropTypes.shape({
            browserName: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            screenResolution: PropTypes.string,
            name: PropTypes.string,
        }).isRequired,
    }),
};

export default SessionInfo;
