export type Dual = {
    human: string;
    tech: string;
};

export type PoolId = "cold" | "warm" | "hot";

export type TopologyNodeId = "jenkins" | "hub" | "ui" | "pool" | "warm" | "hot" | "docker";

export type WallLayerId = "docker-run" | "new-session" | "gradle" | "login" | "jenkins-shell";

export type ComparisonRow = {
    label: string;
    cold: Dual;
    warm: Dual;
    hot: Dual;
};

export type OneRunRow = {
    pool: string;
    cell: Dual;
};

export type FeatureRow = {
    label: string;
    detail?: string;
    cold: boolean;
    warm: boolean;
    hot: boolean;
};

export const POOL_STATS: { id: PoolId; value: string; label: string; tone?: "success" }[] = [
    { id: "cold", value: "~9.4 seconds", label: "Cold — a new browser on every run" },
    { id: "warm", value: "~4.2 seconds", label: "Warm — the container is ready; a new session still opens" },
    {
        id: "hot",
        value: "~0.9 seconds",
        label: "Hot — Java and Chrome are already running",
        tone: "success",
    },
];

export const COMPARISON_HEADERS = ["", "Cold", "Warm · 4 slots", "Hot · 2 slots"] as const;

export const FEATURE_HEADERS = ["What the pool has", "Cold", "Warm", "Hot"] as const;

