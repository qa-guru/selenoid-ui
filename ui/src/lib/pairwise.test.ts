import { describe, expect, it } from "vitest";
import { cartesian, pairwise, uncoveredPairs } from "./pairwise";

const TINY = {
    a: ["1", "2"] as const,
    b: ["x", "y"] as const,
    c: ["p", "q"] as const,
};

describe("pairwise covering", () => {
    it("covers every allowed 2-way combination", () => {
        const rows = pairwise(TINY);
        expect(uncoveredPairs(TINY, rows)).toEqual([]);
        expect(rows.length).toBeGreaterThanOrEqual(4);
        expect(rows.length).toBeLessThan(cartesian(TINY).length);
    });

    it("keeps seeds and still covers pairs", () => {
        const seed = { a: "1", b: "x", c: "p" } as const;
        const rows = pairwise(TINY, { seeds: [seed] });
        expect(rows[0]).toEqual(seed);
        expect(uncoveredPairs(TINY, rows)).toEqual([]);
    });

    it("respects allowed() constraints", () => {
        const allowed = (row: { a: string; b: string; c: string }) => !(row.a === "1" && row.b === "y");
        const rows = pairwise(TINY, { allowed });
        expect(rows.every(allowed)).toBe(true);
        expect(uncoveredPairs(TINY, rows, allowed)).toEqual([]);
        expect(rows.some((row) => row.a === "1" && row.b === "y")).toBe(false);
    });
});
