import { syncThemeToggleIcon } from "./theme-icons.js";
import { fetchTemplateText } from "./dom-utils.js";

/**
 * Resolve #app-header lazily. In SPA (Selenoid UI) the mount is created by
 * React after this module may already be imported via selenoid-header-bridge;
 * a top-level throw would poison the ES module cache and kill the header for
 * the whole session (no Stats / Capabilities / Videos links).
 */
function getMount() {
    return document.getElementById("app-header");
}

const TEMPLATE_URLS = [new URL("../templates/header.html", import.meta.url)];

/**
 * @typedef {{ href?: string }} HeaderBrandConfig
 * @typedef {{ href: string, label: string, active?: boolean, testid?: string }} HeaderNavItem
 * @typedef {{ default?: 'ru' | 'en' }} HeaderLangConfig
 * @typedef {{ default?: 'dark' | 'light' }} HeaderThemeConfig
 * @typedef {{ brand?: HeaderBrandConfig, nav?: HeaderNavItem[], lang?: HeaderLangConfig, theme?: HeaderThemeConfig }} HeaderConfig
 */

export const HEADER_LANG_CHANGE = "header:lang-change";

if (typeof window !== "undefined") {
    window.HEADER_LANG_CHANGE = HEADER_LANG_CHANGE;
}

/** @type {HeaderConfig} */
export const DEFAULT_HEADER_CONFIG = {
    brand: {
        href: "https://qa.guru/",
    },
    nav: [
        {
            href: "https://qa.guru/",
            label: "Главная",
            active: true,
            testid: "header-nav-home",
        },
        {
            href: "#",
            label: "Курсы",
            testid: "header-nav-courses",
        },
        {
            href: "https://qa.guru/about",
            label: "О школе",
            testid: "header-nav-about",
        },
    ],
    lang: {
        default: "en",
    },
    theme: {
        default: "light",
    },
};

/** @param {HeaderConfig | undefined} override @returns {HeaderConfig} */
function resolveHeaderConfig(override) {
    if (!override) {
        return DEFAULT_HEADER_CONFIG;
    }
    return {
        ...DEFAULT_HEADER_CONFIG,
        ...override,
        brand: {
            ...DEFAULT_HEADER_CONFIG.brand,
            ...override.brand,
        },
        lang: {
            ...DEFAULT_HEADER_CONFIG.lang,
            ...override.lang,
        },
        theme: {
            ...DEFAULT_HEADER_CONFIG.theme,
            ...override.theme,
        },
        nav: override.nav ?? DEFAULT_HEADER_CONFIG.nav,
    };
}

/**
 * Normalize a pathname for route comparison: drop a trailing slash except for
 * the root, so `/login/` and `/login` match while `/` stays exact.
 * @param {string | null | undefined} pathname @returns {string}
 */
function normalizePathname(pathname) {
    if (!pathname) {
        return "/";
    }
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.replace(/\/+$/, "");
    }
    return pathname;
}

/**
 * Resolve a nav href to a same-origin pathname, or null when it is not a local
 * route (external URL, `#`-anchor, empty). Lets nav items be matched against
 * the current URL instead of trusting a hardcoded `active` flag.
 * @param {string | null | undefined} href @returns {string | null}
 */
function hrefToPathname(href) {
    if (!href || href.startsWith("#")) {
        return null;
    }
    let url;
    try {
        url = new URL(href, window.location.origin);
    } catch {
        return null;
    }
    if (url.origin !== window.location.origin) {
        return null;
    }
    return normalizePathname(url.pathname);
}

/**
 * Recompute is-active / aria-current on the rendered nav from the current URL.
 * Exactly one link is ever marked. Falls back to the config-declared active
 * item (data-header-active) only when no nav href matches the current route.
 * Syncs both inline nav and mobile menu nav links.
 * @param {ParentNode} root
 */
function syncActiveNav(root) {
    const nav = root.querySelector('[data-testid="header-nav"]');
    const menuNav = root.querySelector('[data-testid="header-menu-nav"]');
    const linkSets = [
        nav ? Array.from(nav.querySelectorAll("a")) : [],
        menuNav ? Array.from(menuNav.querySelectorAll("a")) : [],
    ];
    const links = /** @type {HTMLAnchorElement[]} */ (linkSets.flat());
    if (links.length === 0) {
        return;
    }

    const current = normalizePathname(window.location.pathname);
    const routeHref = links.find((link) => hrefToPathname(link.getAttribute("href")) === current)?.getAttribute("href");
    const fallbackHref = links.find((link) => link.dataset.headerActive === "true")?.getAttribute("href");
    const activeHref = routeHref ?? fallbackHref ?? null;

    for (const link of links) {
        const isActive = activeHref !== null && link.getAttribute("href") === activeHref;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    }
}

