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
        expect(container.querySelector(".vnc-window")).toBeNull();
    });

    it("renders the design-system VncWindow chrome when connected", () => {
        const { container } = renderVnc();

        expect(screen.getByTestId("vnc-screen-stub")).toBeInTheDocument();
        expect(container.querySelector(".vnc-window--connected")).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "Back" })).toHaveClass("window-control", "window-control--danger");
        expect(screen.getByRole("button", { name: "Unlock screen" })).toHaveClass(
            "window-control",
            "window-control--info"
        );
        expect(screen.getByRole("button", { name: "Enter fullscreen" })).toHaveClass(
            "window-control",
            "window-control--success"
        );
        expect(screen.getByRole("button", { name: "Copy from Selenoid" })).toHaveClass("window-control");
        expect(screen.getByRole("button", { name: "Paste to Selenoid" })).toHaveClass("window-control");

        expect(document.querySelector("[class*='dripicons']")).toBeNull();
        expect(screen.getByRole("link", { name: "Back" }).querySelector("svg")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Enter fullscreen" }).querySelector("svg")).toBeTruthy();
    });

    it("passes screenResolution as --vnc-aspect on VncWindow", () => {
        renderVnc({
            browser: { caps: { enableVNC: true, screenResolution: "1280x1024x24" } },
        });
        expect(screen.getByTestId("vnc-window")).toHaveStyle({ "--vnc-aspect": "1280 / 1024" });
    });

    it("toggles fullscreen and notifies parent", async () => {
        const user = userEvent.setup();
        const onVNCFullscreenChange = vi.fn();
        renderVnc({ onVNCFullscreenChange });

        await user.click(screen.getByRole("button", { name: "Enter fullscreen" }));
        expect(onVNCFullscreenChange).toHaveBeenCalledWith(true);
        expect(screen.getByRole("button", { name: "Exit fullscreen" })).toBeInTheDocument();
    });

    it("toggles lock via VncScreen.lock", async () => {
        const user = userEvent.setup();
        renderVnc();

        await user.click(screen.getByRole("button", { name: "Unlock screen" }));
        expect(lockSpy).toHaveBeenCalledWith(true);
        expect(screen.getByRole("button", { name: "Lock screen" })).toBeInTheDocument();
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
        await user.click(screen.getByRole("button", { name: "Copy from Selenoid" }));

        expect(fetchMock).toHaveBeenCalledWith("/clipboard/sess-123", { method: "GET" });
        vi.unstubAllGlobals();
    });
});
