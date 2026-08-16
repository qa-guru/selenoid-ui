import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Docs from "./index";
import { COMPARISON_ROWS, FEATURE_ROWS, ONE_RUN_ROWS } from "./pools";
import { RESOURCE_SERVICES } from "./resources";

function renderDocs(path = "/docs") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/docs/*" element={<Docs />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("Docs", () => {
    it("renders the browser-pools comparison", () => {
        renderDocs();

        expect(screen.getByTestId("docs-page")).toBeInTheDocument();
        expect(screen.getByTestId("docs-nav-pools")).toHaveClass("is-active");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Cold · Warm · Hot — how the pools differ"
        );
        expect(screen.getByTestId("docs-stat-cold")).toHaveTextContent("~9.4 seconds");
        expect(screen.getByTestId("docs-stat-warm")).toHaveTextContent("~4.2 seconds");
        expect(screen.getByTestId("docs-stat-hot")).toHaveTextContent("~2.2 seconds");
        expect(screen.getByTestId("docs-release-callout")).toHaveTextContent(
            "Releasing a slot does not close Chrome"
        );

        const features = screen.getByTestId("docs-features");
        expect(features.querySelectorAll("tbody tr")).toHaveLength(FEATURE_ROWS.length);
        expect(features).toHaveTextContent("Browser container is already running before the test");
        const reuseRow = Array.from(features.querySelectorAll("tbody tr")).find((tr) =>
            tr.textContent?.includes("The same browser window is reused across Jenkins builds")
        );
        expect(reuseRow?.querySelectorAll('[aria-label="No"]')).toHaveLength(2);
        expect(reuseRow?.querySelectorAll('[aria-label="Yes"]')).toHaveLength(1);

        const comparison = screen.getByTestId("docs-comparison");
        expect(comparison.querySelectorAll("tbody tr")).toHaveLength(COMPARISON_ROWS.length);
        expect(comparison).toHaveTextContent("POST /pool/reserve with loopback:false");
        expect(comparison).toHaveTextContent("http://hot-chrome-min-1:4444/");

        const oneRun = screen.getByTestId("docs-one-run");
        expect(oneRun.querySelectorAll("tbody tr")).toHaveLength(ONE_RUN_ROWS.length);
        expect(oneRun).toHaveTextContent("Chrome does not quit");
    });

    it("renders the Resources catalog without aerokube GitHub links", async () => {
        const user = userEvent.setup();
        renderDocs();

        await user.click(screen.getByTestId("docs-nav-resources"));

        expect(screen.getByTestId("docs-nav-resources")).toHaveClass("is-active");
        expect(screen.getByTestId("docs-nav-pools")).not.toHaveClass("is-active");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Resources");

        const page = screen.getByTestId("docs-resources");
        expect(page).toHaveTextContent("qa-guru/selenoid");
        expect(page).toHaveTextContent("qaguru/selenoid-ui");
        expect(page.querySelector('a[href="https://hub.docker.com/r/qaguru/webdriver-chrome"]')).toBeTruthy();
        expect(
            page.querySelector(
                'a[href="https://github.com/qa-guru/browser-image/tree/main/video-recorder"]'
            )
        ).toBeTruthy();
        expect(
            page.querySelector(
                'a[href="https://github.com/qa-guru/browser-image/tree/main/webdriver/firefox"]'
            )
        ).toBeTruthy();
        expect(
            page.querySelector(
                'a[href="https://github.com/qa-guru/browser-image/tree/main/playwright/playwright-webkit"]'
            )
        ).toBeTruthy();
        expect(
            page.querySelector('a[href="https://github.com/qa-guru/browser-image/tree/main/android"]')
        ).toBeTruthy();
        expect(page.querySelector('a[href="https://hub.docker.com/u/qaguru"]')).toBeTruthy();
        expect(page.querySelector('a[href="https://github.com/qa-guru/selenoid"]')).toBeTruthy();
        expect(page.innerHTML).not.toMatch(/github\.com\/aerokube/i);
        expect(page.innerHTML).not.toMatch(/aerokube\.com/i);
        expect(page).not.toHaveTextContent("zero-design-system");
        expect(page).not.toHaveTextContent("selenoid-warm-pool");
        expect(page).not.toHaveTextContent("browsers-production.json");
        expect(page).not.toHaveTextContent("selenoid-qa-guru-deploy");
        expect(page).not.toHaveTextContent("selenoid.qa.guru");
        expect(page).not.toHaveTextContent("Allure TestOps");

        const table = screen.getByTestId("docs-resources-table");
        expect(table.querySelectorAll("tbody tr")).toHaveLength(RESOURCE_SERVICES.length);
        expect(table).toHaveTextContent("webdriver-chrome");
        expect(table).toHaveTextContent("playwright-chromium");
        expect(table).toHaveTextContent("Awesome");
        expect(table).toHaveTextContent("Dashboard");
        expect(table).toHaveTextContent("Sonar");
        expect(
            page.querySelector(
                'a[href="https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/"]'
            )
        ).toBeTruthy();
        expect(
            page.querySelector(
                'a[href="https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/"]'
            )
        ).toBeTruthy();
        expect(page.querySelector('a[href="https://sonar.qa.guru/dashboard?id=selenoid-ui"]')).toBeTruthy();
    });
});
