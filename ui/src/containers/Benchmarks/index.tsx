import React, { useMemo, useState } from "react";

import perfDoc from "../../perf-benchmark/runs.json";
import type {
    BenchmarkFilters,
    ImageFlavor,
    Language,
    PerfBenchmarkDoc,
    PerfRun,
    Protocol,
    SuiteSize,
} from "../../perf-benchmark/types";
import {
    EMPTY_FILTERS,
    artifactsKey,
    cellTriple,
    filterRuns,
    findRun,
    fmt,
    uniqueSorted,
} from "./filter";
import { StyledBenchmarks } from "./style.css";

const doc = perfDoc as PerfBenchmarkDoc;

const PARALLEL_COLS = [1, 5, 10, 25] as const;
const SUITE_ROWS: SuiteSize[] = ["1", "few", "many"];
const PROTOCOLS: Protocol[] = ["webdriver", "playwright"];
const FLAVORS: ImageFlavor[] = ["warm", "min"];

const ARTIFACT_PRESETS: { key: string; label: string; match: (r: PerfRun) => boolean }[] = [
    {
        key: "none",
        label: "none",
        match: (r) => !r.artifacts.video && !r.artifacts.log && r.artifacts.har === "off",
    },
    {
        key: "log",
        label: "log",
        match: (r) => !r.artifacts.video && r.artifacts.log && r.artifacts.har === "off",
    },
    {
        key: "video",
        label: "video",
        match: (r) => r.artifacts.video && !r.artifacts.log && r.artifacts.har === "off",
    },
    {
        key: "har-meta",
        label: "har meta",
        match: (r) => !r.artifacts.video && !r.artifacts.log && r.artifacts.har === "meta",
    },
    {
        key: "har-bodies",
        label: "har bodies",
        match: (r) => !r.artifacts.video && !r.artifacts.log && r.artifacts.har === "bodies",
    },
    {
        key: "video+log",
        label: "video+log",
        match: (r) => r.artifacts.video && r.artifacts.log && r.artifacts.har === "off",
    },
    {
        key: "video+log+har-meta",
        label: "video+log+har meta",
        match: (r) => r.artifacts.video && r.artifacts.log && r.artifacts.har === "meta",
    },
    {
        key: "video+log+har-bodies",
        label: "video+log+har bodies",
        match: (r) => r.artifacts.video && r.artifacts.log && r.artifacts.har === "bodies",
    },
];

function JenkinsJobLink({ url }: { url?: string }) {
    if (!url) {
        return "—";
    }
    let label = "job";
    try {
        const path = new URL(url).pathname.replace(/\/+$/, "");
        const name = path.split("/").filter(Boolean).pop();
        if (name) {
            label = name
                .replace("autotests-ai-multistack-tests-pipeline-java-", "")
                .replace("autotests-ai-multistack-tests-pipeline-python-", "python-")
                .replace("autotests-ai-multistack-tests-pipeline-js-", "js-");
        }
    } catch {
        /* keep default */
    }
    return (
        <a href={url} target="_blank" rel="noreferrer">
            {label}
        </a>
    );
}

