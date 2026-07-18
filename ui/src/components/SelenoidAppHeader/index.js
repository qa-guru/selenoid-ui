import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@zero-design-system/react";

import { headerConfig } from "../../lib/headerConfig";

const MOUNT_SELECTOR = "#app-header";
const NAV_LINK_SELECTOR = '[data-testid="header-nav"] a, [data-testid="header-menu-nav"] a';

/**
 * Normalize a route so `/videos/` and `/videos` compare equal while `/` stays
 * exact.
 * @param {string} path
 * @returns {string}
 */
function normalize(path) {
    if (!path || path === "/") {
        return "/";
    }
    return path.endsWith("/") ? path.replace(/\/+$/, "") : path;
}

/**
 * Map a HashRouter nav href (`#/capabilities`) to its route path
 * (`/capabilities`). Returns null for non-hash / external hrefs so they are
 * never highlighted.
 * @param {string | null} href
 * @returns {string | null}
 */
function hashHrefToPath(href) {
    if (!href || !href.startsWith("#")) {
        return null;
    }
    const path = href.slice(1) || "/";
    return normalize(path.startsWith("/") ? path : `/${path}`);
}

/**
 * Highlight the nav item matching the current route on the DOM rendered by the
 * canonical header (js/header.js only matches by pathname, which is always "/"
 * under a HashRouter). We set `is-active` / `aria-current` for our own paint and
 * mirror it onto `data-header-active` so header.js's own re-sync
 * (popstate / pushState) converges on the same link instead of clearing it.
 * @param {string} pathname
 * @returns {boolean} whether a rendered nav was found and synced
 */
function syncActiveNav(pathname) {
    const root = document.querySelector(MOUNT_SELECTOR);
    if (!root) {
        return false;
    }
    const links = Array.from(root.querySelectorAll(NAV_LINK_SELECTOR));
    if (links.length === 0) {
        return false;
    }

    const current = normalize(pathname);
    for (const link of links) {
        const isActive = hashHrefToPath(link.getAttribute("href")) === current;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
            link.dataset.headerActive = "true";
        } else {
            link.removeAttribute("aria-current");
            delete link.dataset.headerActive;
        }
    }
    return true;
}

/**
 * Selenoid UI v3 header: the canonical design-system <AppHeader> (embed →
 * js/header.js SSOT) rendered above the Viewport. The header markup, burger
 * menu, theme and lang toggles stay owned by js/header.js; this wrapper only
 * publishes the config (via <AppHeader>) and keeps the active nav item in sync
 * with the HashRouter route.
 */
export function SelenoidAppHeader() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (syncActiveNav(pathname)) {
            return undefined;
        }
        // header.js mounts asynchronously (fetches the template); wait for the
        // nav to appear, then sync once.
        const observer = new MutationObserver(() => {
            if (syncActiveNav(pathname)) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [pathname]);

    return <AppHeader config={headerConfig} />;
}

export default SelenoidAppHeader;
