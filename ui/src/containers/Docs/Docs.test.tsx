import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Docs from "./index";
import { COMPARISON_ROWS, ONE_RUN_ROWS } from "./pools";

describe("Docs", () => {
    it("renders the browser-pools comparison", () => {
        render(<Docs />);

        expect(screen.getByTestId("docs-page")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Cold · Warm · Hot — how the pools differ"
        );
        expect(screen.getByTestId("docs-stat-cold")).toHaveTextContent("~9.4 seconds");
        expect(screen.getByTestId("docs-stat-warm")).toHaveTextContent("~4.2 seconds");
        expect(screen.getByTestId("docs-stat-hot")).toHaveTextContent("~2.2 seconds");
        expect(screen.getByTestId("docs-release-callout")).toHaveTextContent(
            "Releasing a slot does not close Chrome"
        );

        const comparison = screen.getByTestId("docs-comparison");
        expect(comparison.querySelectorAll("tbody tr")).toHaveLength(COMPARISON_ROWS.length);
        expect(comparison).toHaveTextContent("POST /pool/reserve with loopback:false");
        expect(comparison).toHaveTextContent("http://hot-chrome-min-1:4444/");

        const oneRun = screen.getByTestId("docs-one-run");
        expect(oneRun.querySelectorAll("tbody tr")).toHaveLength(ONE_RUN_ROWS.length);
        expect(oneRun).toHaveTextContent("Chrome does not quit");
    });
});
