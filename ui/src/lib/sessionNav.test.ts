import { describe, expect, it } from "vitest";

import { sessionDetailTo, sessionsListSearch, sessionsListTo } from "./sessionNav";

describe("sessionNav", () => {
    it("keeps archive sort, order, and page", () => {
        expect(sessionsListSearch("?sort=duration&order=asc&page=2")).toBe("?sort=duration&order=asc&page=2");
    });

    it("drops mock and other unrelated params", () => {
        expect(sessionsListSearch("?mock=1&sort=name&foo=bar")).toBe("?sort=name");
    });

    it("returns empty search when nothing to keep", () => {
        expect(sessionsListSearch("")).toBe("");
        expect(sessionsListSearch("?mock=1")).toBe("");
    });

    it("builds list and detail locations", () => {
        expect(sessionsListTo("?sort=name&page=1")).toEqual({
            pathname: "/sessions",
            search: "?sort=name&page=1",
        });
        expect(sessionDetailTo("abc", "?sort=name&page=1")).toEqual({
            pathname: "/sessions/abc",
            search: "?sort=name&page=1",
        });
    });
});
