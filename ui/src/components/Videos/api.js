export const VIDEO_PAGE_SIZE = 10;

export function buildVideoListUrl({ page = 0, limit = VIDEO_PAGE_SIZE, q = "" } = {}) {
    const offset = Math.max(0, page) * limit;
    const params = new URLSearchParams();
    params.set("json", "");
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (q) {
        params.set("q", q);
    }
    return `/video/?${params.toString()}`;
}

export async function fetchVideoPage({ page = 0, limit = VIDEO_PAGE_SIZE, q = "" } = {}) {
    const response = await fetch(buildVideoListUrl({ page, limit, q }));
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    return {
        videos: Array.isArray(payload.videos) ? payload.videos : [],
        total: Number(payload.total) || 0,
        limit: Number(payload.limit) || limit,
        offset: Number(payload.offset) || 0,
    };
}
