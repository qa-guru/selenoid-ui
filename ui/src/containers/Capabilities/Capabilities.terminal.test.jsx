import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Capabilities from "./index";

const BROWSERS = {
    chrome: {
        "149.0": {},
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

describe("Capabilities CodeHighlight → Panel terminal", () => {
    it("wraps the snippet in panel--terminal with lang tabs in the foot rail", () => {
        renderCapabilities();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        expect(panel).toHaveClass("panel", "panel--terminal", "panel--foot-rail");
        expect(panel.querySelector(".panel__code")).toBeTruthy();
        expect(panel.querySelector(".capabilities-lang")).toBeNull();

        const tabs = within(panel).getByRole("tablist", { name: "Language" });
        expect(tabs).toHaveClass("tabs");
        expect(panel.querySelector(".panel__foot")?.contains(tabs)).toBe(true);
        expect(panel.querySelector(".panel__trail")?.contains(tabs)).toBe(false);

        const curl = within(tabs).getByRole("tab", { name: "curl" });
        expect(curl).toHaveClass("tab", "tab--active");
        expect(curl).toHaveAttribute("aria-selected", "true");
        expect(within(tabs).getByRole("tab", { name: "Java" })).toHaveClass("tab");
        expect(within(tabs).getByRole("tab", { name: "Kotlin" })).toHaveClass("tab");
        expect(within(tabs).getByRole("tab", { name: "Swift" })).toHaveClass("tab");
        expect(within(tabs).getByRole("tab", { name: "Rust" })).toHaveClass("tab");
        expect(within(tabs).getByRole("tab", { name: "Typescript" })).toHaveClass("tab");
        const labels = within(tabs)
            .getAllByRole("tab")
            .map((el) => el.textContent);
        expect(labels).toEqual([
            "curl",
            "Java",
            "Kotlin",
            "Swift",
            "Python",
            "Javascript",
            "Typescript",
            "Go",
            "Rust",
            "C#",
            "PHP",
            "Ruby",
        ]);
    });

    it("switches to kotlin / typescript / swift / rust snippets", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel).getByRole("tablist", { name: "Language" });

        await user.click(within(tabs).getByRole("tab", { name: "Kotlin" }));
        expect(panel.textContent).toContain("val options = ChromeOptions()");
        expect(panel.textContent).toContain("RemoteWebDriver");

        await user.click(within(tabs).getByRole("tab", { name: "Typescript" }));
        expect(panel.textContent).toContain("import { remote, type RemoteOptions }");
        expect(panel.textContent).toContain("await remote(options)");

        await user.click(within(tabs).getByRole("tab", { name: "Swift" }));
        expect(panel.textContent).toContain("import Selenium");
        expect(panel.textContent).toContain("RemoteWebDriver");

        await user.click(within(tabs).getByRole("tab", { name: "Rust" }));
        expect(panel.textContent).toContain("use thirtyfour::prelude::*");
        expect(panel.textContent).toContain("WebDriver::new");
    });

    it("switches the active lang tab and updates the highlighted snippet", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel).getByRole("tablist", { name: "Language" });

        await user.click(within(tabs).getByRole("tab", { name: "Java" }));

        expect(within(tabs).getByRole("tab", { name: "Java" })).toHaveClass("tab--active");
        expect(within(tabs).getByRole("tab", { name: "curl" })).not.toHaveClass("tab--active");
        expect(panel.textContent).toContain("RemoteWebDriver");
        expect(panel.textContent).toContain("ChromeOptions");
    });

    it("mirrors Remote hub session options in the curl terminal snippet", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));
        await screen.findByTestId("capabilities-remote-panel");

        await user.selectOptions(screen.getByRole("combobox", { name: "sessionTimeout" }), "15m");
        await user.clear(screen.getByTestId("caps-session-name"));
        await user.type(screen.getByTestId("caps-session-name"), "Terminal mirror");
        await user.selectOptions(screen.getByRole("combobox", { name: "screenResolution" }), "1280x1024x24");

        const panel = screen.getByTestId("capabilities-terminal-panel");
        expect(panel.textContent).toContain('"sessionTimeout": "15m"');
        expect(panel.textContent).toContain('"name": "Terminal mirror"');
        expect(panel.textContent).toContain('"screenResolution": "1280x1024x24"');
    });

    it("renders vector fingerprint and Сброс / Копировать panel actions", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const vector = within(panel).getByRole("textbox", { name: "Vector id" });
        expect(vector).toHaveAttribute("data-testid", "capabilities-terminal-vector");
        expect(/** @type {HTMLInputElement} */ (vector).value).toMatch(/^vector#[0-9a-f]{8}$/);

        expect(within(panel).getByRole("button", { name: "Сброс" })).toHaveAttribute(
            "data-testid",
            "capabilities-terminal-reset"
        );
        expect(within(panel).getByRole("button", { name: "Копировать" })).toHaveAttribute(
            "data-testid",
            "capabilities-terminal-copy"
        );

        await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));
        await screen.findByTestId("capabilities-remote-panel");
        await user.selectOptions(screen.getByRole("combobox", { name: "sessionTimeout" }), "15m");
        const before = /** @type {HTMLInputElement} */ (vector).value;

        await user.click(within(panel).getByRole("button", { name: "Сброс" }));
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(/** @type {HTMLInputElement} */ (vector).value).toMatch(/^vector#[0-9a-f]{8}$/);
        expect(/** @type {HTMLInputElement} */ (vector).value).not.toBe(before);

        await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));
        await screen.findByTestId("capabilities-remote-panel");
        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("60m");
        expect(screen.getByTestId("caps-session-name")).toHaveValue("Manual session");
    });
});
