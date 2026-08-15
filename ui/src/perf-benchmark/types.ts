export type Language = "java" | "go" | "python" | "js" | "kotlin";
export type Protocol = "webdriver" | "playwright";
export type ImageFlavor = "warm" | "min";
export type Pool = "cold" | "warm-pool" | "hot-pool";
export type SuiteSize = "1" | "few" | "many";
export type HarMode = "off" | "meta" | "bodies";
export type RunStatus = "ok" | "pending" | "failed" | "n/a" | "stub";
export type AllureVariant = "none" | "allure-lite" | "allure-heavy";

export type HostProfile = {
    cpu: string;
    cores: number;
    ram_gb: number;
    os: string;
    note?: string;
};

export type RunVersions = {
    hub: string;
    ui?: string;
    cm?: string;
    browser_image?: string;
};

export type RunArtifacts = {
    video: boolean;
    log: boolean;
    har: HarMode;
};

export type PerfRun = {
    id: string;
    status: RunStatus;
    measured_at: string | null;
    language: Language;
    protocol: Protocol;
    image_flavor: ImageFlavor;
    pool: Pool;
    suite_size: SuiteSize;
    tests_count: number;
    parallel: number;
    browser: string;
    artifacts: RunArtifacts;
    versions: RunVersions;
    host: HostProfile;
    wall_time_s: number | null;
    session_create_p50_ms: number | null;
    session_create_p95_ms: number | null;
    cpu_avg_pct: number | null;
    cpu_peak_pct: number | null;
    ram_avg_mb: number | null;
    ram_peak_mb: number | null;
    video_kb: number | null;
    log_kb: number | null;
    har_kb: number | null;
    artifacts_total_kb: number | null;
    passed: number | null;
    failed: number | null;
    note?: string;
    jenkins_url?: string;
};

export type PerfBenchmarkDoc = {
    version: number;
    har_completeness_url?: string;
    runs: PerfRun[];
};

export type BenchmarkFilters = {
    language: Language | "";
    protocol: Protocol | "";
    image_flavor: ImageFlavor | "";
    pool: Pool | "";
    suite_size: SuiteSize | "";
    parallel: string;
    hub: string;
    artifacts: string;
    status: RunStatus | "";
};
