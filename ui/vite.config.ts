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
    /^\/video/,
    /^\/clipboard/,
    /^\/wd\/hub/,
    /^\/playwright/,
    /^\/ws/,
    /^\/vnc/,
    /^\/log/,
];

export default defineConfig({
    plugins: [
        react(),
        // PWA baseline (canon: reference-app / stacks java-spring frontend-react):
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
                theme_color: "#2c2a26",
                background_color: "#2c2a26",
                icons: [
                    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
                    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
                    {
                        src: "icons/icon-512.png",
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
                    "icons/icon-192.png",
                    "icons/icon-512.png",
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
    ],
    esbuild: {
        loader: "jsx",
        include: /src\/.*\.jsx?$/,
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
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/clipboard": {
                target: "http://selenoid:4444",
                changeOrigin: true,
            },
            "/status": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/video": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/wd/hub": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/playwright": {
                target: "http://localhost:8080",
                ws: true,
                changeOrigin: true,
            },
            "/ws": {
                target: "http://localhost:8080",
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
        esbuildOptions: {
            loader: {
                ".js": "jsx",
            },
        },
    },
    test: {
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
    },
});
