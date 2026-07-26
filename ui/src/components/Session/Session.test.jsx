import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import Session from "./index";

vi.mock("../VncCard", () => ({
    default: () => <div data-testid="vnc-card">VNC</div>,
}));

vi.mock("../Log", () => ({
    default: () => <div data-testid="live-log">Log</div>,
}));

function renderSession(props) {
    return render(
        <MemoryRouter>
            <Session origin="http://localhost" {...props} />
        </MemoryRouter>
    );
}

describe("Session detail page", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows live VNC + log when browser is present", () => {
        renderSession({
            session: "live-1",
            browser: {
                quota: "alice",
                caps: { browserName: "chrome", version: "120", enableVNC: true },
            },
        });

        expect(screen.getByTestId("vnc-card")).toBeInTheDocument();
        expect(screen.getByTestId("live-log")).toBeInTheDocument();
        expect(screen.queryByTestId("session-detail-video")).toBeNull();
    });

    it("loads finished artifacts and renders video, logs, HAR", async () => {
        fetch.mockImplementation(async (url) => {
            if (String(url).startsWith("/sessions/?")) {
                return {
                    ok: true,
                    json: async () => ({
                        sessions: [{ id: "fin-1", video: "fin-1.mp4", log: "fin-1.log", har: "fin-1.har" }],
                        total: 1,
                        limit: 10,
                        offset: 0,
                    }),
                };
            }
            if (String(url) === "/logs/fin-1.log") {
                return { ok: true, text: async () => "line one\nline two\n" };
            }
            if (String(url) === "/har/fin-1.har") {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        log: {
                            version: "1.2",
                            creator: { name: "selenoid" },
                            entries: [
                                {
                                    time: 10,
                                    request: { method: "GET", url: "https://example.com/" },
                                    response: { status: 200, content: { size: 1, mimeType: "text/html" } },
                                },
                            ],
                        },
                    }),
                };
            }
            return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
        });

        renderSession({ session: "fin-1", browser: undefined });

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-video")).toBeInTheDocument();
        });
        expect(screen.getByTestId("session-log-file-body")).toHaveTextContent("line one");
        expect(screen.getByTestId("session-har-viewer")).toBeInTheDocument();
        expect(screen.getByTestId("session-back")).toHaveAttribute("href", "/sessions");
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
    });

    it("shows not-found when archive has no matching session", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        renderSession({ session: "missing-id", browser: undefined });

        await waitFor(() => {
            expect(screen.getByTestId("session-not-found")).toBeInTheDocument();
        });
    });
});
