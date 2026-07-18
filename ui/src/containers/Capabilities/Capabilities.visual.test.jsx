import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Capabilities from "./index";

const BROWSERS = {
    chrome: {
        "149.0": {},
        "149.0-min": {},
    },
    firefox: {
        "151.0": {},
    },
};

function renderCapabilities() {
    return render(
        <MemoryRouter initialEntries={["/capabilities"]}>
            <Routes>
                <Route
                    path="/capabilities"
                    element={
                        <Capabilities
                            browsers={BROWSERS}
                            browserProtocols={{}}
                            sessions={{}}
                            origin="https://selenoid.qa.guru"
                            playwrightAccessKey=""
                        />
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

function parseColor(color) {
    if (!color) {
        return null;
    }
    const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        let value = hex[1];
        if (value.length === 3) {
            value = value
                .split("")
                .map((c) => c + c)
                .join("");
        }
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16),
        };
    }
    const rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgb) {
        return null;
    }
    return {
        r: Number(rgb[1]),
        g: Number(rgb[2]),
        b: Number(rgb[3]),
    };
}

function expectColor(actual, expectedHex) {
    expect(parseColor(actual)).toEqual(parseColor(expectedHex));
}

describe("Capabilities visual contract (Driver + Remote hub panels)", () => {
    it("renders Driver panel with tagstrip of available browsers", () => {
        renderCapabilities();

        const driver = screen.getByTestId("capabilities-driver-panel");
        expect(driver).toHaveClass("panel", "panel--content");
        expect(screen.getByTestId("capabilities-driver-title")).toHaveTextContent("Driver");

        const tagstrip = screen.getByTestId("capabilities-browser-select");
        expect(tagstrip).toHaveClass("capabilities-browser-select");
        expect(tagstrip).toHaveAttribute("data-param-id", "available");
        expect(within(tagstrip).getByRole("group")).toBeInTheDocument();
        expect(within(tagstrip).getByRole("button", { name: "chrome: 149.0" })).toBeInTheDocument();
        expect(within(tagstrip).getByRole("button", { name: "firefox: 151.0" })).toBeInTheDocument();
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
    });

    it("keeps disabled Create Session as solid dark grey, not translucent", () => {
        renderCapabilities();

        const button = screen.getByTestId("capabilities-create-session");
        const style = window.getComputedStyle(button);

        expect(button).toBeDisabled();
        expect(button).toHaveClass("new-session", "disabled-true");
        expect(style.width).toBe("100%");
        expect(style.opacity).toBe("1");
        expectColor(style.backgroundColor, "#3d444c");
        expectColor(style.color, "#666666");
        expectColor(style.borderTopColor, "#3d444c");
    });

    it("opens Remote hub pair+magnet panel (URL, timeout|name, resolution, Vnc|Video, Har) after selecting a WebDriver browser", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));

        const remote = await screen.findByTestId("capabilities-remote-panel");
        expect(remote).toHaveClass("panel", "panel--content");
        expect(screen.getByTestId("capabilities-remote-title")).toHaveTextContent("Remote hub");

        // presets #remote-hub: magnet stack → solo/duo/pair rows, not 3-in-one.
        const caps = within(remote).getByTestId("capabilities-caps");
        expect(caps).toHaveClass("plaque-field-grid-stack", "plaque-field-grid-stack--magnet");

        expect(within(caps).getByTestId("capabilities-caps-remote-url")).toHaveClass("plaque-field-grid--solo");
        expect(within(caps).getByTestId("capabilities-caps-session")).toHaveClass("plaque-field-grid--duo");
        expect(within(caps).getByTestId("capabilities-caps-resolution")).toHaveClass("plaque-field-grid--solo");

        const flags = within(caps).getByTestId("capabilities-caps-flags");
        expect(flags).toHaveClass("plaque-field-grid--solo");
        expect(within(flags).getByTestId("caps-enable-vnc")).toHaveAttribute("data-param-id", "enableVnc");
        expect(within(flags).getByTestId("caps-enable-video")).toHaveAttribute("data-param-id", "enableVideo");
        expect(within(flags).getByTestId("caps-enable-har")).toHaveAttribute("data-param-id", "enableHar");
        expect(within(caps).queryByTestId("capabilities-caps-har")).toBeNull();

        // No builder-only fields.
        expect(within(remote).queryByText("closeBrowserAfterEach")).toBeNull();
        expect(within(remote).queryByText("gradleBin")).toBeNull();
    });

    it("keeps Driver tagstrip in a solo row without magnet nowrap", () => {
        renderCapabilities();

        const browsers = screen.getByTestId("capabilities-driver-browsers");
        expect(browsers).toHaveClass("plaque-field-grid--solo");
        expect(browsers.closest(".plaque-field-grid-stack--magnet")).toBeNull();
        expect(within(browsers).getByTestId("capabilities-browser-select")).toBeInTheDocument();
    });
});
