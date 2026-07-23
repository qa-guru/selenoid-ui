import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Capabilities from "./index";

const ACCESS_KEY = "qa_engineer:aAb_-4gs53FD";

const BROWSERS = {
    chrome: { "149.0": {} },
    "playwright-chrome": { "1.61.0": {} },
};

const BROWSER_PROTOCOLS = {
    chrome: { "149.0": { protocol: "webdriver" } },
    "playwright-chrome": { "1.61.0": { protocol: "playwright" } },
};

function renderCapabilities(accessKey = ACCESS_KEY) {
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
                            accessKey={accessKey}
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

    it("shows accessKey in Playwright curl snippet when status provides it", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
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
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        // Browser capabilities (proxy) is WebDriver-only — hidden for Playwright.
        expect(screen.queryByTestId("capabilities-browser-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();

        const create = screen.getByTestId("capabilities-create-session");
        expect(create).toBeEnabled();

        await expect(user.click(create)).resolves.toBeUndefined();

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.pathname).toBe("/playwright/playwright-chrome/1.61.0");
        expect(wsUrl.searchParams.get("accessKey")).toBe(ACCESS_KEY);
        expect(wsUrl.searchParams.get("name")).toBe("Manual session");
    });

    it("uses default accessKey in Playwright WebSocket when server accessKey is empty", async () => {
        const user = userEvent.setup();
        renderCapabilities("");
        await selectPlaywrightChrome(user);

        await expect(user.click(screen.getByTestId("capabilities-create-session"))).resolves.toBeUndefined();

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("accessKey")).toBe(ACCESS_KEY);
    });

    it("shows Playwright session panel (name/timeout/vnc/video/headless), not WebDriver panels", async () => {
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
        expect(screen.getByTestId("caps-playwright-enable-vnc")).toHaveAttribute("data-param-id", "enableVnc");
        expect(screen.getByTestId("caps-playwright-enable-video")).toHaveAttribute("data-param-id", "enableVideo");
        expect(screen.getByTestId("caps-playwright-headless")).toHaveAttribute("data-param-id", "headless");

        // WebDriver-only panels are hidden for Playwright.
        expect(screen.queryByTestId("capabilities-remote-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-browser-panel")).toBeNull();
        expect(screen.queryByTestId("capabilities-android-panel")).toBeNull();
    });

    it("mirrors Playwright panel options (name, headless) into the Create Session WebSocket query", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        await user.clear(screen.getByTestId("caps-playwright-session-name"));
        await user.type(screen.getByTestId("caps-playwright-session-name"), "PW panel");
        const headless = screen.getByTestId("caps-playwright-headless");
        await user.click(within(headless).getByRole("button", { name: "true" }));

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(openedSockets).toHaveLength(1));
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("name")).toBe("PW panel");
        expect(wsUrl.searchParams.get("headless")).toBe("true");
    });
});
