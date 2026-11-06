/** Pool API contract content for the Docs → Pool API page. */

export type ApiEndpoint = {
    method: string;
    path: string;
    summary: string;
    request: string;
    response: string;
    notes: string[];
};

export type SelectorRow = {
    value: string;
    behavior: string;
    detail: string;
};

export type ReasonRow = {
    token: string;
    when: string;
};

/** Selector: selenoid:options.pool or labels.pool (options wins). */
export const SELECTOR_FORMS = [
    '"selenoid:options": { "pool": "cold|warm|hot|auto" }',
    '"labels": { "pool": "cold|warm|hot|auto" }',
];

export const SELECTOR_ROWS: SelectorRow[] = [
    {
        value: "auto (default)",
        behavior: "Prefer warm, fall back to cold",
        detail:
            "Hub tries to reserve a free warm Chrome slot first. When none is free (or the request is not warm-eligible) the session cold-starts — and the response tells you: servedPool=cold plus forcedPoolReason.",
    },
    {
        value: "cold",
        behavior: "Always cold-start a fresh container",
        detail:
            "Skips the pool entirely. This is the documented replacement for the old enableHar=true workaround — sidecar capabilities still force cold implicitly.",
    },
    {
        value: "warm",
        behavior: "Strict — warm slot or a visible error",
        detail:
            "Reserves a warm slot or fails the session (session not created). No silent cold fallback: the error message carries forcedPoolReason=<token> so the client sees exactly why.",
    },
    {
        value: "hot",
        behavior: "Rejected: invalid argument",
        detail:
            "Hot slots are not routable through hub /session — they are leased directly via POST /pool/lease on the orchestrator (selenoid-pool:9090). The 400 response says so.",
    },
    {
        value: "<other>",
        behavior: "Rejected: invalid argument",
        detail: 'Unknown selector values return HTTP 400 naming the bad value. Valid: "cold", "warm", "hot", "auto".',
    },
];

/** forcedPoolReason tokens surfaced in the New Session response. */
export const REASON_ROWS: ReasonRow[] = [
    {
        token: "sidecar-caps",
        when: "enableVideo / enableVNC / enableHAR need sidecar wiring that is baked at container start — warm slots cannot serve them.",
    },
    {
        token: "non-chrome",
        when: "Warm pool serves Chrome WebDriver only (firefox, playwright path stay cold).",
    },
    {
        token: "version-pin",
        when: "The requested Chrome major differs from the warm slot default (e.g. pinning 148/151 while slots run 152).",
    },
    {
        token: "min-image",
        when: "*-min catalog tags always cold-start their own image.",
    },
    {
        token: "warm-unavailable",
        when: "All warm slots are reserved or recycling right now — nothing free to attach.",
    },
    {
        token: "warm-attach-failed",
        when: "A slot was reserved but ChromeDriver did not answer in time; the session cold-started instead.",
    },
    {
        token: "no-warm-pool",
        when: "The hub is running without -warm-pool-url, so every session is cold by definition.",
    },
];

/** New Session response capability fields injected by the hub. */
export const RESPONSE_FIELDS = `{
  "value": {
    "sessionId": "<driver-uuid>",
    "capabilities": {
      "browserName": "chrome",
      "se:cdp": "ws://<hub>/devtools/<sessionId>/",
      "servedPool": "warm",
      "requestedPool": "auto",
      "servedSlot": "pool-chrome-1",
      "forcedPoolReason": "sidecar-caps"
    }
  }
}`;

