import React from "react";

import { RESOURCE_ROWS } from "./resources";

const Resources = () => {
    return (
        <div data-testid="docs-resources">
            <h1>Resources</h1>
            <p className="docs__lead">
                GitHub, Docker Hub, live sites, CI, and Sonar for the qa-guru Selenoid stack.
            </p>
            <div className="docs__scroll docs__scroll--hug">
                <table className="docs__table docs__table--links" data-testid="docs-resources-table">
                    <thead>
                        <tr>
                            <th>Kind</th>
                            <th>Name</th>
                            <th>What it is</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCE_ROWS.map((row) => (
                            <tr key={row.href}>
                                <td className="docs-resource__kind">{row.kind}</td>
                                <th scope="row">
                                    <a href={row.href} target="_blank" rel="noreferrer">
                                        {row.name}
                                    </a>
                                </th>
                                <td>{row.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Resources;
