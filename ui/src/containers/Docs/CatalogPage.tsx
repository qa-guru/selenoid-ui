import React from "react";

import {
    CATALOG_EFFECTS,
    CATALOG_STEPS,
    CATALOG_VERSIONS_HREF,
    CATALOG_WATCH_HREF,
    CATALOG_WATCH_LABEL,
} from "./catalog";

const CatalogPage = () => {
    return (
        <div data-testid="docs-catalog">
            <h1>Catalog — new versions without restarting</h1>
            <p className="docs__lead">
                New Session shows whatever the hub currently has. A catalog update copies <code>browsers.json</code>,
                pulls the images, and sends <strong>SIGHUP</strong> to the hub. Running sessions stay. This UI is not
                restarted.
            </p>
            <p className="docs__meta">
                The version window is maintained in{" "}
                <a href={CATALOG_WATCH_HREF} target="_blank" rel="noreferrer">
                    {CATALOG_WATCH_LABEL}
                </a>{" "}
                (<code>pins.json</code>, watch). A UI or hub release tag is separate — watch does not set those. Version
                table:{" "}
                <a href={CATALOG_VERSIONS_HREF} target="_blank" rel="noreferrer">
                    selenoid/docs/browser-versions.md
                </a>
                .
            </p>

            <div className="docs__stats" data-testid="docs-catalog-stats">
                {CATALOG_STEPS.map((step, index) => (
                    <div
                        key={step.title}
                        className="docs__stat docs__stat--static"
                        data-testid={`docs-catalog-stat-${index + 1}`}
                    >
                        <span className="docs__stat-value">
                            {index + 1}. {step.title}
                        </span>
                        <span className="docs__stat-label">{step.stat}</span>
                    </div>
                ))}
            </div>

            <section className="docs__section">
                <div className="docs-diagram" data-testid="docs-catalog-steps">
                    <h2>On the host</h2>
                    <ol className="docs-seq">
                        {CATALOG_STEPS.map((step, index) => (
                            <li
                                key={step.title}
                                className="docs-seq__step"
                                data-testid={`docs-catalog-step-${index + 1}`}
                            >
                                <span className="docs-seq__n">{index + 1}</span>
                                <div className="docs-seq__body">
                                    <p className="docs-cell__human">{step.human}</p>
                                    <p className="docs-cell__tech">{step.tech}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <aside className="docs__callout" data-testid="docs-catalog-callout">
                <h2>This UI only watches the hub</h2>
                <p>
                    Protocol metadata is loaded once at UI start (<code>-browsers-conf</code>). The version list on New
                    Session comes from the hub status feed. Do not send SIGHUP to the UI.
                </p>
            </aside>

            <section className="docs__section">
                <h2>What stays</h2>
                <div className="docs__scroll">
                    <table className="docs__table docs__table--run" data-testid="docs-catalog-effects">
                        <thead>
                            <tr>
                                <th>What</th>
                                <th>After the catalog lands</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CATALOG_EFFECTS.map((row) => (
                                <tr key={row.label}>
                                    <th scope="row">{row.label}</th>
                                    <td>
                                        <div className="docs-cell">
                                            <p className="docs-cell__human">{row.human}</p>
                                            <p className="docs-cell__tech">{row.tech}</p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default CatalogPage;
