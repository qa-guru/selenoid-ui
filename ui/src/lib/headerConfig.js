/**
 * Design-system header config for Selenoid UI (HashRouter). Nav hrefs use hash
 * routes; active highlight is synced via syncHeaderHashNav (header.js pathname
 * logic does not match hash links).
 */
export function buildHeaderConfig({ videos = true } = {}) {
    const nav = [
        { href: "#/", label: "Stats", testid: "header-nav-stats" },
        { href: "#/capabilities", label: "Capabilities", testid: "header-nav-capabilities" },
    ];

    if (videos) {
        nav.push({ href: "#/videos", label: "Videos", testid: "header-nav-videos" });
    }

    return {
        brand: { href: "#/", label: "Selenoid UI" },
        nav,
        lang: { default: "en" },
        theme: { default: "dark" },
    };
}

/** @deprecated use buildHeaderConfig */
export const headerConfig = buildHeaderConfig();
