import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Capabilities from "./index";

const ACCESS_KEY = "test_user:test_pass";

const BROWSERS = {
    chrome: { "149.0": {} },
    "playwright-chrome": { "1.61.0": {} },
};

const BROWSER_PROTOCOLS = {
    chrome: { "149.0": { protocol: "webdriver" } },
    "playwright-chrome": { "1.61.0": { protocol: "playwright" } },
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
            </Routes>
        </MemoryRouter>
    );
}

async function selectPlaywrightChrome(user) {
    await user.click(screen.getByRole("button", { name: "chrome: 1.61.0" }));
}

describe("Capabilities Playwright Create Session", () => {
    let openedSockets;

    beforeEach(() => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({}),
        });

        openedSockets = [];
        class CapturingWebSocket {
            constructor(url) {
                this.url = url;
                this.readyState = CapturingWebSocket.OPEN;
                openedSockets.push(this);
            }

            close() {
                this.readyState = CapturingWebSocket.CLOSED;
            }

            send() {}
        }
        CapturingWebSocket.CONNECTING = 0;
        CapturingWebSocket.OPEN = 1;
        CapturingWebSocket.CLOSING = 2;
        CapturingWebSocket.CLOSED = 3;
        window.WebSocket = CapturingWebSocket;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("shows accessKey in Playwright curl snippet from default accessKey", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectPlaywrightChrome(user);

        const panel = document.querySelector(".code-panel");
        expect(panel.textContent).toContain("curl --websocket");
        expect(panel.textContent).toContain(`accessKey=${encodeURIComponent(ACCESS_KEY)}`);
        expect(panel.textContent).toContain("/playwright/playwright-chrome/1.61.0");
        expect(panel.querySelector(".ch-tok-key").textContent).toBe("--websocket");
        expect([...panel.querySelectorAll(".ch-tok-cmd")].map(({ textContent }) => textContent)).toEqual([
            "curl",
            "localhost:3000",
        ]);
        expect([...panel.querySelectorAll(".ch-tok-key")].map(({ textContent }) => textContent)).toContain("accessKey");
    });

    it("opens Playwright WebSocket with accessKey and does not throw ReferenceError", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectPlaywrightChrome(user);

        // Browser capabilities (proxy) is shared — WebDriver W3C / Playwright socksProxy query.
        expect(screen.getByTestId("capabilities-browser-panel")).toBeInTheDocument();
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        // Hub HAR toggle lives on the Playwright panel (caps-playwright-enable-har).
        expect(screen.getByTestId("caps-playwright-enable-har")).toBeInTheDocument();
        expect(screen.queryByTestId("caps-enable-har")).toBeNull();

        const create = screen.getByTestId("capabilities-create-session");
        expect(create).toBeEnabled();

        await expect(user.click(create)).resolves.toBeUndefined();

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.pathname).toBe("/playwright/playwright-chrome/1.61.0");
        expect(wsUrl.searchParams.get("accessKey")).toBe(ACCESS_KEY);
        expect(wsUrl.searchParams.get("name")).toBe("Manual session");
        expect(wsUrl.searchParams.get("screenResolution")).toBe("1920x1080x24");
        expect(wsUrl.searchParams.get("enableLog")).toBe("false");
        expect(wsUrl.searchParams.get("timeZone")).toBe("UTC");
        expect(wsUrl.searchParams.get("labels.manual")).toBe("true");
        expect(wsUrl.searchParams.get("socksProxy")).toBeNull();
    });

    it("uses default accessKey in Playwright WebSocket", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectPlaywrightChrome(user);

        await expect(user.click(screen.getByTestId("capabilities-create-session"))).resolves.toBeUndefined();

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("accessKey")).toBe(ACCESS_KEY);
    });

    it("shows Playwright session panel (hub parity + headless), not WebDriver panels", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        const panel = screen.getByTestId("capabilities-playwright-panel");
        expect(within(panel).getByTestId("capabilities-playwright-title")).toHaveTextContent("Playwright session");
        expect(screen.getByTestId("caps-playwright-session-timeout")).toHaveAttribute(
            "data-param-id",
            "sessionTimeout"
        );
        expect(screen.getByTestId("caps-playwright-session-name")).toHaveValue("Manual session");
        expect(screen.getByTestId("caps-playwright-screen-resolution")).toHaveAttribute(
            "data-param-id",
            "screenResolution"
        );
        expect(screen.getByTestId("caps-playwright-enable-vnc")).toHaveAttribute("data-param-id", "enableVnc");
        expect(screen.getByTestId("caps-playwright-enable-video")).toHaveAttribute("data-param-id", "enableVideo");
        expect(screen.getByTestId("caps-playwright-enable-har")).toHaveAttribute("data-param-id", "enableHar");
        expect(screen.getByTestId("caps-playwright-enable-log")).toHaveAttribute("data-param-id", "enableLog");
        expect(screen.getByTestId("caps-playwright-headless")).toHaveAttribute("data-param-id", "headless");
        expect(screen.queryByTestId("capabilities-playwright-har")).toBeNull();
        expect(screen.getByTestId("caps-playwright-time-zone")).toHaveAttribute("data-param-id", "timeZone");
        expect(screen.getByTestId("caps-playwright-env").closest("label")).toHaveAttribute("data-param-id", "env");
        expect(screen.getByTestId("caps-playwright-labels")).toHaveValue("manual=true");
        expect(screen.getByTestId("caps-playwright-video-name").closest("label")).toHaveAttribute(
            "data-param-id",
            "videoName"
        );

        const accessKeyField = within(panel).getByTestId("capabilities-caps-access-key-field");
        expect(accessKeyField).toHaveValue(ACCESS_KEY);
        expect(accessKeyField.closest("label")).toHaveAttribute("data-param-id", "accessKey");
        expect(within(panel).queryByTestId("capabilities-caps-auth-user")).toBeNull();
        expect(within(panel).queryByTestId("capabilities-caps-auth-pass")).toBeNull();

        // WebDriver Remote hub is hidden for Playwright; proxy panel is below session (WD order).
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(screen.getByTestId("capabilities-browser-panel")).toBeInTheDocument();
        expect(screen.getByTestId("caps-proxy-preset")).toHaveAttribute("data-param-id", "proxyPreset");
        const sessionPanel = screen.getByTestId("capabilities-playwright-panel");
        const proxyPanel = screen.getByTestId("capabilities-browser-panel");
        expect(Boolean(sessionPanel.compareDocumentPosition(proxyPanel) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        expect(screen.queryByTestId("capabilities-android-panel")).toBeNull();
    });

    it("uses edited accessKey in Playwright WebSocket query", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectPlaywrightChrome(user);

        const accessKeyField = screen.getByTestId("capabilities-caps-access-key-field");
        await user.clear(accessKeyField);
        await user.type(accessKeyField, "pw_token_only");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("accessKey")).toBe("pw_token_only");
    });

    it("mirrors Playwright panel options (name, headless, resolution, labels) into the Create Session WebSocket query", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        await user.clear(screen.getByTestId("caps-playwright-session-name"));
        await user.type(screen.getByTestId("caps-playwright-session-name"), "PW panel");
        const headless = screen.getByTestId("caps-playwright-headless");
        await user.click(within(headless).getByRole("button", { name: "true" }));
        await user.clear(screen.getByTestId("caps-playwright-labels"));
        await user.type(screen.getByTestId("caps-playwright-labels"), "manual=true,team=qa");
        await user.clear(screen.getByTestId("caps-playwright-video-name"));
        await user.type(screen.getByTestId("caps-playwright-video-name"), "pw-panel.mp4");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("name")).toBe("PW panel");
        expect(wsUrl.searchParams.get("headless")).toBe("true");
        expect(wsUrl.searchParams.get("screenResolution")).toBe("1920x1080x24");
        expect(wsUrl.searchParams.get("labels.manual")).toBe("true");
        expect(wsUrl.searchParams.get("labels.team")).toBe("qa");
        expect(wsUrl.searchParams.get("videoName")).toBe("pw-panel.mp4");
    });

    it("puts proxy.qaguru.school preset into Playwright WebSocket socksProxy", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        await user.selectOptions(screen.getByRole("combobox", { name: "proxyPreset" }), "proxy.qaguru.school");
        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("socksProxy")).toBe("proxy.qaguru.school:7777");
    });

    it("wires harContent=bodies into Playwright WS query only when enableHar is on", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        const har = screen.getByTestId("caps-playwright-enable-har");
        await user.click(within(har).getByRole("button", { name: "true" }));
        expect(screen.getByTestId("capabilities-playwright-har")).toBeInTheDocument();
        const content = screen.getByTestId("caps-playwright-har-content");
        await user.click(within(content).getByRole("button", { name: "bodies" }));

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("enableHAR")).toBe("true");
        expect(wsUrl.searchParams.get("harContent")).toBe("bodies");
    });

    it("omits harContent from Playwright WS query when enableHar is on with default meta", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        const har = screen.getByTestId("caps-playwright-enable-har");
        await user.click(within(har).getByRole("button", { name: "true" }));
        expect(
            within(screen.getByTestId("caps-playwright-har-content")).getByRole("button", { name: "meta" })
        ).toHaveAttribute("aria-pressed", "true");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("enableHAR")).toBe("true");
        expect(wsUrl.searchParams.get("harContent")).toBeNull();
    });
});
