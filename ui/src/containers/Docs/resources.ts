export type ResourceLink = {
    name: string;
    href: string;
    role: string;
};

export type ResourceSection = {
    id: string;
    title: string;
    hint: string;
    rows: ResourceLink[];
};

export const RESOURCE_SECTIONS: ResourceSection[] = [
    {
        id: "github",
        title: "GitHub",
        hint: "qa-guru repositories for the Selenoid 3 stack.",
        rows: [
            {
                name: "qa-guru/selenoid",
                href: "https://github.com/qa-guru/selenoid",
                role: "Hub — WebDriver and native Playwright",
            },
            {
                name: "qa-guru/selenoid-ui",
                href: "https://github.com/qa-guru/selenoid-ui",
                role: "This web UI",
            },
            {
                name: "qa-guru/cm",
                href: "https://github.com/qa-guru/cm",
                role: "One-command installer",
            },
            {
                name: "qa-guru/browser-image",
                href: "https://github.com/qa-guru/browser-image",
                role: "WebDriver, Playwright, Android, and video-recorder images",
            },
            {
                name: "qa-guru/selenoid-tests",
                href: "https://github.com/qa-guru/selenoid-tests",
                role: "Go pyramid and CI orchestrator",
            },
            {
                name: "qa-guru/selenoid.qa.guru",
                href: "https://github.com/qa-guru/selenoid.qa.guru",
                role: "Production deploy (selenoid.qa.guru)",
            },
            {
                name: "qa-guru/selenoid-warm-pool",
                href: "https://github.com/qa-guru/selenoid-warm-pool",
                role: "Warm-pool prototype — git only, not on prod",
            },
            {
                name: "qa-guru/zero-design-system",
                href: "https://github.com/qa-guru/zero-design-system",
                role: "Monorepo — selenoid-home hub",
            },
            {
                name: "browsers.json",
                href: "https://github.com/qa-guru/selenoid/blob/main/config/browsers.json",
                role: "Hub browser catalog",
            },
            {
                name: "browsers-production.json",
                href: "https://github.com/qa-guru/selenoid.qa.guru/blob/main/deploy/browsers-production.json",
                role: "Production catalog overlay",
            },
        ],
    },
    {
        id: "dockerhub",
        title: "Docker Hub",
        hint: "Images under qaguru/*. Stack images also have a latest-release tag.",
        rows: [
            {
                name: "qaguru",
                href: "https://hub.docker.com/u/qaguru",
                role: "Organization — all qaguru images",
            },
            {
                name: "qaguru/selenoid",
                href: "https://hub.docker.com/r/qaguru/selenoid",
                role: "Hub",
            },
            {
                name: "qaguru/selenoid-ui",
                href: "https://hub.docker.com/r/qaguru/selenoid-ui",
                role: "Web UI",
            },
            {
                name: "qaguru/cm",
                href: "https://hub.docker.com/r/qaguru/cm",
                role: "Installer",
            },
            {
                name: "qaguru/video-recorder",
                href: "https://hub.docker.com/r/qaguru/video-recorder",
                role: "Session video sidecar",
            },
            {
                name: "qaguru/webdriver-chrome",
                href: "https://hub.docker.com/r/qaguru/webdriver-chrome",
                role: "Chrome WebDriver node (warm and -min)",
            },
            {
                name: "qaguru/webdriver-firefox",
                href: "https://hub.docker.com/r/qaguru/webdriver-firefox",
                role: "Firefox WebDriver node (warm and -min)",
            },
            {
                name: "qaguru/webdriver-msedge",
                href: "https://hub.docker.com/r/qaguru/webdriver-msedge",
                role: "Edge WebDriver node (warm and -min)",
            },
            {
                name: "qaguru/playwright-chromium",
                href: "https://hub.docker.com/r/qaguru/playwright-chromium",
                role: "Playwright Chromium node (full and -min)",
            },
            {
                name: "qaguru/playwright-chrome",
                href: "https://hub.docker.com/r/qaguru/playwright-chrome",
                role: "Playwright Chrome node",
            },
            {
                name: "qaguru/playwright-firefox",
                href: "https://hub.docker.com/r/qaguru/playwright-firefox",
                role: "Playwright Firefox node",
            },
            {
                name: "qaguru/playwright-msedge",
                href: "https://hub.docker.com/r/qaguru/playwright-msedge",
                role: "Playwright Edge node",
            },
            {
                name: "qaguru/playwright-webkit",
                href: "https://hub.docker.com/r/qaguru/playwright-webkit",
                role: "Playwright WebKit node",
            },
            {
                name: "qaguru/android",
                href: "https://hub.docker.com/r/qaguru/android",
                role: "Appium Android node (API 26+)",
            },
        ],
    },
    {
        id: "live",
        title: "Live sites",
        hint: "Production UI, published reports, and TestOps.",
        rows: [
            {
                name: "selenoid.qa.guru",
                href: "https://selenoid.qa.guru",
                role: "Production Selenoid 3",
            },
            {
                name: "qa.guru",
                href: "https://qa.guru/",
                role: "qa.guru home",
            },
            {
                name: "Allure dashboard",
                href: "https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/",
                role: "Merged test pyramid (GitHub Pages)",
            },
            {
                name: "Allure awesome",
                href: "https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/",
                role: "Per-epic test details",
            },
            {
                name: "Allure TestOps · 5271",
                href: "https://allure.qa.guru/project/5271",
                role: "selenoid-tests project",
            },
            {
                name: "Stack Overflow · selenoid",
                href: "https://stackoverflow.com/questions/tagged/selenoid",
                role: "Questions tagged selenoid",
            },
        ],
    },
    {
        id: "ci",
        title: "CI, releases, coverage",
        hint: "GitHub Actions, release pages, and coverage reports.",
        rows: [
            {
                name: "selenoid Actions",
                href: "https://github.com/qa-guru/selenoid/actions",
                role: "Hub CI",
            },
            {
                name: "selenoid-ui Actions",
                href: "https://github.com/qa-guru/selenoid-ui/actions",
                role: "UI CI",
            },
            {
                name: "cm Actions",
                href: "https://github.com/qa-guru/cm/actions",
                role: "Installer CI",
            },
            {
                name: "browser-image Actions",
                href: "https://github.com/qa-guru/browser-image/actions",
                role: "Browser image CI",
            },
            {
                name: "selenoid-tests Actions",
                href: "https://github.com/qa-guru/selenoid-tests/actions",
                role: "Test orchestrator CI",
            },
            {
                name: "Orchestrator workflow",
                href: "https://github.com/qa-guru/selenoid-tests/actions/workflows/selenoid_github-orchestrator.yml",
                role: "Full-stack GitHub e2e",
            },
            {
                name: "selenoid Releases",
                href: "https://github.com/qa-guru/selenoid/releases",
                role: "Hub binaries and tags",
            },
            {
                name: "selenoid-ui Releases",
                href: "https://github.com/qa-guru/selenoid-ui/releases",
                role: "UI binaries and tags",
            },
            {
                name: "cm Releases",
                href: "https://github.com/qa-guru/cm/releases",
                role: "Installer binaries and tags",
            },
            {
                name: "Coverage · selenoid",
                href: "https://codecov.io/gh/qa-guru/selenoid",
                role: "Hub coverage",
            },
            {
                name: "Coverage · selenoid-ui",
                href: "https://codecov.io/gh/qa-guru/selenoid-ui",
                role: "UI coverage",
            },
            {
                name: "Go Report · selenoid",
                href: "https://goreportcard.com/report/github.com/qa-guru/selenoid",
                role: "Hub Go report",
            },
            {
                name: "Go Report · cm",
                href: "https://goreportcard.com/report/github.com/qa-guru/cm",
                role: "Installer Go report",
            },
        ],
    },
];
