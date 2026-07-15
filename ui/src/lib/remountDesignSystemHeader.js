export async function remountDesignSystemHeader() {
    const remount = window.__designSystemRemountHeader;
    if (typeof remount === "function") {
        await remount();
    }
}
