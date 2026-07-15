import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Status from "./Status";

describe("Status", () => {
    it("renders CONNECTED for ok sse status with sse-status id", () => {
        render(<Status status="ok" header="sse" version="2.3.0" title="Version: 2.3.0" />);

        const indicator = document.getElementById("sse-status");
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass("indicator_ok");
        expect(screen.getByTestId("sse-status-badge")).toHaveTextContent("CONNECTED");
        expect(screen.getByText("sse")).toBeInTheDocument();
    });

    it("renders ISSUE for error selenoid status with selenoid-status id", () => {
        render(<Status status="error" header="selenoid" version="2.3.0" />);

        const indicator = document.getElementById("selenoid-status");
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass("indicator_error");
        expect(screen.getByText("ISSUE")).toBeInTheDocument();
    });

    it("renders STALE and UNKNOWN labels", () => {
        const { rerender } = render(<Status status="stale" header="sse" version="1.0" />);
        expect(screen.getByText("STALE")).toBeInTheDocument();

        rerender(<Status status="unknown" header="selenoid" version="1.0" />);
        expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    });
});
