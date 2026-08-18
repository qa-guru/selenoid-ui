import { useEffect, useState } from "react";

import { isMockSessionsEnabled, subscribeMockSessions } from "../lib/mockSessions";

/** Subscribe to `?mock=1` without depending on a route change or reload. */
export function useMockSessionsEnabled(): boolean {
    const [enabled, setEnabled] = useState(() => isMockSessionsEnabled());
    const [, bump] = useState(0);

    useEffect(
        () =>
            subscribeMockSessions(() => {
                setEnabled(isMockSessionsEnabled());
                // Created/hidden mock rows change while the flag stays on.
                bump((n) => n + 1);
            }),
        []
    );

    return enabled;
}

export default useMockSessionsEnabled;
