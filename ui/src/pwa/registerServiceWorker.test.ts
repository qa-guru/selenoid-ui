import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

describe("registerServiceWorker", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.stubEnv("DEV", true);
    });

    it("registers /sw.js on load when supported in production", () => {
        vi.stubEnv("DEV", false);
        const register = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { serviceWorker: { register } });
        const addEventListener = vi.fn((_event, handler) => {
            handler();
        });
        vi.stubGlobal("window", { addEventListener });

        registerServiceWorker();

        expect(addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
        expect(register).toHaveBeenCalledWith("/sw.js");
    });

    it("skips registration in Vite dev (no sw.js emitted)", () => {
        vi.stubEnv("DEV", true);
        const register = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { serviceWorker: { register } });
        const addEventListener = vi.fn();
        vi.stubGlobal("window", { addEventListener });

        registerServiceWorker();

        expect(addEventListener).not.toHaveBeenCalled();
        expect(register).not.toHaveBeenCalled();
    });

    it("skips registration when serviceWorker is unavailable", () => {
        vi.stubEnv("DEV", false);
        vi.stubGlobal("navigator", {});
        const addEventListener = vi.fn();
        vi.stubGlobal("window", { addEventListener });

        registerServiceWorker();

        expect(addEventListener).not.toHaveBeenCalled();
    });
});
