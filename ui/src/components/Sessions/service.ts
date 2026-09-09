import { useCallback, useState } from "react";

import { hubFetchInit } from "../../config/hubAuth";
import { resolveHubAuthToken } from "../../config/hubSessionAuth";
import { isMockSessionsEnabled, removeMockLiveSession } from "../../lib/mockSessions";
import { markLiveSessionEnded, reviveLiveSession } from "../../lib/optimisticLive";
import { releasePlaywrightSocket } from "../../util/playwrightSessions";

/** DELETE /wd/hub/session/{id} — shared by Stats trash and VNC kill. */
export function deleteSession(id: string) {
    if (isMockSessionsEnabled() && removeMockLiveSession(id)) {
        return Promise.resolve();
    }
    return fetch(`/wd/hub/session/${id}`, hubFetchInit(resolveHubAuthToken(), { method: "DELETE" })).then(
        (response: any) => {
            if (response.ok || response.status === 404) {
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
    );
}

export function useSessionDelete(id: string): [boolean, () => void] {
    const [deleting, setDeleting] = useState(false);

    const requestDelete = useCallback(() => {
        setDeleting(true);
        releasePlaywrightSocket(id);
        markLiveSessionEnded(id);
        deleteSession(id)
            .catch((e: any) => {
                reviveLiveSession(id);
                console.error("Can't delete session", id, e);
            })
            .finally(() => setDeleting(false));
    }, [id]);

    return [deleting, requestDelete];
}
