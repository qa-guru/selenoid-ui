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
                            playwrightAccessKey=""
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

    it("renders enableVnc/enableVideo/enableHar as 2-opt seg radiogroups, never native checkboxes", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);

        const caps = await screen.findByTestId("capabilities-caps");

        // No native checkbox anywhere in the caps block (skill configurator-boolean).
        expect(caps.querySelectorAll("input[type=checkbox]")).toHaveLength(0);
        // Text inputs are allowed for name / remoteUrl (PlaqueField), not for booleans.
        expect(caps.querySelectorAll("input[type=text]").length).toBeGreaterThanOrEqual(2);

        for (const testId of ["caps-enable-vnc", "caps-enable-video", "caps-enable-har"]) {
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
        expect(screen.getByTestId("capabilities-caps-session")).toHaveClass("plaque-field-grid--duo");
        expect(screen.getByTestId("capabilities-caps-resolution")).toHaveClass("plaque-field-grid--solo");

        const remoteUrl = screen.getByTestId("caps-remote-url");
        expect(remoteUrl).toHaveAttribute("readonly");
        expect(remoteUrl).toHaveValue("https://selenoid.qa.guru/wd/hub");
        expect(remoteUrl.closest("label")).toHaveAttribute("data-param-id", "remoteUrl");

        expect(screen.getByTestId("caps-session-timeout")).toHaveAttribute("data-param-id", "sessionTimeout");
        expect(screen.getByRole("combobox", { name: "sessionTimeout" })).toHaveValue("60m");

        const nameField = screen.getByTestId("caps-session-name");
        expect(nameField).toHaveValue("Manual session");
        expect(nameField.closest("label")).toHaveAttribute("data-param-id", "name");

        expect(screen.getByTestId("caps-screen-resolution")).toHaveAttribute("data-param-id", "screenResolution");
        expect(screen.getByRole("combobox", { name: "screenResolution" })).toHaveValue("1920x1080x24");
    });

    it("wires session options into createSession body (more-caps can still override)", async () => {
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
        const body = JSON.parse(sessionCall[1].body);
        expect(body.desiredCapabilities.sessionTimeout).toBe("15m");
        expect(body.desiredCapabilities.name).toBe("RTL session");
        expect(body.desiredCapabilities.screenResolution).toBe("1280x1024x24");
        expect(body.capabilities.alwaysMatch["selenoid:options"].sessionTimeout).toBe("15m");
        expect(body.capabilities.alwaysMatch["selenoid:options"].name).toBe("RTL session");
        expect(body.capabilities.alwaysMatch["selenoid:options"].screenResolution).toBe("1280x1024x24");
        // remoteUrl is display-only — never a hub cap.
        expect(body.desiredCapabilities.remoteUrl).toBeUndefined();
        expect(body.capabilities.alwaysMatch["selenoid:options"].remoteUrl).toBeUndefined();

        fetchMock.mockRestore();
    });

    it("defaults to VNC/Video on and HAR off", async () => {
        const user = userEvent.setup();
        renderCapabilities();
        await selectChrome(user);
        await screen.findByTestId("capabilities-caps");

        expect(segButton("caps-enable-vnc", "true")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-video", "true")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-har", "false")).toHaveAttribute("aria-pressed", "true");
        expect(segButton("caps-enable-har", "true")).toHaveAttribute("aria-pressed", "false");
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
