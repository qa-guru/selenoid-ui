import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PoolSlots from "./index";

describe("PoolSlots", () => {
    it("renders ready and reserved rows", () => {
        render(
            <PoolSlots
                title="Warm pool"
                testId="warm-slots-panel"
                titleTestId="warm-slots-title"
                slots={[
                    { id: "pool-chrome-1", browser: "chrome", protocol: "webdriver", pool: "warm" },
                    {
                        id: "pool-pw-1",
                        browser: "chromium",
                        protocol: "playwright",
                        pool: "warm",
                        reservedBy: "jenkins",
                    },
                ]}
            />
        );

        expect(screen.getByTestId("warm-slots-panel")).toBeInTheDocument();
        expect(screen.getByTestId("warm-slots-title")).toHaveTextContent("Warm pool");

        const rows = screen.getAllByTestId("pool-slot-row");
        expect(rows).toHaveLength(2);
        expect(within(rows[0]).getByText("chrome")).toBeInTheDocument();
        expect(within(rows[0]).getByText("webdriver")).toBeInTheDocument();
        expect(within(rows[0]).getByText("Ready")).toBeInTheDocument();
        expect(within(rows[1]).getByText("chromium")).toBeInTheDocument();
        expect(within(rows[1]).getByText("Reserved")).toBeInTheDocument();
    });

    it("shows empty state when there are no slots", () => {
        render(
            <PoolSlots title="Hot pool" testId="hot-slots-panel" titleTestId="hot-slots-title" slots={[]} />
        );

        expect(screen.getByTestId("hot-slots-title")).toHaveTextContent("Hot pool");
        expect(screen.getByTestId("pool-slot-empty")).toHaveTextContent("No slots");
        expect(screen.queryByTestId("pool-slot-row")).not.toBeInTheDocument();
    });

    it("treats missing slots as empty, not hidden", () => {
        render(
            <PoolSlots title="Hot pool" testId="hot-slots-panel" titleTestId="hot-slots-title" slots={undefined} />
        );

        expect(screen.getByTestId("hot-slots-panel")).toBeInTheDocument();
        expect(screen.getByTestId("pool-slot-empty")).toBeInTheDocument();
    });
});
