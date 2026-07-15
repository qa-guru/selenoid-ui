import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression: selenoid-header-bridge imports header.js from <head> before React
 * mounts #app-header. A top-level throw poisons the ES module cache and kills
 * Stats / Capabilities / Videos nav for the whole session.
 */
describe("header.js early load (no #app-header yet)", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        vi.resetModules();
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.unstubAllGlobals();
    });

    it("exports remountHeader without throwing when mount is missing", async () => {
        expect(document.getElementById("app-header")).toBeNull();

        const mod = await import("../../public/js/header.js");
        expect(typeof mod.remountHeader).toBe("function");
        expect(window.__designSystemRemountHeader).toBe(mod.remountHeader);
        await expect(mod.remountHeader()).resolves.toBeUndefined();
    });

    it("mounts nav links after #app-header appears", async () => {
        const template = readFileSync(resolve(__dirname, "../../public/templates/header.html"), "utf8");
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                text: async () => template,
            }))
        );

        const mod = await import("../../public/js/header.js");

        const mount = document.createElement("div");
        mount.id = "app-header";
        document.body.appendChild(mount);

        window.headerConfig = {
            brand: { href: "#/", label: "Selenoid UI" },
            nav: [
                { href: "#/", label: "Stats", testid: "header-nav-stats" },
                { href: "#/capabilities", label: "Capabilities", testid: "header-nav-capabilities" },
                { href: "#/videos", label: "Videos", testid: "header-nav-videos" },
            ],
            lang: { default: "en" },
            theme: { default: "dark" },
        };

        await mod.remountHeader();

        expect(document.querySelector('[data-testid="header-nav-stats"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="header-nav-capabilities"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="header-nav-videos"]')).toBeTruthy();
    });
});
