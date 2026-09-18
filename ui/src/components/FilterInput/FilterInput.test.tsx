import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterInput } from "./index";
import "./filter-input.css";

describe("FilterInput", () => {
    it("uses a class shell instead of styled-components", () => {
        const dir = dirname(fileURLToPath(import.meta.url));
        const tsx = readFileSync(join(dir, "index.tsx"), "utf8");
        const css = readFileSync(join(dir, "filter-input.css"), "utf8");

        expect(tsx).not.toMatch(/styled-components|StyledPanelFilter/);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.filter-input\s*\{[^}]*display:\s*flex/s);
        expect(css).toMatch(/\.filter-clear\s*\{[^}]*position:\s*absolute/s);

        render(<FilterInput value="" onChange={vi.fn()} onClear={vi.fn()} />);
        const host = screen.getByTestId("session-filter-input").closest(".filter-input");
        expect(host).toBeTruthy();
        expect(getComputedStyle(host!).display).toBe("flex");
        expect(getComputedStyle(host!).position).toBe("relative");
    });

    it("renders library Input with filter placeholder", () => {
        render(<FilterInput value="" onChange={vi.fn()} onClear={vi.fn()} />);

        const input = screen.getByPlaceholderText("Filter...");
        expect(input!).toHaveClass("input");
        expect(input!.closest(".filter-input")).toBeTruthy();
        expect(input!).toHaveAttribute("data-testid", "session-filter-input");
        expect(input!).toHaveAttribute("id", "session-filter-input");
        expect(input!).toHaveAttribute("name", "session-filter");
        expect(input!).toHaveAttribute("type", "search");
        expect(input!).toHaveAttribute("autocomplete", "off");
        expect(input!).toHaveAttribute("aria-label", "Filter sessions");
    });

    it("forwards value changes and clear action", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onClear = vi.fn();
        render(<FilterInput value="chrome" onChange={onChange} onClear={onClear} />);

        expect(screen.getByDisplayValue("chrome")).toBeInTheDocument();

        await user.click(screen.getByTitle("Clear"));
        expect(onClear!).toHaveBeenCalledTimes(1);

        const clear = screen.getByRole("button", { name: "Clear" });
        expect(clear).toHaveClass("icon-btn", "filter-clear");
        expect(getComputedStyle(clear).position).toBe("absolute");
        expect(clear.querySelectorAll(".icon")).toHaveLength(1);
        expect(clear.querySelector(".icon .icon")).toBeNull();
    });
});
