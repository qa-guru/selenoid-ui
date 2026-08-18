import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import SessionArchive from "./index";

function renderArchive(ui: any = <SessionArchive />, { route = "/sessions" }: { route?: string } = {}) {
    const router = createMemoryRouter(
        [
            { path: "/sessions", element: ui },
            { path: "/sessions/:session", element: <div data-testid="session-detail-page" /> },
        ],
        { initialEntries: [route] }
    );
    const view = render(<RouterProvider router={router} />);
    return { ...view, router };
}

describe("SessionArchive", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("loads first page and shows pager when total exceeds page size", async () => {
        const sessions = Array.from({ length: 10 }, (_: any, i: any) => ({ id: `s${i}`, video: `s${i}.mp4` }));
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions, total: 12, limit: 10, offset: 0 }),
        });

        renderArchive();

        await waitFor(() => {
            expect(screen.getByTestId("archive-pager")).toBeInTheDocument();
        });
        expect(screen.getByTestId("archive-pager-status")).toHaveTextContent("1 / 2");
        expect(fetch!).toHaveBeenCalledWith("/sessions/?json=&limit=10&offset=0&sort=finished&order=desc");
    });

    it("requests next page with offset=10", async () => {
        const user = userEvent.setup();
        (fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    sessions: Array.from({ length: 10 }, (_: any, i: any) => ({ id: `s${i}`, video: `s${i}.mp4` })),
                    total: 12,
                    limit: 10,
                    offset: 0,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    sessions: [
                        { id: "s10", video: "s10.mp4" },
                        { id: "s11", har: "s11.har" },
                    ],
                    total: 12,
                    limit: 10,
                    offset: 10,
                }),
            });

        renderArchive();
        await waitFor(() => expect(screen.getByTestId("archive-pager-next")).toBeEnabled());
        await user.click(screen.getByTestId("archive-pager-next"));

        await waitFor(() => {
            expect(fetch!).toHaveBeenLastCalledWith("/sessions/?json=&limit=10&offset=10&sort=finished&order=desc");
        });
        expect(screen.getByTestId("archive-pager-status")).toHaveTextContent("2 / 2");
    });

    it("renders unified list rows with sort controls, not a table", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                sessions: [{ id: "sess-1", video: "sess-1.mp4" }],
                total: 1,
                limit: 10,
                offset: 0,
            }),
        });

        renderArchive();

        await waitFor(() => expect(screen.getByTestId("session-card")).toBeInTheDocument());
        expect(screen.getByTestId("archive-list")).toBeInTheDocument();
        expect(screen.getByTestId("archive-sort")).toBeInTheDocument();
        expect(screen.getByTestId("session-card")).toHaveClass("session", "archive__row");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.queryByTestId("archive-table")).not.toBeInTheDocument();
        expect(
            [...screen.getByTestId("archive-sort").querySelectorAll(".archive__sort")].map((el) =>
                el.getAttribute("data-testid")
            )
        ).toEqual([
            "archive-sort-id",
            "archive-sort-quota",
            "archive-sort-name",
            "archive-sort-finished",
            "archive-sort-duration",
        ]);
        const row = screen.getByTestId("session-card");
        expect([...row.children].map((el) => el.className)).toEqual([
            expect.stringContaining("session__id"),
            expect.stringContaining("session__quota"),
            expect.stringContaining("session__fields"),
            expect.stringContaining("session__date"),
            expect.stringContaining("session__duration"),
            expect.stringContaining("session__caps"),
            expect.stringContaining("session__actions"),
        ]);
    });

    it("renders a list row with meta, cap badges, and detail link (no video preview)", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                sessions: [
                    {
                        id: "sess-1",
                        video: "sess-1.mp4",
                        log: "sess-1.log",
                        har: "sess-1.har",
                        name: "com.example.VeryLongTestNameThatShouldTruncate",
                        quota: "alice",
                        started: "2026-07-26T10:00:00Z",
                        finished: "2026-07-26T10:01:35Z",
                    },
                ],
                total: 1,
                limit: 10,
                offset: 0,
            }),
        });

        renderArchive();

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-link")).toHaveAttribute("href", "/sessions/sess-1");
        });
        expect(screen.getByTestId("session-name")).toHaveTextContent("com.example.VeryLongTestNameThatShouldTruncate");
        expect(screen.getByTestId("session-name")).toHaveAttribute(
            "title",
            "com.example.VeryLongTestNameThatShouldTruncate"
        );
        expect(screen.getByTestId("session-quota")).toHaveTextContent("alice");
        expect(screen.getByTestId("session-duration")).toHaveTextContent("1m 35s");
        // 24h clock with zero-padded hours (01:00, not 1:00); no AM/PM.
        expect(screen.getByTestId("session-date")).toHaveTextContent(/^\d{1,2}\/\d{1,2}\/\d{2}, \d{2}:\d{2}$/);
        expect(screen.getByTestId("session-date").textContent).not.toMatch(/AM|PM/i);
        const row = screen.getByTestId("session-card");
        expect(row).toHaveClass("session");
        expect(row.querySelector(".browser")).toBeNull();
        expect(screen.getByTestId("session-detail-link")).toHaveAttribute("href", "/sessions/sess-1");
        expect(screen.getByText("VIDEO")).toHaveClass("badge");
        expect(screen.getByText("LOG")).toHaveClass("badge");
        expect(screen.getByText("HAR")).toHaveClass("badge");
        expect(screen.queryByTestId("artifact-video")).toBeNull();
        expect(screen.queryByTestId("session-video")).toBeNull();
        expect(document.querySelector("video")).toBeNull();
        expect(document.querySelector("[class*='dripicons']")).toBeNull();
        expect(row.querySelector(".session__caps")).toContainElement(screen.getByText("VIDEO"));
        expect(row.querySelector(".session__actions")).toContainElement(screen.getByTestId("session-delete"));
        expect(screen.getByTestId("session-delete")).toHaveClass("icon-btn", "session-delete");
    });

    it("links har-only sessions into the detail page", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                sessions: [{ id: "sess-2", har: "sess-2.har" }],
                total: 1,
                limit: 10,
                offset: 0,
            }),
        });

        renderArchive();

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-link")).toHaveAttribute("href", "/sessions/sess-2");
        });
        expect(screen.getByText("HAR")).toHaveClass("badge");
        expect(screen.queryByText("VIDEO")).toBeNull();
        expect(screen.queryByTestId("artifact-har")).toBeNull();
        expect(document.querySelector("video")).toBeNull();
    });

    it("delete-whole issues a DELETE for every present artifact", async () => {
        const user = userEvent.setup();
        (fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    sessions: [{ id: "sess-3", video: "sess-3.mp4", log: "sess-3.log", har: "sess-3.har" }],
                    total: 1,
                    limit: 10,
                    offset: 0,
                }),
            })
            // three per-artifact DELETEs (ok only) + the post-delete reload (needs json)
            .mockResolvedValue({ ok: true, json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }) });

        renderArchive();
        await waitFor(() => expect(screen.getByTestId("session-delete")).toBeInTheDocument());
        await user.click(screen.getByTestId("session-delete"));

        await waitFor(() => {
            expect(fetch!).toHaveBeenCalledWith("/video/sess-3.mp4", { method: "DELETE" });
        });
        expect(fetch!).toHaveBeenCalledWith("/logs/sess-3.log", { method: "DELETE" });
        expect(fetch!).toHaveBeenCalledWith("/har/sess-3.har", { method: "DELETE" });
    });

    it("shows empty state with local SVG hourglass", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        renderArchive();

        expect(screen.getByTestId("archive-panel")).toBeInTheDocument();
        expect(screen.getByTestId("archive-title")).toHaveTextContent("Finished sessions");

        await waitFor(() => {
            expect(screen.getByText("NO FINISHED SESSIONS YET :'(")).toBeInTheDocument();
        });

        const empty = screen.getByText("NO FINISHED SESSIONS YET :'(").closest(".no-any");
        expect(empty!).toBeTruthy();
        expect(empty!.querySelector("svg")).toBeTruthy();
    });

    it("sorts by finished desc by default and toggles sort on header click", async () => {
        const user = userEvent.setup();
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        const { router } = renderArchive();
        await waitFor(() => expect(fetch!).toHaveBeenCalled());

        expect(fetch!).toHaveBeenCalledWith("/sessions/?json=&limit=10&offset=0&sort=finished&order=desc");
        expect(screen.getByTestId("archive-sort-finished")).toHaveAttribute("aria-sort", "descending");

        await user.click(screen.getByTestId("archive-sort-duration"));
        await waitFor(() => {
            expect(fetch!).toHaveBeenLastCalledWith("/sessions/?json=&limit=10&offset=0&sort=duration&order=desc");
        });

        await user.click(screen.getByTestId("archive-sort-duration"));
        await waitFor(() => {
            expect(fetch!).toHaveBeenLastCalledWith("/sessions/?json=&limit=10&offset=0&sort=duration&order=asc");
        });
    });

    it("restores sort and page from the url", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        renderArchive(<SessionArchive />, { route: "/sessions?sort=name&order=asc&page=2" });

        await waitFor(() => {
            expect(fetch!).toHaveBeenCalledWith("/sessions/?json=&limit=10&offset=20&sort=name&order=asc");
        });
        expect(screen.getByTestId("archive-sort-name")).toHaveAttribute("aria-sort", "ascending");
    });

    it("does not invent browser identity from artifact-only payload", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                sessions: [{ id: "sess-1", video: "sess-1.mp4" }],
                total: 1,
                limit: 10,
                offset: 0,
            }),
        });

        renderArchive();

        await waitFor(() => expect(screen.getByTestId("session-card")).toBeInTheDocument());
        const row = screen.getByTestId("session-card");
        expect(row.querySelector(".browser")).toBeNull();
        expect(row.querySelector(".session-name")).toBeNull();
        expect(screen.getByText("VIDEO")).toHaveClass("badge");
        expect(screen.queryByText("—")).toBeTruthy();
        expect(screen.getByTestId("session-quota")).toHaveTextContent("—");
    });

    it("keeps sort and page on the detail link", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                sessions: [{ id: "sess-1", video: "sess-1.mp4" }],
                total: 1,
                limit: 10,
                offset: 20,
            }),
        });

        renderArchive(<SessionArchive />, { route: "/sessions?sort=name&order=asc&page=2" });

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-link")).toHaveAttribute(
                "href",
                "/sessions/sess-1?sort=name&order=asc&page=2"
            );
        });
    });
});
