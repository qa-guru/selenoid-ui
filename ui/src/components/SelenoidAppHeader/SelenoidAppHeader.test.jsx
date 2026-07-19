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
    nav.dataset.testid = "header-nav";
    const items = [
        ["#/", "header-nav-stats", "STATS"],
        ["#/capabilities", "header-nav-capabilities", "CAPABILITIES"],
        ["#/videos", "header-nav-videos", "VIDEOS"],
    ];
    for (const [href, testid, label] of items) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.className = "link link--nav";
        link.dataset.testid = testid;
        link.textContent = label;
        nav.appendChild(link);
    }
    mount.appendChild(nav);
}

function activeTestids() {
    return Array.from(document.querySelectorAll('[data-testid="header-nav"] a.is-active')).map(
        (link) => link.dataset.testid
    );
}

function ariaCurrentTestids() {
    return Array.from(document.querySelectorAll('[data-testid="header-nav"] a[aria-current="page"]')).map(
        (link) => link.dataset.testid
    );
}

function Navigator() {
    const navigate = useNavigate();
    return (
        <button type="button" data-testid="go-videos" onClick={() => navigate("/videos")}>
            go videos
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
        mount.replaceChildren();
    }
});

describe("SelenoidAppHeader", () => {
    it("renders the canonical #app-header mount", () => {
        renderHeader();
        expect(screen.getByTestId("app-header-mount")).toBeInTheDocument();
        expect(document.getElementById("app-header")).not.toBeNull();
    });

    it("highlights the nav item matching the current hash route", async () => {
        renderHeader(["/capabilities"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-capabilities"]);
        });
        expect(ariaCurrentTestids()).toEqual(["header-nav-capabilities"]);
    });

    it("highlights STATS on the root route", async () => {
        renderHeader(["/"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-stats"]);
        });
    });

    it("re-syncs the active item on SPA navigation", async () => {
        const user = userEvent.setup();
        renderHeader(["/"]);
        injectHeaderNav();

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-stats"]);
        });

        await user.click(screen.getByTestId("go-videos"));

        await waitFor(() => {
            expect(activeTestids()).toEqual(["header-nav-videos"]);
        });
        expect(ariaCurrentTestids()).toEqual(["header-nav-videos"]);
    });
});
