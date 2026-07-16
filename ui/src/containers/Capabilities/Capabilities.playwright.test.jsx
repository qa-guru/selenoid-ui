import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route } from "react-router-dom";
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

vi.mock("rxjs/ajax", () => {
    const makeObservable = () => {
        const obs = {
            subscribe: (observer) => {
                if (typeof observer === "function") {
                    observer({ status: 200 });
                } else {
                    observer.next?.({ status: 200 });
                    observer.complete?.();
                }
                return { unsubscribe() {} };
            },
            pipe: () => obs,
        };
        return obs;
    };
    return { ajax: vi.fn(makeObservable) };
});

function renderCapabilities(playwrightAccessKey = ACCESS_KEY) {
    return render(
        <MemoryRouter initialEntries={["/capabilities"]}>
            <Route
                path="/capabilities"
                render={() => (
                    <Capabilities
                        browsers={BROWSERS}
                        browserProtocols={BROWSER_PROTOCOLS}
                        sessions={{}}
                        origin="https://selenoid.autotests.cloud"
                        playwrightAccessKey={playwrightAccessKey}
                    />
                )}
            />
        </MemoryRouter>
    );
}

async function selectPlaywrightChrome(user) {
    const select = document.querySelector(".capabilities-browser-select");
    await user.click(within(select).getByText("Select browser..."));
    await user.click(await screen.findByText("playwright-chrome: 1.61.0"));
}

describe("Capabilities Playwright Create Session", () => {
    let openedSockets;

    beforeEach(() => {
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
        vi.clearAllMocks();
    });

    it("shows accessKey in Playwright curl snippet when status provides it", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        const panel = document.querySelector(".code-panel");
        expect(panel.textContent).toContain("curl --websocket");
        expect(panel.textContent).toContain(`accessKey=${encodeURIComponent(ACCESS_KEY)}`);
        expect(panel.textContent).toContain("/playwright/playwright-chrome/1.61.0");
    });

    it("opens Playwright WebSocket with accessKey and does not throw ReferenceError", async () => {
        const user = userEvent.setup();
        renderCapabilities(ACCESS_KEY);
        await selectPlaywrightChrome(user);

        const create = screen.getByTestId("capabilities-create-session");
        expect(create).toBeEnabled();

        await expect(user.click(create)).resolves.toBeUndefined();

        expect(openedSockets).toHaveLength(1);
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.pathname).toBe("/playwright/playwright-chrome/1.61.0");
        expect(wsUrl.searchParams.get("accessKey")).toBe(ACCESS_KEY);
        expect(wsUrl.searchParams.get("name")).toBe("Manual session");
    });

    it("opens Playwright WebSocket without accessKey when empty (still no ReferenceError)", async () => {
        const user = userEvent.setup();
        renderCapabilities("");
        await selectPlaywrightChrome(user);

        await expect(user.click(screen.getByTestId("capabilities-create-session"))).resolves.toBeUndefined();

        expect(openedSockets).toHaveLength(1);
        const wsUrl = new URL(openedSockets[0].url);
        expect(wsUrl.searchParams.get("accessKey")).toBeNull();
    });
});
