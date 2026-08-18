import { useCallback, useState } from "react";

import { hubFetchInit } from "../../config/hubAuth";
import { resolveHubAuthToken } from "../../config/hubSessionAuth";
import { isMockSessionsEnabled, removeMockLiveSession } from "../../lib/mockSessions";

/** DELETE /wd/hub/session/{id} — shared by Stats trash and VNC kill. */
export function deleteSession(id: string) {
    if (isMockSessionsEnabled() && removeMockLiveSession(id)) {
        return Promise.resolve();
    }
    return fetch(`/wd/hub/session/${id}`, hubFetchInit(resolveHubAuthToken(), { method: "DELETE" })).then(
        (response: any) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        }
    );
}

export function useSessionDelete(id: string): [boolean, () => void] {
    const [deleting, setDeleting] = useState(false);

    const requestDelete = useCallback(() => {
        setDeleting(true);
        deleteSession(id)
            .catch((e: any) => {
                console.error("Can't delete session", id, e);
            })
            .finally(() => setDeleting(false));
    }, [id]);

    return [deleting, requestDelete];
}
