export type ResourceRef = {
    href: string;
    label: string;
};

export type ResourceService = {
    name: string;
    href?: string;
    github?: ResourceRef;
    dockerHub?: ResourceRef;
    awesome?: ResourceRef;
    dashboard?: ResourceRef;
    sonar?: ResourceRef;
    comment: string;
};

const GITHUB_SELENOID: ResourceRef = {
    href: "https://github.com/qa-guru/selenoid",
    label: "qa-guru/selenoid",
};
const GITHUB_UI: ResourceRef = {
    href: "https://github.com/qa-guru/selenoid-ui",
    label: "qa-guru/selenoid-ui",
};
const GITHUB_CM: ResourceRef = {
    href: "https://github.com/qa-guru/cm",
    label: "qa-guru/cm",
};
const GITHUB_IMAGE: ResourceRef = {
    href: "https://github.com/qa-guru/browser-image",
    label: "qa-guru/browser-image",
};
const GITHUB_TESTS: ResourceRef = {
    href: "https://github.com/qa-guru/selenoid-tests",
    label: "qa-guru/selenoid-tests",
};

const AWESOME: ResourceRef = {
    href: "https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/",
    label: "Awesome",
};
const DASHBOARD: ResourceRef = {
    href: "https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/",
    label: "Dashboard",
};

function docker(image: string): ResourceRef {
    return { href: `https://hub.docker.com/r/${image}`, label: image };
}

function sonar(projectKey: string): ResourceRef {
    return {
        href: `https://sonar.qa.guru/dashboard?id=${projectKey}`,
        label: "Sonar",
    };
}

function image(
    name: string,
    repo: string,
    ghPath: string,
    comment: string,
    reports = true
): ResourceService {
    return {
        name,
        github: {
            href: `https://github.com/qa-guru/browser-image/tree/main/${ghPath}`,
            label: `browser-image/${ghPath}`,
        },
        dockerHub: docker(repo),
        awesome: reports ? AWESOME : undefined,
        dashboard: reports ? DASHBOARD : undefined,
        comment,
    };
}

export const RESOURCE_SERVICES: ResourceService[] = [
    {
        name: "selenoid",
        github: GITHUB_SELENOID,
        dockerHub: docker("qaguru/selenoid"),
        awesome: AWESOME,
        dashboard: DASHBOARD,
        sonar: sonar("selenoid"),
        comment: "Hub — WebDriver and Playwright",
    },
    {
        name: "selenoid-ui",
        github: GITHUB_UI,
        dockerHub: docker("qaguru/selenoid-ui"),
        awesome: AWESOME,
        dashboard: DASHBOARD,
        sonar: sonar("selenoid-ui"),
        comment: "Web UI",
    },
    {
        name: "cm",
        github: GITHUB_CM,
        dockerHub: docker("qaguru/cm"),
        awesome: AWESOME,
        dashboard: DASHBOARD,
        sonar: sonar("selenoid-cm"),
        comment: "Installer",
    },
    {
        name: "browser-image",
        github: GITHUB_IMAGE,
        dockerHub: { href: "https://hub.docker.com/u/qaguru", label: "qaguru/*" },
        awesome: AWESOME,
        dashboard: DASHBOARD,
        sonar: sonar("selenoid-browser-image"),
        comment: "Browser node image source",
    },
    {
        name: "selenoid-tests",
        github: GITHUB_TESTS,
        awesome: AWESOME,
        dashboard: DASHBOARD,
        sonar: sonar("selenoid-tests"),
        comment: "Go pyramid and CI orchestrator",
    },
    image("video-recorder", "qaguru/video-recorder", "video-recorder", "Session video sidecar"),
    image("webdriver-chrome", "qaguru/webdriver-chrome", "webdriver/chrome", "Chrome WebDriver node"),
    image("webdriver-firefox", "qaguru/webdriver-firefox", "webdriver/firefox", "Firefox WebDriver node"),
    image("webdriver-msedge", "qaguru/webdriver-msedge", "webdriver/msedge", "Edge WebDriver node"),
    image(
        "playwright-chromium",
        "qaguru/playwright-chromium",
        "playwright/playwright-chromium",
        "Playwright Chromium node"
    ),
    image(
        "playwright-chrome",
        "qaguru/playwright-chrome",
        "playwright/playwright-chrome",
        "Playwright Chrome node"
    ),
    image(
        "playwright-firefox",
        "qaguru/playwright-firefox",
        "playwright/playwright-firefox",
        "Playwright Firefox node"
    ),
    image(
        "playwright-msedge",
        "qaguru/playwright-msedge",
        "playwright/playwright-msedge",
        "Playwright Edge node"
    ),
    image(
        "playwright-webkit",
        "qaguru/playwright-webkit",
        "playwright/playwright-webkit",
        "Playwright WebKit node"
    ),
    image("android", "qaguru/android", "android", "Appium Android node", false),
];
