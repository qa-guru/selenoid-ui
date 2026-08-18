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
        expect(screen.getByTestId("session-info-panel")).toHaveClass(
            "panel",
            "panel--terminal",
            "panel--bar-chrome",
            "session-info-panel"
        );
        expect(screen.getByTestId("session-info-title")).toHaveTextContent("Session details");
        const close = screen.getByTestId("session-close");
        expect(close).toHaveClass("btn", "btn--secondary");
        expect(close).toHaveAttribute("href", "/sessions");
        expect(close).toHaveTextContent("Close session window");
        expect(screen.getByTestId("session-info-panel").querySelector(".panel__actions")).toBeNull();
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("chrome")).toBeInTheDocument();
        expect(screen.getByText("120.0")).toBeInTheDocument();
        expect(screen.getByTestId("session-info-id")).toHaveTextContent("abc-def-");
        expect(screen.getByText("chrome").closest(".session__fields")).toBeTruthy();
        expect(screen.queryByText("/")).not.toBeInTheDocument();
    });

    it("uses the same identity block as the sessions table", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} />
            </MemoryRouter>
        );

        const resolution = screen.getByText("1920x1080");
        expect(resolution).toHaveClass("session__resolution");
        expect(resolution).not.toHaveClass("badge");
        expect(resolution.closest(".browser")).toContainElement(screen.getByText("120.0"));
        expect(resolution.closest(".session__caps")).toBeNull();

        const name = screen.getByText("Manual session");
        expect(name).toHaveClass("session-name");
        expect(name).not.toHaveClass("badge");
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
        expect(screen.getByText("FullSuite.loginAndCheckout")).toHaveClass("session-name");
        expect(screen.getByText("FullSuite.loginAndCheckout")).not.toHaveClass("badge");
    });

    it("omits resolution when screenResolution is missing", () => {
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
        expect(screen.getByText("No resolution")).toHaveClass("session-name");
        expect(screen.getByText("No resolution")).not.toHaveClass("badge");
    });

    it("matches the table: empty quota is an em dash, spinner only while starting", () => {
        const { rerender } = render(
            <MemoryRouter>
                <SessionInfo
                    session="abc-def-12345678"
                    live
                    browser={{ quota: "", caps: { browserName: "chrome", version: "149.0" } }}
                />
            </MemoryRouter>
        );

        expect(screen.queryByTitle("Starting…")).not.toBeInTheDocument();
        expect(
            screen.getByText("chrome").closest(".session-info__main")?.querySelector(".session__quota")
        ).toHaveTextContent("—");

        rerender(
            <MemoryRouter>
                <SessionInfo
                    session="abc-def-12345678"
                    live
                    browser={{
                        quota: "",
                        starting: true,
                        caps: { browserName: "chrome", version: "149.0" },
                    }}
                />
            </MemoryRouter>
        );

        expect(screen.getByTitle("Starting…")).toHaveClass("session__quota_starting");
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
        expect(close).toHaveClass("btn", "btn--secondary");
        expect(close).toHaveTextContent("Close session window");
        expect(screen.getByTestId("session-finished")).toHaveTextContent("FINISHED");
        expect(screen.getByText("VIDEO")).toBeInTheDocument();
        expect(screen.getByText("LOG")).toBeInTheDocument();
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.queryByTestId("session-stop")).not.toBeInTheDocument();
        expect(screen.getByTestId("session-delete")).toBeEnabled();
        expect(screen.getByTestId("session-info-id").nextElementSibling).toHaveClass("session-info__actions");
        expect(screen.getByTestId("session-finished").closest(".session-info__actions")).toBeTruthy();
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

        expect(screen.getByTestId("session-close")).toHaveAttribute("href", "/sessions?sort=duration&order=asc&page=2");
    });

    it("live mode exposes labeled Stop, Delete, and Close after the session id", () => {
        render(
            <MemoryRouter>
                <SessionInfo session="abc-def-12345678" browser={browser} live />
            </MemoryRouter>
        );

        const stop = screen.getByTestId("session-stop");
        expect(stop).toHaveClass("btn", "btn--danger");
        expect(stop).toHaveTextContent("Stop session");
        expect(stop).toBeEnabled();
        expect(screen.queryByTestId("session-finished")).not.toBeInTheDocument();

        const del = screen.getByTestId("session-delete");
        expect(del).toHaveClass("btn", "btn--danger");
        expect(del).toHaveTextContent("Delete session");
        expect(del).toBeDisabled();

        const close = screen.getByTestId("session-close");
        expect(close).toHaveTextContent("Close session window");
        const id = screen.getByTestId("session-info-id");
        expect(id.nextElementSibling).toHaveClass("session-info__actions");
        expect(screen.getByTestId("session-info-panel").querySelector(".panel__bar .panel__actions")).toBeNull();
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
