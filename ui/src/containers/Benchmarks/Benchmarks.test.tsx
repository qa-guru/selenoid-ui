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
                    note: "container-reuse",
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
        expect(screen.getByTestId("benchmarks-filter-status")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-scale")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-artifacts")).toBeInTheDocument();
    });

    it("renders warm isolation one-option table", () => {
        render(<Benchmarks data={fixture} />);

        const table = screen.getByTestId("benchmarks-warm-isolation");
        expect(table.querySelector('[data-variant="screenshot"]')).toHaveTextContent("52");
        expect(table.querySelector('[data-variant="video"]')).toHaveTextContent("44");
        expect(table.querySelector('[data-variant="har"]')).toHaveTextContent("49");
        expect(within(table).getByText("allure3-empty (no attaches)")).toBeInTheDocument();
    });

    it("pins Java and JS login-test walls; heavy ≠ lite", () => {
        render(<Benchmarks />);
        const table = screen.getByTestId("benchmarks-jenkins");
        const warmNone = table.querySelector('[data-run-id="jenkins-java-wd-warm-1-p1-none"]');
        expect(warmNone).not.toBeNull();
        expect(warmNone).toHaveTextContent("3.915");
        expect(warmNone).toHaveAttribute("data-status", "ok");
        expect(warmNone).toHaveAttribute("data-variant", "none");
        const pin = within(table).getByRole("link", { name: /^warm-pool #40$/ });
        expect(pin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool/40/"
        );

        const jsWarmNone = table.querySelector('[data-run-id="jenkins-js-pw-warm-1-p1-none"]');
        const jsWarmLite = table.querySelector(
            '[data-run-id="jenkins-js-pw-warm-1-p1-full-attachments"]'
        );
        expect(jsWarmNone).toHaveAttribute("data-status", "ok");
        expect(jsWarmLite).toHaveAttribute("data-status", "ok");
        expect(jsWarmNone).toHaveTextContent("3.032");
        expect(jsWarmLite).toHaveTextContent("13.68");
        expect(jsWarmLite).toHaveAttribute("data-variant", "allure-lite");
        const jsWarmPin = within(table).getByRole("link", { name: /js-warm-pool #2/ });
        expect(jsWarmPin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-js-warm-pool/2/"
        );
        const jsWarmLitePin = within(table).getByRole("link", {
            name: /js-warm-pool-full-attachments #2/,
        });
        expect(jsWarmLitePin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-js-warm-pool-full-attachments/2/"
        );

        const hotNone = table.querySelector('[data-run-id="jenkins-java-wd-hot-1-p1-none"]');
        expect(hotNone).toHaveAttribute("data-status", "ok");
        expect(hotNone).toHaveTextContent("0.942");
        const hotPin = within(table).getByRole("link", { name: /hot-pool #115/ });
        expect(hotPin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/115/"
        );

        const jsHotNone = table.querySelector('[data-run-id="jenkins-js-pw-hot-1-p1-none"]');
        expect(jsHotNone).toHaveAttribute("data-status", "ok");
        expect(jsHotNone).toHaveTextContent("0.623");
        const jsHotPin = within(table).getByRole("link", { name: /js-hot-pool #12/ });
        expect(jsHotPin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-js-hot-pool/12/"
        );

        const hotLite = table.querySelector(
            '[data-run-id="jenkins-java-wd-hot-1-p1-full-attachments"]'
        );
        expect(hotLite).toHaveAttribute("data-status", "ok");
        expect(hotLite).toHaveAttribute("data-variant", "allure-lite");
        expect(hotLite).toHaveTextContent("1.357");
        const hotLitePin = within(table).getByRole("link", {
            name: /^hot-pool-lite #2$/,
        });
        expect(hotLitePin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool-lite/2/"
        );

        const pyHotNone = table.querySelector('[data-run-id="jenkins-python-wd-hot-1-p1-none"]');
        expect(pyHotNone).toHaveAttribute("data-status", "ok");
        expect(pyHotNone).toHaveTextContent("0.942");
        const pyHotPin = within(table).getByRole("link", { name: /python-hot-pool #22/ });
        expect(pyHotPin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-python-hot-pool/22/"
        );

        const pyHotLite = table.querySelector(
            '[data-run-id="jenkins-python-wd-hot-1-p1-full-attachments"]'
        );
        expect(pyHotLite).toHaveAttribute("data-status", "ok");
        expect(pyHotLite).toHaveAttribute("data-variant", "allure-lite");
        expect(pyHotLite).toHaveTextContent("0.971");
        const pyHotLitePin = within(table).getByRole("link", {
            name: /^python-hot-pool-lite #2$/,
        });
        expect(pyHotLitePin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-python-hot-pool-lite/2/"
        );

        const jsHotLite = table.querySelector(
            '[data-run-id="jenkins-js-pw-hot-1-p1-full-attachments"]'
        );
        expect(jsHotLite).toHaveAttribute("data-status", "ok");
        expect(jsHotLite).toHaveAttribute("data-variant", "allure-lite");
        expect(jsHotLite).toHaveTextContent("0.666");
        const jsHotLitePin = within(table).getByRole("link", {
            name: /^js-hot-pool-lite #2$/,
        });
        expect(jsHotLitePin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-js-hot-pool-lite/2/"
        );

        const heavy = table.querySelector(
            '[data-run-id="jenkins-java-wd-cold-1-p1-full-attachments"]'
        );
        const lite = table.querySelector(
            '[data-run-id="jenkins-java-wd-warm-1-p1-full-attachments"]'
        );
        expect(heavy).toHaveAttribute("data-variant", "allure-heavy");
        expect(lite).toHaveAttribute("data-variant", "allure-lite");
        expect(heavy).toHaveTextContent("allure-heavy");
        expect(lite).toHaveTextContent("allure-lite");
        expect(heavy).toHaveTextContent("6.747");
        expect(lite).toHaveTextContent("4.702");
        const coldHeavyPin = within(table).getByRole("link", {
            name: /^cold-pool-full-attachments #35$/,
        });
        expect(coldHeavyPin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-cold-pool-full-attachments/35/"
        );
        const warmLitePin = within(table).getByRole("link", {
            name: /^warm-pool-full-attachments #33$/,
        });
        expect(warmLitePin).toHaveAttribute(
            "href",
            "https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool-full-attachments/33/"
        );
        expect(table.querySelectorAll("tbody tr")).toHaveLength(18);
    });
});
