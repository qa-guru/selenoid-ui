import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PoolRoutingPanel from "./index";

describe("PoolRouting", () => {
    it("renders counters and recent routes", () => {
        render(
            <PoolRoutingPanel
                routing={{
                    warmServed: 10,
                    coldServed: 4,
                    warmFallbacks: 3,
                    recent: [
                        { session: "abcdef1234567890", pool: "warm", requested: "auto", slot: "pool-chrome-1", at: "2026-01-01T00:00:00Z" },
                        { session: "deadbeef", pool: "cold", requested: "auto", reason: "warm-unavailable", at: "2026-01-01T00:01:00Z" },
                    ],
                }}
            />
        );

        expect(screen.getByTestId("pool-routing-panel")).toBeInTheDocument();
        expect(screen.getByTestId("pool-routing-title")).toHaveTextContent("Pool routing");
        const counters = screen.getByTestId("pool-routing-counters");
        expect(within(counters).getByText("Served warm")).toBeInTheDocument();
        expect(within(counters).getByText("10")).toBeInTheDocument();
        expect(within(counters).getByText("Warm fallbacks")).toBeInTheDocument();
        expect(within(counters).getByText("3")).toBeInTheDocument();

        const rows = screen.getAllByTestId("pool-route-row");
        expect(rows).toHaveLength(2);
        expect(within(rows[0]).getByText("auto → warm")).toBeInTheDocument();
        expect(within(rows[0]).getByText("pool-chrome-1")).toBeInTheDocument();
        expect(within(rows[0]).getByText("abcdef123456…")).toBeInTheDocument();
        expect(within(rows[1]).getByText("auto → cold")).toBeInTheDocument();
        expect(within(rows[1]).getByText("warm-unavailable")).toBeInTheDocument();
    });

    it("shows empty state without routing data", () => {
        render(<PoolRoutingPanel routing={undefined} />);

        expect(screen.getByTestId("pool-routing-empty")).toHaveTextContent("No routed sessions yet");
        const counters = screen.getByTestId("pool-routing-counters");
        expect(within(counters).getByText("Warm fallbacks")).toBeInTheDocument();
    });
});
