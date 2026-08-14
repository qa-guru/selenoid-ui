import { describe, expect, it } from "vitest";

import { buildArchiveSearchParams, parseArchiveUrlState } from "./archiveUrlState";

describe("archiveUrlState", () => {
    it("returns defaults for empty search params", () => {
        expect(parseArchiveUrlState(new URLSearchParams())).toEqual({
            sort: "finished",
            order: "desc",
            page: 0,
        });
    });

    it("parses valid sort, order, and page", () => {
        const params = new URLSearchParams("sort=duration&order=asc&page=3");
        expect(parseArchiveUrlState(params)).toEqual({
            sort: "duration",
            order: "asc",
            page: 3,
        });
    });

    it("ignores invalid sort and order values", () => {
        const params = new URLSearchParams("sort=started&order=sideways&page=-2");
        expect(parseArchiveUrlState(params)).toEqual({
            sort: "finished",
            order: "desc",
            page: 0,
        });
    });

    it("omits default values when building search params", () => {
        const next = buildArchiveSearchParams(new URLSearchParams("sort=duration&order=asc&page=2"), {
            sort: "finished",
            order: "desc",
            page: 0,
        });
        expect(next.toString()).toBe("");
    });

    it("writes non-default sort and page", () => {
        const next = buildArchiveSearchParams(new URLSearchParams(), {
            sort: "name",
            order: "asc",
            page: 1,
        });
        expect(next.toString()).toBe("sort=name&order=asc&page=1");
    });

    it("does not mutate the original URLSearchParams", () => {
        const current = new URLSearchParams("sort=duration");
        const next = buildArchiveSearchParams(current, { sort: "name" });
        expect(current.get("sort")).toBe("duration");
        expect(next.get("sort")).toBe("name");
    });

    it("accepts a query string as current", () => {
        const next = buildArchiveSearchParams("sort=duration&keep=1", { sort: "name", page: 1 });
        expect(next.get("sort")).toBe("name");
        expect(next.get("keep")).toBe("1");
        expect(next.get("page")).toBe("1");
    });
});
