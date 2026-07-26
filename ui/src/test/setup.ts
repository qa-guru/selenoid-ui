import "@testing-library/jest-dom/vitest";
import "mutationobserver-shim";
import EventSource from "eventsourcemock";
import { vi } from "vitest";

Object.defineProperty(window, "EventSource", {
    value: EventSource,
    writable: true,
});

class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    url: string;
    readyState: number;
    onopen: ((ev?: Event) => void) | null;
    onclose: ((ev?: CloseEvent) => void) | null;
    onerror: ((ev?: Event) => void) | null;
    onmessage: ((ev?: MessageEvent) => void) | null;

    constructor(url: string) {
        this.url = url;
        this.readyState = MockWebSocket.OPEN;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
    }

    close() {
        this.readyState = MockWebSocket.CLOSED;
    }

    send() {}
}

Object.defineProperty(window, "WebSocket", {
    value: MockWebSocket,
    writable: true,
});

const novncMock = {
    default: vi.fn().mockImplementation(() => ({
        disconnect: vi.fn(),
        addEventListener: vi.fn(),
        scaleViewport: true,
        resizeSession: true,
    })),
};
vi.mock("@novnc/novnc", () => novncMock);
vi.mock("@novnc/novnc/lib/rfb.js", () => novncMock);
