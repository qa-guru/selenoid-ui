import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("./service", () => ({
    useDeleteVideo: () => [false, vi.fn()],
}));

import Videos from "./index";

describe("Videos", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("loads first page of 10 and shows pager when total exceeds page size", async () => {
        const pageOne = Array.from({ length: 10 }, (_, i) => `v${i}.mp4`);
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ videos: pageOne, total: 12, limit: 10, offset: 0 }),
        });

        render(<Videos />);

        await waitFor(() => {
            expect(screen.getByTestId("videos-pager")).toBeInTheDocument();
        });
        expect(screen.getByTestId("videos-pager-status")).toHaveTextContent("1 / 2");
        expect(fetch).toHaveBeenCalledWith("/video/?json=&limit=10&offset=0");
    });

    it("requests next page with offset=10", async () => {
        const user = userEvent.setup();
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    videos: Array.from({ length: 10 }, (_, i) => `v${i}.mp4`),
                    total: 12,
                    limit: 10,
                    offset: 0,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ videos: ["v10.mp4", "v11.mp4"], total: 12, limit: 10, offset: 10 }),
            });

        render(<Videos />);
        await waitFor(() => expect(screen.getByTestId("videos-pager-next")).toBeEnabled());
        await user.click(screen.getByTestId("videos-pager-next"));

        await waitFor(() => {
            expect(fetch).toHaveBeenLastCalledWith("/video/?json=&limit=10&offset=10");
        });
        expect(screen.getByTestId("videos-pager-status")).toHaveTextContent("2 / 2");
    });
});
