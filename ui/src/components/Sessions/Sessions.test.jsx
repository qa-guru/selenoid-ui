import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Sessions from "./index";

vi.mock("./service", () => ({
    useSessionDelete: () => [false, vi.fn()],
}));

const sessions = {
    "abc-def-123": {
        quota: "1",
        caps: {
            browserName: "chrome",
            version: "120.0",
            name: "Manual session",
            labels: { manual: "true" },
            enableVNC: true,
        },
    },
    "xyz-999": {
        quota: "2",
        caps: {
            browserName: "firefox",
            version: "115.0",
            name: "Smoke test",
        },
    },
};

describe("Sessions", () => {
    it("renders session list without filter", () => {
        render(
            <MemoryRouter>
                <Sessions sessions={sessions} query="" />
            </MemoryRouter>
        );

        expect(screen.getByText("Sessions")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
        expect(screen.getByText("MANUAL")).toBeInTheDocument();
    });

    it("filters sessions by browser name", () => {
        render(
            <MemoryRouter>
                <Sessions sessions={sessions} query="firefox" />
            </MemoryRouter>
        );

        expect(screen.queryByText("chrome")).not.toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
    });

    it("shows empty state when no sessions match", () => {
        render(
            <MemoryRouter>
                <Sessions sessions={{}} query="" />
            </MemoryRouter>
        );

        expect(screen.getByText("NO SESSIONS YET :'(")).toBeInTheDocument();
    });
});
