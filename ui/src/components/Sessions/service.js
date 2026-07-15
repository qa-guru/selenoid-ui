import { useCallback, useState } from "react";
import { of } from "rxjs";
import { catchError, mapTo, startWith } from "rxjs/operators";
import { ajax } from "rxjs/ajax";

export function useSessionDelete(id) {
    const [deleting, setDeleting] = useState(false);

    const deleteSession = useCallback(() => {
        setDeleting(true);
        ajax({
            url: `/wd/hub/session/${id}`,
            method: "DELETE",
        })
            .pipe(
                mapTo(true),
                catchError((e) => {
                    console.error("Can't delete session", id, e);
                    return of(false);
                }),
                startWith(true)
            )
            .subscribe({
                complete: () => setDeleting(false),
                error: () => setDeleting(false),
            });
    }, [id]);

    return [deleting, deleteSession];
}
