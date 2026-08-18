import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const rfbCtor = vi.fn();

vi.mock("@novnc/novnc/lib/rfb.js", () => ({
    default: class {
        constructor(...args: any[]) {
            rfbCtor(...args);
        }
        addEventListener() {}
        removeEventListener() {}
        disconnect() {}
    },
}));

import VncScreen from "./VncScreen";

describe("VncScreen mock preview", () => {
    it("renders a fake desktop and reports connected for mockmax", () => {
        const onUpdateState = vi.fn();
        rfbCtor.mockClear();
        render(
            <VncScreen
                session="mockmax-aaaaaaaaaaaaaaaaaaaaaaa"
                origin="http://localhost"
                browser={{ caps: { browserName: "chrome", version: "149.0" } }}
                onUpdateState={onUpdateState}
            />
        );

        expect(screen.getByTestId("mock-vnc-desktop")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Login Form" })).toBeInTheDocument();
        expect(onUpdateState).toHaveBeenCalledWith("connected");
        expect(rfbCtor).not.toHaveBeenCalled();
    });

    it("stays connecting without RFB for the starting freeze mock", () => {
        const onUpdateState = vi.fn();
        rfbCtor.mockClear();
        render(
            <VncScreen
                session="mockfrz-aaaaaaaaaaaaaaaaaaaaaaa"
                origin="http://localhost"
                onUpdateState={onUpdateState}
            />
        );

        expect(screen.queryByTestId("mock-vnc-desktop")).toBeNull();
        expect(onUpdateState).toHaveBeenCalledWith("connecting");
        expect(rfbCtor).not.toHaveBeenCalled();
    });

    it("renders a fake desktop from a hub session's caps when mock is on", () => {
        const onUpdateState = vi.fn();
        rfbCtor.mockClear();
        render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled
                browser={{ caps: { browserName: "firefox", version: "150.0", enableVNC: true } }}
                onUpdateState={onUpdateState}
            />
        );

        expect(screen.getByTestId("mock-vnc-desktop")).toBeInTheDocument();
        expect(screen.getByLabelText("Mock VNC desktop (firefox 150.0)")).toBeInTheDocument();
        expect(onUpdateState).toHaveBeenCalledWith("connected");
        expect(rfbCtor).not.toHaveBeenCalled();
    });

    it("opens RFB for a hub session while mock is off, then swaps to mock on rerender", () => {
        const onUpdateState = vi.fn();
        rfbCtor.mockClear();
        const browser = { caps: { browserName: "firefox", version: "150.0", enableVNC: true } };
        const { rerender } = render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={browser}
                onUpdateState={onUpdateState}
            />
        );

        expect(screen.queryByTestId("mock-vnc-desktop")).toBeNull();
        expect(rfbCtor).toHaveBeenCalledTimes(1);

        rerender(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled
                browser={browser}
                onUpdateState={onUpdateState}
            />
        );

        expect(screen.getByTestId("mock-vnc-desktop")).toBeInTheDocument();
        expect(onUpdateState).toHaveBeenCalledWith("connected");
        expect(rfbCtor).toHaveBeenCalledTimes(1);
    });
});
