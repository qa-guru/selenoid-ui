import React from "react";

import { RESOURCE_SECTIONS, type ResourceLink } from "./resources";

function ResourceTable({
    id,
    title,
    hint,
    rows,
}: {
    id: string;
    title: string;
    hint: string;
    rows: ResourceLink[];
}) {
    return (
        <section className="docs__section">
            <h2>{title}</h2>
            <p className="docs__meta">{hint}</p>
            <div className="docs__scroll">
                <table className="docs__table docs__table--links" data-testid={`docs-resources-${id}`}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>What it is</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.href}>
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
        </section>
    );
}

const Resources = () => {
    return (
        <div data-testid="docs-resources">
            <h1>Resources</h1>
            <p className="docs__lead">
                GitHub repositories, Docker Hub images, live sites, and CI for the qa-guru Selenoid
                stack.
            </p>

            {RESOURCE_SECTIONS.map((section) => (
                <ResourceTable key={section.id} {...section} />
            ))}
        </div>
    );
};

export default Resources;
