export function registerServiceWorker() {
    // vite-plugin-pwa keeps `devOptions.enabled: false`, so `/sw.js` is not
    // emitted in Vite dev — registering would hit the SPA HTML fallback and
    // spam the console (MIME text/html). Production build serves real SW.
    if (import.meta.env.DEV || !("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
            console.warn("service worker registration failed", err);
        });
    });
}
