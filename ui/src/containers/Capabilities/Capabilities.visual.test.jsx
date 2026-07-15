import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route } from "react-router-dom";
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
            <Route
                path="/capabilities"
                render={() => (
                    <Capabilities
                        browsers={BROWSERS}
                        browserProtocols={{}}
                        sessions={{}}
                        origin="https://selenoid.autotests.cloud"
                        playwrightAccessKey=""
                    />
                )}
            />
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

describe("Capabilities visual contract (Selenoid 2)", () => {
    it("keeps closed select as borderless dark control with grey placeholder", () => {
        renderCapabilities();

        const select = document.querySelector(".capabilities-browser-select");
        const control = select.querySelector(".Select__control");
        const placeholder = select.querySelector(".Select__placeholder");
        const style = window.getComputedStyle(control);

        expect(control).toBeTruthy();
        expect(["0px", ""].includes(style.borderTopWidth) || style.borderStyle === "none").toBe(true);
        expect(style.boxShadow === "none" || style.boxShadow === "").toBe(true);
        expect(style.minHeight === "30px" || style.height === "30px").toBe(true);
        expect(placeholder).toHaveTextContent("Select browser...");
        expectColor(window.getComputedStyle(placeholder).color, "#999999");
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

    it("keeps open select menu options on dark #30363C with Selenoid 2 colors", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        const select = document.querySelector(".capabilities-browser-select");
        await user.click(within(select).getByText("Select browser..."));

        const focused = await screen.findByText("chrome: 149.0");
        const idle = await screen.findByText("firefox: 151.0");
        const focusedStyle = window.getComputedStyle(focused);
        const idleStyle = window.getComputedStyle(idle);

        expectColor(focusedStyle.backgroundColor, "#30363c");
        expectColor(focusedStyle.color, "#59a781");
        expect(focusedStyle.textTransform).toBe("uppercase");

        expectColor(idleStyle.backgroundColor, "#30363c");
        expectColor(idleStyle.color, "#cccccc");
        expect(idleStyle.textTransform).toBe("uppercase");

        const menu = document.querySelector(".Select__menu");
        const menuStyle = window.getComputedStyle(menu);
        expect(menuStyle.boxShadow === "none" || menuStyle.boxShadow === "").toBe(true);
        expect(["0px", ""].includes(menuStyle.borderTopWidth) || menuStyle.borderStyle === "none").toBe(true);
    });
});