export const FEATURE_ROWS: FeatureRow[] = [
    {
        label: "Browser container is already running before the test",
        detail: "No docker run at the start of the session.",
        cold: false,
        warm: true,
        hot: true,
    },
    {
        label: "Skip starting a new Docker container for every test",
        cold: false,
        warm: true,
        hot: true,
    },
    {
        label: "A smaller “-min” browser image is standing by",
        cold: false,
        warm: true,
        hot: true,
    },
    {
        label: "A Playwright container is standing by",
        detail: "The container is up. The Java login job does not use it.",
        cold: false,
        warm: true,
        hot: true,
    },
    {
        label: "Claim and free a named pool slot (reserve / lease and release)",
        cold: false,
        warm: true,
        hot: true,
    },
    {
        label: "Reserve asks the hub to open a new window in that Chrome",
        detail: "POST /pool/reserve with loopback:true.",
        cold: false,
        warm: true,
        hot: false,
    },
    {
        label: "Opens a new browser window (New Session) on every run",
        detail: "This is how cold and warm work. Hot reuses the window that is already open.",
        cold: true,
        warm: true,
        hot: false,
    },
    {
        label: "The same browser window is reused across Jenkins builds",
        cold: false,
        warm: false,
        hot: true,
    },
    {
        label: "The test skips the Selenoid hub and talks to Chrome by container name",
        cold: false,
        warm: false,
        hot: true,
    },
    {
        label: "A Java daemon stays on the agent; the build does not start a new test-worker",
        cold: false,
        warm: false,
        hot: true,
    },
    {
        label: "Git is off the test job; a separate sync job updates the files",
        cold: false,
        warm: false,
        hot: true,
    },
    {
        label: "Chrome stays open after the test (quit is not called)",
        cold: false,
        warm: false,
        hot: true,
    },
    {
        label: "Gradle daemon and configuration cache are part of this path",
        detail: "Hot does not run the test through Gradle. Cold starts a new test-worker each time.",
        cold: false,
        warm: true,
        hot: false,
    },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
    {
        label: "Why it exists",
        cold: {
            human: "This is the default Selenoid path. Use it when you do not need a browser waiting in advance.",
            tech:
                "The hub reads the browsers.json catalog and starts a container when a test asks for a session. Warm and hot slots are a separate overlay; if they are idle or unused, the test still falls back here.",
        },
        warm: {
            human: "Jenkins builds get faster because Docker does not start a new container for every test.",
            tech:
                "The browser containers are already running. Gradle still takes about three seconds to start the test. Do not change this path to copy the hot-pool shortcuts.",
        },
        hot: {
            human: "This is the fastest run: Java and Chrome do not start again between builds.",
            tech:
                "This is a separate Jenkins job. Do not merge it into the warm job that still opens a session through the hub.",
        },
    },
    {
        label: "Browsers standing by",
        cold: {
            human: "None. A browser appears only when the test asks for a session.",
            tech: "There are zero warm slots. The hub runs docker run when it receives POST /session.",
        },
        warm: {
            human:
                "Four browsers wait: two Chrome and two Playwright. In each pair one image is the full browser and one is the smaller “-min” image.",
            tech:
                "Chrome 149 listens on port 14441; Chrome 149-min on port 14442. Playwright 1.61.1 listens on port 14501; Playwright 1.61.1-min on port 14502.",
        },
        hot: {
            human: "Two smaller “-min” browsers wait: one Chrome and one Playwright.",
            tech:
                "Only “-min” images. Chrome 149-min listens on port 16440. Playwright 1.61.1-min listens on port 16441.",
        },
    },
    {
        label: "Container",
        cold: {
            human: "A new Docker container starts for each test, then it is removed.",
            tech: "The hub runs docker run for that session, then docker rm when the session ends.",
        },
        warm: {
            human: "The container is already running. The driver only waits for the command “open a session”.",
            tech: "The container stays up. ChromeDriver listens for the WebDriver New Session command.",
        },
        hot: {
            human: "The container is already running, and the browser window is not closed between Jenkins builds.",
            tech:
                "The container stays up. The WebDriver session and the page survive from one Jenkins build to the next.",
        },
    },
    {
        label: "Browser session",
        cold: {
            human: "Every run gets a new window inside a new container.",
            tech: "The hub creates a New Session and a new container together.",
        },
        warm: {
            human:
                "Every run gets a new window, but inside Chrome that is already running. That window starts on a blank page.",
            tech:
                "New Session opens about:blank. If someone had opened /login earlier, that page is gone by the time Gradle finishes starting the test.",
        },
        hot: {
            human: "The run uses the same window as the previous Jenkins build. No extra blank tab is opened.",
            tech:
                "One WebDriver session lives in the daemon Java process. skipBlankOpen is on. quit() is not called on the test path.",
        },
    },
    {
        label: "How the test reaches Chrome",
        cold: {
            human: "Through the Selenoid hub, like any ordinary test.",
            tech: "The test sends POST /session to the hub. Playwright talks to the hub over a WebSocket.",
        },
        warm: {
            human:
                "Also through the hub, but the hub forwards the request to a warm Chrome instead of starting a container with docker run.",
            tech:
                "The test talks to the hub on port 4444. The hub forwards to 127.0.0.1:14441. This container-reuse path is WebDriver Chrome only. Playwright through the hub is still the cold path.",
        },
        hot: {
            human:
                "The hub is skipped. The Jenkins agent talks to Chrome by the Docker container name on the shared network.",
            tech:
                "The agent uses Docker DNS hot-chrome-min-1:4444/ on the network selenoid-warm. The second Jenkins agent cannot reach that browser as 127.0.0.1:16440, because that address is local to the first agent.",
        },
    },
    {
        label: "Reserving a slot",
        cold: {
            human: "There is no slot queue. The hub picks and starts a container by itself.",
            tech: "The pool orchestrator is not involved. The hub runs docker run.",
        },
        warm: {
            human: "The job claims a warm Chrome and asks the hub to open a new window in that Chrome.",
            tech: "POST /pool/reserve with loopback:true. The hub then sends New Session to that slot.",
        },
        hot: {
            human: "The job only marks the slot busy. It does not open a window — the window is already there.",
            tech: "POST /pool/lease. That is a lock only; no New Session, no loopback, no hub.",
        },
    },
    {
        label: "Releasing a slot",
        cold: {
            human: "By the time release would matter, the browser is already gone: the container died with the test.",
            tech: "The session is closed and the container is removed.",
        },
        warm: {
            human:
                "The slot is marked free. The container stays; the window is closed. The next run opens a new window.",
            tech: "POST /pool/release. The next build sends New Session again.",
        },
        hot: {
            human: "The busy mark is cleared. Chrome and Java keep running.",
            tech: "POST /pool/release without killSession. quit() is not called. The daemon and the session stay.",
        },
    },
    {
        label: "Login page between tests",
        cold: {
            human: "The login page is not kept. There is no container left to hold it.",
            tech: "There is no idle browser sitting on /login.",
        },
        warm: {
            human:
                "Do not leave the login page open “just in case”. Warm slots are not meant to hold that page between runs.",
            tech: "Leaving an idle /login page on a warm slot is forbidden.",
        },
        hot: {
            human:
                "After /run the window stays on the login page for the next build. Sessions are wiped only if the daemon restarts.",
            tech:
                "The daemon parks on /login after POST /run. ChromeDriver sessions are wiped only when the daemon restarts.",
        },
    },
    {
        label: "How long the login test takes",
        cold: {
            human: "About nine seconds.",
            tech: "Java, cold pool: 9.4 seconds.",
        },
        warm: {
            human: "About four seconds.",
            tech: "Java, warm pool: 4.216 seconds (#14).",
        },
        hot: {
            human: "About 0.9 seconds when Java and Chrome are already warm.",
            tech: "Java, hot pool: 0.9 seconds (#80).",
        },
    },
    {
        label: "Where the time goes",
        cold: {
            human: "Start a container, open Chrome, start Java, then run login.",
            tech: "docker run, then New Session, then a new Gradle test-worker, then the login steps in the browser.",
        },
        warm: {
            human:
                "Claim the slot, open a new window, start Gradle, then log in. On a manual Jenkins run the test code is not fetched from git again.",
            tech:
                "reserve, then New Session, then about three seconds of Gradle test, then login. Git checkout is skipped when you press Build Now.",
        },
        hot: {
            human:
                "Login in Chrome is about 0.7 seconds. The rest is Jenkins starting the job.",
            tech:
                "POST /pool/lease, then the running daemon, then POST /run takes about 678 milliseconds, then trap release in the same shell. About 0.3 seconds is the Jenkins Test stage around /run, not the browser. Git lives in a separate sync job.",
        },
    },
    {
        label: "Java process",
        cold: {
            human: "Every Jenkins build starts Java from scratch.",
            tech: "A new Gradle test-worker process starts each time.",
        },
        warm: {
            human: "Gradle itself is already warm, but the test still runs in a new Java process.",
            tech: "The Gradle daemon and configuration-cache stay up. A new test-worker still starts for each build.",
        },
        hot: {
            human: "A Java daemon stays on the Jenkins agent. The build only tells that process to run login.",
            tech:
                "HotJunitDaemon listens on 127.0.0.1:17890. It is not a Gradle test-worker. Restart it when the test classes change.",
        },
    },
    {
        label: "Where the test code comes from",
        cold: {
            human: "A git push checks out fresh code. A manual run usually reuses what is already on the agent.",
            tech: "Jenkins checks out git unless a person started the run with Build Now.",
        },
        warm: {
            human: "The same as cold: a manual run does not clone again if the tests are already on disk.",
            tech: "Git checkout is skipped on Build Now when the workspace already exists.",
        },
        hot: {
            human:
                "The test job does not touch git. A separate sync job updates the files. If there is no code, the test fails with a hint to run that sync job first.",
            tech:
                "The test job does not run git ls-remote, fetch, or checkout. If gradlew is missing, the job fails with “run the sync job first”.",
        },
    },
    {
        label: "Close the browser after the test",
        cold: {
            human: "Yes. The container is removed with it.",
            tech: "quit() runs after the test. Then the container is removed with docker rm.",
        },
        warm: {
            human: "Yes, the window closes. The container stays and waits for the next run.",
            tech: "closeBrowserAfterEach defaults to true. The slot stays up, but there is no open session.",
        },
        hot: {
            human: "No. The window is left open on purpose for the next Jenkins build.",
            tech:
                "closeBrowserAfterEach and closeBrowserAfterAll are false. The same Selenide thread keeps the session.",
        },
    },
    {
        label: "Playwright",
        cold: {
            human: "The ordinary hub path, like any cold browser.",
            tech: "The hub receives POST /session and starts playwright-chromium 1.61.1.",
        },
        warm: {
            human:
                "Playwright containers are already running, but the hub does not reuse them. A Playwright test through the hub still takes the cold path.",
            tech: "Slots on ports 14501 and 14502 are up. There is no Playwright container-reuse.",
        },
        hot: {
            human: "A smaller “-min” Playwright is running, but the Java login job does not use it.",
            tech: "The slot on port 16441 is up. The Java hot-pool job talks to Chrome on port 16440.",
        },
    },
];

