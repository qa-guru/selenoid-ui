import { describe, expect, it } from "vitest";

import { hubRemoteUrl, resolveHubOrigin } from "./hubOrigin.js";

describe("hubOrigin", () => {
    it("prefers public UI origin when backend origin is internal localhost", () => {
        expect(resolveHubOrigin("http://127.0.0.1:4444", "https://selenoid.qa.guru")).toBe("https://selenoid.qa.guru");
    });

    it("prefers public UI origin when backend origin is docker selenoid host", () => {
        expect(resolveHubOrigin("http://selenoid:4444", "http://127.0.0.1:5174")).toBe("http://127.0.0.1:5174");
    });

    it("keeps external backend origin when it is already public", () => {
        expect(resolveHubOrigin("https://selenoid.qa.guru", "http://127.0.0.1:5174")).toBe("https://selenoid.qa.guru");
    });

    it("strips /wd/hub suffix from backend origin before resolving", () => {
        expect(hubRemoteUrl("http://127.0.0.1:4444/wd/hub", "https://selenoid.qa.guru")).toBe(
            "https://selenoid.qa.guru/wd/hub"
        );
    });

    it("falls back to page origin when backend origin is missing", () => {
        expect(resolveHubOrigin(undefined, "https://selenoid.qa.guru")).toBe("https://selenoid.qa.guru");
    });
});
