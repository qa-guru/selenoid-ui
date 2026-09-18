import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Allure 2 result files without allure-vitest (that reporter OOMs GHA:
 * V8 "invalid table size" even with 8GB heap).
 */
export default class AllureLiteReporter {
    constructor() {
        this.dir = join(process.cwd(), "allure-results");
        mkdirSync(this.dir, { recursive: true });
    }

    onTestCaseResult(testCase) {
        const result = testCase.result();
        if (!result || result.state === "pending") {
            return;
        }
        const status =
            result.state === "passed" ? "passed" : result.state === "skipped" ? "skipped" : "failed";
        const uuid = randomUUID();
        const fullName = testCase.fullName;
        const historyId = createHash("md5").update(fullName).digest("hex");
        const duration = Math.round(testCase.diagnostic?.()?.duration ?? 0);
        const stop = Date.now();
        const payload = {
            uuid,
            historyId,
            name: testCase.name,
            fullName,
            status,
            stage: "finished",
            start: stop - duration,
            stop,
            labels: [
                { name: "framework", value: "vitest" },
                { name: "language", value: "javascript" },
                { name: "epic", value: process.env.ALLURE_LABEL_epic || "selenoid-ui" },
                { name: "layer", value: process.env.ALLURE_LABEL_layer || "component" },
                { name: "scope", value: process.env.ALLURE_LABEL_scope || "react" },
            ],
        };
        const err = result.errors?.[0];
        if (err) {
            payload.statusDetails = {
                message: String(err.message || err),
            };
        }
        writeFileSync(join(this.dir, `${uuid}-result.json`), JSON.stringify(payload));
    }
}
