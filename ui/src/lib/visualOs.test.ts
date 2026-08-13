import { describe, expect, it } from "vitest";
import { visualOsFolder } from "./visualOs";

describe("visualOsFolder", () => {
    it("maps process.platform to snapshot folder names", () => {
        expect(visualOsFolder("darwin", "")).toBe("macos");
        expect(visualOsFolder("linux", "")).toBe("linux");
        expect(visualOsFolder("win32", "")).toBe("windows");
        expect(visualOsFolder("freebsd", "")).toBe("freebsd");
    });

    it("VISUAL_OS overrides the host platform", () => {
        expect(visualOsFolder("darwin", "linux")).toBe("linux");
        expect(visualOsFolder("linux", "macos")).toBe("macos");
        expect(visualOsFolder("linux", "  windows  ")).toBe("windows");
    });
});
