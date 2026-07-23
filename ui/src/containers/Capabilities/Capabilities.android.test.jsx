import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Capabilities from "./index";

const BROWSERS = {
    chrome: { "149.0": {} },
    android: { "10.0": {}, "11.0": {}, "16.0": {} },
};

const BROWSER_PROTOCOLS = {
    chrome: { "149.0": { protocol: "webdriver" } },
    android: {
        "10.0": { protocol: "webdriver" },
        "11.0": { protocol: "webdriver" },
        "16.0": { protocol: "webdriver" },
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
                            browserProtocols={BROWSER_PROTOCOLS}
                            sessions={{}}
                            origin="https://selenoid.qa.guru"
                            accessKey=""
                        />
                    }
                />
                <Route path="/sessions/:session" element={<div data-testid="session-route" />} />
            </Routes>
        </MemoryRouter>
    );
}

async function selectAndroid(user, version = "10.0") {
    await user.click(screen.getByRole("button", { name: `android: ${version}` }));
}

function segButton(fieldTestId, value) {
    const field = screen.getByTestId(fieldTestId);
    return within(field)
        .getAllByRole("button")
        .find((btn) => btn.dataset.value === value);
}

describe("Capabilities Android device panel", () => {
    it("shows Android panel (session + appium fields), not WebDriver / Playwright panels", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        const panel = screen.getByTestId("capabilities-android-panel");
        expect(within(panel).getByTestId("capabilities-android-title")).toHaveTextContent("Android device");
        expect(screen.getByTestId("caps-android-session-name")).toHaveValue("Manual session");
        expect(screen.getByTestId("caps-android-app")).toBeInTheDocument();
        expect(screen.getByTestId("caps-android-no-reset")).toHaveAttribute("data-param-id", "noReset");
        expect(screen.getByTestId("caps-android-auto-grant")).toHaveAttribute("data-param-id", "autoGrantPermissions");
        expect(screen.getByTestId("caps-android-orientation")).toHaveAttribute("data-param-id", "orientation");
        expect(screen.getByTestId("caps-android-skin")).toHaveAttribute("data-param-id", "skin");

        // Mobile hides WebDriver proxy / Playwright panels.
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-browser-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-playwright-panel")).toBeNull();
    });

    it("defaults Android sessionTimeout to 2m anti-flake", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("2m");
    });

    it("shows android 11.0 chip from catalog and keeps 2m + QVGA defaults", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        expect(screen.getByRole("button", { name: "android: 11.0" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "android: 11.0" }));

        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("2m");
        expect(screen.getByRole("combobox", { name: "skin" })).toHaveValue("QVGA");

        const panel = screen.getByTestId("capabilities-terminal-panel");
        expect(panel.textContent).toContain('"browserVersion": "11.0"');
        expect(panel.textContent).toContain('"skin": "QVGA"');
    });

    it("puts appium:* caps in alwaysMatch (no proxy, no WebDriver desiredCapabilities set)", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-android" } }),
        });

        renderCapabilities();
        await selectAndroid(user, "16.0");

        await user.type(screen.getByTestId("caps-android-app"), "https://example.org/app-debug.apk");
        await user.click(segButton("caps-android-no-reset", "true"));
        await user.selectOptions(screen.getByRole("combobox", { name: "orientation" }), "LANDSCAPE");
        await user.selectOptions(screen.getByRole("combobox", { name: "skin" }), "HVGA");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/wd/hub/session"));
        expect(sessionCall).toBeTruthy();
        const body = JSON.parse(sessionCall[1].body);
        const am = body.capabilities.alwaysMatch;

        expect(am.browserName).toBe("android");
        expect(am.browserVersion).toBe("16.0");
        expect(am.platformName).toBe("Android");
        expect(am["appium:automationName"]).toBe("UiAutomator2");
        expect(am["appium:app"]).toBe("https://example.org/app-debug.apk");
        expect(am["appium:noReset"]).toBe(true);
        expect(am["appium:autoGrantPermissions"]).toBe(true);
        expect(am["appium:orientation"]).toBe("LANDSCAPE");
        expect(am["selenoid:options"].enableVNC).toBe(true);
        expect(am["selenoid:options"].name).toBe("Manual session");
        expect(am["selenoid:options"].sessionTimeout).toBe("2m");
        expect(am["selenoid:options"].skin).toBe("HVGA");

        // Android is not a WebDriver-proxy path.
        expect(am.proxy).toBeUndefined();
        expect(body.desiredCapabilities).toBeUndefined();

        fetchMock.mockRestore();
    });

    it("mirrors Android caps in the curl terminal snippet", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        const panel = screen.getByTestId("capabilities-terminal-panel");
        expect(panel.textContent).toContain('"browserName": "android"');
        expect(panel.textContent).toContain('"platformName": "Android"');
        expect(panel.textContent).toContain('"appium:orientation": "PORTRAIT"');
        expect(panel.textContent).toContain('"skin": "QVGA"');
        expect(panel.textContent).toContain('"appium:noReset": false');
    });

    it("uses Appium clients in java / python / js / ts snippets (not Selenium RemoteWebDriver)", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel).getByRole("tablist", { name: "Language" });

        await user.click(within(tabs).getByRole("tab", { name: "Java" }));
        expect(panel.textContent).toContain("AndroidDriver");
        expect(panel.textContent).not.toContain("RemoteWebDriver");

        await user.click(within(tabs).getByRole("tab", { name: "Python" }));
        expect(panel.textContent).toContain("from appium import webdriver");
        expect(panel.textContent).toContain("AppiumOptions");
        expect(panel.textContent).not.toContain("from selenium");

        await user.click(within(tabs).getByRole("tab", { name: "Javascript" }));
        expect(panel.textContent).toContain("require('webdriverio')");
        expect(panel.textContent).toContain("await remote(options)");

        await user.click(within(tabs).getByRole("tab", { name: "Typescript" }));
        expect(panel.textContent).toContain("from 'webdriverio'");
        expect(panel.textContent).toContain("await remote(options)");
    });
});

describe("Capabilities iOS placeholder", () => {
    it("shows a disabled coming-soon panel and keeps Create Session locked", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        await user.click(screen.getByRole("button", { name: "iOS (coming soon)" }));

        expect(screen.getByTestId("capabilities-ios-panel")).toBeInTheDocument();
        expect(screen.getByTestId("capabilities-ios-placeholder")).toHaveTextContent("coming soon");
        expect(screen.getByTestId("capabilities-create-session")).toBeDisabled();

        // No config panels for the placeholder.
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-android-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-playwright-panel")).toBeNull();
    });
});
