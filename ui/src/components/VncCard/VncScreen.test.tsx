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
        expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
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
});
