import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./containers/Viewport", () => ({
    default: () => <div data-testid="viewport-shell">viewport</div>,
}));

import App from "./App";

describe("App", () => {
    it("renders the viewport shell", () => {
        render(<App />);
        expect(screen.getByTestId("viewport-shell")).toBeInTheDocument();
    });
});
