import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, afterEach } from "vitest";
import SessionInfo from "./SessionInfo";

const browser = {
    quota: "alice",
    caps: {
        browserName: "chrome",
        version: "120.0",
        screenResolution: "1920x1080",
        name: "Manual session",
    },
};

describe("SessionInfo", () => {
    it("renders browser chrome and short session id", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} />
            </MemoryRouter>
        );

        expect(screen.getByTestId("session-info-panel")).toBeInTheDocument();
        expect(screen.getByTestId("session-info-title")).toHaveTextContent("Session");
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("120.0")).toBeInTheDocument();
        expect(screen.getByTestId("session-info-id")).toHaveTextContent("abc-def-");
    });

    it("renders Badge for resolution and session name", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} />
            </MemoryRouter>
        );

        const resolution = screen.getByText("1920x1080");
        expect(resolution!).toHaveClass("badge");
        expect(resolution!).not.toHaveClass("badge--primary");

        const name = screen.getByText("Manual session");
        expect(name!).toHaveClass("badge");
        expect(name!).not.toHaveClass("badge--primary");
    });

    it("omits resolution Badge when screenResolution is missing", () => {
        render(
            <MemoryRouter>
                <SessionInfo
                    session="abc-def-12345678"
                    browser={{
                        quota: "alice",
                        caps: {
                            browserName: "chrome",
                            version: "120.0",
                            name: "No resolution",
                        },
                    }}
                />
            </MemoryRouter>
        );

        expect(screen.queryByText("1920x1080")).not.toBeInTheDocument();
        expect(screen.getByText("No resolution")).toHaveClass("badge");
    });

    it("finished mode shows back link and artifact badges", () => {
        render(
            <MemoryRouter>
                <SessionInfo
                    session="fin-sess-1"
                    finished
                    artifacts={{ video: "fin-sess-1.mp4", log: "fin-sess-1.log", har: "fin-sess-1.har" }}
                />
            </MemoryRouter>
        );

        expect(screen.getByTestId("session-back")).toHaveAttribute("href", "/sessions");
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
        expect(screen.getByText("VIDEO")).toBeInTheDocument();
        expect(screen.getByText("LOG")).toBeInTheDocument();
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.queryByTestId("session-kill")).toBeNull();
    });

    it("live mode exposes Kill session in Session panel bar", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} live />
            </MemoryRouter>
        );

        const kill = screen.getByTestId("session-kill");
        expect(kill!).toHaveClass("icon-btn", "panel__action");
        expect(kill!).toHaveAttribute("aria-label", "Kill session");
        expect(kill.querySelector("svg")).toBeTruthy();
    });

    it("kill issues DELETE /wd/hub/session/{id} and stays on the page", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} live />
            </MemoryRouter>
        );

        await user.click(screen.getByTestId("session-kill"));
        expect(fetchMock!).toHaveBeenCalledWith(
            "/wd/hub/session/abc-def-12345678",
            expect.objectContaining({
                method: "DELETE",
                credentials: "omit",
                headers: expect.objectContaining({
                    Authorization: expect.stringMatching(/^Basic /),
                }),
            })
        );
        expect(screen.getByTestId("session-info-panel")).toBeInTheDocument();
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
});
