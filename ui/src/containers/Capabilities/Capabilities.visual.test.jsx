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

describe("Capabilities visual contract (Driver + Remote hub + Browser caps panels)", () => {
    it("renders Driver panel with Webdriver / Playwright / Android tagstrips", () => {
        renderCapabilities();

        const driver = screen.getByTestId("capabilities-driver-panel");
        expect(driver).toHaveClass("panel", "panel--content");
        expect(screen.getByTestId("capabilities-driver-title")).toHaveTextContent("Driver");

        const stack = screen.getByTestId("capabilities-driver-browsers");
        expect(stack).toHaveClass("plaque-field-grid-stack", "plaque-field-grid-stack--magnet");

        const webdriver = screen.getByTestId("capabilities-browser-select");
        expect(webdriver).toHaveClass("capabilities-browser-select");
        expect(webdriver).toHaveAttribute("data-param-id", "webdriver");
        expect(within(webdriver).getByRole("group")).toBeInTheDocument();
        expect(within(webdriver).getByRole("button", { name: "chrome: 149.0" })).toBeInTheDocument();
        expect(within(webdriver).getByRole("button", { name: "firefox: 151.0" })).toBeInTheDocument();

        expect(screen.getByTestId("capabilities-browser-select-playwright")).toHaveAttribute(
            "data-param-id",
            "playwright"
        );
        expect(screen.getByTestId("capabilities-browser-select-android")).toHaveAttribute("data-param-id", "android");
        expect(screen.getByTestId("capabilities-browser-select-ios")).toHaveAttribute("data-param-id", "ios");
        // No iOS image yet → a single selectable "coming soon" chip surfaces the placeholder.
        const ios = screen.getByTestId("capabilities-browser-select-ios");
        expect(within(ios).getByRole("button", { name: "iOS (coming soon)" })).toBeInTheDocument();
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

    it("opens Remote hub pair+magnet panel (URL, timeout|name, resolution, flags, tz/env/labels) after selecting a WebDriver browser", async () => {
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
        expect(within(flags).getByTestId("caps-enable-log")).toHaveAttribute("data-param-id", "enableLog");
        expect(within(caps).queryByTestId("capabilities-caps-har")).toBeNull();

        expect(within(caps).getByTestId("capabilities-caps-timezone")).toHaveClass("plaque-field-grid--solo");
        expect(within(caps).getByTestId("caps-time-zone")).toHaveAttribute("data-param-id", "timeZone");
        expect(within(caps).getByTestId("capabilities-caps-env")).toHaveClass("plaque-field-grid--solo");
        expect(within(caps).getByTestId("caps-env").closest("label")).toHaveAttribute("data-param-id", "env");
        expect(within(caps).getByTestId("capabilities-caps-labels")).toHaveClass("plaque-field-grid--solo");
        expect(within(caps).getByTestId("caps-labels").closest("label")).toHaveAttribute("data-param-id", "labels");
        expect(within(caps).getByTestId("capabilities-caps-names")).toHaveClass("plaque-field-grid--solo");
        expect(within(caps).getByTestId("caps-video-name").closest("label")).toHaveAttribute(
            "data-param-id",
            "videoName"
        );

        // No builder-only fields.
        expect(within(remote).queryByText("closeBrowserAfterEach")).toBeNull();
        expect(within(remote).queryByText("gradleBin")).toBeNull();

        const browserCaps = await screen.findByTestId("capabilities-browser-panel");
        expect(browserCaps).toHaveClass("panel", "panel--content");
        expect(screen.getByTestId("capabilities-browser-title")).toHaveTextContent("Browser capabilities");
        expect(within(browserCaps).getByTestId("capabilities-browser-proxy-preset")).toHaveClass(
            "plaque-field-grid--solo"
        );
        expect(within(browserCaps).getByTestId("capabilities-browser-proxy")).toHaveClass("plaque-field-grid--duo");
        expect(within(browserCaps).getByTestId("caps-proxy-preset")).toHaveAttribute("data-param-id", "proxyPreset");
        expect(within(browserCaps).getByTestId("caps-proxy-server")).toBeInTheDocument();
        expect(within(browserCaps).getByTestId("caps-proxy-port")).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "proxyPreset" })).toHaveValue("off");

        // Legacy More capabilities removed.
        expect(screen.queryByTestId("capabilities-more-caps")).toBeNull();
        expect(screen.queryByText("More capabilities")).toBeNull();
        expect(document.querySelector("textarea.more-capabilities")).toBeNull();
    });

    it("keeps Driver tagstrips in magnet solo rows (dividers flush)", () => {
        renderCapabilities();

        const stack = screen.getByTestId("capabilities-driver-browsers");
        expect(stack).toHaveClass("plaque-field-grid-stack--magnet");

        for (const id of [
            "capabilities-driver-webdriver",
            "capabilities-driver-playwright",
            "capabilities-driver-android",
            "capabilities-driver-ios",
        ]) {
            expect(screen.getByTestId(id)).toHaveClass("plaque-field-grid--solo");
        }
        expect(within(stack).getByTestId("capabilities-browser-select")).toBeInTheDocument();
    });

    it("locks Capabilities body to continuous 6-col clamp (no discrete fr ladder)", async () => {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const { fileURLToPath } = await import("node:url");
        const dir = path.dirname(fileURLToPath(import.meta.url));
        const css = await fs.readFile(path.join(dir, "style.css.js"), "utf8");

        // Canon: one cfg|term formula ≥769. Ban the old 1:2:2 / stage rebuilds.
        expect(css).toMatch(/grid-template-columns:\s*var\(--capabilities-cfg\)\s+var\(--capabilities-term\)/);
        expect(css).toMatch(/--capabilities-col-rest:\s*calc\(/);
        expect(css).toMatch(/--capabilities-span-2:\s*calc\(/);
        expect(css).toMatch(/--capabilities-gutter:\s*clamp\(/);
        expect(css).not.toMatch(/1fr\)\s+minmax\(0,\s*2fr\)\s+minmax\(0,\s*2fr\)/);
        expect(css).not.toMatch(/1fr\)\s+minmax\(0,\s*2fr\)\s+minmax\(0,\s*3fr\)/);
        expect(css).not.toMatch(/@media\s*\(\s*min-width:\s*(900|1100|1280|1600)px\s*\)/);
        expect(css).not.toMatch(/@media\s*\(\s*min-width:\s*\d+px\)\s+and\s*\(\s*max-width:/);
    });
});