function JenkinsLoginTable({ runs }: { runs: PerfRun[] }) {
    const order = [
        "jenkins-java-wd-cold-1-p1-headless-none",
        "jenkins-java-wd-cold-1-p1-full-attachments",
        "jenkins-java-wd-warm-1-p1-none",
        "jenkins-java-wd-hot-1-p1-none",
        "jenkins-python-wd-cold-1-p1-headless-none",
        "jenkins-python-wd-cold-1-p1-full-attachments",
        "jenkins-python-wd-warm-1-p1-none",
        "jenkins-python-wd-hot-1-p1-none",
        "jenkins-js-pw-cold-1-p1-headless-none",
        "jenkins-js-pw-cold-1-p1-full-attachments",
        "jenkins-js-pw-warm-1-p1-none",
        "jenkins-js-pw-hot-1-p1-none",
    ];
    const byId = new Map(runs.map((r) => [r.id, r]));
    const rows = order.map((id) => byId.get(id)).filter((r): r is PerfRun => Boolean(r));
    if (!rows.length) {
        return null;
    }
    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-jenkins">
                <thead>
                    <tr>
                        <th>language</th>
                        <th>pool</th>
                        <th>variant</th>
                        <th>status</th>
                        <th>wall_s</th>
                        <th>artifacts</th>
                        <th>jenkins</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((run) => (
                        <tr key={run.id} data-status={run.status} data-run-id={run.id}>
                            <td>{run.language}</td>
                            <td>{run.pool}</td>
                            <td>{run.note ?? run.id}</td>
                            <td>{run.status}</td>
                            <td>{fmt(run.wall_time_s)}</td>
                            <td>{artifactsKey(run)}</td>
                            <td>
                                <JenkinsJobLink url={run.jenkins_url} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FilterSelect({
    label,
    name,
    value,
    options,
    onChange,
}: {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="benchmarks__filter" htmlFor={`bench-filter-${name}`}>
            {label}
            <select
                id={`bench-filter-${name}`}
                data-testid={`benchmarks-filter-${name}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">all</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

function CatalogTable({ runs }: { runs: PerfRun[] }) {
    if (!runs.length) {
        return <div className="benchmarks__empty">No runs match filters.</div>;
    }
    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-catalog">
                <thead>
                    <tr>
                        <th>measured_at</th>
                        <th>hub</th>
                        <th>language</th>
                        <th>protocol</th>
                        <th>browser</th>
                        <th>image</th>
                        <th>pool</th>
                        <th>tests</th>
                        <th>parallel</th>
                        <th>video</th>
                        <th>log</th>
                        <th>har</th>
                        <th>wall_s</th>
                        <th>cpu_peak%</th>
                        <th>ram_peak_mb</th>
                        <th>video_kb</th>
                        <th>log_kb</th>
                        <th>har_kb</th>
                        <th>total_kb</th>
                        <th>jenkins</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map((run) => (
                        <tr key={run.id} data-status={run.status} data-run-id={run.id}>
                            <td>{run.measured_at ?? "—"}</td>
                            <td>{run.versions.hub}</td>
                            <td>{run.language}</td>
                            <td>{run.protocol}</td>
                            <td>{run.browser}</td>
                            <td>{run.image_flavor}</td>
                            <td>{run.pool}</td>
                            <td>{run.tests_count}</td>
                            <td>{run.parallel}</td>
                            <td>{run.artifacts.video ? "yes" : "no"}</td>
                            <td>{run.artifacts.log ? "yes" : "no"}</td>
                            <td>{run.artifacts.har}</td>
                            <td>{fmt(run.wall_time_s)}</td>
                            <td>{fmt(run.cpu_peak_pct)}</td>
                            <td>{fmt(run.ram_peak_mb)}</td>
                            <td>{fmt(run.video_kb)}</td>
                            <td>{fmt(run.log_kb)}</td>
                            <td>{fmt(run.har_kb)}</td>
                            <td>{fmt(run.artifacts_total_kb)}</td>
                            <td>
                                <JenkinsJobLink url={run.jenkins_url} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ScaleParallelTable({ runs }: { runs: PerfRun[] }) {
    const base = runs.filter(
        (r) =>
            r.language === "go" &&
            r.protocol === "playwright" &&
            r.image_flavor === "warm" &&
            r.pool === "cold" &&
            artifactsKey(r) === "none"
    );
    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-scale">
                <thead>
                    <tr>
                        <th>suite \\ parallel</th>
                        {PARALLEL_COLS.map((p) => (
                            <th key={p}>×{p}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {SUITE_ROWS.map((suite) => (
                        <tr key={suite}>
                            <td>
                                {suite === "1" ? "1 test" : suite === "few" ? "few (10)" : "many (100)"}
                            </td>
                            {PARALLEL_COLS.map((p) => {
                                const run = findRun(
                                    base,
                                    (r) => r.suite_size === suite && r.parallel === p
                                );
                                return <td key={p}>{cellTriple(run)}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ProtocolImageTable({ runs }: { runs: PerfRun[] }) {
    const cold = runs.filter(
        (r) =>
            r.suite_size === "few" &&
            r.parallel === 5 &&
            r.pool === "cold" &&
            artifactsKey(r) === "none"
    );
    const warmPool = runs.filter(
        (r) =>
            r.suite_size === "few" &&
            r.parallel === 5 &&
            r.pool === "warm-pool" &&
            artifactsKey(r) === "none"
    );

    const grid = (source: PerfRun[], testid: string) => (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid={testid}>
                <thead>
                    <tr>
                        <th>protocol \\ image</th>
                        {FLAVORS.map((f) => (
                            <th key={f}>{f}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PROTOCOLS.map((protocol) => (
                        <tr key={protocol}>
                            <td>{protocol}</td>
                            {FLAVORS.map((flavor) => {
                                const run = findRun(
                                    source,
                                    (r) => r.protocol === protocol && r.image_flavor === flavor
                                );
                                if (!run) {
                                    return <td key={flavor}>—</td>;
                                }
                                return (
                                    <td key={flavor}>
                                        {fmt(run.wall_time_s)} · {fmt(run.session_create_p50_ms)} ·{" "}
                                        {fmt(run.cpu_peak_pct)} · {fmt(run.ram_peak_mb)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            <p className="benchmarks__hint">
                Fixed: suite=few, parallel=5, artifacts=none, pool=cold. Cell: wall_s · create_p50 ·
                cpu_peak% · ram_peak_mb
            </p>
            {grid(cold, "benchmarks-protocol-image")}
            <p className="benchmarks__hint" style={{ marginTop: 14 }}>
                Same grid for warm-pool (compare create_p50 / wall vs cold).
            </p>
            {grid(warmPool, "benchmarks-protocol-image-warmpool")}
        </>
    );
}

function ArtifactsCostTable({ runs }: { runs: PerfRun[] }) {
    const base = runs.filter(
        (r) =>
            r.language === "go" &&
            r.protocol === "webdriver" &&
            r.image_flavor === "warm" &&
            r.pool === "cold" &&
            r.suite_size === "1" &&
            r.parallel === 1
    );
    const noneRun = findRun(base, (r) => artifactsKey(r) === "none");
    const noneWall = noneRun?.wall_time_s;

    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-artifacts">
                <thead>
                    <tr>
                        <th>artifacts</th>
                        <th>wall_s</th>
                        <th>Δwall vs none</th>
                        <th>video_kb</th>
                        <th>log_kb</th>
                        <th>har_kb</th>
                        <th>total_kb</th>
                        <th>cpu_peak%</th>
                        <th>ram_peak_mb</th>
                    </tr>
                </thead>
                <tbody>
                    {ARTIFACT_PRESETS.map((preset) => {
                        const run = findRun(base, preset.match);
                        const delta =
                            run?.wall_time_s != null && noneWall != null
                                ? Math.round((run.wall_time_s - noneWall) * 100) / 100
                                : null;
                        return (
                            <tr key={preset.key} data-status={run?.status ?? "pending"}>
                                <td>{preset.label}</td>
                                <td>{fmt(run?.wall_time_s ?? null)}</td>
                                <td>{preset.key === "none" ? "0" : fmt(delta)}</td>
                                <td>{fmt(run?.video_kb ?? (run ? 0 : null))}</td>
                                <td>{fmt(run?.log_kb ?? (run ? 0 : null))}</td>
                                <td>{fmt(run?.har_kb ?? (run ? 0 : null))}</td>
                                <td>{fmt(run?.artifacts_total_kb ?? (run ? 0 : null))}</td>
                                <td>{fmt(run?.cpu_peak_pct ?? null)}</td>
                                <td>{fmt(run?.ram_peak_mb ?? null)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function LanguagesTable({ runs }: { runs: PerfRun[] }) {
    const base = runs.filter(
        (r) =>
            r.image_flavor === "warm" &&
            r.pool === "cold" &&
            r.suite_size === "few" &&
            r.parallel === 5 &&
            r.artifacts.video &&
            r.artifacts.log &&
            r.artifacts.har === "off"
    );
    const languages: Language[] = ["java", "kotlin", "go", "python", "js"];
    const rows = languages.flatMap((language) => {
        const matches = base.filter((r) => r.language === language);
        if (!matches.length) {
            return [{ language, run: undefined as PerfRun | undefined }];
        }
        return matches.map((run) => ({ language, run }));
    });

    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-languages">
                <thead>
                    <tr>
                        <th>language</th>
                        <th>protocol</th>
                        <th>wall_s</th>
                        <th>create_p50</th>
                        <th>cpu_peak%</th>
                        <th>ram_peak_mb</th>
                        <th>total_kb</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ language, run }, idx) => (
                        <tr key={`${language}-${run?.id ?? idx}`} data-status={run?.status ?? "pending"}>
                            <td>{language}</td>
                            <td>{run?.protocol ?? "—"}</td>
                            <td>{fmt(run?.wall_time_s ?? null)}</td>
                            <td>{fmt(run?.session_create_p50_ms ?? null)}</td>
                            <td>{fmt(run?.cpu_peak_pct ?? null)}</td>
                            <td>{fmt(run?.ram_peak_mb ?? null)}</td>
                            <td>{fmt(run?.artifacts_total_kb ?? null)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function VersionsTable({ runs }: { runs: PerfRun[] }) {
    const base = runs.filter(
        (r) =>
            r.language === "go" &&
            r.protocol === "playwright" &&
            r.image_flavor === "warm" &&
            r.pool === "cold" &&
            r.suite_size === "few" &&
            r.parallel === 5 &&
            r.artifacts.video &&
            r.artifacts.log &&
            r.artifacts.har === "off"
    );
    const byHub = new Map<string, PerfRun>();
    for (const run of base) {
        byHub.set(run.versions.hub, run);
    }
    const hubs = Array.from(byHub.keys()).sort((a, b) => a.localeCompare(b));

    return (
        <div className="benchmarks__scroll">
            <table className="benchmarks__table" data-testid="benchmarks-versions">
                <thead>
                    <tr>
                        <th>hub</th>
                        <th>ui</th>
                        <th>wall_s</th>
                        <th>create_p50</th>
                        <th>cpu_peak%</th>
                        <th>ram_peak_mb</th>
                        <th>total_kb</th>
                        <th>note</th>
                    </tr>
                </thead>
                <tbody>
                    {(hubs.length ? hubs : ["—"]).map((hub) => {
                        const run = byHub.get(hub);
                        return (
                            <tr key={hub} data-status={run?.status ?? "pending"}>
                                <td>{run?.versions.hub ?? hub}</td>
                                <td>{run?.versions.ui ?? "—"}</td>
                                <td>{fmt(run?.wall_time_s ?? null)}</td>
                                <td>{fmt(run?.session_create_p50_ms ?? null)}</td>
                                <td>{fmt(run?.cpu_peak_pct ?? null)}</td>
                                <td>{fmt(run?.ram_peak_mb ?? null)}</td>
                                <td>{fmt(run?.artifacts_total_kb ?? null)}</td>
                                <td>{run?.note ?? "—"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const Benchmarks = ({ data = doc }: { data?: PerfBenchmarkDoc }) => {
    const [filters, setFilters] = useState<BenchmarkFilters>(EMPTY_FILTERS);
    const runs = data.runs;

    const filtered = useMemo(() => filterRuns(runs, filters), [runs, filters]);

    const options = useMemo(
        () => ({
            language: uniqueSorted(runs.map((r) => r.language)),
            protocol: uniqueSorted(runs.map((r) => r.protocol)),
            image_flavor: uniqueSorted(runs.map((r) => r.image_flavor)),
            pool: uniqueSorted(runs.map((r) => r.pool)),
            suite_size: uniqueSorted(runs.map((r) => r.suite_size)),
            parallel: uniqueSorted(runs.map((r) => String(r.parallel))),
            hub: uniqueSorted(runs.map((r) => r.versions.hub)),
            artifacts: uniqueSorted(runs.map(artifactsKey)),
        }),
        [runs]
    );

    const set = (key: keyof BenchmarkFilters) => (value: string) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const harUrl =
        data.har_completeness_url ??
        "https://github.com/qa-guru/selenoid-tests/blob/main/docs/har-benchmark/MATRIX.md";

    return (
        <StyledBenchmarks data-testid="benchmarks-page">
            <h1>Benchmarks</h1>
            <p className="benchmarks__lead">
                Published performance runs: wall time, session create latency, host CPU/RAM, and
                artifact weights in KB. Values stay empty until a reference host is measured
                (status=pending).
            </p>

            <div className="benchmarks__filters" data-testid="benchmarks-filters">
                <FilterSelect
                    label="language"
                    name="language"
                    value={filters.language}
                    options={options.language}
                    onChange={set("language")}
                />
                <FilterSelect
                    label="protocol"
                    name="protocol"
                    value={filters.protocol}
                    options={options.protocol}
                    onChange={set("protocol")}
                />
                <FilterSelect
                    label="image"
                    name="image_flavor"
                    value={filters.image_flavor}
                    options={options.image_flavor}
                    onChange={set("image_flavor")}
                />
                <FilterSelect
                    label="pool"
                    name="pool"
                    value={filters.pool}
                    options={options.pool}
                    onChange={set("pool")}
                />
                <FilterSelect
                    label="suite"
                    name="suite_size"
                    value={filters.suite_size}
                    options={options.suite_size}
                    onChange={set("suite_size")}
                />
                <FilterSelect
                    label="parallel"
                    name="parallel"
                    value={filters.parallel}
                    options={options.parallel}
                    onChange={set("parallel")}
                />
                <FilterSelect
                    label="hub"
                    name="hub"
                    value={filters.hub}
                    options={options.hub}
                    onChange={set("hub")}
                />
                <FilterSelect
                    label="artifacts"
                    name="artifacts"
                    value={filters.artifacts}
                    options={options.artifacts}
                    onChange={set("artifacts")}
                />
            </div>

            <section className="benchmarks__section">
                <h2>0. Jenkins login-test</h2>
                <p className="benchmarks__hint">
                    One Java Selenide, Python Selenium, and JS Playwright login on{" "}
                    <a href="https://jenkins.qa.guru/" target="_blank" rel="noreferrer">
                        jenkins.qa.guru
                    </a>
                    : cold headless, cold full-attachments, warm hub-attach, hot stub.
                </p>
                <JenkinsLoginTable runs={runs} />
            </section>

            <section className="benchmarks__section">
                <h2>1. Catalog</h2>
                <p className="benchmarks__hint">All published runs (filterable).</p>
                <CatalogTable runs={filtered} />
            </section>

            <section className="benchmarks__section">
                <h2>2. Scale × Parallel</h2>
                <p className="benchmarks__hint">
                    Fixed: go · playwright · warm · cold · artifacts=none. Cell: wall_s / cpu_peak% /
                    ram_peak_mb
                </p>
                <ScaleParallelTable runs={filtered} />
            </section>

            <section className="benchmarks__section">
                <h2>3. Protocol × Image</h2>
                <ProtocolImageTable runs={filtered} />
            </section>

            <section className="benchmarks__section">
                <h2>4. Artifacts cost</h2>
                <p className="benchmarks__hint">
                    Fixed: go · webdriver · warm · cold · suite=1 · parallel=1. Weights in KB.
                </p>
                <ArtifactsCostTable runs={filtered} />
            </section>

            <section className="benchmarks__section">
                <h2>5. Languages</h2>
                <p className="benchmarks__hint">
                    Fixed: warm · cold · few · parallel=5 · video+log.
                </p>
                <LanguagesTable runs={filtered} />
            </section>

            <section className="benchmarks__section">
                <h2>6. Versions</h2>
                <p className="benchmarks__hint">
                    Fixed: go · playwright · warm · cold · few · parallel=5 · video+log.
                </p>
                <VersionsTable runs={filtered} />
            </section>

            <section className="benchmarks__section benchmarks__har" data-testid="benchmarks-har-link">
                <h2>7. HAR completeness</h2>
                <p className="benchmarks__hint">
                    Field-coverage scorecard (not wall time / KB). See MATRIX — do not mix with perf
                    metrics above.
                </p>
                <p>
                    <a href={harUrl} target="_blank" rel="noreferrer">
                        HAR completeness MATRIX
                    </a>
                </p>
            </section>
        </StyledBenchmarks>
    );
};

export default Benchmarks;
