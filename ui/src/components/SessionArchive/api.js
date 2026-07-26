export const SESSION_PAGE_SIZE = 10;

export function buildSessionListUrl({ page = 0, limit = SESSION_PAGE_SIZE, q = "" } = {}) {
    const offset = Math.max(0, page) * limit;
    const params = new URLSearchParams();
    params.set("json", "");
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (q) {
        params.set("q", q);
    }
    return `/sessions/?${params.toString()}`;
}

// Fetch one page of finished-session artifacts from the hub /sessions/ endpoint.
// Each entry groups the video/log/har files that share a session id.
export async function fetchSessionPage({ page = 0, limit = SESSION_PAGE_SIZE, q = "" } = {}) {
    const response = await fetch(buildSessionListUrl({ page, limit, q }));
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    return {
        sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
        total: Number(payload.total) || 0,
        limit: Number(payload.limit) || limit,
        offset: Number(payload.offset) || 0,
    };
}

/**
 * Resolve one finished session by id via the hub list endpoint (`q` substring filter).
 * Returns null when no exact id match is present.
 */
export async function fetchSessionById(id) {
    const sessionId = String(id || "").trim();
    if (!sessionId) {
        return null;
    }
    const payload = await fetchSessionPage({ page: 0, limit: SESSION_PAGE_SIZE, q: sessionId });
    const exact = (payload.sessions || []).find((session) => session.id === sessionId);
    return exact || null;
}
