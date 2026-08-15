import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import SelenoidAppHeader from "./index";

/**
 * In production the canonical header markup is rendered by js/header.js (async,
 * external module). Under jsdom that script does not execute, so we simulate its
 * rendered nav inside the #app-header mount and assert the wrapper drives the
 * active item from the HashRouter route.
 */
function injectHeaderNav() {
    const mount = document.getElementById("app-header");
    const nav = document.createElement("nav");
    (nav as HTMLElement).dataset.testid = "header-nav";
    const menuNav = document.createElement("nav");
    (menuNav as HTMLElement).dataset.testid = "header-menu-nav";
    const items = [
        ["#/statistics", "header-nav-statistics", "header-menu-nav-statistics", "Statistics"],
        ["#/sessions", "header-nav-sessions", "header-menu-nav-sessions", "Sessions"],
        ["#/new-session", "header-nav-new-session", "header-menu-nav-new-session", "New Session"],
        ["#/benchmarks", "header-nav-benchmarks", "header-menu-nav-benchmarks", "Benchmarks"],
    ];
    for (const [href, testid, menuTestid, label] of items) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.className = "link link--nav";
        (link as HTMLElement).dataset.testid = testid;
        link.textContent = label;
        nav.appendChild(link);

        const menuLink = document.createElement("a");
        menuLink.setAttribute("href", href);
        menuLink.className = "link link--nav";
        (menuLink as HTMLElement).dataset.testid = menuTestid;
        menuLink.textContent = label;
        menuNav.appendChild(menuLink);
    }
    mount!.appendChild(nav);
    mount!.appendChild(menuNav);
}

function activeTestids() {
    return Array.from(document.querySelectorAll('[data-testid="header-nav"] a.is-active')).map(
        (link: any) => (link as HTMLElement).dataset.testid
    );
}

function ariaCurrentTestids() {
    return Array.from(document.querySelectorAll('[data-testid="header-nav"] a[aria-current="page"]')).map(
        (link: any) => (link as HTMLElement).dataset.testid
    );
}

function Navigator() {
    const navigate = useNavigate();
    return (
        <button type="button" data-testid="go-sessions" onClick={() => navigate("/sessions")}>
            go sessions
        </button>
    );
}

const renderHeader = (initialEntries = ["/"]) =>
    render(
        <MemoryRouter initialEntries={initialEntries}>
            <SelenoidAppHeader />
            <Navigator />
        </MemoryRouter>
    );

afterEach(() => {
    const mount = document.getElementById("app-header");
    if (mount) {
        mount!.replaceChildren();
    }
    window.history.replaceState(null, "", "/");
});

describe("SelenoidAppHeader", () => {
    it("renders the canonical #app-header mount", () => {
        renderHeader();
        expect(screen.getByTestId("app-header-mount")).toBeInTheDocument();
        expect(document.getElementById("app-header")).not.toBeNull();
    });

    it("highlights the nav item matching the current hash route", async () => {
        renderHeader(["/new-session"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-new-session"]);
        });
        expect(ariaCurrentTestids()).toEqual(["header-nav-new-session"]);
    });

    it("highlights Statistics on the statistics route", async () => {
        renderHeader(["/statistics"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-statistics"]);
        });
    });

    it("highlights Benchmarks on the benchmarks route", async () => {
        renderHeader(["/benchmarks"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-benchmarks"]);
        });
        expect(ariaCurrentTestids()).toEqual(["header-nav-benchmarks"]);
    });

    it("re-syncs the active item on SPA navigation", async () => {
        const user = userEvent.setup();
        renderHeader(["/statistics"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-statistics"]);
        });

        await user.click(screen.getByTestId("go-sessions"));

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-sessions"]);
        });
        expect(ariaCurrentTestids()).toEqual(["header-nav-sessions"]);
    });

    it("injects an unpressed ?mock=1 button after Benchmarks in header and burger", async () => {
        renderHeader(["/sessions"]);
        injectHeaderNav();

        const headerBtn = await waitFor(() => {
            const btn = document.querySelector('[data-testid="header-nav-mock"]');
            expect(btn).toBeTruthy();
            return btn as HTMLButtonElement;
        });
        const menuBtn = document.querySelector('[data-testid="header-menu-nav-mock"]') as HTMLButtonElement;
        expect(headerBtn.textContent).toBe("?mock=1");
        expect(headerBtn.getAttribute("aria-pressed")).toBe("false");
        expect(menuBtn.getAttribute("aria-pressed")).toBe("false");
        expect(document.querySelector('[data-testid="header-nav"]')?.lastElementChild).toBe(headerBtn);
        expect(headerBtn.previousElementSibling?.getAttribute("data-testid")).toBe("header-nav-mock-divider");
        expect(document.querySelector('[data-testid="header-menu-nav"]')?.lastElementChild).toBe(menuBtn);
        expect(document.querySelector('[data-testid="header-menu-nav-sessions-row"]')).toBeNull();
    });

    it.each(["/statistics", "/sessions", "/new-session", "/benchmarks"] as const)(
        "presses the toggle on %s without leaving the route",
        async (route) => {
            const user = userEvent.setup();
            renderHeader([route]);
            injectHeaderNav();

            const headerBtn = await waitFor(() => {
                const btn = document.querySelector('[data-testid="header-nav-mock"]');
                expect(btn).toBeTruthy();
                return btn as HTMLButtonElement;
            });

            await user.click(headerBtn);

            await waitFor(() => {
                expect(headerBtn.getAttribute("aria-pressed")).toBe("true");
            });
            expect(window.location.search).toBe("?mock=1");
            expect(
                document.querySelector('[data-testid="header-menu-nav-mock"]')?.getAttribute("aria-pressed")
            ).toBe("true");
            expect(activeTestids()).toEqual([`header-nav-${route.slice(1)}`]);
        }
    );
});
