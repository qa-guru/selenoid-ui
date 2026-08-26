export type CatalogStep = {
    title: string;
    stat: string;
    human: string;
    tech: string;
};

export type CatalogEffect = {
    label: string;
    human: string;
    tech: string;
};

/** Facts only: hub SIGHUP reloads browsers.json; UI has no SIGHUP handler; chips come from hub status. */
export const CATALOG_STEPS: CatalogStep[] = [
    {
        title: "Copy",
        stat: "browsers.json",
        human: "The catalog file is placed where the hub already reads it.",
        tech: "browsers.json on the host. The hub is not given a new binary.",
    },
    {
        title: "Pull",
        stat: "docker pull",
        human: "Images named in that file are downloaded first.",
        tech: "docker pull. SIGHUP does not download images.",
    },
    {
        title: "SIGHUP",
        stat: "hub stays up",
        human: "The hub re-reads the file in place. It does not stop.",
        tech: "SIGHUP reloads browsers.json in memory. Live sessions are not closed.",
    },
];

export const CATALOG_EFFECTS: CatalogEffect[] = [
    {
        label: "Sessions already running",
        human: "They stay connected.",
        tech: "SIGHUP reloads the catalog, not the session map.",
    },
    {
        label: "Hub process",
        human: "It stays up.",
        tech: "Reload in memory. Not systemctl restart, not docker stop.",
    },
    {
        label: "This UI",
        human: "It stays up.",
        tech: "No SIGHUP handler here. A hangup would stop the process.",
    },
    {
        label: "New Session chips",
        human: "They pick up the new versions from the hub.",
        tech:
            "The UI polls hub status. Playwright names are detected by name, so a new version does not need a UI restart.",
    },
    {
        label: "Warm or hot slot already running",
        human: "It keeps the image it was started with.",
        tech: "Until that slot is recycled. New cold sessions use the new image.",
    },
];

export const CATALOG_WATCH_HREF = "https://github.com/qa-guru/browser-image";
export const CATALOG_WATCH_LABEL = "qa-guru/browser-image";
export const CATALOG_VERSIONS_HREF = "https://github.com/qa-guru/selenoid/blob/main/docs/browser-versions.md";

export type CatalogSourceLink = {
    href: string;
    label: string;
};

export type CatalogSource = {
    name: string;
    watch: boolean;
    human: string;
    tech: string;
    links: CatalogSourceLink[];
};

/** URLs copied from browser-image/scripts/watch_upstream.py. Android is not on that cron. */
export const CATALOG_SOURCES: CatalogSource[] = [
    {
        name: "Chrome",
        watch: true,
        human: "Stable from Chrome for Testing.",
        tech: "JSON field channels.Stable.version. Zip + chromedriver must exist on chrome-for-testing-public.",
        links: [
            {
                href: "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json",
                label: "last-known-good-versions.json",
            },
        ],
    },
    {
        name: "Firefox",
        watch: true,
        human: "Latest release from Mozilla product-details.",
        tech: "JSON field LATEST_FIREFOX_VERSION. Linux tarball must exist on ftp.mozilla.org.",
        links: [
            {
                href: "https://product-details.mozilla.org/1.0/firefox_versions.json",
                label: "firefox_versions.json",
            },
        ],
    },
    {
        name: "Edge",
        watch: true,
        human: "microsoft-edge-stable from the Microsoft apt repo.",
        tech: "Highest Version: in Packages. Deb + msedgedriver zip must exist.",
        links: [
            {
                href: "https://packages.microsoft.com/repos/edge/dists/stable/main/binary-amd64/Packages",
                label: "edge …/Packages",
            },
        ],
    },
    {
        name: "Playwright",
        watch: true,
        human: "Latest stable @playwright/test on npm.",
        tech: "npm latest version, then MCR must have tag v{version}-noble.",
        links: [
            {
                href: "https://registry.npmjs.org/@playwright/test/latest",
                label: "npm @playwright/test/latest",
            },
            {
                href: "https://mcr.microsoft.com/v2/playwright/tags/list",
                label: "MCR playwright/tags/list",
            },
        ],
    },
    {
        name: "Android",
        watch: false,
        human: "Pinned in browsers.json. Watch does not rewrite it.",
        tech:
            "qaguru/android via sdkmanager. cmdline-tools zip from dl.google.com/android/repository. Appium and UiAutomator2 are Dockerfile ARGs, not the watch cron.",
        links: [
            {
                href: "https://github.com/qa-guru/browser-image/tree/main/android",
                label: "browser-image/android",
            },
            {
                href: "https://dl.google.com/android/repository/",
                label: "dl.google.com/android/repository",
            },
        ],
    },
];
