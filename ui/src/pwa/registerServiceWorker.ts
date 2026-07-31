import { registerServiceWorker as registerPwa } from "./pwa-register.js";

/**
 * Heir wrapper around design-system `js/pwa-register.js` (synced copy in this
 * folder / `public/js/`). Vite DEV has no real `/sw.js` — skip registration.
 */
export function registerServiceWorker() {
    if (import.meta.env.DEV) {
        return;
    }
    registerPwa({ immediate: true });
}
