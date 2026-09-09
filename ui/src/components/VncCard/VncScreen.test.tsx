import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const { rfbCtor, rfbDisconnect, scaleViewportSet, resizeSessionSet, rfbListeners } = vi.hoisted(() => ({
    rfbCtor: vi.fn(),
    rfbDisconnect: vi.fn(),
    scaleViewportSet: vi.fn(),
    resizeSessionSet: vi.fn(),
    rfbListeners: {} as Record<string, (...args: any[]) => void>,
}));

vi.mock("@novnc/novnc/lib/rfb.js", () => ({
    default: class {
        viewOnly = true;
        clipViewport = false;
        _screen = { style: { overflow: "auto" } };
        _scaleViewport = false;
        _resizeSession = false;
        constructor(...args: any[]) {
            rfbCtor(...args);
        }
        get scaleViewport() {
            return this._scaleViewport;
        }
        set scaleViewport(value: boolean) {
            this._scaleViewport = value;
            scaleViewportSet(value);
        }
        get resizeSession() {
            return this._resizeSession;
        }
        set resizeSession(value: boolean) {
            this._resizeSession = value;
            resizeSessionSet(value);
        }
        addEventListener(type: string, cb: (...args: any[]) => void) {
            rfbListeners[type] = cb;
        }
        removeEventListener(type: string) {
            delete rfbListeners[type];
        }
        disconnect() {
            rfbDisconnect();
        }
    },
}));

import VncScreen from "./VncScreen";

describe("VncScreen mock preview", () => {
    beforeEach(() => {
        rfbCtor.mockClear();
        rfbDisconnect.mockClear();
        scaleViewportSet.mockClear();
        resizeSessionSet.mockClear();
        for (const key of Object.keys(rfbListeners)) {
            delete rfbListeners[key];
        }
    });
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

    it("does not disconnect an RFB that already closed", () => {
        rfbDisconnect.mockClear();
        const onUpdateState = vi.fn();
        const { unmount } = render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={{ caps: { browserName: "chrome", version: "152.0", enableVNC: true } }}
                onUpdateState={onUpdateState}
            />
        );

        expect(rfbCtor).toHaveBeenCalled();
        rfbListeners.disconnect?.();
        unmount();
        expect(rfbDisconnect).not.toHaveBeenCalled();
    });

    it("marks connected when RFB fires connect", () => {
        const onUpdateState = vi.fn();
        render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={{ caps: { browserName: "chrome", version: "152.0", enableVNC: true } }}
                onUpdateState={onUpdateState}
            />
        );
        rfbListeners.connect?.();
        expect(onUpdateState).toHaveBeenCalledWith("connected");
    });

    it("applyScale is a no-op without an RFB and skips overflow when _screen is missing", () => {
        expect(() => VncScreen.applyScale(null)).not.toThrow();
        expect(() => VncScreen.applyScale(undefined)).not.toThrow();
        const stub: any = {};
        VncScreen.applyScale(stub);
        expect(stub.scaleViewport).toBe(true);
        expect(stub.resizeSession).toBe(false);
        expect(stub.clipViewport).toBe(false);
    });

    it("scales the viewport locally and never requests a remote desktop resize", () => {
        const ref = createRef<any>();
        render(
            <VncScreen
                ref={ref}
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={{ caps: { browserName: "chrome", version: "152.0", enableVNC: true } }}
                onUpdateState={vi.fn()}
            />
        );
        expect(ref.current.rfb.scaleViewport).toBe(true);
        expect(ref.current.rfb.resizeSession).toBe(false);
        expect(ref.current.rfb._screen.style.overflow).toBe("hidden");
        expect(resizeSessionSet).toHaveBeenCalledWith(false);
        expect(resizeSessionSet).not.toHaveBeenCalledWith(true);
    });

    it("does not re-apply scaleViewport when the parent re-renders", () => {
        const browser = { caps: { browserName: "chrome", version: "152.0", enableVNC: true } };
        const { rerender } = render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={browser}
                onUpdateState={vi.fn()}
            />
        );
        const afterMount = scaleViewportSet.mock.calls.length;
        expect(afterMount).toBeGreaterThan(0);

        rerender(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={{ ...browser }}
                onUpdateState={vi.fn()}
            />
        );
        expect(scaleViewportSet.mock.calls.length).toBe(afterMount);
        expect(rfbCtor).toHaveBeenCalledTimes(1);
    });

    it("reports disconnected for a stub mock preview (VNC off)", () => {
        const onUpdateState = vi.fn();
        render(
            <VncScreen
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled
                browser={{ caps: { browserName: "chrome", version: "152.0", enableVNC: false } }}
                onUpdateState={onUpdateState}
            />
        );
        expect(onUpdateState).toHaveBeenCalledWith("disconnected");
        expect(rfbCtor).not.toHaveBeenCalled();
    });

    it("lock toggles RFB viewOnly", () => {
        const ref = createRef<any>();
        render(
            <VncScreen
                ref={ref}
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled={false}
                browser={{ caps: { browserName: "chrome", version: "152.0", enableVNC: true } }}
                onUpdateState={vi.fn()}
            />
        );
        ref.current.lock(true);
        expect(ref.current.rfb.viewOnly).toBe(false);
        ref.current.lock(false);
        expect(ref.current.rfb.viewOnly).toBe(true);
    });
});
