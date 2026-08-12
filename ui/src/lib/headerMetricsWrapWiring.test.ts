import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const PUBLIC_JS = resolve(__dirname, "../../public/js");
const HEADER_JS = resolve(PUBLIC_JS, "header.js");
const HEADER_CSS = resolve(__dirname, "../../public/css/header.css");
const METRICS_WRAP_JS = resolve(PUBLIC_JS, "header-metrics-wrap.js");
const SYNC_SCRIPT = resolve(__dirname, "../../../scripts/sync-design-system-static.sh");

/**
 * Guard against CSS/JS drift: metrics adaptive (nav-fold + wrap) requires
 * header-metrics-wrap.js + observeHeaderMetricsWrap() in the synced header.js.
 * Regression: consumer fork without observe left wrap CSS dead on :8080.
 */
describe("header metrics-wrap wiring (synced from design-system)", () => {
    it("ships header-metrics-wrap.js next to header.js", () => {
        expect(existsSync(METRICS_WRAP_JS)).toBe(true);
        const src = readFileSync(METRICS_WRAP_JS, "utf8");
        expect(src).toContain("header--metrics-wrap");
        expect(src).toContain("export function observeHeaderMetricsWrap");
    });

    it("header.js imports and calls observeHeaderMetricsWrap", () => {
        const src = readFileSync(HEADER_JS, "utf8");
        expect(src).toMatch(/from\s+['"]\.\/header-metrics-wrap\.js['"]/);
        expect(src).toContain("observeHeaderMetricsWrap(headerEl)");
        expect(src).toContain("function getMount(");
        expect(src).toContain("__designSystemRemountHeader");
    });

    it("sync script copies header.js + header-metrics-wrap and asserts wiring", () => {
        const sync = readFileSync(SYNC_SCRIPT, "utf8");
        expect(sync).toMatch(/\bheader\b.*\bheader-metrics-wrap\b|\bheader-metrics-wrap\b.*\bheader\b/);
        expect(sync).toContain("observeHeaderMetricsWrap");
        expect(sync).toContain('cp "$DS/js/${f}.js"');
    });

    it("hides .header__burger with specificity above .icon-btn", () => {
        // Vite injects @zero-design-system/react/styles.css after <link href="/css/header.css">.
        // `.header__burger { display: none }` (0,1,0) loses to `.icon-btn { display: inline-flex }`.
        const css = readFileSync(HEADER_CSS, "utf8");
        expect(css).toMatch(/\.header\s+\.header__burger\s*\{[^}]*display:\s*none/);
    });
});
