/** Shared hub / SSE / session domain types for Selenoid UI. */

export type HealthStatus = "ok" | "stale" | "error" | "unknown";

export type SessionLabels = Record<string, string | boolean | undefined> & {
    manual?: string | boolean;
};

export type SessionCaps = {
    browserName?: string;
    version?: string;
    name?: string;
    enableVNC?: boolean | string;
    enableVideo?: boolean | string;
    enableHAR?: boolean | string;
    enableLog?: boolean | string;
    screenResolution?: string;
    sessionTimeout?: string;
    timeZone?: string;
    labels?: SessionLabels;
    [key: string]: unknown;
};

export type LiveSession = {
    id?: string;
    container?: string;
    quota?: string;
    caps?: SessionCaps;
    /** Hub feed entry exists, container/quota not ready yet (Create Session freeze). */
    starting?: boolean;
    /** Dev mock: fake connected VNC/logs instead of real sockets. */
    preview?: "active";
    [key: string]: unknown;
};

export type SessionsMap = Record<string, LiveSession>;

export type BrowserVersionInfo = {
    protocol?: string;
    [key: string]: unknown;
};

/** browserName → version → protocol metadata */
export type BrowserProtocols = Record<string, Record<string, BrowserVersionInfo>>;

/** browserName → version → count (quota usage) */
export type BrowsersMap = Record<string, Record<string, number>>;

/** Warm/hot orchestrator slot on hub /status (no URLs). */
export type PoolSlot = {
    id?: string;
    browser?: string;
    protocol?: string;
    pool?: string;
    reservedBy?: string | null;
};

export type HubState = {
    total?: number;
    used?: number;
    queued?: number;
    pending?: number;
    warmReady?: number;
    warmTotal?: number;
    hotReady?: number;
    hotTotal?: number;
    warmSlots?: PoolSlot[];
    hotSlots?: PoolSlot[];
    [key: string]: unknown;
};

export type UiStatusPayload = {
    state: HubState;
    origin?: string;
    browsers?: BrowsersMap;
    sessions?: SessionsMap;
    browserProtocols?: BrowserProtocols;
    version?: string;
    errors?: unknown[];
    [key: string]: unknown;
};

export type PlaywrightSessionForm = {
    name: string;
    sessionTimeout: string;
    screenResolution: string;
    enableVnc: boolean;
    enableVideo: boolean;
    enableHar: boolean;
    harContent: string;
    enableLog: boolean;
    timeZone: string;
    env: string;
    labels: string;
    videoName: string;
    logName: string;
    socksProxy: string;
    headless: boolean;
};
