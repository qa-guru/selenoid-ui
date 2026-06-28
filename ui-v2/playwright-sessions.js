/** Keeps Playwright WebSocket open until the session page is ready. */

const activeSockets = new Map();

export function retainPlaywrightSocket(sessionId, socket) {
  if (sessionId && socket) {
    activeSockets.set(sessionId, socket);
  }
}

export function releasePlaywrightSocket(sessionId) {
  const socket = activeSockets.get(sessionId);
  if (!socket) return;
  try {
    if (socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
  } catch {
    // ignore close errors
  }
  activeSockets.delete(sessionId);
}
