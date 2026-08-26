export type CatalogStep = {
    title: string;
    stat: string;
    human: string;
    tech: string;
    excerpt?: string;
    href?: string;
};

export type CatalogEffect = {
    label: string;
    human: string;
    tech: string;
};

/** Facts only: hub re-reads browsers.json without stopping; UI has no such reload; chips come from hub status. */
export const CATALOG_STEPS: CatalogStep[] = [
    {
        title: "Copy",
        stat: "browsers.json",
        human: "The new list of browsers is written where the hub already looks.",
        tech: "browsers.json on the host. The hub program file is not replaced.",
        href: "https://github.com/qa-guru/selenoid.qa.guru/blob/main/deploy/deploy.sh",
        excerpt: `cp "$BROWSERS_PRODUCTION" "$CONFIG_DIR/browsers.json"`,
    },
    {
        title: "Pull",
        stat: "docker pull",
        human: "For each image name in that file the host runs docker pull, before the hub re-reads the list.",
        tech: "Example: docker pull qaguru/webdriver-chrome:152. Re-reading the file does not download anything.",
        href: "https://github.com/qa-guru/selenoid.qa.guru/blob/main/deploy/deploy.sh",
        excerpt: `jq -r '.. | objects | select(has("image")) | .image' "$CONFIG_DIR/browsers.json"

echo "--- docker pull \${img} ---"
docker pull "$img"`,
    },
    {
        title: "Reload",
        stat: "hub stays up",
        human: "The hub is asked to re-read the list. It does not stop. Open sessions stay.",
        tech: "On the host that is kill -HUP on the hub pid. Not systemctl restart, not docker stop.",
        href: "https://github.com/qa-guru/selenoid.qa.guru/blob/main/deploy/deploy.sh",
        excerpt: `kill -HUP "$pid"`,
    },
];

