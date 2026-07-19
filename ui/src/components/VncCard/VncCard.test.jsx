import React, { Component } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const lockSpy = vi.fn();

vi.mock("./VncScreen", () => ({
    default: class VncScreenStub extends Component {
        lock = (...args) => lockSpy(...args);

        componentDidMount() {
            if (this.props.onUpdateState) {
                this.props.onUpdateState(this.props.initialConnection || "connected");
            }
        }

        render() {
            return <div data-testid="vnc-screen-stub" />;
        }
    },
}));

import VncCard from "./index";

function renderVnc(props = {}) {
    return render(
        <MemoryRouter>
            <VncCard
                session="sess-123"
                origin="http://localhost"
                browser={{ caps: { enableVNC: true } }}
                onVNCFullscreenChange={vi.fn()}
                {...props}
            />
        </MemoryRouter>
    );
}

describe("VncCard", () => {
    beforeEach(() => {
        lockSpy.mockClear();
    });

    it("renders nothing when VNC is disabled", () => {
        const { container } = renderVnc({
            browser: { caps: { enableVNC: false } },
        });
        expect(container.querySelector(".vnc-card")).toBeNull();
    });

    it("renders icon-btn chrome without dripicons when connected", () => {
        renderVnc();

        expect(screen.getByTestId("vnc-screen-stub")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back" })).toHaveClass("icon-btn", "control_back", "link");
        expect(screen.getByRole("button", { name: "Lock/Unlock Screen" })).toHaveClass("icon-btn", "control_lock");
        expect(screen.getByRole("button", { name: "Fullscreen" })).toHaveClass("icon-btn", "control_fullscreen");
        expect(screen.getByRole("button", { name: "copyFromSelenoid" })).toHaveClass("icon-btn", "control_copy");
        expect(screen.getByRole("button", { name: "pasteToSelenoid" })).toHaveClass("icon-btn", "control_upload");

        expect(document.querySelector("[class*='dripicons']")).toBeNull();
        expect(screen.getByRole("link", { name: "Back" }).querySelector("svg")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Fullscreen" }).querySelector("svg")).toBeTruthy();
    });

    it("toggles fullscreen and notifies parent", async () => {
        const user = userEvent.setup();
        const onVNCFullscreenChange = vi.fn();
        renderVnc({ onVNCFullscreenChange });

        await user.click(screen.getByRole("button", { name: "Fullscreen" }));
        expect(onVNCFullscreenChange).toHaveBeenCalledWith(true);
    });

    it("toggles lock via VncScreen.lock", async () => {
        const user = userEvent.setup();
        renderVnc();

        await user.click(screen.getByRole("button", { name: "Lock/Unlock Screen" }));
        expect(lockSpy).toHaveBeenCalledWith(true);
    });

    it("invokes clipboard fetch on copy control", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({ text: () => Promise.resolve("clip") });
        vi.stubGlobal("fetch", fetchMock);
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn() },
        });

        renderVnc();
        await user.click(screen.getByRole("button", { name: "copyFromSelenoid" }));

        expect(fetchMock).toHaveBeenCalledWith("/clipboard/sess-123", { method: "GET" });
        vi.unstubAllGlobals();
    });
});
