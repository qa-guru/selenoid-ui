import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import SessionArchive from "./index";

function renderArchive(ui = <SessionArchive />) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("SessionArchive", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("loads first page and shows pager when total exceeds page size", async () => {
        const sessions = Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, video: `s${i}.mp4` }));
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions, total: 12, limit: 10, offset: 0 }),
        });

        renderArchive();

        await waitFor(() => {
            expect(screen.getByTestId("archive-pager")).toBeInTheDocument();
        });
        expect(screen.getByTestId("archive-pager-status")).toHaveTextContent("1 / 2");
        expect(fetch).toHaveBeenCalledWith("/sessions/?json=&limit=10&offset=0");
    });

    it("requests next page with offset=10", async () => {
        const user = userEvent.setup();
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    sessions: Array.from({ length: 10 }, (_, i) => ({ id: `s${i}`, video: `s${i}.mp4` })),
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
            expect(fetch).toHaveBeenLastCalledWith("/sessions/?json=&limit=10&offset=10");
        });
        expect(screen.getByTestId("archive-pager-status")).toHaveTextContent("2 / 2");
    });

    it("renders a list row with detail link and artifact badges (no video preview)", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                sessions: [{ id: "sess-1", video: "sess-1.mp4", log: "sess-1.log", har: "sess-1.har" }],
                total: 1,
                limit: 10,
                offset: 0,
            }),
        });

        renderArchive();

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-link")).toHaveAttribute("href", "/sessions/sess-1");
        });
        expect(screen.getByText("VIDEO")).toBeInTheDocument();
        expect(screen.getByText("LOG")).toBeInTheDocument();
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.queryByTestId("session-video")).toBeNull();
        expect(document.querySelector("video")).toBeNull();
        // No dripicons — local SVG chrome only.
        expect(document.querySelector("[class*='dripicons']")).toBeNull();
    });

    it("links har-only sessions into the detail page", async () => {
        fetch.mockResolvedValueOnce({
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
        expect(screen.getByText("HAR")).toBeInTheDocument();
        expect(screen.queryByText("VIDEO")).toBeNull();
        expect(document.querySelector("video")).toBeNull();
    });

    it("delete-whole issues a DELETE for every present artifact", async () => {
        const user = userEvent.setup();
        fetch
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
            expect(fetch).toHaveBeenCalledWith("/video/sess-3.mp4", { method: "DELETE" });
        });
        expect(fetch).toHaveBeenCalledWith("/logs/sess-3.log", { method: "DELETE" });
        expect(fetch).toHaveBeenCalledWith("/har/sess-3.har", { method: "DELETE" });
    });

    it("shows empty state with local SVG hourglass", async () => {
        fetch.mockResolvedValueOnce({
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
        expect(empty).toBeTruthy();
        expect(empty.querySelector("svg")).toBeTruthy();
    });
});
