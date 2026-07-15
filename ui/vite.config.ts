import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
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
