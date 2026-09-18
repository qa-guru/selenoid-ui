import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Quota from "./Quota";
import Queue from "./Queue";
import Separator from "./Separator";
import Used from "./Used";
import "./stats-element.css";

describe("header Stats widgets", () => {
    it("uses a class shell instead of styled-components", () => {
        const dir = dirname(fileURLToPath(import.meta.url));
        const css = readFileSync(join(dir, "stats-element.css"), "utf8");

        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(existsSync(join(dir, "StatsElement.ts"))).toBe(false);
        expect(existsSync(join(dir, "Separator.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.stats-element\s*\{[^}]*display:\s*flex/s);
        expect(css).toMatch(/\.stats-quota\s*\{/);
        expect(css).toMatch(/\.stats-separator\s*\{/);
        for (const name of readdirSync(dir)) {
            if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
                expect(readFileSync(join(dir, name), "utf8"), name).not.toMatch(
                    /styled-components|StyledQuota|StyledQueue/
                );
            }
        }

        const { container, rerender } = render(<Quota used={2} pending={1} total={10} />);
        const quota = screen.getByText("QUOTA").closest(".stats-element");
        expect(quota).toHaveClass("stats-quota");
        expect(getComputedStyle(quota!).display).toBe("flex");
        expect(getComputedStyle(quota!).height).toBe("80px");
        expect(getComputedStyle(quota!).flexDirection).toBe("column");

        rerender(<Queue queued={3} />);
        const queued = screen.getByText("QUEUED").closest(".stats-queue");
        expect(queued).toHaveClass("stats-element");
        expect(screen.getByText("3")).toBeInTheDocument();

        rerender(<Used used={2} pending={1} total={10} />);
        const used = screen.getByText("USED").closest(".stats-used");
        expect(used).toHaveClass("stats-element");
        expect(used).toHaveTextContent("30");
        expect(used?.querySelector(".small")).toHaveTextContent("%");

        rerender(<Separator />);
        const sep = container.querySelector(".stats-separator");
        expect(sep).toBeTruthy();
        expect(getComputedStyle(sep!).height).toBe("60px");
    });
});
