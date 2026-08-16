import React from "react";

import { RESOURCE_SERVICES, type ResourceRef } from "./resources";

function ExtLink({ link }: { link?: ResourceRef }) {
    if (!link) {
        return <span className="docs-resource__empty">—</span>;
    }
    return (
        <a href={link.href} target="_blank" rel="noreferrer">
            {link.label}
        </a>
    );
}

const Resources = () => {
    return (
        <div data-testid="docs-resources">
            <h1>Resources</h1>
            <p className="docs__lead">qa-guru Selenoid stack — GitHub, Docker Hub, live sites, and Sonar.</p>
            <div className="docs__scroll">
                <table className="docs__table docs__table--links" data-testid="docs-resources-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>GitHub</th>
                            <th>Docker Hub</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCE_SERVICES.map((row) => (
                            <tr key={`${row.name}-${row.href ?? row.github?.href ?? row.dockerHub?.href}`}>
                                <th scope="row">
                                    {row.href ? (
                                        <a href={row.href} target="_blank" rel="noreferrer">
                                            {row.name}
                                        </a>
                                    ) : (
                                        row.name
                                    )}
                                </th>
                                <td>
                                    <ExtLink link={row.github} />
                                </td>
                                <td>
                                    <ExtLink link={row.dockerHub} />
                                </td>
                                <td>
                                    {row.comment}
                                    {row.sonar ? (
                                        <>
                                            {" · "}
                                            <ExtLink link={row.sonar} />
                                        </>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Resources;