export const ONE_RUN_ROWS: OneRunRow[] = [
    {
        pool: "Cold",
        cell: {
            human:
                "Ask for a browser, then the hub starts a container, then a window opens, then login runs, then everything is torn down.",
            tech:
                "POST /session, then the hub runs docker run, then New Session, then login, then DELETE session, then docker rm.",
        },
    },
    {
        pool: "Warm",
        cell: {
            human:
                "Claim a warm Chrome, then the hub opens a new blank window, then login runs, then the window closes, then the slot is marked free.",
            tech:
                "POST /pool/reserve with loopback:true, then the hub sends New Session to 127.0.0.1:14441, then about:blank, then login, then quit, then release. The container stays up.",
        },
    },
    {
        pool: "Hot",
        cell: {
            human:
                "Mark the slot busy, then tell the running Java process to log in on the Chrome that is already open, then clear the lock.",
            tech:
                "POST /pool/lease, then ensure.sh reuses the daemon on :17890, then POST /run, then login, then release without killSession or quit. Docker DNS hot-chrome-min-1:4444/, not 127.0.0.1:16440.",
        },
    },
];

export function comparisonDual(label: string, pool: PoolId): Dual {
    const row = COMPARISON_ROWS.find((item) => item.label === label);
    return row ? row[pool] : { human: "", tech: "" };
}

