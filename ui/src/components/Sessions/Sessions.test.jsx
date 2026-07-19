import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Sessions from "./index";
import { sessionIdShort } from "../../util/sessionsLogic";

const deleteSession = vi.fn();

vi.mock("./service", () => ({
    useSessionDelete: () => [false, deleteSession],
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
            screenResolution: "1920x1080",
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

function renderSessions(props = {}) {
    return render(
        <MemoryRouter>
            <Sessions sessions={sessions} query="" {...props} />
        </MemoryRouter>
    );
}

describe("Sessions", () => {
    it("renders session list without filter", () => {
        renderSessions();

        expect(screen.getByText("Sessions")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
        expect(screen.getByText("MANUAL")).toBeInTheDocument();
    });

    it("filters sessions by browser name", () => {
        renderSessions({ query: "firefox" });

        expect(screen.queryByText("chrome")).not.toBeInTheDocument();
        expect(screen.getByText("firefox")).toBeInTheDocument();
    });

    it("shows empty state when no sessions match", () => {
        renderSessions({ sessions: {}, query: "" });

        const empty = screen.getByText("NO SESSIONS YET :'(").closest(".no-any");
        expect(empty).toBeTruthy();
        expect(empty.querySelector(".dripicons-hourglass")).toBeNull();
        expect(empty.querySelector("svg")).toBeTruthy();
    });

    it("renders Badge caps and icon-btn delete without dripicons", () => {
        renderSessions();

        expect(screen.getByText("MANUAL")).toHaveClass("badge", "badge--primary");
        expect(screen.getByText("VNC")).toHaveClass("badge", "badge--primary");

        const resolution = screen.getByText("1920x1080");
        expect(resolution).toHaveClass("badge");
        expect(resolution).not.toHaveClass("badge--primary");

        const deleteBtn = screen.getByRole("button", { name: "Delete" });
        expect(deleteBtn).toHaveClass("icon-btn", "session-delete");
        expect(deleteBtn.querySelector(".dripicons-trash")).toBeNull();
        expect(deleteBtn.querySelector("svg")).toBeTruthy();

        expect(document.querySelector(".dripicons-trash")).toBeNull();
        expect(document.querySelector(".dripicons-hourglass")).toBeNull();
    });

    it("links session id and identity to /sessions/:id", () => {
        renderSessions();

        const shortId = sessionIdShort("abc-def-123");
        const idLink = screen.getByRole("link", { name: shortId });
        expect(idLink).toHaveAttribute("href", "/sessions/abc-def-123");
        expect(idLink).toHaveClass("link", "id");

        const identity = screen.getByText("chrome").closest("a.identity");
        expect(identity).toHaveAttribute("href", "/sessions/abc-def-123");
        expect(identity).toHaveClass("link", "identity");
    });

    it("invokes delete for manual sessions", async () => {
        const user = userEvent.setup();
        deleteSession.mockClear();
        renderSessions();

        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(deleteSession).toHaveBeenCalledTimes(1);
    });
});
