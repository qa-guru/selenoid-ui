import React from "react";

import {
    DAEMON_ROWS,
    ENDPOINTS,
    LIFECYCLE_ROWS,
    REASON_ROWS,
    RESPONSE_FIELDS,
    SELECTOR_FORMS,
    SELECTOR_ROWS,
    STATUS_ROWS,
} from "./poolApi";

const PoolApiPage = () => {
    return (
        <div data-testid="docs-pool-api">
            <h1>Pool API — the exact contract</h1>
            <p className="docs__lead">
                How a client picks cold / warm / hot, what the orchestrator (selenoid-pool:9090) answers, and what the
                hub adds to the New Session response. Request and response bodies below are verbatim.
            </p>
            <p className="docs__meta">
                Warm reservations go through the hub&apos;s <code>/session</code> flow; hot slots are leased directly
                from the orchestrator and never touch the hub.
            </p>

            <section className="docs__section" data-testid="docs-pool-selector">
                <h2>Picking a pool: the selector</h2>
                <p className="docs__hint">
                    Send one of these in the session capabilities — <code>selenoid:options.pool</code> wins over{" "}
                    <code>labels.pool</code> when both are present:
                </p>
                <div className="docs-pipeline">
                    {SELECTOR_FORMS.map((form) => (
                        <article key={form} className="docs-pipeline__item">
                            <h3>{form}</h3>
                        </article>
                    ))}
                </div>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-selector-table">
                        <thead>
                            <tr>
                                <th>pool=</th>
                                <th>What happens</th>
                                <th>Contract</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SELECTOR_ROWS.map((row) => (
                                <tr key={row.value}>
                                    <th scope="row">{row.value}</th>
                                    <td>{row.behavior}</td>
                                    <td>{row.detail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section" data-testid="docs-pool-response">
                <h2>What the session response tells you</h2>
                <p className="docs__hint">
                    The hub stamps the actual routing into <code>value.capabilities</code> — no more guessing which pool
                    served the session:
                </p>
                <pre className="docs-excerpt" data-testid="docs-response-excerpt">
                    <code>{RESPONSE_FIELDS}</code>
                </pre>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-reason-table">
                        <thead>
                            <tr>
                                <th>forcedPoolReason</th>
                                <th>When it shows up</th>
                            </tr>
                        </thead>
                        <tbody>
                            {REASON_ROWS.map((row) => (
                                <tr key={row.token}>
                                    <th scope="row">
                                        <code>{row.token}</code>
                                    </th>
                                    <td>{row.when}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section" data-testid="docs-pool-endpoints">
                <h2>Orchestrator endpoints</h2>
                <div className="docs-pipeline">
                    {ENDPOINTS.map((ep) => (
                        <article key={ep.path} className="docs-pipeline__item" data-testid={`docs-endpoint-${ep.path.split("/").pop()}`}>
                            <h3>
                                {ep.method} {ep.path}
                            </h3>
                            <p className="docs-cell__human">{ep.summary}</p>
                            <pre className="docs-excerpt">
                                <code>{ep.request}</code>
                            </pre>
                            <pre className="docs-excerpt">
                                <code>{ep.response}</code>
                            </pre>
                            <ul className="docs-cell__tech">
                                {ep.notes.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            <section className="docs__section" data-testid="docs-pool-lifecycle">
                <h2>Lease TTL, reaper and warm recycle</h2>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-lifecycle-table">
                        <thead>
                            <tr>
                                <th>config.hub.yaml</th>
                                <th>value</th>
                                <th>effect</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LIFECYCLE_ROWS.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row">
                                        <code>{row.key}</code>
                                    </th>
                                    <td>{row.value}</td>
                                    <td>{row.effect}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section" data-testid="docs-pool-status">
                <h2>What /status exposes</h2>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-status-table">
                        <thead>
                            <tr>
                                <th>field</th>
                                <th>shape</th>
                                <th>meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STATUS_ROWS.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row">
                                        <code>{row.key}</code>
                                    </th>
                                    <td>{row.value}</td>
                                    <td>{row.effect}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section" data-testid="docs-pool-daemons">
                <h2>Hot daemons</h2>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-daemons-table">
                        <thead>
                            <tr>
                                <th>daemon</th>
                                <th>what it does</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DAEMON_ROWS.map((row) => (
                                <tr key={row.name}>
                                    <th scope="row">{row.name}</th>
                                    <td>{row.detail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default PoolApiPage;