export const UI_STATUS_CAPTION: Dual = {
    human: "The UI only watches hub status. It does not start a session or claim a slot.",
    tech: "GET /status. The UI is not on the login-test path.",
};

export const GLOSSARY_LINE =
    "Cold is docker run + New Session. Warm is container-reuse: New Session on a container that is already up. Hot is session-reuse: lease, bypass the hub. Not an Allure attachment.";

export const SEQUENCE_STEPS: Record<PoolId, string[]> = {
    cold: ["POST /session", "hub docker run", "New Session", "login", "DELETE", "docker rm"],
    warm: [
        "POST /pool/reserve {loopback:true}",
        "hub New Session 127.0.0.1:14441",
        "about:blank",
        "login",
        "quit",
        "release (container stays up)",
    ],
    hot: [
        "POST /pool/lease",
        "hot-chrome-min-1:4444/",
        "ensure.sh reuse daemon :17890",
        "POST /run",
        "login",
        "release without killSession / quit",
    ],
};

export const TOPOLOGY_LIVE: Record<PoolId, TopologyNodeId[]> = {
    cold: ["jenkins", "hub", "docker"],
    warm: ["jenkins", "pool", "hub", "warm"],
    hot: ["jenkins", "pool", "hot"],
};

export const TOPOLOGY_EDGES: {
    from: TopologyNodeId;
    to: TopologyNodeId;
    live: PoolId[];
    dashed?: boolean;
}[] = [
    { from: "jenkins", to: "hub", live: ["cold"] },
    { from: "jenkins", to: "pool", live: ["warm", "hot"] },
    { from: "pool", to: "hub", live: ["warm"] },
    { from: "pool", to: "hot", live: ["hot"] },
    { from: "hub", to: "warm", live: ["warm"] },
    { from: "hub", to: "docker", live: ["cold"] },
    { from: "hub", to: "ui", live: [], dashed: true },
];