export const ENDPOINTS: ApiEndpoint[] = [
    {
        method: "POST",
        path: "/pool/reserve",
        summary: "Claim a free warm slot (what the hub does for you on a warm/auto session).",
        request: `POST /pool/reserve
{
  "protocol": "webdriver",
  "browser":  "chrome",
  "owner":    "hub-42",
  "loopback": true,
  "slotId":   "pool-chrome-1",  // optional pin
  "ttlSec":   5400              // optional lease, clamped to max_lease_ttl
}`,
        response: `200 OK
{
  "ok": true,
  "slot": {
    "id": "pool-chrome-1",
    "protocol": "webdriver",
    "browser": "chrome",
    "pool": "warm",
    "sessionId": "pool-chrome-1",
    "webdriverUrl": "http://127.0.0.1:14441/",
    "reservedBy": "hub-42",
    "reservedAt": "…",
    "leaseExpiresAt": "…",
    "sessionCount": 7,
    "ageSec": 18120,
    "recycling": false,
    "recyclePending": false
  }
}
// 409 { "error": "no available slots" }`,
        notes: [
            "owner binds the reservation: release/renew must echo it back.",
            "loopback:true returns host-reachable URLs (127.0.0.1:14441); false returns docker-DNS URLs for in-network callers.",
            "ttlSec sets the reservation lifetime; without it the configured lease_ttl (1h) applies. Minimum 60s, maximum max_lease_ttl (6h).",
        ],
    },
    {
        method: "POST",
        path: "/pool/lease",
        summary: "Claim a hot slot AND get its live browser session (hot-only, bypasses the hub).",
        request: `POST /pool/lease
{
  "protocol": "webdriver",   // webdriver | playwright | cdp
  "browser":  "chrome",      // optional filter
  "owner":    "jenkins-115",
  "loopback": false,         // in-network callers use docker DNS
  "ttlSec":   3600
}`,
        response: `200 OK
{
  "ok": true,
  "created": true,                  // new ChromeDriver session was made
  "sessionId": "e4f2…driver-uuid",  // TOP-LEVEL = live driver session to use NOW
  "slot": {
    "id": "pool-hot-chrome-min-1",
    "pool": "hot",
    "sessionId": "pool-hot-chrome-min-1",  // slot.stable id, NOT the driver session
    "webdriverUrl": "http://hot-chrome-min-1:4444/",
    "driverSessionId": "e4f2…driver-uuid",
    "reservedBy": "jenkins-115",
    "leaseExpiresAt": "…"
  }
}`,
        notes: [
            "sessionId (top level) is the live ChromeDriver UUID — send your commands to webdriverUrl + /session/<that id>. slot.sessionId is the stable slot id, not a driver session.",
            "created:false means the slot already held a live driver session — you got slot.driverSessionId back.",
            "Docker jobs reach webdriverUrl by docker DNS (hot-chrome-min-1:4444); host jobs pass loopback:true → 127.0.0.1:16440.",
            "Playwright leases return playwrightWsUrl (ws://hot-pw-min-1:3000/ or loopback); CDP leases return cdpUrl.",
        ],
    },
    {
        method: "POST",
        path: "/pool/release",
        summary: "Free a reserved slot. Owner-verified — only the reserving owner (or force, or the reaper after TTL) may release.",
        request: `POST /pool/release
{
  "slotId":      "pool-hot-chrome-min-1",
  "owner":       "jenkins-115",  // must match reservedBy
  "killSession": true,           // hot only: also DELETE the driver session
  "force":       false           // ops escape hatch for stuck slots
}`,
        response: `200 OK            { "ok": true, "slotId": "pool-hot-chrome-min-1" }
200 OK (free)    { "ok": true, "slotId": "…", "alreadyFree": true }
409 Conflict     { "error": "slot \\"pool-hot-chrome-min-1\\" is reserved by \\"jenkins-115\\"" }
404 Not Found    { "error": "slot not found" }`,
        notes: [
            "Releasing a warm slot POSTs /warm/reset to the container (cookies/cache/profile wiped for the next tenant) — Chrome stays up.",
            "Hot: without killSession the driver session survives the release — that is the documented keep-alive path. killSession:true deletes it so the next lease creates a fresh one.",
            "Anonymous reservations (no owner at reserve time) may be released by anyone.",
        ],
    },
    {
        method: "POST",
        path: "/pool/renew",
        summary: "Extend a live reservation's lease deadline (same owner rules as release).",
        request: `POST /pool/renew
{
  "slotId": "pool-chrome-1",
  "owner":  "hub-42",
  "ttlSec": 1200     // deadline becomes now+ttlSec (clamped like reserve)
}`,
        response: `200 OK
{ "ok": true, "slotId": "pool-chrome-1", "leaseExpiresAt": "…" }
// 409 on free slot or owner mismatch`,
        notes: [
            "The deadline is RESET to now+ttlSec — renew with a shorter ttlSec shortens the lease.",
            "Use it for long jobs: renew periodically to stay ahead of the reaper.",
        ],
    },
    {
        method: "GET",
        path: "/pool/slots",
        summary: "All slots with lease + lifecycle telemetry (what hub /status proxies).",
        request: `GET /pool/slots`,
        response: `[
  {
    "id": "pool-chrome-1",
    "protocol": "webdriver",
    "browser": "chrome",
    "pool": "warm",
    "sessionId": "pool-chrome-1",
    "warmUrl": "http://warm-chrome-1:4444",
    "webdriverUrl": "http://warm-chrome-1:4444/",
    "webdriverUrlLoopback": "http://127.0.0.1:14441/",
    "reservedBy": null,
    "reservedAt": null,
    "leaseExpiresAt": null,
    "sessionCount": 7,
    "ageSec": 18120,
    "recycling": false,
    "recyclePending": false
  }
]`,
        notes: [
            "ageSec is seconds since the container (re)started — reset on every recycle.",
            "sessionCount counts reserve/lease handouts since that birth.",
            "recycling=true slots are mid-restart and are not handed out; recyclePending means a due rotation could not run (no docker socket) — the slot keeps serving.",
        ],
    },
];

