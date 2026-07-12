import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HashRouter } from "react-router-dom";
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
            <HashRouter>
                <Sessions sessions={sessions} query="" />
            </HashRouter>
        );

        expect(screen.getByText("Sessions")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
        expect(screen.getByText("MANUAL")).toBeInTheDocument();
    });

    it("filters sessions by browser name", () => {
        render(
            <HashRouter>
                <Sessions sessions={sessions} query="firefox" />
            </HashRouter>
        );

        expect(screen.queryByText("chrome")).not.toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
    });

    it("shows empty state when no sessions match", () => {
        render(
            <HashRouter>
                <Sessions sessions={{}} query="" />
            </HashRouter>
        );

        expect(screen.getByText("NO SESSIONS YET :'(")).toBeInTheDocument();
    });
});
