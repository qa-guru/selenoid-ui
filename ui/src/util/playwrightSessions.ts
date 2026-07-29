const activeSockets: Record<string, WebSocket> = {};

export function retainPlaywrightSocket(sessionId: string, socket: WebSocket): void {
    activeSockets[sessionId] = socket;
}

export function releasePlaywrightSocket(sessionId: string): void {
    const socket = activeSockets[sessionId];
    if (socket) {
        socket.close();
        delete activeSockets[sessionId];
    }
}