/** @param {ParentNode} root @param {HeaderConfig} config */
function applyHeaderConfig(root, config) {
    const brandLink = root.querySelector('[data-testid="header-brand-link"]');
    if (brandLink && config.brand?.href) {
        brandLink.href = config.brand.href;
    }

    const nav = root.querySelector('[data-testid="header-nav"]');
    if (!nav || !Array.isArray(config.nav)) {
        return;
    }

    nav.replaceChildren(
        ...config.nav.map((item, index) => {
            const link = document.createElement("a");
            link.href = item.href;
            link.textContent = item.label;
            link.className = "link link--nav";
            link.dataset.testid = item.testid ?? `header-nav-${index}`;
            if (item.active) {
                link.dataset.headerActive = "true";
            }
            return link;
        })
    );

    // Highlight is derived from the real route (not the static config flag) so
    // direct URLs, top-nav clicks and in-form links stay in sync — including SPA
    // pushState navigation observed via observeNavigation().
    syncActiveNav(root);
}

/** @param {ParentNode} root @param {HeaderConfig} config */
function buildHeaderMenu(root, config) {
    const menu = root.querySelector('[data-testid="header-menu"]');
    if (!menu) {
        return;
    }

    menu.replaceChildren();

    if (Array.isArray(config.nav) && config.nav.length > 0) {
        const menuNav = document.createElement("nav");
        menuNav.className = "header__menu-nav";
        menuNav.dataset.testid = "header-menu-nav";
        menuNav.setAttribute("aria-label", "Mobile navigation");
        menuNav.replaceChildren(
            ...config.nav.map((item, index) => {
                const link = document.createElement("a");
                link.href = item.href;
                link.textContent = item.label;
                link.className = "link link--nav";
                link.dataset.testid = `header-menu-nav-${item.testid?.replace(/^header-nav-/, "") ?? index}`;
                if (item.active) {
                    link.dataset.headerActive = "true";
                }
                return link;
            })
        );
        menu.appendChild(menuNav);
    }

    const menuSearch = document.createElement("div");
    menuSearch.className = "header__menu-search";
    menuSearch.dataset.testid = "header-menu-search";
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "input";
    searchInput.placeholder = "Поиск";
    searchInput.dataset.testid = "header-menu-search-input";
    searchInput.setAttribute("aria-label", "Поиск");
    menuSearch.appendChild(searchInput);
    menu.appendChild(menuSearch);

    const menuTools = document.createElement("div");
    menuTools.className = "header__menu-tools";
    menuTools.dataset.testid = "header-menu-tools";

    for (const testid of ["header-github", "header-github-pages"]) {
        const source = root.querySelector(`[data-testid="${testid}"]`);
        if (!source || !(source instanceof HTMLAnchorElement)) {
            continue;
        }
        const link = document.createElement("a");
        link.href = source.href;
        link.className = "icon-btn";
        link.dataset.testid = testid.replace("header-", "header-menu-");
        link.setAttribute("aria-label", source.getAttribute("aria-label") ?? "");
        link.target = source.target;
        link.rel = source.rel;
        const icon = source.querySelector(".icon");
        if (icon) {
            link.innerHTML = icon.outerHTML;
        }
        menuTools.appendChild(link);
    }

    if (menuTools.childElementCount > 0) {
        menu.appendChild(menuTools);
    }

    syncActiveNav(root);
}

/** @param {HTMLElement} menu @param {HTMLElement} burger @param {boolean} open */
function setHeaderMenuOpen(menu, burger, open) {
    menu.hidden = !open;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
}

/** @param {ParentNode} root */
function closeHeaderMenu(root) {
    const menu = root.querySelector('[data-testid="header-menu"]');
    const burger = root.querySelector('[data-testid="header-burger"]');
    if (menu instanceof HTMLElement && burger instanceof HTMLElement) {
        setHeaderMenuOpen(menu, burger, false);
    }
}

/** @param {ParentNode} root */
function bindHeaderMenu(root) {
    const menu = root.querySelector('[data-testid="header-menu"]');
    const burger = root.querySelector('[data-testid="header-burger"]');
    if (!(menu instanceof HTMLElement) || !(burger instanceof HTMLElement)) {
        return;
    }

    if (typeof window.matchMedia !== "function") {
        return;
    }

    const mobileQuery = window.matchMedia("(max-width: 767px)");

    burger.addEventListener("click", () => {
        if (!mobileQuery.matches) {
            return;
        }
        const open = menu.hidden;
        setHeaderMenuOpen(menu, burger, open);
    });

    menu.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("a")) {
            closeHeaderMenu(root);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) {
            closeHeaderMenu(root);
        }
    });

    document.addEventListener("click", (event) => {
        if (menu.hidden) {
            return;
        }
        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }
        const header = root.querySelector('[data-testid="header"]');
        if (header && !header.contains(target)) {
            closeHeaderMenu(root);
        }
    });

    const onViewportChange = () => {
        if (!mobileQuery.matches) {
            closeHeaderMenu(root);
        }
    };
    mobileQuery.addEventListener("change", onViewportChange);
    window.addEventListener("resize", onViewportChange);
}

