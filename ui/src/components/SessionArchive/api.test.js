import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildSessionListUrl, fetchSessionPage, SESSION_PAGE_SIZE } from "./api";

describe("SessionArchive api", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("builds paginated list url with default page size 10", () => {
        expect(buildSessionListUrl({ page: 1 })).toBe(`/sessions/?json=&limit=${SESSION_PAGE_SIZE}&offset=10`);
    });

    it("includes search query when provided", () => {
        expect(buildSessionListUrl({ page: 0, q: "sess" })).toContain("q=sess");
    });

    it("fetches a page and normalizes payload", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                sessions: [{ id: "a", video: "a.mp4", har: "a.har" }],
                total: 11,
                limit: 10,
                offset: 0,
            }),
        });

        const page = await fetchSessionPage({ page: 0 });
        expect(fetch).toHaveBeenCalledWith(`/sessions/?json=&limit=10&offset=0`);
        expect(page).toEqual({
            sessions: [{ id: "a", video: "a.mp4", har: "a.har" }],
            total: 11,
            limit: 10,
            offset: 0,
        });
    });

    it("never requests an unbounded list", () => {
        const url = buildSessionListUrl();
        expect(url).toContain("limit=");
        expect(url).toContain("offset=");
        expect(url).not.toMatch(/limit=0/);
    });
});
