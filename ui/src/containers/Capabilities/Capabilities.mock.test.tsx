import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Capabilities from "./index";
import {
    isMockLiveSession,
    mergeMockLiveSessions,
    resetMockLiveSessionOverlay,
    setMockSessionsEnabled,
} from "../../lib/mockSessions";

const BROWSERS = {
    chrome: { "149.0": {} },
    "playwright-chrome": { "1.61.0": {} },
    android: { "16.0": {} },
};

const BROWSER_PROTOCOLS = {
    chrome: { "149.0": { protocol: "webdriver" } },
    "playwright-chrome": { "1.61.0": { protocol: "playwright" } },
    android: { "16.0": { protocol: "webdriver" } },
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

function createdFromForm() {
    return Object.values(mergeMockLiveSessions({})).find((session) =>
        String(session.id || "").startsWith("mockusr-")
    );
}

describe("Capabilities Create Session in mock mode", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        resetMockLiveSessionOverlay();
        setMockSessionsEnabled(false);
    });

    it("spawns a WebDriver mock session from the form and does not POST the hub", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "should-not-use" } }),
        });
        setMockSessionsEnabled(true);

        renderCapabilities();
        await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));
        await screen.findByTestId("capabilities-caps");

        await user.selectOptions(screen.getByRole("combobox", { name: "sessionTimeout" }), "15m");
        await user.clear(screen.getByTestId("caps-session-name"));
        await user.type(screen.getByTestId("caps-session-name"), "RTL mock");
        await user.selectOptions(screen.getByRole("combobox", { name: "screenResolution" }), "1280x1024x24");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(screen.getByTestId("session-route")).toBeInTheDocument());
        expect(
            fetchMock.mock.calls.some(([url]: [unknown]) => String(url).includes("/wd/hub/session"))
        ).toBe(false);

        const created = createdFromForm();
        expect(created).toBeTruthy();
        expect(isMockLiveSession(created?.id)).toBe(true);
        expect(created?.caps?.browserName).toBe("chrome");
        expect(created?.caps?.version).toBe("149.0");
        expect(created?.caps?.name).toBe("RTL mock");
        expect(created?.caps?.sessionTimeout).toBe("15m");
        expect(created?.caps?.screenResolution).toBe("1280x1024x24");
        expect(created?.caps?.enableVNC).toBe(true);
        expect(created?.caps?.labels).toEqual({ manual: "true" });
        expect(created?.quota).toBe("test_user");
    });

    it("spawns a Playwright mock session without opening a WebSocket", async () => {
        const user = userEvent.setup();
        setMockSessionsEnabled(true);

        renderCapabilities();
        await user.click(screen.getByRole("button", { name: "chrome: 1.61.0" }));
        await user.clear(screen.getByTestId("caps-playwright-session-name"));
        await user.type(screen.getByTestId("caps-playwright-session-name"), "PW mock");
        await user.click(within(screen.getByTestId("caps-playwright-headless")).getByRole("button", { name: "true" }));

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(screen.getByTestId("session-route")).toBeInTheDocument());
        const created = createdFromForm();
        expect(created?.caps?.browserName).toBe("playwright-chrome");
        expect(created?.caps?.version).toBe("1.61.0");
        expect(created?.caps?.name).toBe("PW mock");
        expect(created?.caps?.headless).toBe(true);
        expect(created?.caps?.enableVNC).toBe(true);
    });

    it("spawns an Android mock session from the device panel", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "should-not-use" } }),
        });
        setMockSessionsEnabled(true);

        renderCapabilities();
        await user.click(screen.getByRole("button", { name: "android: 16.0" }));
        await user.clear(screen.getByTestId("caps-android-session-name"));
        await user.type(screen.getByTestId("caps-android-session-name"), "Android mock");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(screen.getByTestId("session-route")).toBeInTheDocument());
        expect(
            fetchMock.mock.calls.some(([url]: [unknown]) => String(url).includes("/wd/hub/session"))
        ).toBe(false);

        const created = createdFromForm();
        expect(created?.caps?.browserName).toBe("android");
        expect(created?.caps?.version).toBe("16.0");
        expect(created?.caps?.name).toBe("Android mock");
        expect(created?.caps?.enableVNC).toBe(true);
    });
});
