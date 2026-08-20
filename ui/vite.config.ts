/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

// Live / streaming endpoints must stay online-only: never precache, never answer
// with the SPA navigateFallback. HashRouter keeps client routes under `/#/…`, so
// manifest start_url/scope stay `/` (document URL is `/`).
const LIVE_NAV_DENYLIST = [
    /^\/events/,
    /^\/status/,
    /^\/ui\/status/,
    /^\/video/,
    /^\/har/,
    /^\/sessions/,
    /^\/clipboard/,
    /^\/wd\/hub/,
    /^\/playwright/,
    /^\/ws/,
    /^\/vnc/,
    /^\/log/,
];

function devSwNotHtml() {
    return {
        name: "dev-sw-not-html",
        configureServer(server: { middlewares: { use: (fn: any) => void } }) {
            server.middlewares.use((req: { url?: string }, res: any, next: () => void) => {
                const path = (req.url || "").split("?")[0];
                if (path !== "/sw.js") {
                    next();
                    return;
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                res.setHeader("Cache-Control", "no-store");
                res.end("/* no service worker in Vite dev */");
            });
        },
    };
}

export default defineConfig({
    // Plugin types diverge when vitest nests a different vite major than the app.
    plugins: [
        // Vite SPA fallback would otherwise serve index.html as /sw.js (text/html) —
        // DevTools MIME warning and a stale SW can leave localhost as a blank page.
        devSwNotHtml(),
        react(),
        // PWA baseline (canon: Multistack / stacks java-spring frontend-react):
        // emit manifest.webmanifest + sw.js next to the Vite `build/` shell.
        // Precache app shell only; live API/SSE/video/ws denylisted; no push,
        // no offline session API. Registration owned by src/pwa/registerServiceWorker.ts.
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: null,
            manifest: {
                name: "Selenoid UI",
                short_name: "Selenoid",
                description: "Selenoid UI — browser session dashboard",
                start_url: "/",
                scope: "/",
                display: "standalone",
                theme_color: "#151414",
                background_color: "#151414",
                icons: [
                    { src: "icons/pwa-192.png", sizes: "192x192", type: "image/png" },
                    { src: "icons/pwa-512.png", sizes: "512x512", type: "image/png" },
                    {
                        src: "icons/pwa-maskable-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                // Vite default hashed assets under build/assets/; also peer DS
                // css/js copied from public/ (header shell).
                globPatterns: [
                    "index.html",
                    "assets/**/*.{js,css}",
                    "manifest.webmanifest",
                    "icons/pwa-192.png",
                    "icons/pwa-512.png",
                    "icons/pwa-maskable-512.png",
                    "css/**/*.css",
                    "js/**/*.js",
                    "favicon.ico",
                ],
                navigateFallback: "index.html",
                navigateFallbackDenylist: LIVE_NAV_DENYLIST,
                cleanupOutdatedCaches: true,
            },
            devOptions: {
                enabled: false,
            },
        }),
    ] as any,
    // Include .ts/.tsx so esbuild strips types in dev; loader tsx keeps JSX-in-JS.
    // Narrow include to .jsx? alone left `as` / annotations in served .ts modules.
    esbuild: {
        loader: "tsx",
        include: /src\/.*\.[jt]sx?$/,
        exclude: [],
    },
    build: {
        outDir: "build",
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        proxy: {
            "/events": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/clipboard": {
                target: "http://selenoid:4444",
                changeOrigin: true,
            },
            "/status": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/ui/status": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/video": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            // Finished-session artifact listings/downloads (logs, HAR) and the
            // session-centric grouping endpoint. Declared before "/log" so the
            // "/logs" file API is not swallowed by the "/log" ws stream prefix.
            "/logs": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/har": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/sessions": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/wd/hub": {
                target: "http://localhost:8090",
                changeOrigin: true,
            },
            "/playwright": {
                target: "http://localhost:8090",
                ws: true,
                changeOrigin: true,
            },
            "/ws": {
                target: "http://localhost:8090",
                ws: true,
                changeOrigin: true,
            },
            "/vnc": {
                target: "http://localhost:3000",
                ws: true,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/vnc/, ""),
            },
            "/log": {
                target: "http://localhost:3000",
                ws: true,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/log/, ""),
            },
        },
    },
    optimizeDeps: {
        include: ["@novnc/novnc/lib/rfb.js"],
        // file: vendor — pick up sync-design-system-static.sh dist without a stale prebundle
        exclude: ["@zero-design-system/react"],
        esbuildOptions: {
            loader: {
                ".js": "jsx",
            },
        },
    },
    test: {
        env: {
            VITE_HUB_AUTH_USER: "test_user",
            VITE_HUB_AUTH_PASS: "test_pass",
            VITE_HUB_ACCESS_KEY: "test_user:test_pass",
        },
        environment: "jsdom",
        css: true,
        globals: true,
        include: ["src/**/*.test.{ts,tsx,js,jsx}"],
        setupFiles: ["./src/test/setup.ts", "allure-vitest/setup"],
        // Stub only under Vitest. A global resolve.alias to novncStub.ts was baked into
        // production (v2.3.0 Vite cut) and left the UI stuck on "VNC CONNECTING".
        alias: {
            "@novnc/novnc/lib/rfb.js": resolve(__dirname, "src/test/novncStub.ts"),
            "@novnc/novnc": resolve(__dirname, "src/test/novncStub.ts"),
        },
        reporters: [
            "default",
            [
                "allure-vitest/reporter",
                {
                    resultsDir: "allure-results",
                },
            ],
        ],
        coverage: {
            provider: "v8",
            reporter: ["lcov", "text"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/**/*.d.ts"],
        },
    },
});