/** Lifecycle knobs on the orchestrator (config.hub.yaml). */
export const LIFECYCLE_ROWS = [
    {
        key: "lease_ttl",
        value: "1h",
        effect: "Default reservation lifetime. The reaper sweeps expired reservations every 15s — a dead agent cannot hold a slot forever.",
    },
    {
        key: "max_lease_ttl",
        value: "6h",
        effect: "Upper clamp for per-request ttlSec (floor is 60s).",
    },
    {
        key: "recycle_after_sessions",
        value: "20",
        effect: "A free warm container is restarted after serving this many sessions.",
    },
    {
        key: "recycle_after_age",
        value: "12h",
        effect: "A free warm container is restarted when it is older than this.",
    },
];

/** Hub /status additions. */
export const STATUS_ROWS = [
    {
        key: "warmSlots[] / hotSlots[]",
        value: "slot rows",
        effect: "reservedBy, reservedAt, leaseExpiresAt, sessionCount, ageSec, recycling, recyclePending.",
    },
    {
        key: "poolRouting.warmServed / coldServed",
        value: "counters",
        effect: "How many sessions each pool actually served since hub start.",
    },
    {
        key: "poolRouting.warmFallbacks",
        value: "counter",
        effect: "Sessions that wanted/preferred warm but were served cold.",
    },
    {
        key: "poolRouting.recent[]",
        value: "last 20",
        effect: "session, requested→served pool, slot, forcedPoolReason, timestamp.",
    },
];

/** Hot daemons around the leased browsers. */
export const DAEMON_ROWS = [
    {
        name: "HotJunitDaemon :17890",
        detail: "POST /run?select=<test-selector> runs a JUnit test against the leased session — the 0.94s hot path.",
    },
    {
        name: "hot-pw :17990 / :17991",
        detail: "Playwright daemon on the hot slot: 17990 = none profile, 17991 = light profile.",
    },
    {
        name: "hot-cdp :9223 (×5)",
        detail: "CDP slots expose cdpUrl — no WebDriver session is ever created on them.",
    },
];
