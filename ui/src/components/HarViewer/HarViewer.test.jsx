import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import HarViewer, { harFileName, wantsHar } from "./index";

describe("HarViewer helpers", () => {
    it("detects enableHAR caps", () => {
        expect(wantsHar({ enableHAR: true })).toBe(true);
        expect(wantsHar({ enableHar: true })).toBe(true);
        expect(wantsHar({})).toBe(false);
    });

    it("resolves default and custom har file names", () => {
        expect(harFileName("abc", {})).toBe("abc.har");
        expect(harFileName("abc", { harName: "custom" })).toBe("custom.har");
        expect(harFileName("abc", { harName: "x.har" })).toBe("x.har");
    });
});

describe("HarViewer", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => ({
                ok: true,
                status: 200,
                json: async () => ({
                    log: {
                        version: "1.2",
                        creator: { name: "selenoid", version: "1.2" },
                        entries: [
                            {
                                time: 42,
                                request: { method: "GET", url: "https://example.com/" },
                                response: {
                                    status: 200,
                                    content: { size: 1256, mimeType: "text/html" },
                                },
                            },
                        ],
                    },
                }),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("renders nothing when enableHAR is off", () => {
        const { container } = render(<HarViewer session="s1" browser={{ caps: { enableHAR: false } }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("polls /har/<id>.har and renders entries", async () => {
        render(
            <HarViewer
                session="sess-1"
                browser={{ caps: { enableHAR: true, browserName: "chrome" } }}
                sessionAlive={false}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId("session-har-viewer")).toBeInTheDocument();
            expect(screen.getByText("https://example.com/")).toBeInTheDocument();
        });
        expect(fetch).toHaveBeenCalledWith("/har/sess-1.har", { cache: "no-store" });
        expect(screen.getByTestId("session-har-download")).toHaveAttribute("href", "/har/sess-1.har");
    });
});
