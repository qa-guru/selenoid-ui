import type { BenchmarkFilters, PerfRun } from "../../perf-benchmark/types";

export const EMPTY_FILTERS: BenchmarkFilters = {
    language: "",
    protocol: "",
    image_flavor: "",
    pool: "",
    suite_size: "",
    parallel: "",
    hub: "",
    artifacts: "",
};

export function artifactsKey(run: PerfRun): string {
    const parts: string[] = [];
    if (run.artifacts.video) {
        parts.push("video");
    }
    if (run.artifacts.log) {
        parts.push("log");
    }
    if (run.artifacts.har === "meta") {
        parts.push("har-meta");
    } else if (run.artifacts.har === "bodies") {
        parts.push("har-bodies");
    }
    return parts.length ? parts.join("+") : "none";
}

export function filterRuns(runs: PerfRun[], filters: BenchmarkFilters): PerfRun[] {
    return runs.filter((run) => {
        if (filters.language && run.language !== filters.language) {
            return false;
        }
        if (filters.protocol && run.protocol !== filters.protocol) {
            return false;
        }
        if (filters.image_flavor && run.image_flavor !== filters.image_flavor) {
            return false;
        }
        if (filters.pool && run.pool !== filters.pool) {
            return false;
        }
        if (filters.suite_size && run.suite_size !== filters.suite_size) {
            return false;
        }
        if (filters.parallel && String(run.parallel) !== filters.parallel) {
            return false;
        }
        if (filters.hub && run.versions.hub !== filters.hub) {
            return false;
        }
        if (filters.artifacts && artifactsKey(run) !== filters.artifacts) {
            return false;
        }
        return true;
    });
}

export function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort();
}

export function fmt(value: number | null | undefined, suffix = ""): string {
    if (value === null || value === undefined) {
        return "—";
    }
    return `${value}${suffix}`;
}

export function cellTriple(run: PerfRun | undefined): string {
    if (!run) {
        return "—";
    }
    return `${fmt(run.wall_time_s)} / ${fmt(run.cpu_peak_pct)} / ${fmt(run.ram_peak_mb)}`;
}

export function findRun(
    runs: PerfRun[],
    predicate: (run: PerfRun) => boolean
): PerfRun | undefined {
    return runs.find(predicate);
}
