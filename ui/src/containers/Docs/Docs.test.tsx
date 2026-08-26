import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Docs from "./index";
import { CATALOG_EFFECTS, CATALOG_STEPS } from "./catalog";
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
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Cold · Warm · Hot — how the pools differ");
        expect(screen.getByTestId("docs-stat-cold")).toHaveTextContent("~9.4 seconds");
        expect(screen.getByTestId("docs-stat-warm")).toHaveTextContent("~4.2 seconds");
        expect(screen.getByTestId("docs-stat-hot")).toHaveTextContent("~0.9 seconds");
        expect(screen.getByTestId("docs-release-callout")).toHaveTextContent("Releasing a slot does not close Chrome");

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
        expect(comparison).toHaveTextContent("POST /pool/lease");
        expect(comparison).not.toHaveTextContent("POST /pool/reserve with loopback:false");
        expect(comparison).toHaveTextContent("hot-chrome-min-1:4444/");

        const oneRun = screen.getByTestId("docs-one-run");
        expect(oneRun.querySelectorAll("tbody tr")).toHaveLength(ONE_RUN_ROWS.length);
        expect(oneRun).toHaveTextContent("release without killSession or quit");
        expect(oneRun).toHaveTextContent("hotJunitDaemon");
        expect(oneRun).not.toHaveTextContent("ensure.sh");
    });

    it("drives topology, sequence, and wall from one Cold | Warm | Hot selector", async () => {
        const user = userEvent.setup();
        renderDocs();

        const topology = screen.getByTestId("docs-diagram-topology");
        const sequence = screen.getByTestId("docs-diagram-sequence");
        const wall = screen.getByTestId("docs-diagram-wall");

        expect(topology).toBeInTheDocument();
        expect(sequence).toBeInTheDocument();
        expect(wall).toBeInTheDocument();

        expect(topology).toHaveAttribute("data-pool", "cold");
        expect(screen.getByTestId("docs-topo-node-docker")).toHaveAttribute("data-live", "true");
        expect(screen.getByTestId("docs-topo-node-hot")).toHaveAttribute("data-live", "false");
        expect(screen.getByTestId("docs-topo-node-hub")).toHaveAttribute("data-live", "true");
        expect(sequence).toHaveTextContent("docker run");
        expect(sequence).not.toHaveTextContent("POST /pool/lease");
        expect(sequence).not.toHaveTextContent("14441");
        expect(wall).toHaveTextContent("docker run");
        expect(screen.getByTestId("docs-wall-layer-docker-run")).toBeInTheDocument();
        expect(screen.queryByTestId("docs-wall-layer-jenkins-shell")).not.toBeInTheDocument();

        await user.click(screen.getByTestId("docs-pool-select-warm"));
        expect(topology).toHaveAttribute("data-pool", "warm");
        expect(sequence).toHaveAttribute("data-pool", "warm");
        expect(wall).toHaveAttribute("data-pool", "warm");
        expect(screen.getByTestId("docs-topo-node-warm")).toHaveAttribute("data-live", "true");
        expect(screen.getByTestId("docs-topo-node-docker")).toHaveAttribute("data-live", "false");
        expect(screen.getByTestId("docs-topo-node-hot")).toHaveAttribute("data-live", "false");
        expect(sequence).toHaveTextContent("POST /pool/reserve");
        expect(sequence).toHaveTextContent("14441");
        expect(sequence).not.toHaveTextContent("POST /pool/lease");
        expect(sequence).not.toHaveTextContent("docker run");
        expect(wall).toHaveTextContent("~3s");
        expect(wall).toHaveTextContent("#14");
        expect(screen.queryByTestId("docs-wall-layer-docker-run")).not.toBeInTheDocument();

        await user.click(screen.getByTestId("docs-pool-select-hot"));
        expect(topology).toHaveAttribute("data-pool", "hot");
        expect(screen.getByTestId("docs-topo-node-hot")).toHaveAttribute("data-live", "true");
        expect(screen.getByTestId("docs-topo-node-hub")).toHaveAttribute("data-live", "false");
        expect(screen.getByTestId("docs-topo-node-docker")).toHaveAttribute("data-live", "false");
        expect(sequence).toHaveTextContent("POST /pool/lease");
        expect(sequence).toHaveTextContent("hot-chrome-min-1:4444");
        expect(sequence).toHaveTextContent("hotJunitDaemon");
        expect(sequence).toHaveTextContent("17890");
        expect(sequence).not.toHaveTextContent("ensure.sh");
        expect(sequence).not.toHaveTextContent("docker run");
        expect(sequence).not.toHaveTextContent("14441");
        expect(wall).toHaveTextContent("~0.6s /run");
        expect(wall).toHaveTextContent("~0.3s pipeline/shell");
        expect(wall).toHaveTextContent("#95");
        expect(screen.queryByTestId("docs-wall-layer-docker-run")).not.toBeInTheDocument();
        expect(screen.getByTestId("docs-wall-layer-jenkins-shell")).toBeInTheDocument();

        await user.click(screen.getByTestId("docs-stat-cold"));
        expect(topology).toHaveAttribute("data-pool", "cold");
        expect(sequence).toHaveTextContent("docker run");
        expect(sequence).not.toHaveTextContent("POST /pool/lease");

        await user.click(screen.getByTestId("docs-topo-node-ui"));
        expect(screen.getByTestId("docs-diagram-caption")).toHaveTextContent(
            "The UI only watches hub status. It does not start a session or claim a slot."
        );
    });

    it("renders the catalog reload without bouncing hub or UI", async () => {
        const user = userEvent.setup();
        renderDocs();

        await user.click(screen.getByTestId("docs-nav-catalog"));

        expect(screen.getByTestId("docs-nav-catalog")).toHaveClass("is-active");
        expect(screen.getByTestId("docs-nav-pools")).not.toHaveClass("is-active");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Catalog — new versions without restarting"
        );

        const page = screen.getByTestId("docs-catalog");
        expect(page).toHaveTextContent("SIGHUP");
        expect(page).toHaveTextContent("browsers.json");
        expect(page).toHaveTextContent("docker pull");
        expect(page).toHaveTextContent("This UI is not restarted");
        expect(page).toHaveTextContent("watch does not set those");
        expect(page.querySelector('a[href="https://github.com/qa-guru/browser-image"]')).toBeTruthy();
        expect(
            page.querySelector('a[href="https://github.com/qa-guru/selenoid/blob/main/docs/browser-versions.md"]')
        ).toBeTruthy();
        expect(page).toHaveTextContent("Not systemctl restart");
        expect(page).not.toHaveTextContent("remote-update");
        expect(page).not.toHaveTextContent("zero-design-system");
        expect(page).not.toHaveTextContent("v3.0.");
        expect(page.innerHTML).not.toMatch(/github\.com\/aerokube/i);

        expect(screen.getByTestId("docs-catalog-steps").querySelectorAll("li")).toHaveLength(CATALOG_STEPS.length);
        expect(screen.getByTestId("docs-catalog-effects").querySelectorAll("tbody tr")).toHaveLength(
            CATALOG_EFFECTS.length
        );
        expect(screen.getByTestId("docs-catalog-callout")).toHaveTextContent("Do not send SIGHUP to the UI");
        expect(screen.getByTestId("docs-catalog-callout")).toHaveTextContent("-browsers-conf");
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
            page.querySelector('a[href="https://github.com/qa-guru/browser-image/tree/main/video-recorder"]')
        ).toBeTruthy();
        expect(
            page.querySelector('a[href="https://github.com/qa-guru/browser-image/tree/main/webdriver/firefox"]')
        ).toBeTruthy();
        expect(
            page.querySelector(
                'a[href="https://github.com/qa-guru/browser-image/tree/main/playwright/playwright-webkit"]'
            )
        ).toBeTruthy();
        expect(page.querySelector('a[href="https://github.com/qa-guru/browser-image/tree/main/android"]')).toBeTruthy();
        expect(page.querySelector('a[href="https://hub.docker.com/u/qaguru"]')).toBeTruthy();
        expect(page.querySelector('a[href="https://github.com/qa-guru/selenoid"]')).toBeTruthy();
        expect(page.innerHTML).not.toMatch(/github\.com\/aerokube/i);
        expect(page.innerHTML).not.toMatch(/aerokube\.com/i);
        expect(page).not.toHaveTextContent("zero-design-system");
        expect(page).not.toHaveTextContent("selenoid-warm-pool");
        expect(page).not.toHaveTextContent("selenoid-pool");
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
        expect(table).toHaveTextContent("awesome/?query=selenoid-ui");
        expect(table).toHaveTextContent("dashboards/selenoid-ui");
        expect(table).toHaveTextContent("awesome/?query=webdriver-image&tags=chrome");
        expect(table).toHaveTextContent("dashboards/webdriver-image");
        expect(
            page.querySelector(
                'a[href="https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/?query=selenoid-ui"]'
            )
        ).toBeTruthy();
        expect(
            page.querySelector('a[href="https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/"]')
        ).toBeTruthy();
        const chrome = RESOURCE_SERVICES.find((row) => row.name === "webdriver-chrome");
        expect(chrome?.awesome?.href).toContain("query=webdriver-image");
        expect(chrome?.awesome?.href).toContain("tags=chrome");
        expect(chrome?.dashboard?.href).toContain("/dashboards/webdriver-image/");
        expect(page.querySelector(`a[href="${chrome?.awesome?.href}"]`)).toBeTruthy();
        expect(page.querySelector(`a[href="${chrome?.dashboard?.href}"]`)).toBeTruthy();
        const firefox = RESOURCE_SERVICES.find((row) => row.name === "webdriver-firefox");
        expect(firefox?.awesome?.href).toContain("tags=firefox");
        const android = RESOURCE_SERVICES.find((row) => row.name === "android");
        expect(android?.awesome?.href).toContain("query=android");
        expect(page.querySelector(`a[href="${android?.awesome?.href}"]`)).toBeTruthy();
        const ios = RESOURCE_SERVICES.find((row) => row.name === "ios");
        expect(ios?.awesome?.href).toContain("query=ios");
        expect(page.querySelector(`a[href="${ios?.awesome?.href}"]`)).toBeTruthy();
        expect(page.querySelector('a[href="https://sonar.qa.guru/dashboard?id=selenoid-ui"]')).toBeTruthy();
    });
});
