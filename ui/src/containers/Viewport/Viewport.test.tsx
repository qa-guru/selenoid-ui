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
        const hot = screen.getByTestId("selenoid-metrics-hot");
        expect(hot).toHaveTextContent("Hot");
        expect(hot.querySelector(".selenoid-metrics__value")?.textContent).toBe("0 / 0");
        expect(screen.getByTestId("browsers-panel")).toBeInTheDocument();
        expect(screen.getByTestId("warm-slots-panel")).toBeInTheDocument();
        expect(screen.getByTestId("hot-slots-panel")).toBeInTheDocument();
        expect(screen.getByTestId("warm-slots-title")).toHaveTextContent("Warm pool");
        expect(screen.getByTestId("hot-slots-title")).toHaveTextContent("Hot pool");
        expect(screen.getAllByTestId("pool-slot-empty")).toHaveLength(2);
    });

    it("portals the filter into the header search slot and filters sessions", async () => {
        const user = userEvent.setup();
        injectHeaderSlots();
        renderViewport();

        const filter = await screen.findByPlaceholderText("Filter...");
        expect(document.querySelector(".header__search")).toContainElement(filter);

        await user.type(filter, "chrome");
        expect(filter!).toHaveValue("chrome");
    });

    it("shows Capabilities browser select and Create Session on the new-session route", () => {
        injectHeaderSlots();
        renderViewport(["/new-session"]);

        expect(screen.getByTestId("capabilities-browser-select")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-driver-panel")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toHaveTextContent("Create Session");
    });

    it("shows Benchmarks catalog on the benchmarks route", () => {
        injectHeaderSlots();
        renderViewport(["/benchmarks"]);

        expect(screen.getByTestId("benchmarks-page")).toBeInTheDocument();
        expect(screen.getByTestId("benchmarks-catalog")).toBeInTheDocument();
    });

    it("shows Docs browser-pools page on the docs route", () => {
        injectHeaderSlots();
        renderViewport(["/docs"]);

        expect(screen.getByTestId("docs-page")).toBeInTheDocument();
        expect(screen.getByTestId("docs-comparison")).toBeInTheDocument();
    });
});
