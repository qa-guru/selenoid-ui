import React, { useEffect, useMemo } from "react";
import { AppHeader } from "@zero-design-system/react";

import { buildHeaderConfig } from "../../lib/headerConfig";
import { remountDesignSystemHeader } from "../../lib/remountDesignSystemHeader";
import { bindHeaderHashNav, syncHeaderHashNav } from "../../lib/syncHeaderHashNav";

export function SelenoidAppHeader({ videos }) {
    const config = useMemo(() => buildHeaderConfig({ videos: Boolean(videos) }), [videos]);

    useEffect(() => bindHeaderHashNav(), []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            window.headerConfig = config;
            await remountDesignSystemHeader();
            if (!cancelled) {
                syncHeaderHashNav();
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [config, videos]);

    return <AppHeader config={config} />;
}