export const TOPOLOGY_PATH: Record<PoolId, string> = {
    cold: "Jenkins → hub :4444 → Docker",
    warm: "Jenkins → pool :9090 → hub :4444 → warm 4/4",
    hot: "Jenkins → pool :9090 → hot 2/2 (bypass hub)",
};

export type TopologyNode = {
    id: TopologyNodeId;
    title: string;
    lines: string[];
    caption: (pool: PoolId) => Dual;
};

export const TOPOLOGY_NODES: TopologyNode[] = [
    {
        id: "jenkins",
        title: "Jenkins agent / job",
        lines: [],
        caption: (pool) => comparisonDual("Java process", pool),
    },
    {
        id: "pool",
        title: "pool :9090",
        lines: [],
        caption: (pool) => comparisonDual("Reserving a slot", pool),
    },
    {
        id: "hub",
        title: "hub :4444",
        lines: [],
        caption: (pool) => comparisonDual("How the test reaches Chrome", pool),
    },
    {
        id: "ui",
        title: "UI",
        lines: ["watches /status"],
        caption: () => UI_STATUS_CAPTION,
    },
    {
        id: "hot",
        title: "hot 2/2",
        lines: ["WD 16440 :149-min", "PW 16441 1.61.1-min"],
        caption: () => comparisonDual("Browsers standing by", "hot"),
    },
    {
        id: "warm",
        title: "warm 4/4",
        lines: ["WD 14441 :149 headed", "WD 14442 :149-min", "PW 14501 / 14502"],
        caption: () => comparisonDual("Browsers standing by", "warm"),
    },
    {
        id: "docker",
        title: "Docker",
        lines: ["cold docker run"],
        caption: () => comparisonDual("Container", "cold"),
    },
];

export const WALL_LAYER_LABELS: Record<WallLayerId, string> = {
    "docker-run": "docker run",
    "new-session": "New Session",
    gradle: "Gradle test-worker",
    login: "login in Chrome",
    "jenkins-shell": "Jenkins / shell",
};

export type WallSlice = {
    id: WallLayerId;
    seconds?: number;
    pin?: string;
};

export const WALL_BY_POOL: Record<
    PoolId,
    { totalLabel: string; pin?: string; totalSeconds: number; layers: WallSlice[] }
> = {
    cold: {
        totalLabel: "~9.4s",
        totalSeconds: 9.4,
        layers: [{ id: "docker-run" }, { id: "new-session" }, { id: "gradle" }, { id: "login" }],
    },
    warm: {
        totalLabel: "4.216s",
        pin: "#14",
        totalSeconds: 4.216,
        layers: [{ id: "new-session" }, { id: "gradle", seconds: 3, pin: "~3s" }, { id: "login" }],
    },
    hot: {
        totalLabel: "0.9s",
        pin: "#80",
        totalSeconds: 0.9,
        layers: [
            { id: "login", seconds: 0.678, pin: "~0.7s /run" },
            { id: "jenkins-shell", seconds: 0.283, pin: "~0.3s pipeline/shell" },
        ],
    },
};

export function topologyIsLive(pool: PoolId, node: TopologyNodeId): boolean {
    return TOPOLOGY_LIVE[pool].includes(node);
}

export function wallLayerFlex(pool: PoolId, layer: WallSlice): number {
    const stack = WALL_BY_POOL[pool];
    if (layer.seconds != null) {
        return layer.seconds;
    }
    const known = stack.layers.reduce((sum, item) => sum + (item.seconds ?? 0), 0);
    const unknown = stack.layers.filter((item) => item.seconds == null).length;
    if (unknown === 0) {
        return 1;
    }
    return Math.max(stack.totalSeconds - known, 0.4 * unknown) / unknown;
}
