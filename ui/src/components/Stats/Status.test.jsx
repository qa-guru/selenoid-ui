import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Status from "./Status";

describe("Status", () => {
    it("renders Connected for ok sse status with sse-status id", () => {
        render(<Status status="ok" header="sse" version="2.3.0" title="Version: 2.3.0" />);

        const tile = document.getElementById("sse-status");
        expect(tile).toBeInTheDocument();
        expect(tile).toHaveClass("status-tile", "status-tile--connected", "status-tile--tile");
        expect(screen.getByTestId("sse-status-badge")).toHaveTextContent("Connected");
        expect(screen.getByText("sse")).toBeInTheDocument();
        expect(tile).toHaveAttribute("title", "Version: 2.3.0");
    });

    it("renders Issue for error selenoid status with selenoid-status id", () => {
        render(<Status status="error" header="selenoid" version="2.3.0" />);

        const tile = document.getElementById("selenoid-status");
        expect(tile).toBeInTheDocument();
        expect(tile).toHaveClass("status-tile--error");
        expect(screen.getByTestId("selenoid-status-badge")).toHaveTextContent("Issue");
        expect(tile).toHaveAttribute("title", "Version: 2.3.0");
    });

    it("renders Stale and Unknown labels", () => {
        const { rerender } = render(<Status status="stale" header="sse" version="1.0" />);
        expect(screen.getByTestId("sse-status-badge")).toHaveClass("status-tile--stale");
        expect(screen.getByText("Stale")).toBeInTheDocument();

        rerender(<Status status="unknown" header="selenoid" version="1.0" />);
        expect(screen.getByTestId("selenoid-status-badge")).toHaveClass("status-tile--disconnected");
        expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
});
