import React from "react";

import {
    COMPARISON_HEADERS,
    COMPARISON_ROWS,
    ONE_RUN_ROWS,
    POOL_STATS,
    type Dual,
} from "./pools";
import { StyledDocs } from "./style.css";

function DualCell({ human, tech }: Dual) {
    return (
        <div className="docs-cell">
            <p className="docs-cell__human">{human}</p>
            <p className="docs-cell__tech">{tech}</p>
        </div>
    );
}

const Docs = () => {
    return (
        <StyledDocs data-testid="docs-page">
            <h1>Cold · Warm · Hot — how the pools differ</h1>
            <p className="docs__lead">
                Same Java login test in every column. Each cell: plain English first, then the
                mechanism.
            </p>
            <p className="docs__meta">
                Timing: login test, Allure off, Jenkins, 15–16 Aug 2026. Playwright 1.61.1.
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
                    After the test we tell the pool the slot is free. On cold the browser is already
                    gone with its container. On warm the container stays up, but the window is
                    closed — the next run opens a new session. On hot Chrome stays open; only the
                    lock is cleared.
                </p>
            </aside>

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
                Versus cold: warm is ~5 s faster, hot ~7 s. Do not compare Allure lite/heavy across
                pools — that cost is the report, not the browser.
            </p>
        </StyledDocs>
    );
};

export default Docs;
