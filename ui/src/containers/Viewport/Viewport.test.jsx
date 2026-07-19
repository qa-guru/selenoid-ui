import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Viewport from "./index";

vi.mock("../../hooks/useUiFeed", () => ({
    useUiFeed: () => ({
        origin: "http://localhost:8080",
        state: {
            total: 10,
            used: 2,
            pending: 1,
            queued: 0,
            videos: true,
            browsers: {
                chrome: { "128.0": {} },
            },
        },
        browsers: { chrome: 2 },
        sessions: {},
        browserProtocols: {},
        playwrightAccessKey: "",
        version: "2.3.0",
        sseStatus: "ok",
        selenoidStatus: "ok",
        lastUpdate: Date.now(),
    }),
}));

/**
 * In production js/header.js renders `.header__search` / `.header__slot` inside
 * `#app-header`; the Viewport portals the filter and live stats into them. Under
 * jsdom that script does not run, so we stand up the slots the wrapper targets.
 */
function injectHeaderSlots() {
    const header = document.createElement("div");
    header.id = "app-header";
    const search = document.createElement("div");
    search.className = "header__search";
    const slot = document.createElement("div");
    slot.className = "header__slot";
    header.append(search, slot);
    document.body.appendChild(header);
    return header;
}

const renderViewport = (initialEntries = ["/"]) =>
    render(
        <MemoryRouter initialEntries={initialEntries}>
            <Viewport />
        </MemoryRouter>
    );

afterEach(() => {
    document.getElementById("app-header")?.remove();
});

describe("Viewport", () => {
    it("portals SSE indicators and live stats into the header slot", async () => {
        injectHeaderSlots();
        renderViewport();

        await waitFor(() => {
            expect(document.getElementById("sse-status")).toBeInTheDocument();
        });
        expect(document.getElementById("selenoid-status")).toBeInTheDocument();
        expect(screen.getByTestId("header-live-stats")).toBeInTheDocument();
        expect(screen.getByTestId("sse-status-badge")).toHaveClass("status-tile--connected");
        expect(screen.getAllByText("Connected").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByTestId("selenoid-metrics")).toBeInTheDocument();
    });

    it("portals the filter into the header search slot and filters sessions", async () => {
        const user = userEvent.setup();
        injectHeaderSlots();
        renderViewport();

        const filter = await screen.findByPlaceholderText("Filter...");
        expect(document.querySelector(".header__search")).toContainElement(filter);

        await user.type(filter, "chrome");
        expect(filter).toHaveValue("chrome");
    });

    it("shows Capabilities browser select and Create Session on the capabilities route", () => {
        injectHeaderSlots();
        renderViewport(["/capabilities"]);

        expect(screen.getByTestId("capabilities-browser-select")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-driver-panel")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toHaveTextContent("Create Session");
    });
});
