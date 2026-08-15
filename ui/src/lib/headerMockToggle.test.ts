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
        <a href="#/benchmarks" data-testid="header-nav-benchmarks">Benchmarks</a>
      </nav>
      <nav data-testid="header-menu-nav">
        <a href="#/statistics" data-testid="header-menu-nav-statistics">Statistics</a>
        <a href="#/sessions" data-testid="header-menu-nav-sessions">Sessions</a>
        <a href="#/new-session" data-testid="header-menu-nav-new-session">New Session</a>
        <a href="#/benchmarks" data-testid="header-menu-nav-benchmarks">Benchmarks</a>
      </nav>
    `;
    document.body.appendChild(mount);
    return mount;
}

afterEach(() => {
    document.body.replaceChildren();
    window.history.replaceState(null, "", "/");
    setMockSessionsEnabled(false);
});

describe("syncHeaderMockToggle", () => {
    it("inserts an unpressed ?mock=1 button after Benchmarks in header and burger", () => {
        navMarkup();
        expect(syncHeaderMockToggle(false)).toBe(true);

        const headerBtn = document.querySelector('[data-testid="header-nav-mock"]');
        const menuBtn = document.querySelector('[data-testid="header-menu-nav-mock"]');
        expect(headerBtn).toBeInstanceOf(HTMLButtonElement);
        expect(menuBtn).toBeInstanceOf(HTMLButtonElement);
        expect(headerBtn?.textContent).toBe("?mock=1");
        expect(headerBtn?.getAttribute("aria-pressed")).toBe("false");
        expect(menuBtn?.getAttribute("aria-pressed")).toBe("false");

        const headerNav = document.querySelector('[data-testid="header-nav"]');
        expect(headerNav?.lastElementChild).toBe(headerBtn);
        expect(headerBtn?.previousElementSibling?.getAttribute("data-testid")).toBe("header-nav-mock-divider");
        expect(document.querySelector('[data-testid="header-nav-benchmarks"]')?.nextElementSibling).toBe(
            headerBtn?.previousElementSibling
        );

        const menuNav = document.querySelector('[data-testid="header-menu-nav"]');
        expect(menuNav?.lastElementChild).toBe(menuBtn);
        expect(document.querySelector('[data-testid="header-menu-nav-benchmarks"]')?.nextElementSibling).toBe(
            menuBtn
        );
        expect(document.querySelector('[data-testid="header-menu-nav-sessions-row"]')).toBeNull();
        expect(document.querySelector('[data-testid="header-nav-sessions"]')?.nextElementSibling).not.toBe(
            headerBtn
        );
    });

    it("is idempotent across remount-style re-syncs", () => {
        navMarkup();
        syncHeaderMockToggle(false);
        syncHeaderMockToggle(false);
        expect(document.querySelectorAll('[data-testid="header-nav-mock"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-testid="header-menu-nav-mock"]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-testid="header-nav-mock-divider"]')).toHaveLength(1);
        expect(document.querySelector('[data-testid="header-nav"]')?.lastElementChild).toBe(
            document.querySelector('[data-testid="header-nav-mock"]')
        );
        expect(document.querySelector('[data-testid="header-menu-nav"]')?.lastElementChild).toBe(
            document.querySelector('[data-testid="header-menu-nav-mock"]')
        );
    });

    it("moves a leftover chip next to Sessions to the end and unwraps the burger row", () => {
        navMarkup();
        const sessions = document.querySelector('[data-testid="header-nav-sessions"]') as HTMLElement;
        const leftover = document.createElement("button");
        leftover.dataset.testid = "header-nav-mock";
        leftover.textContent = "?mock=1";
        sessions.insertAdjacentElement("afterend", leftover);

        const menuSessions = document.querySelector('[data-testid="header-menu-nav-sessions"]') as HTMLElement;
        const row = document.createElement("div");
        row.className = "header-mock-toggle-row";
        row.dataset.testid = "header-menu-nav-sessions-row";
        menuSessions.replaceWith(row);
        row.appendChild(menuSessions);
        const menuLeftover = document.createElement("button");
        menuLeftover.dataset.testid = "header-menu-nav-mock";
        menuLeftover.textContent = "?mock=1";
        row.appendChild(menuLeftover);

        expect(syncHeaderMockToggle(false)).toBe(true);

        expect(document.querySelector('[data-testid="header-nav"]')?.lastElementChild).toBe(
            document.querySelector('[data-testid="header-nav-mock"]')
        );
        expect(document.querySelector('[data-testid="header-menu-nav"]')?.lastElementChild).toBe(
            document.querySelector('[data-testid="header-menu-nav-mock"]')
        );
        expect(document.querySelector('[data-testid="header-menu-nav-sessions-row"]')).toBeNull();
        expect(document.querySelector('[data-testid="header-menu-nav-sessions"]')?.parentElement?.getAttribute("data-testid")).toBe(
            "header-menu-nav"
        );
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
    });

    it.each(["#/statistics", "#/new-session", "#/benchmarks", "#/sessions"])(
        "keeps the hash route %s when toggling",
        (hash) => {
            window.history.replaceState(null, "", `/${hash}`);
            navMarkup();
            syncHeaderMockToggle(false);

            (document.querySelector('[data-testid="header-nav-mock"]') as HTMLButtonElement).click();

            expect(window.location.hash).toBe(hash);
            expect(window.location.search).toBe("?mock=1");
            expect(isMockSessionsEnabled()).toBe(true);
        }
    );
});
