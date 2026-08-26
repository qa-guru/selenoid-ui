import browsersFileJson from "../../../../browsers.json";

export type CatalogVersionMeta = {
    image?: string;
    protocol?: string;
};

export type CatalogFamily = {
    default?: string;
    versions?: Record<string, CatalogVersionMeta>;
};

export type BrowsersFile = Record<string, CatalogFamily>;

export type CatalogImageRow = {
    name: string;
    version: string;
    image: string;
    dockerHub: string;
    isDefault: boolean;
    protocol: string;
    min: boolean;
};

export const BROWSERS_FILE = browsersFileJson as BrowsersFile;

const FAMILY_ORDER = [
    "chrome",
    "firefox",
    "msedge",
    "playwright-chromium",
    "playwright-chrome",
    "playwright-firefox",
    "playwright-webkit",
    "playwright-msedge",
    "android",
];

export function inferBrowserImage(name: string, version: string): string {
    const min = version.endsWith("-min");
    const ver = min ? version.slice(0, -4) : version;
    if (name.startsWith("playwright-")) {
        return `qaguru/${name}:${ver}${min ? "-min" : ""}`;
    }
    if (name === "android") {
        if (ver === "5.1") {
            return "selenoid/android:5.1";
        }
        return `qaguru/android:${ver.split(".")[0] ?? ver}`;
    }
    return `qaguru/webdriver-${name}:${ver.split(".")[0] ?? ver}${min ? "-min" : ""}`;
}

export function dockerHubHref(image: string): string {
    const repo = image.split(":")[0] ?? image;
    return `https://hub.docker.com/r/${repo}`;
}

export function inferProtocol(name: string, meta?: CatalogVersionMeta): string {
    if (meta?.protocol) {
        return meta.protocol.toLowerCase();
    }
    return name.startsWith("playwright-") ? "playwright" : "webdriver";
}

function familyRank(name: string): number {
    const index = FAMILY_ORDER.indexOf(name);
    return index === -1 ? FAMILY_ORDER.length + name.charCodeAt(0) : index;
}

function sortRows(a: CatalogImageRow, b: CatalogImageRow): number {
    const family = familyRank(a.name) - familyRank(b.name);
    if (family !== 0) {
        return family;
    }
    const name = a.name.localeCompare(b.name);
    if (name !== 0) {
        return name;
    }
    const coreA = a.version.replace(/-min$/, "");
    const coreB = b.version.replace(/-min$/, "");
    const core = coreB.localeCompare(coreA, undefined, { numeric: true });
    if (core !== 0) {
        return core;
    }
    return Number(a.min) - Number(b.min);
}

type HubBrowsers = Record<string, Record<string, unknown>>;
type Protocols = Record<string, Record<string, { protocol?: string }>>;

export function listCatalogImages(
    file: BrowsersFile = BROWSERS_FILE,
    hubBrowsers?: HubBrowsers | null,
    protocols?: Protocols
): CatalogImageRow[] {
    const live = hubBrowsers && Object.keys(hubBrowsers).length > 0 ? hubBrowsers : null;
    const names = live ? Object.keys(live) : Object.keys(file);
    const rows: CatalogImageRow[] = [];

    for (const name of names) {
        const family = file[name];
        const versions = live ? Object.keys(live[name] ?? {}) : Object.keys(family?.versions ?? {});
        for (const version of versions) {
            const meta = family?.versions?.[version];
            const image = meta?.image || inferBrowserImage(name, version);
            const protocol =
                protocols?.[name]?.[version]?.protocol || inferProtocol(name, meta);
            rows.push({
                name,
                version,
                image,
                dockerHub: dockerHubHref(image),
                isDefault: family?.default === version,
                protocol,
                min: version.endsWith("-min"),
            });
        }
    }

    return rows.sort(sortRows);
}
