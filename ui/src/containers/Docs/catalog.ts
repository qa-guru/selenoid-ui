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
