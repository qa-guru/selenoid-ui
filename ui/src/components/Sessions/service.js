import { useCallback, useState } from "react";

export function useSessionDelete(id) {
    const [deleting, setDeleting] = useState(false);

    const deleteSession = useCallback(() => {
        setDeleting(true);
        fetch(`/wd/hub/session/${id}`, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
            })
            .catch((e) => {
                console.error("Can't delete session", id, e);
            })
            .finally(() => setDeleting(false));
    }, [id]);

    return [deleting, deleteSession];
}
