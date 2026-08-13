/**
 * Visual snapshot folder: `VISUAL_OS` override, else macos | linux | windows.
 * Playwright `snapshotPathTemplate` uses this as a directory name, not a suffix.
 */
export function visualOsFolder(
    platform: string = process.platform,
    override: string | undefined = process.env.VISUAL_OS
): string {
    const named = String(override || "").trim();
    if (named) {
        return named;
    }
    if (platform === "darwin") {
        return "macos";
    }
    if (platform === "linux") {
        return "linux";
    }
    if (platform === "win32") {
        return "windows";
    }
    return platform;
}
