import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "node_modules/@novnc/novnc/lib/display.js");
const from = "this._drawCtx = this._backbuffer.getContext('2d');";
const to = "this._drawCtx = this._backbuffer.getContext('2d', { willReadFrequently: true });";

let code;
try {
    code = readFileSync(target, "utf8");
} catch {
    process.exit(0);
}

if (code.includes(to)) {
    process.exit(0);
}

if (!code.includes(from)) {
    console.warn("patch-novnc-display: pattern not found in @novnc/novnc/lib/display.js");
    process.exit(0);
}

writeFileSync(target, code.replace(from, to));
