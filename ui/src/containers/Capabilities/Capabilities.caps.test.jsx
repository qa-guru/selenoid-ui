import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Capabilities from "./index";

const BROWSERS = {
    chrome: {
        "149.0": {},
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
                            accessKey=""
                        />
                    }
                />
                <Route path="/sessions/:session" element={<div data-testid="session-route" />} />
            </Routes>
        </MemoryRouter>
    );
}

async function selectChrome(user) {
    await user.click(screen.getByRole("button", { name: "chrome: 149.0" }));
}

function segButton(fieldTestId, value) {
    const field = screen.getByTestId(fieldTestId);
    return within(field)
        .getAllByRole("button")
        .find((btn) => btn.dataset.value === value);
}

describe("Capabilities boolean caps (seg canon)", () => {
    it("hides the caps until a WebDriver browser is selected", () => {
        renderCapabilities();
        expect(screen.queryByTestId("capabilities-caps")).toBeNull();
    });

    it("renders enableVnc/enableVideo/enableHar/enableLog as 2-opt seg radiogroups, never native checkboxes", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);

        const caps = await screen.findByTestId("capabilities-caps");

        // No native checkbox anywhere in the caps block (skill configurator-boolean).
        expect(caps.querySelectorAll("input[type=checkbox]")).toHaveLength(0);
        // Text inputs are allowed for name / remoteUrl / env / labels (PlaqueField), not for booleans.
        expect(caps.querySelectorAll("input[type=text]").length).toBeGreaterThanOrEqual(2);

        for (const testId of ["caps-enable-vnc", "caps-enable-video", "caps-enable-har", "caps-enable-log"]) {
            const field = within(caps).getByTestId(testId);
            expect(within(field).getByRole("radiogroup")).toBeInTheDocument();
            expect(within(field).getByRole("button", { name: "true" })).toBeInTheDocument();
            expect(within(field).getByRole("button", { name: "false" })).toBeInTheDocument();
        }
    });

    it("renders sessionTimeout select, name field, readonly remoteUrl, and screenResolution", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        expect(screen.getByTestId("capabilities-caps-remote-url")).toHaveClass("plaque-field-grid--solo");
        expect(screen.getByTestId("capabilities-caps-auth")).toHaveClass("plaque-field-grid--duo");
        expect(screen.getByTestId("capabilities-caps-session")).toHaveClass("plaque-field-grid--duo");
        expect(screen.getByTestId("capabilities-caps-resolution")).toHaveClass("plaque-field-grid--solo");

        const remoteUrl = screen.getByTestId("caps-remote-url");
        expect(remoteUrl).toHaveAttribute("readonly");
        expect(remoteUrl).toHaveValue("https://selenoid.qa.guru/wd/hub");
        expect(remoteUrl.closest("label")).toHaveAttribute("data-param-id", "remoteUrl");

        const authUser = screen.getByTestId("capabilities-caps-auth-user");
        expect(authUser).toHaveValue("qa_engineer");
        expect(authUser.closest("label")).toHaveAttribute("data-param-id", "authUser");

        const authPass = screen.getByTestId("capabilities-caps-auth-pass");
        expect(authPass).toHaveValue("aAb_-4gs53FD");
        expect(authPass.closest("label")).toHaveAttribute("data-param-id", "authPass");

        expect(screen.getByTestId("caps-session-timeout")).toHaveAttribute("data-param-id", "sessionTimeout");
        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("60m");

        const nameField = screen.getByTestId("caps-session-name");
        expect(nameField).toHaveValue("Manual session");
        expect(nameField.closest("label")).toHaveAttribute("data-param-id", "name");

        expect(screen.getByTestId("caps-screen-resolution")).toHaveAttribute("data-param-id", "screenResolution");
        expect(screen.getByRole("combobox", { name: "screenResolution" })).toHaveValue("1920x1080x24");
    });

    it("wires session options into createSession body", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-1" } }),
        });

        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        await user.selectOptions(screen.getByRole("combobox", { name: "sessionTimeout" }), "15m");
        await user.clear(screen.getByTestId("caps-session-name"));
        await user.type(screen.getByTestId("caps-session-name"), "RTL session");
        await user.selectOptions(screen.getByRole("combobox", { name: "screenResolution" }), "1280x1024x24");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/wd/hub/session"));
        expect(sessionCall).toBeTruthy();
        expect(sessionCall[1].credentials).toBe("omit");
        expect(sessionCall[1].headers.Authorization).toMatch(/^Basic /);
        const body = JSON.parse(sessionCall[1].body);
        expect(body.desiredCapabilities.sessionTimeout).toBe("15m");
        expect(body.desiredCapabilities.name).toBe("RTL session");
        expect(body.desiredCapabilities.screenResolution).toBe("1280x1024x24");
        expect(body.capabilities.alwaysMatch["selenoid:options"].sessionTimeout).toBe("15m");
        expect(body.capabilities.alwaysMatch["selenoid:options"].name).toBe("RTL session");
        expect(body.capabilities.alwaysMatch["selenoid:options"].screenResolution).toBe("1280x1024x24");
        expect(body.capabilities.alwaysMatch["selenoid:options"].timeZone).toBe("UTC");
        expect(body.capabilities.alwaysMatch["selenoid:options"].enableLog).toBe(false);
        expect(body.capabilities.alwaysMatch["selenoid:options"].labels).toEqual({ manual: "true" });
        expect(body.capabilities.alwaysMatch["selenoid:options"].env).toBeUndefined();
        // remoteUrl is display-only — never a hub cap.
        expect(body.desiredCapabilities.remoteUrl).toBeUndefined();
        expect(body.capabilities.alwaysMatch["selenoid:options"].remoteUrl).toBeUndefined();
        // proxy off by default — not present on alwaysMatch / selenoid:options.
        expect(body.capabilities.alwaysMatch.proxy).toBeUndefined();
        expect(body.capabilities.alwaysMatch["selenoid:options"].proxy).toBeUndefined();

        await waitFor(() =>
            expect(fetchMock.mock.calls.some(([url]) => String(url) === "/wd/hub/session/sess-1/window/maximize")).toBe(
                true
            )
        );
        expect(body.capabilities.alwaysMatch["goog:chromeOptions"].args).toEqual([
            "--window-size=1280,1024",
            "--window-position=0,0",
            "--start-maximized",
        ]);

        fetchMock.mockRestore();
    });

    it("wires enableLog, timeZone, env, labels, videoName into selenoid:options", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-opts" } }),
        });

        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        await user.click(segButton("caps-enable-log", "true"));
        await user.selectOptions(screen.getByRole("combobox", { name: "timeZone" }), "Europe/Moscow");
        await user.clear(screen.getByTestId("caps-env"));
        await user.type(screen.getByTestId("caps-env"), "LANG=C,FOO=bar");
        await user.clear(screen.getByTestId("caps-labels"));
        await user.type(screen.getByTestId("caps-labels"), "manual=true,team=qa");
        await user.clear(screen.getByTestId("caps-video-name"));
        await user.type(screen.getByTestId("caps-video-name"), "demo.mp4");
        await user.clear(screen.getByTestId("caps-log-name"));
        await user.type(screen.getByTestId("caps-log-name"), "demo.log");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/wd/hub/session"));
        expect(sessionCall).toBeTruthy();
        const opts = JSON.parse(sessionCall[1].body).capabilities.alwaysMatch["selenoid:options"];
        expect(opts.enableLog).toBe(true);
        expect(opts.timeZone).toBe("Europe/Moscow");
        expect(opts.env).toEqual(["LANG=C", "FOO=bar"]);
        expect(opts.labels).toEqual({ manual: "true", team: "qa" });
        expect(opts.videoName).toBe("demo.mp4");
        expect(opts.logName).toBe("demo.log");
        expect(opts.proxy).toBeUndefined();

        fetchMock.mockRestore();
    });

    it("puts proxy.qaguru.school preset on alwaysMatch.proxy root, not selenoid:options", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ value: { sessionId: "sess-proxy" } }),
        });

        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-browser-panel");

        await user.selectOptions(screen.getByRole("combobox", { name: "proxyPreset" }), "proxy.qaguru.school");
        expect(screen.getByTestId("caps-proxy-server")).toHaveValue("proxy.qaguru.school");
        expect(screen.getByTestId("caps-proxy-port")).toHaveValue("7777");

        await user.click(screen.getByTestId("capabilities-create-session"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const sessionCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/wd/hub/session"));
        expect(sessionCall).toBeTruthy();
        const body = JSON.parse(sessionCall[1].body);
        const expectedProxy = {
            proxyType: "manual",
            socksProxy: "proxy.qaguru.school:7777",
            socksVersion: 5,
        };
        expect(body.capabilities.alwaysMatch.proxy).toEqual(expectedProxy);
        expect(body.desiredCapabilities.proxy).toEqual(expectedProxy);
        expect(body.capabilities.alwaysMatch["selenoid:options"].proxy).toBeUndefined();

        fetchMock.mockRestore();
    });

    it("clears proxyServer and proxyPort when switching from preset to custom", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-browser-panel");

        await user.selectOptions(screen.getByRole("combobox", { name: "proxyPreset" }), "proxy.qaguru.school");
        expect(screen.getByTestId("caps-proxy-server")).toHaveValue("proxy.qaguru.school");
        expect(screen.getByTestId("caps-proxy-port")).toHaveValue("7777");

        await user.selectOptions(screen.getByRole("combobox", { name: "proxyPreset" }), "custom");
        expect(screen.getByTestId("caps-proxy-server")).toHaveValue("");
        expect(screen.getByTestId("caps-proxy-port")).toHaveValue("");
        expect(screen.getByTestId("caps-proxy-server")).not.toHaveAttribute("readonly");
        expect(screen.getByTestId("caps-proxy-port")).not.toHaveAttribute("readonly");
    });

    it("defaults to VNC/Video on and HAR/Log off", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        expect(segButton("caps-enable-vnc", "true")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-video", "true")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-har", "false")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-har", "true")).toHaveAttribute("aria-pressed", "false");
        expect(segButton("caps-enable-log", "false")).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("combobox", { name: "timeZone" })).toHaveValue("UTC");
        expect(screen.getByTestId("caps-labels")).toHaveValue("manual=true");
        expect(screen.getByTestId("caps-env")).toHaveValue("");
        expect(screen.getByTestId("caps-video-name")).toBeInTheDocument();
        expect(screen.queryByTestId("caps-log-name")).toBeNull();
    });

    it("toggles a cap value on click", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        await user.click(segButton("caps-enable-har", "true"));

        expect(segButton("caps-enable-har", "true")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-har", "false")).toHaveAttribute("aria-pressed", "false");
    });
});