export const CATALOG_EFFECTS: CatalogEffect[] = [
    {
        label: "Sessions already running",
        human: "They stay connected.",
        tech: "The hub re-reads the list. It does not drop the session map.",
    },
    {
        label: "Hub process",
        human: "It stays up.",
        tech: "Re-read in memory. Not systemctl restart, not docker stop.",
    },
    {
        label: "This UI",
        human: "It stays up.",
        tech: "This process does not re-read on hangup. The same kill -HUP would stop it.",
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

const BI = "https://github.com/qa-guru/browser-image/blob/main";

export type CatalogScript = {
    file: string;
    href: string;
    human: string;
    tech: string;
    excerpt: string;
};

/** Real files the watch job runs. Excerpts are copied from those files, not paraphrased. */
export const CATALOG_SCRIPTS: CatalogScript[] = [
    {
        file: "pins.json",
        href: `${BI}/pins.json`,
        human: "The two-layer window: default + previous, with exact Chrome/Firefox/Edge/Playwright strings.",
        tech: "Watch writes this file. Image builds read it via pin_get.py / *-versions.sh.",
        excerpt: `{
  "chrome": {
    "default_major": 152,
    "regression_major": 151,
    "versions": { "152": "152.0.7977.64", "151": "151.0.7922.138" }
  },
  "playwright": { "default": "1.62.1", "regression": "1.61.1", "mcr_distro": "noble" }
}`,
    },
    {
        file: ".github/workflows/watch.yml",
        href: `${BI}/.github/workflows/watch.yml`,
        human: "Cron every 15 minutes. Resolve → pin → tags one by one → Hub 200 → catalog. dry_run skips writes.",
        tech: "Does not wait for selenoid-tests smoke. Does not pass hub/UI version into deploy.",
        excerpt: `on:
  schedule:
    - cron: "7,22,37,52 * * * *"

# later, same job:
python3 scripts/watch_upstream.py wait-hub --plan plan.json ...
bash scripts/catalog_sync.sh plan.json`,
    },
    {
        file: "scripts/watch_upstream.py",
        href: `${BI}/scripts/watch_upstream.py`,
        human: "Fetches stables and diffs them against pins.json. No-op when they already match.",
        tech: "Chrome = channels.Stable.version. Firefox = LATEST_FIREFOX_VERSION. Edge = max microsoft-edge-stable. Playwright = npm latest + MCR vX-noble.",
        excerpt: `def resolve_chrome() -> dict[str, Any]:
    lkg = http_json(CFT_LKG)
    stable = (lkg.get("channels") or {}).get("Stable") or {}
    version = str(stable.get("version") or "")
    ...
    return {"major": major, "version": version}

def resolve_playwright() -> dict[str, Any]:
    latest = str(http_json(NPM_PW_LATEST).get("version") or "")
    return {"version": latest, "mcr_tag": f"v{latest}-noble"}`,
    },
    {
        file: "scripts/push_watch_tags.sh",
        href: `${BI}/scripts/push_watch_tags.sh`,
        human: "Pushes git tags one at a time so each tag starts its own publish workflow.",
        tech: "A PAT must push the tags. GITHUB_TOKEN tag pushes do not start Actions. Existing tag = delete + recreate.",
        excerpt: `git tag -a "\${tag}" -m "\${tag}"
git push origin "refs/tags/\${tag}"
sleep "\${sleep_s}"   # default 3s; do not git push origin tag1 tag2`,
    },
    {
        file: ".github/workflows/publish-webdriver.yml",
        href: `${BI}/.github/workflows/publish-webdriver.yml`,
        human: "Tag webdriver/chrome-N (and firefox/msedge, warm or -min) builds that one image and pushes Docker Hub.",
        tech: "Concurrency is per git ref, so chrome-152 and chrome-152-min run together. A shared group would cancel siblings.",
        excerpt: `on:
  push:
    tags:
      - "webdriver/chrome-[0-9]+"
      - "webdriver/chrome-[0-9]+-min"
      # firefox / msedge same shape

concurrency:
  group: browser-image-webdriver-\${{ github.ref }}
  cancel-in-progress: false`,
    },
    {
        file: "scripts/update_catalog.py",
        href: `${BI}/scripts/update_catalog.py`,
        human: "Rewrites browsers.json to the pin window. Leaves Android as-is.",
        tech: "Keeps hosts/env/shmSize from the existing file. Sliding window = default + regression, each with warm + min when min already exists.",
        excerpt: `Does not touch android. Sliding window = default + regression
(warm + min when the file already has -min entries).

image = qaguru/webdriver-{chrome|firefox|msedge}:{major}[-min]
image = qaguru/playwright-*:{semver}[-min]`,
    },
    {
        file: "scripts/catalog_sync.sh",
        href: `${BI}/scripts/catalog_sync.sh`,
        human: "After Hub 200, clones each catalog repo, runs update_catalog.py, commits, pushes. This UI is browsers.json only.",
        tech: "Order: selenoid → cm → selenoid-tests → selenoid-ui → selenoid.qa.guru last. That last push copies the list, pulls images, and asks the hub to re-read. It does not restart hub or UI.",
        excerpt: `clone_repo qa-guru/selenoid-ui ...
python3 update_catalog.py --file .../selenoid-ui/browsers.json
commit_push ... browsers.json

# LAST — browsers-only: copy + docker pull + hub re-reads the file
clone_repo qa-guru/selenoid.qa.guru ...
commit_push ... deploy/browsers-production.json`,
    },
    {
        file: "selenoid-ui/browsers.json",
        href: "https://github.com/qa-guru/selenoid-ui/blob/main/browsers.json",
        human: "This repo's copy of the hub catalog. Watch overwrites it. A UI release does not.",
        tech: "UI start flag -browsers-conf. New Session chips still come from hub /status after the hub re-reads the list.",
        excerpt: `"chrome": { "default": "152.0", "versions": { "152.0": { "image": "qaguru/webdriver-chrome:152" }, ... } }
"android": { "default": "16.0", ... }   # watch does not rewrite this block`,
    },
];

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