/** @param {'ru' | 'en'} lang */
function dispatchLangChange(lang) {
    document.dispatchEvent(new CustomEvent(HEADER_LANG_CHANGE, { detail: { lang } }));
}

/** @param {HTMLElement} langBtn @param {HTMLElement} langLabel @param {'ru' | 'en'} lang */
function setLangState(langBtn, langLabel, lang) {
    const code = lang === "en" ? "en" : "ru";
    langBtn.dataset.lang = code;
    langLabel.textContent = code === "ru" ? "RU" : "EN";
    langBtn.setAttribute("aria-label", code === "ru" ? "Переключить на English" : "Switch to Russian");
}

/** @param {ParentNode} root @param {HeaderLangConfig | undefined} langConfig */
function applyLangDefault(root, langConfig) {
    const langBtn = root.querySelector('[data-testid="header-lang-toggle"]');
    const langLabel = root.querySelector('[data-testid="header-lang-label"]');
    if (!langBtn || !langLabel) {
        return;
    }
    const code = langConfig?.default === "ru" ? "ru" : "en";
    setLangState(langBtn, langLabel, code);
    dispatchLangChange(code);
}

/** @param {HTMLElement} themeBtn */
function setThemeIcon(themeBtn) {
    syncThemeToggleIcon(themeBtn);
}

/** @param {HeaderThemeConfig | undefined} themeConfig */
function applyThemeDefault(themeConfig) {
    const isLight = themeConfig?.default !== "dark";
    document.documentElement.classList.toggle("theme-light", isLight);
}

async function fetchHeaderTemplate() {
    for (const url of TEMPLATE_URLS) {
        try {
            return await fetchTemplateText(url);
        } catch {
            continue;
        }
    }
    throw new Error("header.js: failed to load template (404 on all candidate paths)");
}

async function mountHeader() {
    const mount = getMount();
    if (!mount) {
        return;
    }

    mount.innerHTML = await fetchHeaderTemplate();

    const config = resolveHeaderConfig(window.headerConfig);
    applyHeaderConfig(mount, config);
    buildHeaderMenu(mount, config);
    applyLangDefault(mount, config.lang);
    applyThemeDefault(config.theme);

    const themeBtn = mount.querySelector('[data-testid="header-theme-toggle"]');
    if (themeBtn) {
        setThemeIcon(themeBtn);
    }

    bindHeaderControls(mount);
    bindHeaderMenu(mount);
}

function bindHeaderControls(root) {
    const langBtn = root.querySelector('[data-testid="header-lang-toggle"]');
    const langLabel = root.querySelector('[data-testid="header-lang-label"]');
    if (langBtn && langLabel) {
        langBtn.addEventListener("click", () => {
            const next = langBtn.dataset.lang === "ru" ? "en" : "ru";
            setLangState(langBtn, langLabel, next);
            dispatchLangChange(next);
        });
    }

    const themeBtn = root.querySelector('[data-testid="header-theme-toggle"]');
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.documentElement.classList.toggle("theme-light");
            setThemeIcon(themeBtn);
        });
    }
}

/** Re-read `window.headerConfig` and remount #app-header (playground live sync). */
export async function remountHeader() {
    await mountHeader();
}

/**
 * Keep the active nav item in sync with client-side navigation. Browsers fire
 * `popstate` only for back/forward, not for `history.pushState`/`replaceState`
 * used by SPA routers (e.g. React Router `<Link>`), so those are wrapped once
 * to emit a synthetic `header:locationchange`. Registered once at module load;
 * listeners re-read the live DOM, so they survive remountHeader().
 */
function observeNavigation() {
    if (typeof window === "undefined") {
        return;
    }
    const resync = () => {
        const mount = getMount();
        if (mount) {
            syncActiveNav(mount);
        }
    };
    window.addEventListener("popstate", resync);
    window.addEventListener("header:locationchange", resync);

    if (window.__headerNavPatched) {
        return;
    }
    window.__headerNavPatched = true;
    for (const method of ["pushState", "replaceState"]) {
        const original = history[method];
        if (typeof original !== "function") {
            continue;
        }
        history[method] = function patchedHistoryMethod(...args) {
            const result = original.apply(this, args);
            window.dispatchEvent(new Event("header:locationchange"));
            return result;
        };
    }
}

observeNavigation();
mountHeader();
