import { of } from "rxjs";
import { catchError, flatMap, mapTo, startWith } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { useEventCallback } from "rxjs-hooks";

export function useDeleteVideo(name) {
    const [deleteVideo, deleted] = useEventCallback(
        (event$) =>
            event$.pipe(
                flatMap(() =>
                    ajax({
                        url: `/video/${name}`,
                        method: "DELETE",
                    }).pipe(
                        mapTo(true),
                        catchError((e) => {
                            console.error("Can't delete video", name, e);
                            return of(false);
                        }),
                        startWith(true)
                    )
                )
            ),
        false
    );

    return [deleted, () => deleteVideo(name)];
}
