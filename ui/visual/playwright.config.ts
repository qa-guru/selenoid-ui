import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;
const uiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Visual snapshots of ?mock=1 Live sessions / session pages.
 * Runs against Vite dev (no production build) — early CI gate.
 */
export default defineConfig({
    testDir: ".",
    testMatch: "*.spec.ts",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",
    timeout: 30_000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.02,
            animations: "disabled",
        },
    },
    use: {
        baseURL: BASE,
        viewport: { width: 1280, height: 800 },
        colorScheme: "dark",
        trace: "off",
    },
    webServer: {
        command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
        cwd: uiRoot,
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
        },
    ],
});
