/**
 * Selenoid UI v3 header config — published to `window.headerConfig` by
 * <SelenoidAppHeader> before the canonical design-system header (js/header.js)
 * reads it. Nav hrefs are HashRouter routes (`#/…`) so the SSOT header renders
 * real SPA links; active state is derived from the live route by the wrapper.
 *
 * @typedef {import('@zero-design-system/react').HeaderConfig} HeaderConfig
 */

/** @type {HeaderConfig} */
export const headerConfig = {
    brand: {
        href: "https://qa.guru/",
        leading: {
            href: "#/statistic",
            label: "Selenoid 3",
        },
    },
    nav: [
        { href: "#/statistic", label: "Statistic", testid: "header-nav-statistic" },
        { href: "#/sessions", label: "Sessions", testid: "header-nav-sessions" },
        { href: "#/new-session", label: "New Session", testid: "header-nav-new-session" },
    ],
    lang: {
        default: "en",
    },
    theme: {
        default: "dark",
    },
};

export default headerConfig;
