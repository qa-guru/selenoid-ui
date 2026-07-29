import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HarViewer, { harFileName, wantsHar } from "./index";

function harPayload(entries: any) {
    return {
        log: {
            version: "1.2",
            creator: { name: "selenoid", version: "1.2" },
            entries,
        },
    };
}

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
                json: async () =>
                    harPayload([
                        {
                            time: 42,
                            request: {
                                method: "GET",
                                url: "https://example.com/",
                                headers: [
                                    { name: "Accept", value: "text/html" },
                                    { name: "User-Agent", value: "selenoid" },
                                ],
                            },
                            response: {
                                status: 200,
                                statusText: "OK",
                                headers: [{ name: "Content-Type", value: "text/html" }],
                                content: { size: 1256, mimeType: "text/html", text: "<html></html>" },
                            },
                            timings: {
                                blocked: 1,
                                dns: 2,
                                connect: 3,
                                ssl: 4,
                                send: 5,
                                wait: 20,
                                receive: 7,
                            },
                        },
                    ]),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("renders nothing when enableHAR is off", () => {
        const { container } = render(<HarViewer session="s1" browser={{ caps: { enableHAR: false } }} />);
        expect(container!).toBeEmptyDOMElement();
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
        expect(fetch!).toHaveBeenCalledWith("/har/sess-1.har", { cache: "no-store" });
        expect(screen.getByTestId("session-har-download")).toHaveAttribute("href", "/har/sess-1.har");
    });

    it("renders when an explicit finished-session file is provided without caps", async () => {
        render(<HarViewer session="sess-2" file="custom.har" sessionAlive={false} />);

        await waitFor(() => {
            expect(screen.getByTestId("session-har-viewer")).toBeInTheDocument();
        });
        expect(fetch!).toHaveBeenCalledWith("/har/custom.har", { cache: "no-store" });
    });

    it("expands a row and shows headers; second click collapses", async () => {
        const user = userEvent.setup();
        render(<HarViewer session="sess-1" browser={{ caps: { enableHAR: true } }} sessionAlive={false} />);

        const row = await screen.findByTestId("session-har-row-0");
        expect(row!).toHaveAttribute("aria-expanded", "false");

        await user.click(row);
        expect(row!).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByTestId("session-har-detail")).toBeInTheDocument();
        expect(screen.getByText("Response Headers")).toBeInTheDocument();
        expect(screen.getByText("Content-Type")).toBeInTheDocument();
        expect(screen.getByTestId("session-har-panel-headers")).toHaveTextContent("text/html");
        expect(screen.getByText("Request Headers")).toBeInTheDocument();
        expect(screen.getByText("Accept")).toBeInTheDocument();

        await user.click(row);
        expect(row!).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByTestId("session-har-detail")).not.toBeInTheDocument();
    });

    it("does not crash on empty CDP content (status 0, size 0, no text)", async () => {
        const user = userEvent.setup();
        (fetch as any).mockImplementation(async () => ({
            ok: true,
            status: 200,
            json: async () =>
                harPayload([
                    {
                        time: 0,
                        request: { method: "GET", url: "https://cdp.example/empty" },
                        response: {
                            status: 0,
                            content: { size: 0, mimeType: "" },
                        },
                    },
                ]),
        }));

        render(<HarViewer session="sess-empty" browser={{ caps: { enableHAR: true } }} sessionAlive={false} />);

        const row = await screen.findByTestId("session-har-row-0");
        expect(screen.getByText("https://cdp.example/empty")).toBeInTheDocument();
        expect(row!).toHaveTextContent("—");

        await user.click(row);
        expect(screen.getByTestId("session-har-detail")).toBeInTheDocument();
        expect(screen.getAllByText("No headers captured.")).toHaveLength(2);

        await user.click(screen.getByTestId("session-har-tab-response"));
        expect(screen.getByTestId("session-har-panel-response")).toBeInTheDocument();
        expect(screen.getByText("Body not captured (meta / headers + size only).")).toBeInTheDocument();
    });
});
