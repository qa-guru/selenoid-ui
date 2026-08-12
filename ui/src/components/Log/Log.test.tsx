import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const xtermState = { textarea: null as HTMLTextAreaElement | null };

vi.mock("xterm", () => ({
    Terminal: class {
        textarea: HTMLTextAreaElement | undefined;
        loadAddon() {}
        open() {
            this.textarea = document.createElement("textarea");
            xtermState.textarea = this.textarea;
        }
        writeln() {}
        write() {}
        clear() {}
        dispose() {}
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
        expect(panel!).toHaveClass("panel", "panel--terminal", "log-card");
        expect(screen.getByTestId("session-log-title")).toHaveTextContent("Session logs");
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
});
