const activeSockets = {};

export function retainPlaywrightSocket(sessionId, socket) {
    activeSockets[sessionId] = socket;
}

export function releasePlaywrightSocket(sessionId) {
    const socket = activeSockets[sessionId];
    if (socket) {
        socket.close();
        delete activeSockets[sessionId];
    }
}
