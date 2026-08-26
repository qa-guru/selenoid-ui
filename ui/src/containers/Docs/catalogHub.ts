import type { CatalogEffect, CatalogScript } from "./catalog";

/** Hub binary vs catalog vs UI — three deploys, not one cron. */
export const CATALOG_PLANES: CatalogEffect[] = [
    {
        label: "Browser images",
        human: "New Chrome, Firefox, Edge, and Playwright tags land on this hub without stopping Selenoid.",
        tech: "watch.yml → catalog_sync.sh → copy browsers.json → docker pull → hub re-reads the list. Watch does not pass version or ui_version.",
    },
    {
        label: "Selenoid (hub binary)",
        human: "A new Selenoid is a new program file from qa-guru/selenoid. The catalog cron does not download it. New Chrome tags are not a Selenoid release.",
        tech: "GitHub Release publishes selenoid_linux_amd64. deploy.yml sends version to install that file. Watch omits version, so a catalog push cannot rewind or replace the hub.",
    },
    {
        label: "This UI",
        human: "A new UI is a new program file for this page. The hub stays up.",
        tech: "GitHub Release on qa-guru/selenoid-ui publishes selenoid-ui_linux_amd64. deploy.yml sends ui_version. An empty ui_version key is omitted.",
    },
];

const SELENOID = "https://github.com/qa-guru/selenoid/blob/main";
const QA_GURU = "https://github.com/qa-guru/selenoid.qa.guru/blob/main";
const UI = "https://github.com/qa-guru/selenoid-ui/blob/main";

/** Real files that move the hub/UI binary. Excerpts copied from those files. */
export const CATALOG_HUB_SCRIPTS: CatalogScript[] = [
    {
        file: "selenoid/.github/workflows/release.yml",
        href: `${SELENOID}/.github/workflows/release.yml`,
        human: "A GitHub Release on qa-guru/selenoid builds the hub program and then installs that tag on the server.",
        tech: "The deploy payload includes version. It does not include ui_version. Catalog watch never calls this workflow.",
        excerpt: `on:
  release:
    types: [published]

  deploy-prod:
    with:
      version: \${{ needs.golang.outputs.release_version }}
      pull_browsers: never`,
    },
    {
        file: "selenoid-ui/.github/workflows/release.yml",
        href: `${UI}/.github/workflows/release.yml`,
        human: "A GitHub Release on qa-guru/selenoid-ui replaces only this UI.",
        tech: "The payload is ui_version. version (the hub tag) is omitted, so the hub program is not replaced.",
        excerpt: `  deploy-prod:
    with:
      ui_version: \${{ needs.selenoid-ui.outputs.release_version }}
      pull_browsers: never`,
    },
    {
        file: "selenoid.qa.guru/deploy/deploy.sh",
        href: `${QA_GURU}/deploy/deploy.sh`,
        human: "The host downloads selenoid_linux_amd64 from the GitHub Release. Catalog-only never enters this branch.",
        tech: "URL is …/releases/download/<tag>/selenoid_linux_amd64 (and selenoid-ui_linux_amd64). kill -HUP does not load a new program — it only re-reads browsers.json.",
        excerpt: `download_binary() {
  local url="https://github.com/\${GITHUB_OWNER}/\${repo}/releases/download/\${tag}/\${repo}_linux_amd64"
  curl -fsSL "$url" -o "$tmp"
}`,
    },
    {
        file: "deploy.sh browsers-only",
        href: `${QA_GURU}/deploy/deploy.sh`,
        human: "Same script, catalog path: copy the list, pull images, ask the hub to re-read. The hub program is not downloaded.",
        tech: "BROWSERS_ONLY=1 when version and ui_version are both omitted. kill -HUP on the running selenoid pid.",
        excerpt: `if browsers_only; then
  apply_production_browsers_json
  pull_browser_images
  sighup_hub_reload_catalog   # kill -HUP "$pid"
  # UI left running
fi`,
    },
];
