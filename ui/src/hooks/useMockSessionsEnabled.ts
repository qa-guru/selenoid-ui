import { useEffect, useState } from "react";

import { isMockSessionsEnabled, subscribeMockSessions } from "../lib/mockSessions";

/** Subscribe to `?mock=1` without depending on a route change or reload. */
export function useMockSessionsEnabled(): boolean {
    const [enabled, setEnabled] = useState(() => isMockSessionsEnabled());

    useEffect(() => subscribeMockSessions(() => setEnabled(isMockSessionsEnabled())), []);

    return enabled;
}

export default useMockSessionsEnabled;
