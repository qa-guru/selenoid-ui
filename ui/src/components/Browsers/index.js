import React from "react";

import PropTypes from "prop-types";
import { Panel } from "@zero-design-system/react";
import { StyledBrowsers } from "./style.css";
import Browser from "./Browser";

function descendingCount(browsers) {
    return Object.keys(browsers)
        .sort((a, b) => browsers[b] - browsers[a])
        .map((name) => ({
            name,
            used: browsers[name],
        }));
}

const Browsers = ({ totalUsed, browsers }) => {
    if (totalUsed === undefined) {
        return null;
    }

    return (
        <StyledBrowsers>
            <Panel
                title="Browsers"
                testId="browsers-panel"
                titleTestId="browsers-title"
                className="browsers-panel"
                bodyClassName="browsers-panel__body"
            >
                <div className="browsers-table-wrap">
                    <table className="browsers-table">
                        <thead>
                            <tr>
                                <th scope="col">Browser</th>
                                <th scope="col">Used</th>
                                <th scope="col">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {descendingCount(browsers).map((browser) => (
                                <Browser key={browser.name} totalUsed={totalUsed} {...browser} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </StyledBrowsers>
    );
};

Browsers.propTypes = {
    totalUsed: PropTypes.number,
    browsers: PropTypes.object.isRequired,
};

export default Browsers;
