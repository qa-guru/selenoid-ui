import { defaultHubAuthPass, defaultHubAuthUser, formatAccessKey } from "./hubAuth";

/**
 * Last WebDriver Basic Auth token used for Create Session.
 * Kill / DELETE must reuse it — nginx requires auth on /wd/hub and the form
 * value may differ from bake-time VITE_HUB_AUTH_* defaults.
 */
let lastHubAuthToken = "";

export function rememberHubAuthToken(token: unknown): void {
    const next = String(token || "").trim();
    if (next) {
        lastHubAuthToken = next;
    }
}

/** Prefer remembered Create Session token; else bake-time WD defaults. */
export function resolveHubAuthToken(): string {
    if (lastHubAuthToken) {
        return lastHubAuthToken;
    }
    return formatAccessKey(defaultHubAuthUser(), defaultHubAuthPass());
}
