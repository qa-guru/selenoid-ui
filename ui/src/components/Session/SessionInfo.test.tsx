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
        expect(screen.getByTestId("session-info-title")).toHaveTextContent("Session details");
        const close = screen.getByTestId("session-close");
        expect(close).toHaveClass("icon-btn", "panel__action");
        expect(close).toHaveAttribute("href", "/sessions");
        expect(close).toHaveAttribute("aria-label", "Close window");
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

    it("live mode shows HAR VIDEO LOG from caps", () => {
        render(
            <MemoryRouter>
                <SessionInfo
                    session="abc-def-12345678"
                    live
                    browser={{
                        quota: "max.user",
                        caps: {
                            browserName: "chrome",
                            version: "149.0",
                            name: "FullSuite.loginAndCheckout",
                            enableHAR: true,
                            enableVideo: true,
                            enableLog: true,
                        },
                    }}
                />
            </MemoryRouter>
        );

        expect(screen.getByText("HAR")).toHaveClass("badge");
        expect(screen.getByText("VIDEO")).toHaveClass("badge");
        expect(screen.getByText("LOG")).toHaveClass("badge");
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

    it("finished mode shows Close window and artifact badges", () => {
        render(
            <MemoryRouter>
                <SessionInfo
                    session="fin-sess-1"
                    finished
                    artifacts={{ video: "fin-sess-1.mp4", log: "fin-sess-1.log", har: "fin-sess-1.har" }}
                />
            </MemoryRouter>
        );

        const close = screen.getByTestId("session-close");
        expect(close).toHaveAttribute("href", "/sessions");
        expect(close).toHaveClass("icon-btn", "panel__action");
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
        expect(screen.getByText("VIDEO")).toBeInTheDocument();
        expect(screen.getByText("LOG")).toBeInTheDocument();
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.getByTestId("session-stop")).toBeDisabled();
        expect(screen.getByTestId("session-delete")).toBeEnabled();
        expect(screen.getByText("FINISHED").closest(".session-info__additional")).toBeTruthy();
        expect(screen.getByText("LOG").closest(".session-info__additional")).toBeTruthy();
    });

    it("keeps list filters on Close window", () => {
        render(
            <MemoryRouter initialEntries={["/sessions/fin-sess-1?sort=duration&order=asc&page=2"]}>
                <SessionInfo
                    session="fin-sess-1"
                    finished
                    artifacts={{ video: "fin-sess-1.mp4", log: "fin-sess-1.log" }}
                />
            </MemoryRouter>
        );

        expect(screen.getByTestId("session-close")).toHaveAttribute(
            "href",
            "/sessions?sort=duration&order=asc&page=2"
        );
    });

    it("live mode exposes Stop, disabled Delete, and Close in Session panel bar", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} live />
            </MemoryRouter>
        );

        const stop = screen.getByTestId("session-stop");
        expect(stop).toHaveClass("icon-btn", "panel__action");
        expect(stop).toHaveAttribute("aria-label", "Stop session");
        expect(stop).toBeEnabled();
        expect(stop.querySelector("svg")).toBeTruthy();

        const del = screen.getByTestId("session-delete");
        expect(del).toHaveAttribute("aria-label", "Delete session");
        expect(del).toBeDisabled();

        expect(screen.getByTestId("session-close")).toHaveAttribute("aria-label", "Close window");
    });

    it("stop issues DELETE /wd/hub/session/{id} and stays on the page", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} live />
            </MemoryRouter>
        );

        await user.click(screen.getByTestId("session-stop"));
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

    it("delete wipes finished artifacts", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({ ok: true });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <MemoryRouter>
                <SessionInfo
                    session="fin-sess-1"
                    finished
                    artifacts={{ video: "fin-sess-1.mp4", log: "fin-sess-1.log", har: "fin-sess-1.har" }}
                />
            </MemoryRouter>
        );

        await user.click(screen.getByTestId("session-delete"));
        expect(fetchMock).toHaveBeenCalledWith("/video/fin-sess-1.mp4", { method: "DELETE" });
        expect(fetchMock).toHaveBeenCalledWith("/logs/fin-sess-1.log", { method: "DELETE" });
        expect(fetchMock).toHaveBeenCalledWith("/har/fin-sess-1.har", { method: "DELETE" });
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
});
