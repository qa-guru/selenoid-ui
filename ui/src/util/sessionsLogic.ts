export function matchesSessionQuery(id, sessions, query) {
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

export function sortSessionIds(ids, sessions) {
    return [...ids].sort((a) => (sessions[a]?.caps?.labels?.manual ? -1 : 1));
}

export function filterVideoFiles(videos, query) {
    return videos.filter((fname) => fname.includes(query) && fname.includes("."));
}

export function videoPreloadMode(count) {
    return count > 100 ? "none" : "auto";
}

export function sessionIdShort(id) {
    const dash = id.indexOf("-");
    return id.substring(0, dash === -1 ? 8 : dash);
}
