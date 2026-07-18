import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildVideoListUrl, fetchVideoPage, VIDEO_PAGE_SIZE } from "./api";

describe("Videos api", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("builds paginated list url with default page size 10", () => {
        expect(buildVideoListUrl({ page: 1 })).toBe(`/video/?json=&limit=${VIDEO_PAGE_SIZE}&offset=10`);
    });

    it("includes search query when provided", () => {
        expect(buildVideoListUrl({ page: 0, q: "sess" })).toContain("q=sess");
    });

    it("fetches a page and normalizes payload", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ videos: ["a.mp4"], total: 11, limit: 10, offset: 0 }),
        });

        const page = await fetchVideoPage({ page: 0 });
        expect(fetch).toHaveBeenCalledWith(`/video/?json=&limit=10&offset=0`);
        expect(page).toEqual({ videos: ["a.mp4"], total: 11, limit: 10, offset: 0 });
    });

    it("never requests an unbounded list", () => {
        const url = buildVideoListUrl();
        expect(url).toContain("limit=");
        expect(url).toContain("offset=");
        expect(url).not.toMatch(/limit=0/);
    });
});
