import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { normalizeHashRoute, syncHeaderHashNav } from "./syncHeaderHashNav";

describe("syncHeaderHashNav", () => {
    beforeEach(() => {
        document.body.innerHTML = `
          <nav data-testid="header-nav">
            <a href="#/" data-testid="header-nav-stats">Stats</a>
            <a href="#/capabilities" data-testid="header-nav-capabilities">Capabilities</a>
            <a href="#/videos" data-testid="header-nav-videos">Videos</a>
          </nav>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("normalizes hash routes", () => {
        expect(normalizeHashRoute("#/")).toBe("#/");
        expect(normalizeHashRoute("#/capabilities/")).toBe("#/capabilities");
        expect(normalizeHashRoute("#/videos")).toBe("#/videos");
    });

    it("marks Stats active on root hash", () => {
        window.location.hash = "#/";
        syncHeaderHashNav();

        const stats = document.querySelector('[data-testid="header-nav-stats"]');
        const capabilities = document.querySelector('[data-testid="header-nav-capabilities"]');

        expect(stats).toHaveClass("is-active");
        expect(stats).toHaveAttribute("aria-current", "page");
        expect(capabilities).not.toHaveClass("is-active");
    });

    it("marks Capabilities active on capabilities hash", () => {
        window.location.hash = "#/capabilities";
        syncHeaderHashNav();

        const capabilities = document.querySelector('[data-testid="header-nav-capabilities"]');
        expect(capabilities).toHaveClass("is-active");
        expect(capabilities).toHaveAttribute("aria-current", "page");
    });
});
