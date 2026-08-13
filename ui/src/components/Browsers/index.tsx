import React from "react";

import { Panel } from "@zero-design-system/react";
import { StyledBrowsers } from "./style.css";
import Browser from "./Browser";

function descendingCount(browsers: any) {
    return Object.keys(browsers)
        .sort((a: any, b: any) => browsers[b] - browsers[a])
        .map((name: any) => ({
            name,
            used: browsers[name],
        }));
}

const Browsers = ({ totalUsed, browsers }: any) => {
    if (totalUsed === undefined) {
        return null;
    }

    return (
        <StyledBrowsers>
            <Panel
                title="Browser usage"
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
                            {descendingCount(browsers).map((browser: any) => (
                                <Browser key={browser.name} totalUsed={totalUsed} {...browser} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </StyledBrowsers>
    );
};

export default Browsers;
