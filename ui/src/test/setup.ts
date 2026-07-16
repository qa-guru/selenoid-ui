import "@testing-library/jest-dom/vitest";
import "mutationobserver-shim";
import EventSource from "eventsourcemock";
import { vi } from "vitest";

Object.defineProperty(window, "EventSource", {
    value: EventSource,
    writable: true,
});

class MockWebSocket {
    constructor(url) {
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

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

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
