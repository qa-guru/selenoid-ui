import React from "react";

import {
    COMPARISON_HEADERS,
    COMPARISON_ROWS,
    FEATURE_HEADERS,
    FEATURE_ROWS,
    ONE_RUN_ROWS,
    POOL_STATS,
    type Dual,
} from "./pools";

function DualCell({ human, tech }: Dual) {
    return (
        <div className="docs-cell">
            <p className="docs-cell__human">{human}</p>
            <p className="docs-cell__tech">{tech}</p>
        </div>
    );
}

function Mark({ yes }: { yes: boolean }) {
    return (
        <span
            className={yes ? "docs-mark docs-mark--yes" : "docs-mark docs-mark--no"}
            aria-label={yes ? "Yes" : "No"}
        >
            {yes ? "✓" : "—"}
        </span>
    );
}

const Pools = () => {
    return (
        <>
            <h1>Cold · Warm · Hot — how the pools differ</h1>
            <p className="docs__lead">
                The same Java login test is measured in every column. Each cell has two sentences:
                first what a person sees, then how it works.
            </p>
            <p className="docs__meta">
                Times are for the login test with Allure reporting turned off, run from Jenkins, on
                15–16 August 2026. Playwright version is 1.61.1.
            </p>

            <div className="docs__stats" data-testid="docs-pool-stats">
                {POOL_STATS.map((stat) => (
                    <div
                        key={stat.label}
                        className="docs__stat"
                        data-tone={stat.tone}
                        data-testid={`docs-stat-${stat.label.split(" — ")[0].toLowerCase()}`}
                    >
                        <span className="docs__stat-value">{stat.value}</span>
                        <span className="docs__stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            <aside className="docs__callout" data-testid="docs-release-callout">
                <h2>Releasing a slot does not close Chrome</h2>
                <p>
                    After the test we tell the pool that the slot is free. In the cold pool the
                    browser is already gone together with its container. In the warm pool the
                    container stays up, but the window is closed — the next run opens a new session.
                    In the hot pool Chrome stays open; only the lock is cleared.
                </p>
            </aside>

            <section className="docs__section">
                <h2>What each pool has</h2>
                <p className="docs__hint">
                    A check means this pool has the feature or optimization. A dash means it does
                    not.
                </p>
                <div className="docs__scroll">
                    <table className="docs__table docs__table--marks" data-testid="docs-features">
                        <thead>
                            <tr>
                                {FEATURE_HEADERS.map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURE_ROWS.map((row) => (
                                <tr key={row.label}>
                                    <th scope="row">
                                        <span className="docs-feature__label">{row.label}</span>
                                        {row.detail ? (
                                            <span className="docs-feature__detail">{row.detail}</span>
                                        ) : null}
                                    </th>
                                    <td>
                                        <Mark yes={row.cold} />
                                    </td>
                                    <td>
                                        <Mark yes={row.warm} />
                                    </td>
                                    <td>
                                        <Mark yes={row.hot} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section">
                <h2>Comparison</h2>
                <div className="docs__scroll">
                    <table className="docs__table" data-testid="docs-comparison">
                        <thead>
                            <tr>
                                {COMPARISON_HEADERS.map((header) => (
                                    <th key={header || "row"}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row) => (
                                <tr key={row.label}>
                                    <th scope="row">{row.label}</th>
                                    <td>
                                        <DualCell {...row.cold} />
                                    </td>
                                    <td>
                                        <DualCell {...row.warm} />
                                    </td>
                                    <td>
                                        <DualCell {...row.hot} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs__section">
                <h2>One run, start to finish</h2>
                <div className="docs__scroll">
                    <table className="docs__table docs__table--run" data-testid="docs-one-run">
                        <thead>
                            <tr>
                                <th>Pool</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ONE_RUN_ROWS.map((row) => (
                                <tr key={row.pool}>
                                    <th scope="row">{row.pool}</th>
                                    <td>
                                        <DualCell {...row.cell} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <p className="docs__footnote">
                Compared with cold, warm is about five seconds faster and hot is about seven seconds
                faster. Do not compare Allure with few attachments against Allure with many
                attachments across pools: that extra time is the report, not the browser.
            </p>
        </>
    );
};

export default Pools;
