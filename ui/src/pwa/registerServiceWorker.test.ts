import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

describe("registerServiceWorker", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("registers /sw.js on load when supported", () => {
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

    it("skips registration when serviceWorker is unavailable", () => {
        vi.stubGlobal("navigator", {});
        const addEventListener = vi.fn();
        vi.stubGlobal("window", { addEventListener });

        registerServiceWorker();

        expect(addEventListener).not.toHaveBeenCalled();
    });
});
