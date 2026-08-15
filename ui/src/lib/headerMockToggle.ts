import { isMockSessionsEnabled, setMockSessionsEnabled } from "./mockSessions";

const HEADER_NAV = '[data-testid="header-nav"]';
const MENU_NAV = '[data-testid="header-menu-nav"]';
const HEADER_TOGGLE = "header-nav-mock";
const MENU_TOGGLE = "header-menu-nav-mock";
const HEADER_DIVIDER = "header-nav-mock-divider";
const LEGACY_MENU_ROW = "header-menu-nav-sessions-row";

function onMockToggleClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    setMockSessionsEnabled(!isMockSessionsEnabled());
    syncHeaderMockToggle(isMockSessionsEnabled());
}

/** Undo the old Sessions+chip burger row so the toggle can be a real menu item. */
function unwrapLegacyMenuRow(): void {
    const row = document.querySelector(`[data-testid="${LEGACY_MENU_ROW}"]`);
    if (!(row instanceof HTMLElement) || !row.parentElement) {
        return;
    }
    const parent = row.parentElement;
    while (row.firstChild) {
        parent.insertBefore(row.firstChild, row);
    }
    row.remove();
}

function applyPressedState(btn: HTMLButtonElement, enabled: boolean): void {
    btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    btn.setAttribute(
        "aria-label",
        enabled ? "Disable mock sessions (?mock=1)" : "Enable mock sessions (?mock=1)"
    );
    btn.classList.toggle("is-pressed", enabled);
}

function createToggleButton(testid: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "header-mock-toggle";
    btn.dataset.testid = testid;
    btn.textContent = "?mock=1";
    btn.addEventListener("click", onMockToggleClick);
    return btn;
}

function createDivider(): HTMLElement {
    const divider = document.createElement("span");
    divider.className = "plaque-divider";
    divider.setAttribute("aria-hidden", "true");
    divider.dataset.testid = HEADER_DIVIDER;
    return divider;
}

/**
 * Place the toggle as the last child of a nav. Desktop nav gets a plaque
 * divider in front so the chip is a separate item after Benchmarks, not a
 * sibling glued to Sessions.
 */
function ensureToggleAtEnd(nav: HTMLElement, testid: string, enabled: boolean, withDivider: boolean): void {
    const existing = nav.querySelector(`[data-testid="${testid}"]`);
    const btn =
        existing instanceof HTMLButtonElement ? existing : createToggleButton(testid);

    let divider: Element | null = withDivider
        ? nav.querySelector(`[data-testid="${HEADER_DIVIDER}"]`)
        : null;
    if (withDivider && !(divider instanceof HTMLElement)) {
        divider = createDivider();
    }

    const last = nav.lastElementChild;
    const alreadyLast = last === btn && (!withDivider || last?.previousElementSibling === divider);
    if (!alreadyLast) {
        if (withDivider && divider instanceof HTMLElement) {
            nav.append(divider, btn);
        } else {
            nav.appendChild(btn);
        }
    }

    applyPressedState(btn, enabled);
}

/**
 * Idempotent: insert (or update) the `?mock=1` toggle as the last item in the
 * inline header nav and as its own burger-menu row. Safe on every remount.
 */
export function syncHeaderMockToggle(enabled: boolean = isMockSessionsEnabled()): boolean {
    unwrapLegacyMenuRow();
    const headerNav = document.querySelector(HEADER_NAV);
    const menuNav = document.querySelector(MENU_NAV);
    if (!(headerNav instanceof HTMLElement) && !(menuNav instanceof HTMLElement)) {
        return false;
    }
    if (headerNav instanceof HTMLElement) {
        ensureToggleAtEnd(headerNav, HEADER_TOGGLE, enabled, true);
    }
    if (menuNav instanceof HTMLElement) {
        ensureToggleAtEnd(menuNav, MENU_TOGGLE, enabled, false);
    }
    return true;
}

export default syncHeaderMockToggle;
