import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const UI_ROOT = resolve(__dirname, "../..");
const SRC = resolve(UI_ROOT, "src");
const INDEX_HTML = resolve(UI_ROOT, "index.html");
const SYNC_SCRIPT = resolve(__dirname, "../../../scripts/sync-design-system-static.sh");
const PUBLIC_CSS = resolve(UI_ROOT, "public/css");

const BARREL = "@zero-design-system/react/styles.css";
const SESSION_CSS = ["window-control.css", "connection-status.css", "vnc-window.css", "har-viewer.css"] as const;
const PLAQUE_IMPORTS = ["plaque-field-seg.css", "plaque-field-seg-layout.css", "plaque-number.css"] as const;

function walkTs(dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            walkTs(path, acc);
        } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\.(tsx?|jsx?)$/.test(entry.name)) {
            acc.push(path);
        }
    }
    return acc;
}

describe("peer /css/* (no react-ui styles.css barrel)", () => {
    it("src/containers has 0 barrel CSS imports", () => {
        const files = walkTs(join(SRC, "containers"));
        expect(files.length).toBeGreaterThan(0);
        for (const file of files) {
            expect(readFileSync(file, "utf8"), file).not.toContain(BARREL);
        }
    });

    it("src components do not import the styles.css barrel", () => {
        const files = walkTs(join(SRC, "components"));
        expect(files.length).toBeGreaterThan(0);
        for (const file of files) {
            expect(readFileSync(file, "utf8"), file).not.toContain(BARREL);
        }
    });

    it("index.html links session CSS and does not reference the barrel", () => {
        const html = readFileSync(INDEX_HTML, "utf8");
        expect(html).not.toMatch(/import\s+['"]@zero-design-system\/react\/styles/);
        expect(html).not.toMatch(/href=["'][^"']*\/styles\.css["']/);
        expect(html).not.toMatch(/href=["'][^"']*page\.css["']/);
        expect(html).toContain('href="/css/plaque-field.css"');
        expect(html).toContain('href="/css/code-highlight.css"');
        expect(html).toContain('href="/src/containers/Viewport/viewport.css"');
        expect(html).toContain('href="/src/components/SessionIdentity/session-identity.css"');
        expect(html).toContain('href="/src/components/Sessions/sessions.css"');
        expect(html).toContain('href="/src/components/SessionArchive/session-archive.css"');
        expect(html).toContain('href="/src/components/Session/session.css"');
        expect(html).toContain('href="/src/components/Log/log.css"');
        expect(html).toContain('href="/src/components/FilterInput/filter-input.css"');
        expect(html).toContain('href="/src/components/Browsers/browsers.css"');
        expect(html).toContain('href="/src/containers/Stats/stats.css"');
        expect(html).toContain('href="/src/containers/Docs/docs.css"');
        expect(html).toContain('href="/src/containers/Benchmarks/benchmarks.css"');
        expect(html).toContain('href="/src/containers/Capabilities/capabilities.css"');
        expect(html).toContain('href="/src/components/Stats/stats-element.css"');
        expect(html).toContain('href="/src/components/VncCard/mock-vnc-desktop.css"');
        const identityAt = html.indexOf('href="/src/components/SessionIdentity/session-identity.css"');
        const sessionsAt = html.indexOf('href="/src/components/Sessions/sessions.css"');
        const archiveAt = html.indexOf('href="/src/components/SessionArchive/session-archive.css"');
        const sessionAt = html.indexOf('href="/src/components/Session/session.css"');
        const logAt = html.indexOf('href="/src/components/Log/log.css"');
        const filterAt = html.indexOf('href="/src/components/FilterInput/filter-input.css"');
        const browsersAt = html.indexOf('href="/src/components/Browsers/browsers.css"');
        const statsAt = html.indexOf('href="/src/containers/Stats/stats.css"');
        const docsAt = html.indexOf('href="/src/containers/Docs/docs.css"');
        const benchmarksAt = html.indexOf('href="/src/containers/Benchmarks/benchmarks.css"');
        const capabilitiesAt = html.indexOf('href="/src/containers/Capabilities/capabilities.css"');
        const statsElementAt = html.indexOf('href="/src/components/Stats/stats-element.css"');
        const mockVncAt = html.indexOf('href="/src/components/VncCard/mock-vnc-desktop.css"');
        const headerAt = html.indexOf('href="/css/header.css"');
        expect(identityAt).toBeGreaterThan(-1);
        expect(sessionsAt).toBeGreaterThan(-1);
        expect(archiveAt).toBeGreaterThan(-1);
        expect(sessionAt).toBeGreaterThan(-1);
        expect(logAt).toBeGreaterThan(-1);
        expect(filterAt).toBeGreaterThan(-1);
        expect(browsersAt).toBeGreaterThan(-1);
        expect(statsAt).toBeGreaterThan(-1);
        expect(docsAt).toBeGreaterThan(-1);
        expect(benchmarksAt).toBeGreaterThan(-1);
        expect(capabilitiesAt).toBeGreaterThan(-1);
        expect(statsElementAt).toBeGreaterThan(-1);
        expect(mockVncAt).toBeGreaterThan(-1);
        expect(identityAt).toBeLessThan(headerAt);
        expect(sessionsAt).toBeLessThan(headerAt);
        expect(archiveAt).toBeLessThan(headerAt);
        expect(sessionAt).toBeLessThan(headerAt);
        expect(logAt).toBeLessThan(filterAt);
        expect(filterAt).toBeLessThan(browsersAt);
        expect(browsersAt).toBeLessThan(statsAt);
        expect(statsAt).toBeLessThan(docsAt);
        expect(docsAt).toBeLessThan(benchmarksAt);
        expect(benchmarksAt).toBeLessThan(capabilitiesAt);
        expect(capabilitiesAt).toBeLessThan(statsElementAt);
        expect(statsElementAt).toBeLessThan(mockVncAt);
        expect(mockVncAt).toBeLessThan(headerAt);
        for (const file of SESSION_CSS) {
            expect(html).toContain(`href="/css/${file}"`);
        }
        expect(html).toMatch(/href="\/css\/header\.css"\s*\/>\s*<\/head>/);
    });

    it("FOUC shell uses tokens, not hex, after tokens.css", () => {
        const html = readFileSync(INDEX_HTML, "utf8");
        const tokensAt = html.indexOf('href="/css/tokens.css"');
        const styleAt = html.indexOf("<style>");
        expect(tokensAt).toBeGreaterThan(-1);
        expect(styleAt).toBeGreaterThan(tokensAt);
        const fouc = html.match(/<style>([\s\S]*?)<\/style>/);
        expect(fouc?.[1]).toContain("var(--color-surface)");
        expect(fouc?.[1]).toContain("var(--color-text)");
        expect(fouc?.[1]).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    });

    it("src has 0 createGlobalStyle", () => {
        const files = walkTs(SRC);
        expect(files.length).toBeGreaterThan(0);
        for (const file of files) {
            expect(readFileSync(file, "utf8"), file).not.toContain("createGlobalStyle");
        }
    });

    it("Viewport shell CSS has no :root and replaces styles.css.ts", () => {
        const dir = join(SRC, "containers/Viewport");
        const css = readFileSync(join(dir, "viewport.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "styles.css.ts"))).toBe(false);
    });

    it("Sessions list CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "components/Sessions");
        const css = readFileSync(join(dir, "sessions.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledSessions/);
    });

    it("SessionIdentity peer CSS has no :root", () => {
        const css = readFileSync(join(SRC, "components/SessionIdentity/session-identity.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(SRC, "components/SessionIdentity/style.ts"))).toBe(false);
    });

    it("SessionArchive list CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "components/SessionArchive");
        const css = readFileSync(join(dir, "session-archive.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledArchive/);
    });

    it("Session page CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "components/Session");
        const css = readFileSync(join(dir, "session.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).not.toMatch(/sessionIdentityCss/);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledSession/);
        expect(readFileSync(join(dir, "SessionVideo.tsx"), "utf8")).not.toMatch(/styled-components|StyledSession/);
    });

    it("Log host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "components/Log");
        const css = readFileSync(join(dir, "log.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledLog/);
        expect(readFileSync(join(SRC, "components/Session/SessionLogFile.tsx"), "utf8")).not.toMatch(
            /styled-components|StyledLog/
        );
    });

    it("FilterInput host CSS has no :root and replaces styled shell", () => {
        const dir = join(SRC, "components/FilterInput");
        const css = readFileSync(join(dir, "filter-input.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledPanelFilter/);
    });

    it("Browsers host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "components/Browsers");
        const css = readFileSync(join(dir, "browsers.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledBrowsers/);
        expect(readFileSync(join(SRC, "components/PoolSlots/index.tsx"), "utf8")).not.toMatch(
            /styled-components|StyledBrowsers/
        );
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
    });

    it("Stats host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "containers/Stats");
        const css = readFileSync(join(dir, "stats.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "index.tsx"), "utf8")).not.toMatch(/styled-components|StyledStats/);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
    });

    it("Docs host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "containers/Docs");
        const css = readFileSync(join(dir, "docs.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.docs\s+h1\s*\{/);
        expect(css.split("\n").some((line) => /^\s*h1\s*\{/.test(line))).toBe(false);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        for (const name of readdirSync(dir)) {
            if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
                expect(readFileSync(join(dir, name), "utf8"), name).not.toMatch(/styled-components|StyledDocs/);
            }
        }
    });

    it("Benchmarks host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "containers/Benchmarks");
        const css = readFileSync(join(dir, "benchmarks.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.benchmarks\s+h1\s*\{/);
        expect(css.split("\n").some((line) => /^\s*h1\s*\{/.test(line))).toBe(false);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        for (const name of readdirSync(dir)) {
            if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
                expect(readFileSync(join(dir, name), "utf8"), name).not.toMatch(/styled-components|StyledBenchmarks/);
            }
        }
    });

    it("Capabilities host CSS has no :root and replaces style.css.ts", () => {
        const dir = join(SRC, "containers/Capabilities");
        const css = readFileSync(join(dir, "capabilities.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.capabilities\s+\.setup\s*\{/);
        expect(css.split("\n").some((line) => /^\s*\.setup\s*\{/.test(line))).toBe(false);
        expect(css).toMatch(/html\.theme-light\s+\.capabilities/);
        expect(css).not.toMatch(/html\.theme-light\s+&/);
        expect(existsSync(join(dir, "style.css.ts"))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        for (const name of readdirSync(dir)) {
            if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
                expect(readFileSync(join(dir, name), "utf8"), name).not.toMatch(/styled-components|StyledCapabilities/);
            }
        }
    });

    it("header Stats widgets CSS has no :root and replaces styled shells", () => {
        const dir = join(SRC, "components/Stats");
        const css = readFileSync(join(dir, "stats-element.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.stats-element\s*\{/);
        expect(css).toMatch(/\.stats-quota\s*\{/);
        expect(css).toMatch(/\.stats-queue\s*\{/);
        expect(css).toMatch(/\.stats-used\s*\{/);
        expect(css).toMatch(/\.stats-separator\s*\{/);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        for (const name of readdirSync(dir)) {
            if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) {
                expect(readFileSync(join(dir, name), "utf8"), name).not.toMatch(/styled-components|StyledQuota|StyledQueue/);
            }
        }
    });

    it("MockVncDesktop CSS has no :root and replaces styled shell", () => {
        const dir = join(SRC, "components/VncCard");
        const css = readFileSync(join(dir, "mock-vnc-desktop.css"), "utf8");
        expect(css).not.toMatch(/(?:^|})\s*:root\b/m);
        expect(css).toMatch(/\.vnc-mock-desktop\s*\{/);
        expect(css).toMatch(/\.vnc-mock-desktop\s+h1\s*\{/);
        expect(css.split("\n").some((line) => /^\s*h1\s*\{/.test(line))).toBe(false);
        expect(readdirSync(dir).some((name) => name.endsWith(".css.ts"))).toBe(false);
        expect(readFileSync(join(dir, "MockVncDesktop.tsx"), "utf8")).not.toMatch(
            /styled-components|StyledMockDesktop/
        );
    });

    it("src has 0 styled-components imports", () => {
        const files = walkTs(SRC);
        expect(files.length).toBeGreaterThan(0);
        for (const file of files) {
            expect(readFileSync(file, "utf8"), file).not.toMatch(
                /from\s+['"]styled-components['"]|require\(['"]styled-components['"]\)/
            );
        }
        expect(readFileSync(join(UI_ROOT, "package.json"), "utf8")).not.toMatch(/"styled-components"/);
    });

    it("sync script copies session CSS and plaque-field @import deps", () => {
        const sync = readFileSync(SYNC_SCRIPT, "utf8");
        expect(sync).toContain("window-control");
        expect(sync).toContain("connection-status");
        expect(sync).toContain("vnc-window");
        expect(sync).toContain("har-viewer");
        expect(sync).toContain("plaque-field-seg-layout");
        expect(sync).toContain("plaque-number");
        expect(sync).toContain("code-highlight");
        for (const file of [...SESSION_CSS, "plaque-field.css", "code-highlight.css", ...PLAQUE_IMPORTS]) {
            expect(existsSync(join(PUBLIC_CSS, file)), file).toBe(true);
        }
    });
});
