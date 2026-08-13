import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const patches = [
    {
        file: "node_modules/@novnc/novnc/lib/display.js",
        from: "this._drawCtx = this._backbuffer.getContext('2d');",
        to: "this._drawCtx = this._backbuffer.getContext('2d', { willReadFrequently: true });",
    },
    // xterm Color: one 1x1 canvas, many getImageData calls while parsing ANSI.
    {
        file: "node_modules/xterm/lib/xterm.js",
        from: 'i.width=1,i.height=1;var u=i.getContext("2d")',
        to: 'i.width=1,i.height=1;var u=i.getContext("2d",{willReadFrequently:!0})',
    },
    // xterm CharAtlasGenerator._tmpCtx: loop of getImageData (Chrome Canvas2D warning).
    {
        file: "node_modules/xterm/lib/xterm.js",
        from: 'n.getContext("2d",{alpha:i._config.allowTransparency})',
        to: 'n.getContext("2d",{alpha:i._config.allowTransparency,willReadFrequently:!0})',
    },
];

let failed = false;

for (const patch of patches) {
    const target = resolve(root, patch.file);
    let code;
    try {
        code = readFileSync(target, "utf8");
    } catch {
        continue;
    }

    if (code.includes(patch.to)) {
        continue;
    }

    if (!code.includes(patch.from)) {
        console.warn(`patch-novnc-display: pattern not found in ${patch.file}`);
        failed = true;
        continue;
    }

    writeFileSync(target, code.replace(patch.from, patch.to));
}

if (failed) {
    process.exit(1);
}
