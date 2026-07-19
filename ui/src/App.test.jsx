import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./containers/Viewport", () => ({
    default: () => <div data-testid="viewport-shell">viewport</div>,
}));

import App from "./App";

describe("App", () => {
    it("mounts the canonical header above the viewport shell", () => {
        render(<App />);

        expect(screen.getByTestId("app-header-mount")).toBeInTheDocument();
        expect(screen.getByTestId("viewport-shell")).toBeInTheDocument();
    });

    it("publishes the Selenoid header config for header.js", () => {
        render(<App />);

        expect(window.headerConfig?.brand?.leading).toEqual({
            href: "#/",
            label: "Selenoid 3",
        });
        expect(window.headerConfig?.brand?.href).toBe("https://qa.guru/");
        expect(window.headerConfig?.brand?.label).toBeUndefined();
        expect(window.headerConfig?.nav?.map((item) => item.label)).toEqual(["STATS", "CAPABILITIES", "VIDEOS"]);
    });
});
