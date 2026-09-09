import { describe, expect, it, vi } from "vitest";
import { releasePlaywrightSocket, retainPlaywrightSocket } from "./playwrightSessions";

describe("playwrightSessions", () => {
    it("closes an open retained socket and is idempotent", () => {
        const socket = { readyState: WebSocket.OPEN, close: vi.fn() } as any;
        retainPlaywrightSocket("sess-1", socket);
        releasePlaywrightSocket("sess-1");
        expect(socket.close).toHaveBeenCalledTimes(1);
        releasePlaywrightSocket("sess-1");
        expect(socket.close).toHaveBeenCalledTimes(1);
    });

    it("does not close an already-closed socket", () => {
        const socket = { readyState: WebSocket.CLOSED, close: vi.fn() } as any;
        retainPlaywrightSocket("sess-2", socket);
        releasePlaywrightSocket("sess-2");
        expect(socket.close).not.toHaveBeenCalled();
    });
});
