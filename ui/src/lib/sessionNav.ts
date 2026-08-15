/** Hash-route search to keep when moving between the sessions list and a detail page. */
const LIST_SEARCH_KEYS = ["q", "sort", "order", "page", "mock"] as const;

export function sessionsListSearch(search: string = ""): string {
    const raw = search.startsWith("?") ? search.slice(1) : search;
    const params = new URLSearchParams(raw);
    const next = new URLSearchParams();
    for (const key of LIST_SEARCH_KEYS) {
        const value = params.get(key);
        if (value) {
            next.set(key, value);
        }
    }
    const qs = next.toString();
    return qs ? `?${qs}` : "";
}

export function sessionsListTo(search: string = ""): { pathname: "/sessions"; search: string } {
    return { pathname: "/sessions", search: sessionsListSearch(search) };
}

export function sessionDetailTo(id: string, search: string = ""): { pathname: string; search: string } {
    return { pathname: `/sessions/${id}`, search: sessionsListSearch(search) };
}
