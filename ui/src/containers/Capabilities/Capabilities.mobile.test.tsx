import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Capabilities from "./index";
import { mobileDeviceById } from "../../util/capabilitiesMobileEmulation";

const BROWSERS = {
    chrome: {
        "149.0": {},
    },
    msedge: {
        "149.0": {},
    },
    firefox: {
        "151.0": {},
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
                            browserProtocols={{}}
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

async function selectBrowser(user: any, label: string) {
    await user.click(screen.getByRole("button", { name: label }));
}

describe("Capabilities Chrome mobileEmulation catalog", () => {
    it("defaults to off on chrome and hides the panel for firefox", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectBrowser(user, "chrome: 149.0");

        const panel = await screen.findByTestId("capabilities-mobile-panel");
        expect(screen.getByTestId("capabilities-mobile-title")).toHaveTextContent("Mobile emulation");
        expect(screen.getByRole("combobox", { name: "mobileDevice" })).toHaveValue("off");
        expect(screen.getByTestId("capabilities-mobile-hint")).toHaveTextContent(/Off = desktop/);
        expect(within(panel!).getByRole("option", { name: "iPhone 12 Pro" })).toBeInTheDocument();
        expect(within(panel!).getByRole("option", { name: "Pixel 7" })).toBeInTheDocument();

        await selectBrowser(user, "firefox: 151.0");
        expect(screen.queryByTestId("capabilities-mobile-panel")).toBeNull();
    });

    it("omits mobileEmulation from Create Session while off", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-desktop" } }),
        });

        renderCapabilities();
        await selectBrowser(user, "chrome: 149.0");
        await screen.findByTestId("capabilities-mobile-panel");
        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock!).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]: [any]) => String(url).includes("/wd/hub/session"));
        const body = JSON.parse(String(sessionCall[1].body));
        expect(body.capabilities.alwaysMatch["goog:chromeOptions"].mobileEmulation).toBeUndefined();
        expect(body.capabilities.alwaysMatch["goog:chromeOptions"].args).toEqual([
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--window-size=1920,1080",
            "--window-position=0,0",
        ]);
        expect(
            fetchMock.mock.calls.some(([url]: any[]) => String(url).includes("/wd/hub/session/sess-desktop/url"))
        ).toBe(false);

        fetchMock.mockRestore();
    });

    it("puts deviceMetrics + UA on goog:chromeOptions for Create Session and Java/Python/JS", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-iphone" } }),
        });
        const iphone = mobileDeviceById("iphone-12-pro")!;

        renderCapabilities();
        await selectBrowser(user, "chrome: 149.0");
        await screen.findByTestId("capabilities-mobile-panel");
        await user.selectOptions(screen.getByRole("combobox", { name: "mobileDevice" }), "iphone-12-pro");

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel!).getByRole("tablist", { name: "Language" });

        await user.click(within(tabs!).getByRole("tab", { name: "Java" }));
        expect(panel.textContent).toContain('setExperimentalOption("mobileEmulation"');
        expect(panel.textContent).toContain('put("width", 390)');
        expect(panel.textContent).toContain(iphone.userAgent);

        await user.click(within(tabs!).getByRole("tab", { name: "Python" }));
        expect(panel.textContent).toContain('"goog:chromeOptions"');
        expect(panel.textContent).toContain('"deviceMetrics"');
        expect(panel.textContent).toContain('"userAgent"');
        expect(panel.textContent).toContain(iphone.userAgent);

        await user.click(within(tabs!).getByRole("tab", { name: "Javascript" }));
        expect(panel.textContent).toContain('"goog:chromeOptions"');
        expect(panel.textContent).toContain('"deviceMetrics"');
        expect(panel.textContent).toContain(iphone.userAgent);

        await user.click(screen.getByTestId("capabilities-create-session"));
        await waitFor(() => expect(fetchMock!).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]: [any]) => String(url).includes("/wd/hub/session"));
        const body = JSON.parse(String(sessionCall[1].body));
        const emulation = body.capabilities.alwaysMatch["goog:chromeOptions"].mobileEmulation;
        expect(emulation.deviceMetrics).toEqual({ width: 390, height: 844, pixelRatio: 3 });
        expect(emulation.userAgent).toBe(iphone.userAgent);
        expect(body.desiredCapabilities["goog:chromeOptions"].mobileEmulation).toEqual(emulation);
        expect(body.capabilities.alwaysMatch["selenoid:options"].screenResolution).toBe("390x844x24");
        expect(body.capabilities.alwaysMatch["goog:chromeOptions"].args).toEqual([
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--window-size=390,844",
            "--window-position=0,0",
        ]);
        const urlCall = fetchMock.mock.calls.find(([url]: [any]) =>
            String(url).includes("/wd/hub/session/sess-iphone/url")
        );
        expect(urlCall!).toBeTruthy();
        expect(JSON.parse(String(urlCall[1].body)).url).toContain("data:text/html");

        fetchMock.mockRestore();
    });

    it("puts deviceMetrics + UA on ms:edgeOptions for msedge", async () => {
        const user = userEvent.setup();
        const fetchMock = (vi.spyOn(globalThis, "fetch") as any).mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-edge" } }),
        });
        const pixel = mobileDeviceById("pixel-7")!;

        renderCapabilities();
        await selectBrowser(user, "msedge: 149.0");
        await screen.findByTestId("capabilities-mobile-panel");
        await user.selectOptions(screen.getByRole("combobox", { name: "mobileDevice" }), "pixel-7");
        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock!).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]: [any]) => String(url).includes("/wd/hub/session"));
        const body = JSON.parse(String(sessionCall[1].body));
        expect(body.capabilities.alwaysMatch["ms:edgeOptions"].mobileEmulation.deviceMetrics).toEqual({
            width: 412,
            height: 915,
            pixelRatio: 2.625,
        });
        expect(body.capabilities.alwaysMatch["ms:edgeOptions"].mobileEmulation.userAgent).toBe(pixel.userAgent);
        expect(body.capabilities.alwaysMatch["goog:chromeOptions"]).toBeUndefined();

        const panel = screen.getByTestId("capabilities-terminal-panel");
        const tabs = within(panel!).getByRole("tablist", { name: "Language" });
        await user.click(within(tabs!).getByRole("tab", { name: "Python" }));
        expect(panel.textContent).toContain('"ms:edgeOptions"');
        expect(panel.textContent).toContain(pixel.userAgent);

        fetchMock.mockRestore();
    });
});
