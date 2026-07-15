import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterInput } from "./index";

describe("FilterInput", () => {
    it("renders library Input with filter placeholder", () => {
        render(<FilterInput value="" onChange={vi.fn()} onClear={vi.fn()} />);

        const input = screen.getByPlaceholderText("Filter...");
        expect(input).toHaveClass("input");
        expect(input).toHaveAttribute("data-testid", "session-filter-input");
    });

    it("forwards value changes and clear action", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onClear = vi.fn();
        render(<FilterInput value="chrome" onChange={onChange} onClear={onClear} />);

        expect(screen.getByDisplayValue("chrome")).toBeInTheDocument();

        await user.click(screen.getByTitle("Clear"));
        expect(onClear).toHaveBeenCalledTimes(1);
    });
});
