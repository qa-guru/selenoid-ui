import { describe, expect, it } from "vitest";
import { buildHeaderConfig } from "./headerConfig";

describe("buildHeaderConfig", () => {
    it("includes Videos nav when videos enabled", () => {
        const config = buildHeaderConfig({ videos: true });
        expect(config.nav).toHaveLength(3);
        expect(config.nav[2]).toMatchObject({ href: "#/videos", label: "Videos" });
    });

    it("omits Videos nav when videos disabled", () => {
        const config = buildHeaderConfig({ videos: false });
        expect(config.nav).toHaveLength(2);
        expect(config.nav.map((item) => item.href)).toEqual(["#/", "#/capabilities"]);
    });
});
