import { act, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Capabilities from "./index";
import { CREATE_SESSION_TIMEOUT_MS } from "../../util/capabilitiesLogic";

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
        <MemoryRouter initialEntries={["/new-session"]}>
            <Routes>
                <Route
                    path="/new-session"
                    element={
                        <Capabilities
                            browsers={BROWSERS}
                            browserProtocols={BROWSER_PROTOCOLS}
                            sessions={{}}
                            origin="https://selenoid.qa.guru"
                        />
                    }
                />
                <Route path="/sessions/:session" element={<div data-testid="session-route" />} />
            </Routes>
        </MemoryRouter>
    );
}

async function selectAndroid(user: any, version: any = "10.0") {
    await user.click(screen.getByRole("button", { name: `android: ${version}` }));
}

function segButton(fieldTestId: any, value: any) {
    const field = screen.getByTestId(fieldTestId);
    return within(field!)
        .getAllByRole("button")
        .find((btn: any) => btn.dataset.value === value);
}

describe("Capabilities Android device panel", () => {
    it("shows Android panel (session + appium fields), not WebDriver / Playwright panels", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        const panel = screen.getByTestId("capabilities-android-panel");
        expect(within(panel!).getByTestId("capabilities-android-title")).toHaveTextContent("Session options");
        expect(screen.getByTestId("caps-android-session-name")).toHaveValue("Manual session");
        expect(screen.getByTestId("caps-android-app")).toBeInTheDocument();
        expect(screen.getByTestId("caps-android-no-reset")).toHaveAttribute("data-param-id", "noReset");
        expect(screen.getByTestId("caps-android-auto-grant")).toHaveAttribute("data-param-id", "autoGrantPermissions");
        expect(screen.getByTestId("caps-android-orientation")).toHaveAttribute("data-param-id", "orientation");
        expect(screen.queryByTestId("caps-android-skin")).toBeNull();

        expect(within(panel!).getByTestId("capabilities-caps-auth-user")).toHaveValue("test_user");
        expect(within(panel!).getByTestId("capabilities-caps-auth-pass")).toHaveValue("test_pass");

        // Mobile hides WebDriver proxy / Playwright panels.
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-browser-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-playwright-panel")).toBeNull();
        // HAR is WebDriver client-side only — never on Android.
        expect(screen.queryByTestId("caps-enable-har")).toBeNull();
    });

    it("defaults Android sessionTimeout to 2m anti-flake", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("2m");
    });

    it("shows android 11.0 chip from catalog and keeps 2m sessionTimeout default", async () => {
        const user = userEvent.setup();
        renderCapabilities();

        expect(screen.getByRole("button", { name: "android: 11.0" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "android: 11.0" }));

        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("2m");
        expect(screen.queryByRole("combobox", { name: "skin" })).toBeNull();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        expect(panel!.textContent).toContain('"browserVersion": "11.0"');
        expect(panel!.textContent).not.toContain('"skin"');
    });

    it("puts appium:* caps in alwaysMatch (no proxy, no WebDriver desiredCapabilities set)", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-android" } }),
        });

        renderCapabilities();
        await selectAndroid(user, "16.0");

        await user.type(screen.getByTestId("caps-android-app"), "https://example.org/app-debug.apk");
        await user.click(segButton("caps-android-no-reset", "true")!);
        await user.selectOptions(screen.getByRole("combobox", { name: "orientation" }), "LANDSCAPE");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock!).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]: any[]) => String(url).includes("/wd/hub/session"));
        expect(sessionCall!).toBeTruthy();
        const body = JSON.parse(String(sessionCall[1].body));
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
        expect(am["selenoid:options"].skin).toBeUndefined();

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
        expect(panel!.textContent).toContain('"browserName": "android"');
        expect(panel!.textContent).toContain('"platformName": "Android"');
        expect(panel!.textContent).toContain('"appium:orientation": "PORTRAIT"');
        expect(panel!.textContent).not.toContain('"skin"');
        expect(panel!.textContent).toContain('"appium:noReset": false');
    });

    it("uses Appium clients in java / python / js / ts snippets (not Selenium RemoteWebDriver)", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectAndroid(user);

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel!).getByRole("tablist", { name: "Language" });

        await user.click(within(tabs!).getByRole("tab", { name: "Java" }));
        expect(panel!.textContent).toContain("AndroidDriver");
        expect(panel!.textContent).not.toContain("RemoteWebDriver");

        await user.click(within(tabs!).getByRole("tab", { name: "Python" }));
        expect(panel!.textContent).toContain("from appium import webdriver");
        expect(panel!.textContent).toContain("AppiumOptions");
        expect(panel!.textContent).not.toContain("from selenium");

        await user.click(within(tabs!).getByRole("tab", { name: "Javascript" }));
        expect(panel!.textContent).toContain("require('webdriverio')");
        expect(panel!.textContent).toContain("await remote(options)");

        await user.click(within(tabs!).getByRole("tab", { name: "Typescript" }));
        expect(panel!.textContent).toContain("from 'webdriverio'");
        expect(panel!.textContent).toContain("await remote(options)");
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

describe("Capabilities Android Create Session errors", () => {
    it("shows a 5m timeout on the Create Session plaque after abort, never aborted-without-reason", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input: any, init?: RequestInit) => {
            if (String(input).includes("/wd/hub/status")) {
                return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
            }
            return new Promise((_resolve, reject) => {
                const signal = init?.signal;
                if (!signal) {
                    return;
                }
                const onAbort = () => {
                    reject(signal.reason ?? new DOMException("signal is aborted without reason", "AbortError"));
                };
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                signal.addEventListener("abort", onAbort);
            });
        });
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        try {
            renderCapabilities();
            await selectAndroid(user);
            vi.useFakeTimers();
            fireEvent.click(screen.getByTestId("capabilities-create-session"));
            await act(async () => {
                await vi.advanceTimersByTimeAsync(CREATE_SESSION_TIMEOUT_MS);
            });

            const create = screen.getByTestId("capabilities-create-session");
            expect(create).toHaveClass("error-true");
            const title = create.getAttribute("title") || "";
            expect(title).toContain("timed out after 5m waiting for POST /wd/hub/session");
            expect(title).toMatch(/container logs|-session-attempt-timeout/);
            expect(title).not.toMatch(/aborted without reason/i);
            expect(title).not.toMatch(/AbortError/);
            expect(title).not.toMatch(/Can't start Android session manually/);
            expect(consoleSpy).toHaveBeenCalledWith(title, expect.anything());
        } finally {
            vi.useRealTimers();
            consoleSpy.mockRestore();
            fetchMock.mockRestore();
        }
    });

    it("shows hub HTTP 500 body on the Create Session plaque", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
            if (String(input).includes("/wd/hub/status")) {
                return Promise.resolve({ ok: true, status: 200, json: async () => ({}) } as Response);
            }
            return Promise.resolve({
                ok: false,
                status: 500,
                json: async () => ({
                    value: { error: "session not created", message: "Android container died" },
                }),
            } as Response);
        });

        try {
            renderCapabilities();
            await selectAndroid(user);
            await user.click(screen.getByTestId("capabilities-create-session"));

            await waitFor(() => {
                expect(screen.getByTestId("capabilities-create-session")).toHaveAttribute(
                    "title",
                    "Create Session failed: HTTP 500 — Android container died"
                );
            });
        } finally {
            fetchMock.mockRestore();
        }
    });
});
