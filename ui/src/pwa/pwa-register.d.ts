export type RegisterServiceWorkerOptions = {
    swUrl?: string;
    immediate?: boolean;
    reloadOnControllerChange?: boolean;
    onRegistered?: (reg: ServiceWorkerRegistration) => void;
    onRegisterError?: (err: unknown) => void;
};

export const DEFAULT_SW_URL: string;
export const PWA_ICON_PATHS: readonly string[];

export function registerServiceWorker(
    options?: RegisterServiceWorkerOptions,
): ServiceWorkerRegistration | undefined;
