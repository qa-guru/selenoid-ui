import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const xtermState = { textarea: null as HTMLTextAreaElement | null, resizeCalls: 0 };

vi.mock("xterm", () => ({
    Terminal: class {
        textarea: HTMLTextAreaElement | undefined;
        rows = 24;
        cols = 80;
        element: HTMLDivElement | undefined;
        buffer = { active: { length: 0, baseY: 0, cursorY: 0, viewportY: 0 } };
        loadAddon() {}
        open() {
            this.textarea = document.createElement("textarea");
            this.element = document.createElement("div");
            xtermState.textarea = this.textarea;
        }
        writeln() {}
        write(_data: unknown, callback?: () => void) {
            callback?.();
        }
        clear() {}
        dispose() {}
        resize() {
            xtermState.resizeCalls += 1;
        }
        scrollToTop() {}
    },
}));

vi.mock("xterm-addon-fit", () => ({
    FitAddon: class {
        fit() {}
    },
}));

vi.mock("xterm/css/xterm.css", () => ({}));

import Log from "./index";

describe("Log chrome → Panel terminal", () => {
    it("wraps the term host in panel--terminal", () => {
        const { container } = render(<Log />);

        const panel = screen.getByTestId("session-log-panel");
        expect(panel!).toHaveClass("panel", "panel--terminal", "panel--bar-chrome", "log-card");
        expect(screen.getByTestId("session-log-title")).toHaveTextContent("Session logs");
        expect(screen.queryByTestId("session-log-download")).toBeNull();
        expect(panel.querySelector(".log-card__body .term")).toBeTruthy();
        expect(container.querySelector(".log-card__content")).toBeNull();
    });

    it("keeps hidden-true for Session fullscreen interaction", () => {
        const { container } = render(<Log hidden />);

        expect(container.firstChild).toHaveClass("hidden-true");
        expect(screen.getByTestId("session-log-panel")).toBeInTheDocument();
    });

    it("decorates xterm helper textarea for DevTools form hints", () => {
        render(<Log />);

        const textarea = xtermState.textarea;
        expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
        expect(textarea!.id).toBe("session-log-input");
        expect(textarea!.name).toBe("session-log");
        expect(textarea!.getAttribute("autocomplete")).toBe("off");
    });

    it("does not open WebSocket for an active mock session", () => {
        const ws = vi.fn();
        vi.stubGlobal("WebSocket", ws);
        render(
            <Log
                session="mockmax-aaaaaaaaaaaaaaaaaaaaaaa"
                origin="http://localhost"
                browser={{ caps: { enableLog: true } }}
            />
        );
        expect(ws).not.toHaveBeenCalled();
        expect(screen.getByTestId("session-log-download")).toHaveClass("icon-btn", "panel__action");
        vi.unstubAllGlobals();
    });

    it("does not resize xterm for each mock live log line", () => {
        xtermState.resizeCalls = 0;
        render(
            <Log
                session="mockmax-aaaaaaaaaaaaaaaaaaaaaaa"
                origin="http://localhost"
                browser={{ caps: { enableLog: true } }}
            />
        );
        // Default viewport is 24 rows; the mock dump is shorter. Hug-to-content
        // must not rebuild the screen on every writeln (that flashes the buffer).
        expect(xtermState.resizeCalls).toBe(0);
    });

    it("does not open WebSocket for a hub session when mock is on", () => {
        const ws = vi.fn();
        vi.stubGlobal("WebSocket", ws);
        render(
            <Log
                session="hub-sess-1"
                origin="http://localhost"
                mockEnabled
                browser={{ caps: { browserName: "firefox", version: "150.0", enableLog: true } }}
            />
        );
        expect(ws).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });
});
