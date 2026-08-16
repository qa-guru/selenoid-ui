export type ResourceKind = "GitHub" | "Docker Hub" | "Live" | "CI";

export type ResourceLink = {
    kind: ResourceKind;
    name: string;
    href: string;
    role: string;
};

export const RESOURCE_ROWS: ResourceLink[] = [
    {
        kind: "GitHub",
        name: "qa-guru/selenoid",
        href: "https://github.com/qa-guru/selenoid",
        role: "Hub",
    },
    {
        kind: "GitHub",
        name: "qa-guru/selenoid-ui",
        href: "https://github.com/qa-guru/selenoid-ui",
        role: "Web UI",
    },
    {
        kind: "GitHub",
        name: "qa-guru/cm",
        href: "https://github.com/qa-guru/cm",
        role: "Installer",
    },
    {
        kind: "GitHub",
        name: "qa-guru/browser-image",
        href: "https://github.com/qa-guru/browser-image",
        role: "Browser node images",
    },
    {
        kind: "GitHub",
        name: "qa-guru/selenoid-tests",
        href: "https://github.com/qa-guru/selenoid-tests",
        role: "Tests and CI orchestrator",
    },
    {
        kind: "GitHub",
        name: "qa-guru/selenoid.qa.guru",
        href: "https://github.com/qa-guru/selenoid.qa.guru",
        role: "Production deploy",
    },
    {
        kind: "GitHub",
        name: "qa-guru/selenoid-warm-pool",
        href: "https://github.com/qa-guru/selenoid-warm-pool",
        role: "Warm-pool prototype",
    },
    {
        kind: "GitHub",
        name: "qa-guru/zero-design-system",
        href: "https://github.com/qa-guru/zero-design-system",
        role: "Monorepo",
    },
    {
        kind: "GitHub",
        name: "browsers.json",
        href: "https://github.com/qa-guru/selenoid/blob/main/config/browsers.json",
        role: "Hub catalog",
    },
    {
        kind: "GitHub",
        name: "browsers-production.json",
        href: "https://github.com/qa-guru/selenoid.qa.guru/blob/main/deploy/browsers-production.json",
        role: "Prod catalog overlay",
    },
    {
        kind: "Docker Hub",
        name: "qaguru",
        href: "https://hub.docker.com/u/qaguru",
        role: "Organization",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/selenoid",
        href: "https://hub.docker.com/r/qaguru/selenoid",
        role: "Hub",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/selenoid-ui",
        href: "https://hub.docker.com/r/qaguru/selenoid-ui",
        role: "Web UI",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/cm",
        href: "https://hub.docker.com/r/qaguru/cm",
        role: "Installer",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/video-recorder",
        href: "https://hub.docker.com/r/qaguru/video-recorder",
        role: "Video sidecar",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/webdriver-chrome",
        href: "https://hub.docker.com/r/qaguru/webdriver-chrome",
        role: "Chrome WebDriver",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/webdriver-firefox",
        href: "https://hub.docker.com/r/qaguru/webdriver-firefox",
        role: "Firefox WebDriver",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/webdriver-msedge",
        href: "https://hub.docker.com/r/qaguru/webdriver-msedge",
        role: "Edge WebDriver",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/playwright-chromium",
        href: "https://hub.docker.com/r/qaguru/playwright-chromium",
        role: "Playwright Chromium",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/playwright-chrome",
        href: "https://hub.docker.com/r/qaguru/playwright-chrome",
        role: "Playwright Chrome",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/playwright-firefox",
        href: "https://hub.docker.com/r/qaguru/playwright-firefox",
        role: "Playwright Firefox",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/playwright-msedge",
        href: "https://hub.docker.com/r/qaguru/playwright-msedge",
        role: "Playwright Edge",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/playwright-webkit",
        href: "https://hub.docker.com/r/qaguru/playwright-webkit",
        role: "Playwright WebKit",
    },
    {
        kind: "Docker Hub",
        name: "qaguru/android",
        href: "https://hub.docker.com/r/qaguru/android",
        role: "Appium Android",
    },
    {
        kind: "Live",
        name: "selenoid.qa.guru",
        href: "https://selenoid.qa.guru",
        role: "Production Selenoid 3",
    },
    {
        kind: "Live",
        name: "qa.guru",
        href: "https://qa.guru/",
        role: "qa.guru home",
    },
    {
        kind: "Live",
        name: "Allure dashboard",
        href: "https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/",
        role: "Test pyramid",
    },
    {
        kind: "Live",
        name: "Allure awesome",
        href: "https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/",
        role: "Per-epic details",
    },
    {
        kind: "Live",
        name: "Allure TestOps · 5271",
        href: "https://allure.qa.guru/project/5271",
        role: "selenoid-tests project",
    },
    {
        kind: "Live",
        name: "Stack Overflow · selenoid",
        href: "https://stackoverflow.com/questions/tagged/selenoid",
        role: "Tagged questions",
    },
    {
        kind: "CI",
        name: "selenoid Actions",
        href: "https://github.com/qa-guru/selenoid/actions",
        role: "Hub CI",
    },
    {
        kind: "CI",
        name: "selenoid-ui Actions",
        href: "https://github.com/qa-guru/selenoid-ui/actions",
        role: "UI CI",
    },
    {
        kind: "CI",
        name: "cm Actions",
        href: "https://github.com/qa-guru/cm/actions",
        role: "Installer CI",
    },
    {
        kind: "CI",
        name: "browser-image Actions",
        href: "https://github.com/qa-guru/browser-image/actions",
        role: "Browser image CI",
    },
    {
        kind: "CI",
        name: "selenoid-tests Actions",
        href: "https://github.com/qa-guru/selenoid-tests/actions",
        role: "Test orchestrator CI",
    },
    {
        kind: "CI",
        name: "Orchestrator workflow",
        href: "https://github.com/qa-guru/selenoid-tests/actions/workflows/selenoid_github-orchestrator.yml",
        role: "Full-stack GitHub e2e",
    },
    {
        kind: "CI",
        name: "selenoid Releases",
        href: "https://github.com/qa-guru/selenoid/releases",
        role: "Hub binaries and tags",
    },
    {
        kind: "CI",
        name: "selenoid-ui Releases",
        href: "https://github.com/qa-guru/selenoid-ui/releases",
        role: "UI binaries and tags",
    },
    {
        kind: "CI",
        name: "cm Releases",
        href: "https://github.com/qa-guru/cm/releases",
        role: "Installer binaries and tags",
    },
    {
        kind: "CI",
        name: "Coverage · selenoid",
        href: "https://codecov.io/gh/qa-guru/selenoid",
        role: "Hub coverage",
    },
    {
        kind: "CI",
        name: "Coverage · selenoid-ui",
        href: "https://codecov.io/gh/qa-guru/selenoid-ui",
        role: "UI coverage",
    },
    {
        kind: "CI",
        name: "Go Report · selenoid",
        href: "https://goreportcard.com/report/github.com/qa-guru/selenoid",
        role: "Hub Go report",
    },
    {
        kind: "CI",
        name: "Go Report · cm",
        href: "https://goreportcard.com/report/github.com/qa-guru/cm",
        role: "Installer Go report",
    },
];
