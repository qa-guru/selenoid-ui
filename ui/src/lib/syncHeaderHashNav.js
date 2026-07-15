/**
 * Keep design-system header nav in sync with HashRouter routes. header.js
 * hrefToPathname() ignores hash hrefs — selenoid applies is-active locally.
 */

export function normalizeHashRoute(hash) {
    const raw = hash || "#/";
    if (raw === "#" || raw === "") {
        return "#/";
    }

    let path = raw.startsWith("#") ? raw.slice(1) : raw;
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    if (path.length > 1 && path.endsWith("/")) {
        path = path.replace(/\/+$/, "");
    }

    return `#${path}`;
}

function hashFromNavHref(href) {
    if (!href || !href.startsWith("#")) {
        return null;
    }
    return normalizeHashRoute(href);
}

export function syncHeaderHashNav() {
    const current = normalizeHashRoute(window.location.hash);
    const navRoots = document.querySelectorAll('[data-testid="header-nav"], [data-testid="header-menu-nav"]');

    navRoots.forEach((nav) => {
        nav.querySelectorAll("a").forEach((link) => {
            const linkHash = hashFromNavHref(link.getAttribute("href"));
            const isActive = linkHash !== null && linkHash === current;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    });
}

export function bindHeaderHashNav() {
    const handler = () => syncHeaderHashNav();
    window.addEventListener("hashchange", handler);
    handler();
    return () => window.removeEventListener("hashchange", handler);
}
