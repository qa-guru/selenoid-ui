import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Browsers from "./index";
import { usageBarColor } from "./Browser";
import "./browsers.css";

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
    it("uses a class shell instead of styled-components", () => {
        const dir = dirname(fileURLToPath(import.meta.url));
        const tsx = readFileSync(join(dir, "index.tsx"), "utf8");
        const css = readFileSync(join(dir, "browsers.css"), "utf8");

        expect(tsx).not.toMatch(/styled-components|StyledBrowsers/);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.browsers\s*\{[^}]*max-width:\s*520px/s);
        expect(css).toMatch(/\.browsers-panel\s*\{[^}]*width:\s*100%/s);
        expect(css).toMatch(/\.browsers-table\s*\{[^}]*border-collapse:\s*collapse/s);
        expect(css).toMatch(/\.usage-bar\s*\{[^}]*height:\s*100%/s);

        render(
            <Browsers
                totalUsed={10}
                browsers={{
                    firefox: 2,
                    chrome: 7,
                }}
            />
        );

        const host = screen.getByTestId("browsers-panel").closest(".browsers");
        expect(host).toBeTruthy();
        expect(getComputedStyle(host!).maxWidth).toBe("520px");
        expect(getComputedStyle(host!).width).toBe("100%");
        expect(screen.getByTestId("browsers-panel")).toHaveClass("browsers-panel");
        expect(screen.getByRole("table")).toHaveClass("browsers-table");
        expect(getComputedStyle(screen.getByRole("table")).borderCollapse).toBe("collapse");
        expect(getComputedStyle(screen.getAllByTestId("browser-usage-bar")[0]).height).toBe("100%");
    });

    it("renders panel table rows sorted by count with token usage-bar", () => {
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

        expect(screen.getByTestId("browsers-panel")).toBeInTheDocument();
        expect(screen.getByTestId("browsers-title")).toHaveTextContent("Browser usage");

        const rows = screen.getAllByTestId("browser-row");
        expect(rows!).toHaveLength(3);
        expect(within(rows[0]).getByText("chrome")).toBeInTheDocument();
        expect(within(rows[0]).getByText("7")).toBeInTheDocument();
        expect(within(rows[0]).getByText("70%")).toBeInTheDocument();

        const chromeBar = within(rows[0]).getByTestId("browser-usage-bar");
        expect(chromeBar!).toHaveStyle({ width: "70%" });
        expect(chromeBar.style.backgroundColor).toBe("var(--color-danger)");

        const firefoxBar = within(rows[1]).getByTestId("browser-usage-bar");
        expect(firefoxBar!).toHaveStyle({ width: "20%" });
        expect(firefoxBar.style.backgroundColor).toBe("var(--color-info)");

        const operaBar = within(rows[2]).getByTestId("browser-usage-bar");
        expect(operaBar!).toHaveStyle({ width: "10%" });
        expect(operaBar.style.backgroundColor).toBe("var(--color-info)");
    });

    it("returns null when totalUsed is undefined", () => {
        const { container } = render(<Browsers browsers={{ chrome: 1 }} />);
        expect(container!).toBeEmptyDOMElement();
    });
});
