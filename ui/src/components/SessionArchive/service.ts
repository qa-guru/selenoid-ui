import { useCallback, useState } from "react";

import { hubFetchInit } from "../../config/hubAuth";
import { resolveHubAuthToken } from "../../config/hubSessionAuth";

// A whole-session wipe removes each artifact via its own per-file DELETE, reusing
// the existing /video/, /logs/ and /har/ endpoints (the hub has no combined
// delete). Only artifacts present on the session are touched. /logs/ is
// htpasswd-gated on prod; send Authorization so nginx does not 401.
const ARTIFACT_ENDPOINTS = [
    ["video", "/video/"],
    ["log", "/logs/"],
    ["har", "/har/"],
];

export function useDeleteSession(session: any, onDeleted?: () => void): [boolean, () => void] {
    const [deleting, setDeleting] = useState(false);

    const deleteSession = useCallback(() => {
        setDeleting(true);
        const requests = ARTIFACT_ENDPOINTS.filter(([key]) => session[key]).map(([key, base]) =>
            fetch(`${base}${session[key]}`, hubFetchInit(resolveHubAuthToken(), { method: "DELETE" })).then(
                (response: any) => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                }
            )
        );

        Promise.all(requests)
            .then(() => {
                if (typeof onDeleted === "function") {
                    onDeleted();
                }
            })
            .catch((e: any) => {
                console.error("Can't delete session", session.id, e);
            })
            .finally(() => setDeleting(false));
    }, [session, onDeleted]);

    return [deleting, deleteSession];
}
