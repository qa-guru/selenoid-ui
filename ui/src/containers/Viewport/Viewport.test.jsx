import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("Viewport", () => {
    it("renders stats bar indicators with native navigation and logo", () => {
        render(<Viewport />);

        expect(screen.getByTestId("selenoid-logo")).toBeInTheDocument();
        expect(document.getElementById("app-header")).not.toBeInTheDocument();
        expect(document.getElementById("sse-status")).toBeInTheDocument();
        expect(document.getElementById("selenoid-status")).toBeInTheDocument();
        expect(screen.getAllByText("CONNECTED").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole("link", { name: "STATS" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "CAPABILITIES" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "VIDEOS" })).toBeInTheDocument();
    });

    it("filters sessions via search input", async () => {
        const user = userEvent.setup();
        render(<Viewport />);

        const filter = screen.getByPlaceholderText("Filter...");
        await user.type(filter, "chrome");
        expect(filter).toHaveValue("chrome");
    });

    it("shows Capabilities browser select and Create Session", async () => {
        const user = userEvent.setup();
        render(<Viewport />);

        await user.click(screen.getByRole("link", { name: "CAPABILITIES" }));

        expect(document.querySelector(".capabilities-browser-select")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-create-session")).toHaveTextContent("Create Session");
    });
});
