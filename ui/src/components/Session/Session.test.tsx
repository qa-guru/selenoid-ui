import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../util/waitForLiveSession", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../util/waitForLiveSession")>();
    return {
        ...actual,
        LIVE_SESSION_GRACE_MS: 0,
    };
});

import Session from "./index";

vi.mock("../VncCard", () => ({
    default: () => <div data-testid="vnc-card">VNC</div>,
}));

vi.mock("../Log", () => ({
    default: () => <div data-testid="live-log">Log</div>,
}));

function renderSession(props: any) {
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
        (fetch as any).mockImplementation(async (url: any) => {
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
            if (String(url) === "/video/fin-1.mp4") {
                return { ok: true, status: 200 };
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
        await waitFor(() => {
            expect(screen.getByTestId("session-log-file-body")).toHaveTextContent("line one");
        });
        expect(screen.getByTestId("session-log-download")).toHaveAttribute("aria-label", "Download");
        expect(screen.getByTestId("session-video-download")).toHaveAttribute("aria-label", "Download");
        expect(screen.getByTestId("session-har-download")).toHaveAttribute("aria-label", "Download");
        expect(screen.getByTestId("session-har-viewer")).toBeInTheDocument();
        expect(screen.getByTestId("session-back")).toHaveAttribute("href", "/sessions");
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
    });

    it("loads finished session from archive immediately on cold open", async () => {
        (fetch as any).mockImplementation(async (url: any) => {
            if (String(url).startsWith("/sessions/?")) {
                return {
                    ok: true,
                    json: async () => ({
                        sessions: [{ id: "cold-fin-1", video: "cold-fin-1.mp4", har: "cold-fin-1.har" }],
                        total: 1,
                        limit: 10,
                        offset: 0,
                    }),
                };
            }
            if (String(url) === "/video/cold-fin-1.mp4") {
                return { ok: true, status: 200 };
            }
            if (String(url) === "/har/cold-fin-1.har") {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        log: { version: "1.2", creator: { name: "selenoid" }, entries: [] },
                    }),
                };
            }
            return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
        });

        renderSession({ session: "cold-fin-1", browser: undefined });

        await waitFor(() => {
            expect(screen.queryByTestId("session-loading")).toBeNull();
        });

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-video")).toBeInTheDocument();
        });
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
    });

    it("shows not-found when archive has no matching session", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        renderSession({ session: "missing-id", browser: undefined });

        await waitFor(() => {
            expect(screen.getByTestId("session-not-found")).toBeInTheDocument();
        });
        const empty = screen.getByTestId("session-not-found");
        expect(empty!).toHaveClass("no-any");
        expect(empty.querySelector("svg")).toBeTruthy();
        expect(empty!).toHaveTextContent("SESSION NOT FOUND");
        expect(screen.getByTestId("session-missing-panel")).toBeInTheDocument();
        expect(screen.queryByTestId("session-back-missing")).not.toBeInTheDocument();
    });

    it("shows live VNC when browser appears before archive lookup finishes", async () => {
        let resolveFetch: ((value: unknown) => void) | undefined;
        (fetch as any).mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveFetch = resolve;
                })
        );

        const { rerender } = render(
            <MemoryRouter>
                <Session origin="http://localhost" session="live-2" browser={undefined} />
            </MemoryRouter>
        );

        expect(screen.getByTestId("session-loading")).toBeInTheDocument();

        rerender(
            <MemoryRouter>
                <Session
                    origin="http://localhost"
                    session="live-2"
                    browser={{
                        quota: "alice",
                        caps: { browserName: "chrome", version: "120", enableVNC: true },
                    }}
                />
            </MemoryRouter>
        );

        expect(screen.getByTestId("vnc-card")).toBeInTheDocument();
        expect(screen.queryByTestId("session-not-found")).toBeNull();

        resolveFetch?.({
            ok: true,
            json: async () => ({ sessions: [], total: 0, limit: 10, offset: 0 }),
        });

        await waitFor(() => {
            expect(screen.getByTestId("vnc-card")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("session-not-found")).toBeNull();
    });

    it("keeps the page after kill, preserves live log, and loads video + HAR", async () => {
        const liveBrowser = {
            quota: "alice",
            caps: {
                browserName: "chrome",
                version: "120",
                enableVNC: true,
                enableHAR: true,
            },
        };

        (fetch as any).mockImplementation(async (url: any) => {
            if (String(url).startsWith("/sessions/?")) {
                return {
                    ok: true,
                    json: async () => ({
                        sessions: [{ id: "live-kill-1", video: "live-kill-1.mp4", har: "live-kill-1.har" }],
                        total: 1,
                        limit: 10,
                        offset: 0,
                    }),
                };
            }
            if (String(url) === "/har/live-kill-1.har") {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        log: {
                            version: "1.2",
                            creator: { name: "selenoid" },
                            entries: [],
                        },
                    }),
                };
            }
            if (String(url) === "/video/live-kill-1.mp4") {
                return { ok: true, status: 200 };
            }
            return { ok: true, json: async () => ({}) };
        });

        const { rerender } = renderSession({
            session: "live-kill-1",
            browser: liveBrowser,
        });

        expect(screen.getByTestId("vnc-card")).toBeInTheDocument();
        expect(screen.getByTestId("live-log")).toBeInTheDocument();

        rerender(
            <MemoryRouter>
                <Session origin="http://localhost" session="live-kill-1" browser={undefined} />
            </MemoryRouter>
        );

        expect(screen.queryByTestId("vnc-card")).toBeNull();
        expect(screen.getByTestId("live-log")).toBeInTheDocument();
        expect(screen.getByTestId("session-media-slot")).toBeInTheDocument();
        expect(screen.getByTestId("session-video-waiting")).toBeInTheDocument();
        expect(screen.getAllByTestId("session-har-viewer")).toHaveLength(1);

        await waitFor(() => {
            expect(screen.getByTestId("session-detail-video")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("session-video-waiting")).toBeNull();
        expect(screen.getAllByTestId("session-har-viewer")).toHaveLength(1);
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
    });

    it("omits empty video/log placeholders when finished session has only HAR", async () => {
        (fetch as any).mockImplementation(async (url: any) => {
            if (String(url).startsWith("/sessions/?")) {
                return {
                    ok: true,
                    json: async () => ({
                        sessions: [{ id: "har-only", har: "har-only.har" }],
                        total: 1,
                        limit: 10,
                        offset: 0,
                    }),
                };
            }
            if (String(url) === "/har/har-only.har") {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        log: {
                            version: "1.2",
                            creator: { name: "selenoid" },
                            entries: [],
                        },
                    }),
                };
            }
            return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
        });

        renderSession({ session: "har-only", browser: undefined });

        await waitFor(() => {
            expect(screen.getByTestId("session-har-viewer")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("session-no-video")).toBeNull();
        expect(screen.queryByTestId("session-no-log")).toBeNull();
        expect(screen.getByText("FINISHED")).toBeInTheDocument();
        expect(screen.getByTestId("session-har-title")).toHaveTextContent("HAR");
    });
});
