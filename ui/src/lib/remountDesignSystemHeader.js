/**
 * Wait for selenoid-header-bridge (or a late dynamic import) to expose
 * remountHeader. AppHeader inject alone is not enough: if header.js was
 * already evaluated before #app-header existed, the module cache will not
 * re-run mountHeader().
 */
export async function remountDesignSystemHeader({ timeoutMs = 5000, intervalMs = 50 } = {}) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const remount = window.__designSystemRemountHeader;
        if (typeof remount === "function") {
            await remount();
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false;
}
