import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("devtools canvas readback patches", () => {
    it("noVNC backbuffer sets willReadFrequently", () => {
        const src = readFileSync(resolve(uiRoot, "node_modules/@novnc/novnc/lib/display.js"), "utf8");
        expect(src).toContain("getContext('2d', { willReadFrequently: true })");
    });

    it("xterm color and atlas canvases set willReadFrequently", () => {
        const src = readFileSync(resolve(uiRoot, "node_modules/xterm/lib/xterm.js"), "utf8");
        expect(src).toContain('i.width=1,i.height=1;var u=i.getContext("2d",{willReadFrequently:!0})');
        expect(src).toContain(
            'n.getContext("2d",{alpha:i._config.allowTransparency,willReadFrequently:!0})'
        );
    });
});
