import { useCallback, useState } from "react";
import { of } from "rxjs";
import { catchError, mapTo, startWith } from "rxjs/operators";
import { ajax } from "rxjs/ajax";

export function useDeleteVideo(name) {
    const [deleting, setDeleting] = useState(false);

    const deleteVideo = useCallback(() => {
        setDeleting(true);
        ajax({
            url: `/video/${name}`,
            method: "DELETE",
        })
            .pipe(
                mapTo(true),
                catchError((e) => {
                    console.error("Can't delete video", name, e);
                    return of(false);
                }),
                startWith(true)
            )
            .subscribe({
                complete: () => setDeleting(false),
                error: () => setDeleting(false),
            });
    }, [name]);

    return [deleting, deleteVideo];
}
