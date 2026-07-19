import { useCallback, useState } from "react";

export function useDeleteVideo(name, onDeleted) {
    const [deleting, setDeleting] = useState(false);

    const deleteVideo = useCallback(() => {
        setDeleting(true);
        fetch(`/video/${name}`, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                if (typeof onDeleted === "function") {
                    onDeleted();
                }
            })
            .catch((e) => {
                console.error("Can't delete video", name, e);
            })
            .finally(() => setDeleting(false));
    }, [name, onDeleted]);

    return [deleting, deleteVideo];
}
