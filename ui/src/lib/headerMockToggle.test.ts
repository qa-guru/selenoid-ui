import { afterEach, describe, expect, it, vi } from "vitest";

import { isMockSessionsEnabled, setMockSessionsEnabled } from "./mockSessions";
import { syncHeaderMockToggle } from "./headerMockToggle";

function navMarkup() {
    const mount = document.createElement("div");
    mount.id = "app-header";
    mount.innerHTML = `
      <nav data-testid="header-nav">
        <a href="#/statistics" data-testid="header-nav-statistics">Statistics</a>
        <a href="#/sessions" data-testid="header-nav-sessions">Sessions</a>
        <a href="#/new-session" data-testid="header-nav-new-session">New Session</a>
      </nav>
      <nav data-testid="header-menu-nav">
        <a href="#/statistics" data-testid="header-menu-nav-statistics">Statistics</a>
        <a href="#/sessions" data-testid="header-menu-nav-sessions">Sessions</a>
        <a href="#/new-session" data-testid="header-menu-nav-new-session">New Session</a>
      </nav>
    `;
    document.body.appendChild(mount);
    return mount;
}

afterEach(() => {
    document.body.replaceChildren();
    window.history.replaceState(null, "", "/");
});

describe("syncHeaderMockToggle", () => {
    it("inserts an unpressed ?mock=1 chip next to Sessions in header and burger", () => {
        navMarkup();
        expect(syncHeaderMockToggle(false)).toBe(true);

        const headerBtn = document.querySelector('[data-testid="header-nav-mock"]');
        const menuBtn = document.querySelector('[data-testid="header-menu-nav-mock"]');
        expect(headerBtn).toBeInstanceOf(HTMLButtonElement);
        expect(menuBtn).toBeInstanceOf(HTMLButtonElement);
        expect(headerBtn?.textContent).toBe("?mock=1");
        expect(headerBtn?.getAttribute("aria-pressed")).toBe("false");
        expect(menuBtn?.getAttribute("aria-pressed")).toBe("false");

        const sessions = document.querySelector('[data-testid="header-nav-sessions"]');
        expect(sessions?.nextElementSibling).toBe(headerBtn);

        const row = document.querySelector('[data-testid="header-menu-nav-sessions-row"]');
        expect(row).toContainElement(document.querySelector('[data-testid="header-menu-nav-sessions"]') as HTMLElement);
        expect(row).toContainElement(menuBtn as HTMLElement);
        expect(row?.classList.contains("header-mock-toggle-row")).toBe(true);
        expect(document.querySelector('[data-testid="header-menu-nav-sessions"]')?.nextElementSibling).toBe(
            menuBtn
        );
    });

    it("is idempotent across remount-style re-syncs", () => {
        navMarkup();
        syncHeaderMockToggle(false);
        syncHeaderMockToggle(false);
        expect(document.querySelectorAll('[data-testid="header-nav-mock"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-testid="header-menu-nav-mock"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-testid="header-menu-nav-sessions-row"]')).toHaveLength(1);
    });

    it("toggles ?mock=1 via replaceState on click, without reload", () => {
        navMarkup();
        syncHeaderMockToggle(false);
        const replaceState = vi.spyOn(window.history, "replaceState");

        (document.querySelector('[data-testid="header-nav-mock"]') as HTMLButtonElement).click();

        expect(replaceState).toHaveBeenCalled();
        expect(isMockSessionsEnabled()).toBe(true);
        expect(window.location.search).toBe("?mock=1");

        expect(document.querySelector('[data-testid="header-nav-mock"]')?.getAttribute("aria-pressed")).toBe(
            "true"
        );
        expect(document.querySelector('[data-testid="header-menu-nav-mock"]')?.getAttribute("aria-pressed")).toBe(
            "true"
        );

        (document.querySelector('[data-testid="header-menu-nav-mock"]') as HTMLButtonElement).click();
        expect(isMockSessionsEnabled()).toBe(false);
        expect(window.location.search).toBe("");

        replaceState.mockRestore();
        setMockSessionsEnabled(false);
    });
});
