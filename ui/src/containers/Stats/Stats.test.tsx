import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Stats from "./index";
import "./stats.css";

const state = {
    used: 2,
    warmSlots: [],
    hotSlots: [],
};

describe("Stats", () => {
    it("uses a class shell instead of styled-components", () => {
        const dir = dirname(fileURLToPath(import.meta.url));
        const tsx = readFileSync(join(dir, "index.tsx"), "utf8");
        const css = readFileSync(join(dir, "stats.css"), "utf8");

        expect(tsx).not.toMatch(/styled-components|StyledStats/);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.stats\s*\{[^}]*display:\s*flex/s);
        expect(css).toMatch(/\.stats\s*\{[^}]*min-height:\s*100px/s);

        render(<Stats state={state} browsers={{ chrome: 2 }} />);

        const host = screen.getByTestId("browsers-panel").closest(".stats");
        expect(host).toBeTruthy();
        expect(getComputedStyle(host!).display).toBe("flex");
        expect(getComputedStyle(host!).width).toBe("100%");
        expect(getComputedStyle(host!).minHeight).toBe("100px");
        expect(getComputedStyle(host!).flexWrap).toBe("wrap");
        expect(getComputedStyle(host!).justifyContent).toBe("center");
        expect(getComputedStyle(host!).alignItems).toBe("flex-start");
        expect(getComputedStyle(host!).boxSizing).toBe("border-box");
        expect(host!.querySelectorAll(":scope > .browsers")).toHaveLength(3);
        expect(screen.getByTestId("browsers-panel").closest(".browsers")).toBeTruthy();
        expect(screen.getByTestId("warm-slots-panel").closest(".browsers")).toBeTruthy();
        expect(screen.getByTestId("hot-slots-panel").closest(".browsers")).toBeTruthy();
    });
});
