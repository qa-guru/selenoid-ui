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

const REPORT_LATEST = "https://qa-guru.github.io/selenoid-tests/reports/latest";

function awesome(epic?: string, tag?: string): ResourceRef {
    const params = new URLSearchParams();
    if (epic) {
        params.set("query", epic);
    }
    if (tag) {
        params.set("tags", tag);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const href = `${REPORT_LATEST}/awesome/${query}`;
    return { href, label: `awesome/${query}` };
}

function dashboard(epic?: string): ResourceRef {
    if (!epic) {
        return { href: `${REPORT_LATEST}/dashboard/`, label: "dashboard" };
    }
    return {
        href: `${REPORT_LATEST}/dashboards/${encodeURIComponent(epic)}/`,
        label: `dashboards/${epic}`,
    };
}

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
    epic?: string | false,
    tag?: string
): ResourceService {
    const reports = epic !== false;
    const slug = typeof epic === "string" ? epic : undefined;
    return {
        name,
        github: {
            href: `https://github.com/qa-guru/browser-image/tree/main/${ghPath}`,
            label: `browser-image/${ghPath}`,
        },
        dockerHub: docker(repo),
        awesome: reports ? awesome(slug, tag) : undefined,
        dashboard: reports ? dashboard(slug) : undefined,
        comment,
    };
}

export const RESOURCE_SERVICES: ResourceService[] = [
    {
        name: "selenoid",
        github: GITHUB_SELENOID,
        dockerHub: docker("qaguru/selenoid"),
        awesome: awesome("selenoid"),
        dashboard: dashboard("selenoid"),
        sonar: sonar("selenoid"),
        comment: "Hub — WebDriver and Playwright",
    },
    {
        name: "selenoid-ui",
        github: GITHUB_UI,
        dockerHub: docker("qaguru/selenoid-ui"),
        awesome: awesome("selenoid-ui"),
        dashboard: dashboard("selenoid-ui"),
        sonar: sonar("selenoid-ui"),
        comment: "Web UI",
    },
    {
        name: "cm",
        github: GITHUB_CM,
        dockerHub: docker("qaguru/cm"),
        awesome: awesome("cm"),
        dashboard: dashboard("cm"),
        sonar: sonar("selenoid-cm"),
        comment: "Installer",
    },
    {
        name: "browser-image",
        github: GITHUB_IMAGE,
        dockerHub: { href: "https://hub.docker.com/u/qaguru", label: "qaguru/*" },
        awesome: awesome(),
        dashboard: dashboard(),
        sonar: sonar("selenoid-browser-image"),
        comment: "Browser node image source",
    },
    {
        name: "selenoid-tests",
        github: GITHUB_TESTS,
        awesome: awesome(),
        dashboard: dashboard(),
        sonar: sonar("selenoid-tests"),
        comment: "Go pyramid and CI orchestrator",
    },
    image(
        "video-recorder",
        "qaguru/video-recorder",
        "video-recorder",
        "Session video sidecar",
        "video-recorder"
    ),
    image(
        "webdriver-chrome",
        "qaguru/webdriver-chrome",
        "webdriver/chrome",
        "Chrome WebDriver node",
        "webdriver-image",
        "chrome"
    ),
    image(
        "webdriver-firefox",
        "qaguru/webdriver-firefox",
        "webdriver/firefox",
        "Firefox WebDriver node",
        "webdriver-image",
        "firefox"
    ),
    image(
        "webdriver-msedge",
        "qaguru/webdriver-msedge",
        "webdriver/msedge",
        "Edge WebDriver node",
        "webdriver-image",
        "msedge"
    ),
    image(
        "playwright-chromium",
        "qaguru/playwright-chromium",
        "playwright/playwright-chromium",
        "Playwright Chromium node",
        "playwright-image",
        "chromium"
    ),
    image(
        "playwright-chrome",
        "qaguru/playwright-chrome",
        "playwright/playwright-chrome",
        "Playwright Chrome node",
        "playwright-image",
        "chrome"
    ),
    image(
        "playwright-firefox",
        "qaguru/playwright-firefox",
        "playwright/playwright-firefox",
        "Playwright Firefox node",
        "playwright-image",
        "firefox"
    ),
    image(
        "playwright-msedge",
        "qaguru/playwright-msedge",
        "playwright/playwright-msedge",
        "Playwright Edge node",
        "playwright-image",
        "msedge"
    ),
    image(
        "playwright-webkit",
        "qaguru/playwright-webkit",
        "playwright/playwright-webkit",
        "Playwright WebKit node",
        "playwright-image",
        "webkit"
    ),
    image("android", "qaguru/android", "android", "Appium Android node", "android"),
    {
        name: "ios",
        awesome: awesome("ios"),
        dashboard: dashboard("ios"),
        comment: "Appium iOS node — not on roadmap",
    },
];
