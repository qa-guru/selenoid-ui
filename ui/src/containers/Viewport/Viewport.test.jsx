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

vi.mock("../../components/SelenoidAppHeader", () => ({
    SelenoidAppHeader: ({ videos }) => <div data-testid="selenoid-app-header" data-videos={String(Boolean(videos))} />,
}));

describe("Viewport", () => {
    it("renders stats bar indicators without legacy navigation", () => {
        render(<Viewport />);

        expect(screen.getByTestId("selenoid-app-header")).toBeInTheDocument();
        expect(document.getElementById("sse-status")).toBeInTheDocument();
        expect(document.getElementById("selenoid-status")).toBeInTheDocument();
        expect(screen.getAllByText("CONNECTED").length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByRole("link", { name: "STATS" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "CAPABILITIES" })).not.toBeInTheDocument();
    });

    it("filters sessions via search input", async () => {
        const user = userEvent.setup();
        render(<Viewport />);

        const filter = screen.getByPlaceholderText("Filter...");
        await user.type(filter, "chrome");
        expect(filter).toHaveValue("chrome");
    });
});
