import { isMockSessionsEnabled, setMockSessionsEnabled } from "./mockSessions";

const HEADER_SESSIONS = '[data-testid="header-nav-sessions"]';
const MENU_SESSIONS = '[data-testid="header-menu-nav-sessions"]';
const HEADER_TOGGLE = "header-nav-mock";
const MENU_TOGGLE = "header-menu-nav-mock";
const MENU_ROW = "header-mock-toggle-row";

function onMockToggleClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    setMockSessionsEnabled(!isMockSessionsEnabled());
    syncHeaderMockToggle(isMockSessionsEnabled());
}

function ensureMenuRow(sessionsLink: HTMLElement): HTMLElement {
    const parent = sessionsLink.parentElement;
    if (parent?.classList.contains(MENU_ROW)) {
        return parent;
    }
    const row = document.createElement("div");
    row.className = MENU_ROW;
    row.dataset.testid = "header-menu-nav-sessions-row";
    sessionsLink.replaceWith(row);
    row.appendChild(sessionsLink);
    return row;
}

function ensureToggleButton(sessionsLink: HTMLElement, testid: string, enabled: boolean): void {
    const host = sessionsLink.parentElement;
    if (!host) {
        return;
    }
    const existing = host.querySelector(`[data-testid="${testid}"]`);
    const btn =
        existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!(existing instanceof HTMLButtonElement)) {
        btn.type = "button";
        btn.className = "header-mock-toggle";
        btn.dataset.testid = testid;
        btn.textContent = "?mock=1";
        btn.addEventListener("click", onMockToggleClick);
        sessionsLink.insertAdjacentElement("afterend", btn);
    }
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.setAttribute(
        "aria-label",
        enabled ? "Disable mock sessions (?mock=1)" : "Enable mock sessions (?mock=1)"
    );
    btn.classList.toggle("is-pressed", enabled);
}

/**
 * Idempotent: insert (or update) the `?mock=1` toggle next to Sessions in the
 * inline header nav and the burger menu. Safe to call on every header remount.
 */
export function syncHeaderMockToggle(enabled: boolean = isMockSessionsEnabled()): boolean {
    const headerLink = document.querySelector(HEADER_SESSIONS);
    const menuLink = document.querySelector(MENU_SESSIONS);
    if (!(headerLink instanceof HTMLElement) && !(menuLink instanceof HTMLElement)) {
        return false;
    }
    if (headerLink instanceof HTMLElement) {
        ensureToggleButton(headerLink, HEADER_TOGGLE, enabled);
    }
    if (menuLink instanceof HTMLElement) {
        ensureMenuRow(menuLink);
        ensureToggleButton(menuLink, MENU_TOGGLE, enabled);
    }
    return true;
}

export default syncHeaderMockToggle;
