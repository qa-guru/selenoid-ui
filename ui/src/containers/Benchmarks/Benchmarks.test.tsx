import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PerfBenchmarkDoc } from "../../perf-benchmark/types";
import Benchmarks from "./index";

const fixture: PerfBenchmarkDoc = {
    version: 1,
    har_completeness_url:
        "https://github.com/qa-guru/selenoid-tests/blob/main/docs/har-benchmark/MATRIX.md",
    runs: [
        {
            id: "fixture-go-pw-warm-few-p5-none",
            status: "ok",
            measured_at: "2026-07-31T12:00:00Z",
            language: "go",
            protocol: "playwright",
            image_flavor: "warm",
            pool: "cold",
            suite_size: "few",
            tests_count: 10,
            parallel: 5,
            browser: "playwright-chromium/1.61.1",
            artifacts: { video: false, log: false, har: "off" },
            versions: { hub: "3.0.5", ui: "3.0.14", cm: "3.0.1", browser_image: "1.61.1" },
            host: { cpu: "test-cpu", cores: 8, ram_gb: 32, os: "Debian 12" },
            wall_time_s: 42.5,
            session_create_p50_ms: 800,
            session_create_p95_ms: 1200,
            cpu_avg_pct: 35,
            cpu_peak_pct: 72,
            ram_avg_mb: 4100,
            ram_peak_mb: 6200,
            video_kb: 0,
            log_kb: 0,
            har_kb: 0,
            artifacts_total_kb: 0,
            passed: 10,
            failed: 0,
        },
        {
            id: "fixture-go-wd-warm-1-p1-har-meta",
            status: "ok",
            measured_at: "2026-07-31T12:05:00Z",
            language: "go",
            protocol: "webdriver",
            image_flavor: "warm",
            pool: "cold",
            suite_size: "1",
            tests_count: 1,
            parallel: 1,
            browser: "chrome/149.0",
            artifacts: { video: false, log: false, har: "meta" },
            versions: { hub: "3.0.5", ui: "3.0.14", cm: "3.0.1", browser_image: "149" },
            host: { cpu: "test-cpu", cores: 8, ram_gb: 32, os: "Debian 12" },
            wall_time_s: 8.2,
            session_create_p50_ms: 900,
            session_create_p95_ms: 1100,
            cpu_avg_pct: 20,
            cpu_peak_pct: 40,
            ram_avg_mb: 1800,
            ram_peak_mb: 2200,
            video_kb: 0,
            log_kb: 0,
            har_kb: 48,
            artifacts_total_kb: 48,
            passed: 1,
            failed: 0,
        },
    ],
};

describe("Benchmarks", () => {
    it("renders Catalog rows from fixture JSON", () => {
        render(<Benchmarks data={fixture} />);

        expect(screen.getByTestId("benchmarks-page")).toBeInTheDocument();
        const catalog = screen.getByTestId("benchmarks-catalog");
        expect(catalog.querySelector('[data-run-id="fixture-go-pw-warm-few-p5-none"]')).not.toBeNull();
        expect(within(catalog).getByText("42.5")).toBeInTheDocument();
        expect(within(catalog).getAllByText("48").length).toBeGreaterThanOrEqual(1);
        expect(within(catalog).getByText("playwright-chromium/1.61.1")).toBeInTheDocument();
        expect(within(catalog).getAllByText("3.0.5").length).toBeGreaterThanOrEqual(1);
    });

    it("links HAR completeness MATRIX without embedding scorecard", () => {
        render(<Benchmarks data={fixture} />);

        const section = screen.getByTestId("benchmarks-har-link");
        const link = within(section).getByRole("link", { name: /HAR completeness MATRIX/i });
        expect(link).toHaveAttribute("href", fixture.har_completeness_url);
        expect(section).not.toHaveTextContent("withContentText");
    });

    it("renders Jenkins login-test rows with job links", () => {
        const withJobs: PerfBenchmarkDoc = {
            ...fixture,
            runs: [
                {
                    ...fixture.runs[0],
                    id: "jenkins-java-wd-warm-1-p1-none",
                    language: "java",
                    pool: "warm-pool",
                    jenkins_url:
                        "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool/",
                    note: "hub-attach",
                    wall_time_s: 4.216,
                },
            ],
        };
        render(<Benchmarks data={withJobs} />);
        const table = screen.getByTestId("benchmarks-jenkins");
        expect(table.querySelector('[data-run-id="jenkins-java-wd-warm-1-p1-none"]')).not.toBeNull();
        const link = within(table).getByRole("link", { name: "warm-pool" });
        expect(link).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool/"
        );
        expect(within(table).getByText("java")).toBeInTheDocument();
    });

    it("exposes filter controls for shared axes", () => {
        render(<Benchmarks data={fixture} />);

        expect(screen.getByTestId("benchmarks-filter-language")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-filter-protocol")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-filter-artifacts")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-scale")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-artifacts")).toBeInTheDocument();
    });
});
