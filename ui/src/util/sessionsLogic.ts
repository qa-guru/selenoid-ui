import type { SessionsMap } from "../types/hub";

export function matchesSessionQuery(id: string, sessions: SessionsMap, query: string): boolean {
    if (id.includes(query)) {
        return true;
    }

    const caps = sessions[id]?.caps;
    if (!caps) {
        return query === "";
    }

    if (caps.name && caps.name.toLowerCase().includes(query.toLowerCase())) {
        return true;
    }

    if (caps.browserName && caps.browserName.toLowerCase().includes(query.toLowerCase())) {
        return true;
    }

    return query === "";
}

export function sortSessionIds(ids: string[], sessions: SessionsMap): string[] {
    return [...ids].sort((a: any) => (sessions[a]?.caps?.labels?.manual ? -1 : 1));
}

export function filterVideoFiles(videos: string[], query: string): string[] {
    return videos.filter((fname: any) => fname.includes(query) && fname.includes("."));
}

export function videoPreloadMode(count: number): "none" | "auto" {
    return count > 100 ? "none" : "auto";
}

export function sessionIdShort(id: string): string {
    const dash = id.indexOf("-");
    return id.substring(0, dash === -1 ? 8 : dash);
}
