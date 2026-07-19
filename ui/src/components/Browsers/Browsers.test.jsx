import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Browsers from "./index";
import { usageBarColor } from "./Browser";

describe("usageBarColor", () => {
    it("maps load bands to DS semantic tokens", () => {
        expect(usageBarColor(0)).toBe("var(--color-info)");
        expect(usageBarColor(29)).toBe("var(--color-info)");
        expect(usageBarColor(30)).toBe("var(--color-warning)");
        expect(usageBarColor(69)).toBe("var(--color-warning)");
        expect(usageBarColor(70)).toBe("var(--color-danger)");
        expect(usageBarColor(100)).toBe("var(--color-danger)");
    });
});

describe("Browsers", () => {
    it("renders rows sorted by count with token usage-bar", () => {
        render(
            <Browsers
                totalUsed={10}
                browsers={{
                    firefox: 2,
                    chrome: 7,
                    opera: 1,
                }}
            />
        );

        const rows = screen.getAllByTestId("browser-row");
        expect(rows).toHaveLength(3);
        expect(within(rows[0]).getByText("chrome")).toBeInTheDocument();
        expect(within(rows[0]).getByText("7")).toBeInTheDocument();
        expect(within(rows[0]).getByText("70%")).toBeInTheDocument();

        const chromeBar = within(rows[0]).getByTestId("browser-usage-bar");
        expect(chromeBar).toHaveStyle({ width: "70%" });
        expect(chromeBar.style.borderBottomColor).toBe("var(--color-danger)");

        const firefoxBar = within(rows[1]).getByTestId("browser-usage-bar");
        expect(firefoxBar).toHaveStyle({ width: "20%" });
        expect(firefoxBar.style.borderBottomColor).toBe("var(--color-info)");

        const operaBar = within(rows[2]).getByTestId("browser-usage-bar");
        expect(operaBar).toHaveStyle({ width: "10%" });
        expect(operaBar.style.borderBottomColor).toBe("var(--color-info)");
    });

    it("returns null when totalUsed is undefined", () => {
        const { container } = render(<Browsers browsers={{ chrome: 1 }} />);
        expect(container).toBeEmptyDOMElement();
    });
});
