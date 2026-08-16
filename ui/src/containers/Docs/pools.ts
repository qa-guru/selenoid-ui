export type Dual = {
    human: string;
    tech: string;
};

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

export const POOL_STATS: { value: string; label: string; tone?: "success" }[] = [
    { value: "~9.4 s", label: "Cold — new browser every run" },
    { value: "~4.2 s", label: "Warm — container ready, new session" },
    { value: "~2.2 s", label: "Hot — JVM and Chrome already running", tone: "success" },
];

export const COMPARISON_HEADERS = ["", "Cold", "Warm · 4 slots", "Hot · 2 slots"] as const;

export const COMPARISON_ROWS: ComparisonRow[] = [
    {
        label: "Why it exists",
        cold: {
            human: "Default Selenoid path. Use it when you do not need a warm browser.",
            tech: "browsers.json catalog. Fallback when warm/hot slots are idle or unused.",
        },
        warm: {
            human: "Faster CI: skip docker run on every test.",
            tech: "Containers already running. Gradle ~3 s; leave this path as-is.",
        },
        hot: {
            human: "Fastest run: Java and Chrome do not start again.",
            tech: "Separate Jenkins job. Do not fold into the warm hub-attach job.",
        },
    },
    {
        label: "Browsers standing by",
        cold: {
            human: "None. A browser appears only when the test asks for a session.",
            tech: "0 warm slots. Hub docker run on POST /session.",
        },
        warm: {
            human: "Four: two Chrome, two Playwright — full image and -min.",
            tech: "Chrome 149 :14441 and 149-min :14442. Playwright 1.61.1 :14501 and 1.61.1-min :14502.",
        },
        hot: {
            human: "Two -min browsers: one Chrome, one Playwright.",
            tech: "-min only. Chrome 149-min :16440. Playwright 1.61.1-min :16441.",
        },
    },
    {
        label: "Container",
        cold: {
            human: "A new container per test, then it is removed.",
            tech: "docker run per session, then rm.",
        },
        warm: {
            human: "The container is already up. The driver waits for “open a session”.",
            tech: "Container up. ChromeDriver listens for New Session.",
        },
        hot: {
            human: "The container is up, and the window is not closed between runs.",
            tech: "Container up. Session and page survive across Jenkins builds.",
        },
    },
    {
        label: "Browser session",
        cold: {
            human: "Always a new window in a new container.",
            tech: "New Session + new container.",
        },
        warm: {
            human: "New window, but in an already running Chrome. Starts on a blank page.",
            tech: "New Session → about:blank. A preopened /login is gone by the time Gradle finishes.",
        },
        hot: {
            human: "The same window as the previous build. No extra blank tab.",
            tech: "One WebDriver session in the daemon JVM. skipBlankOpen. quit() is off the test path.",
        },
    },
    {
        label: "How the test reaches Chrome",
        cold: {
            human: "Through the Selenoid hub, like any ordinary test.",
            tech: "Test → hub POST /session. Playwright via the hub WebSocket.",
        },
        warm: {
            human: "Also through the hub, but the hub points at a warm Chrome instead of docker run.",
            tech: "Test → hub :4444 → 127.0.0.1:14441. Chrome WD only. Hub Playwright is still cold.",
        },
        hot: {
            human: "The hub is skipped. The Jenkins agent talks to Chrome by container DNS.",
            tech: "http://hot-chrome-min-1:4444/ on network selenoid-warm. box2 cannot use 127.0.0.1:16440.",
        },
    },
    {
        label: "Reserve",
        cold: {
            human: "No slot queue. The hub picks a container itself.",
            tech: "Pool orchestrator is not involved. Hub does docker run.",
        },
        warm: {
            human: "Claim a warm Chrome and ask the hub to open a new window in it.",
            tech: "POST /pool/reserve loopback:true — hub New Session on the slot.",
        },
        hot: {
            human: "Mark the slot busy. Do not open a window — it is already there.",
            tech: "POST /pool/reserve loopback:false — lock only, no New Session.",
        },
    },
    {
        label: "Release",
        cold: {
            human: "By then the browser is gone — the container died with the test.",
            tech: "Session closed, container removed.",
        },
        warm: {
            human: "The slot is free. The container stays; the window is closed. Next run opens a new one.",
            tech: "POST /pool/release. Next build does New Session again.",
        },
        hot: {
            human: "Clear the busy mark. Chrome and Java keep running.",
            tech: "POST /pool/release. No quit(). Daemon and session stay.",
        },
    },
    {
        label: "Login page between tests",
        cold: {
            human: "Not kept. There is no container to hold it.",
            tech: "No idle /login.",
        },
        warm: {
            human: "Do not leave login open “just in case”. Warm slots are not for that.",
            tech: "Idle /login on warm is forbidden.",
        },
        hot: {
            human: "The window stays alive, but it is not left on login unattended. Sessions are wiped only if the daemon restarts.",
            tech: "Keep-alive session. Wipe ChromeDriver sessions on daemon restart.",
        },
    },
    {
        label: "Login-test duration",
        cold: {
            human: "About 9 seconds.",
            tech: "java cold-pool · 9.4 s",
        },
        warm: {
            human: "About 4 seconds.",
            tech: "java warm-pool · 4.2 s",
        },
        hot: {
            human: "About 2 seconds when Java and Chrome are already warm.",
            tech: "java hot-pool · 2.1–2.2 s",
        },
    },
    {
        label: "Where the time goes",
        cold: {
            human: "Start a container, open Chrome, start Java, run login.",
            tech: "docker run + New Session + Gradle test-worker + login.",
        },
        warm: {
            human: "Claim the slot, open a new window, run Gradle, log in. Code is not fetched again on a manual run.",
            tech: "reserve + New Session + Gradle test ~3 s + login. Checkout skipped on Build Now.",
        },
        hot: {
            human: "Most of the wall is Jenkins overhead. The login in Chrome is about half a second.",
            tech: "reserve + ensure reuse + POST /run ~600 ms + release. ~1.5 s is pipeline/shell, not the browser. Git lives in a sync job.",
        },
    },
    {
        label: "Java process",
        cold: {
            human: "Every build starts Java from scratch.",
            tech: "New Gradle test-worker.",
        },
        warm: {
            human: "Gradle is warm, but the test still runs in a new process.",
            tech: "Gradle daemon + configuration-cache. New test-worker per build.",
        },
        hot: {
            human: "A Java daemon stays on the agent. The build only tells it to run login.",
            tech: "HotJunitDaemon on 127.0.0.1:17890. Not a test-worker. Restart if test classes change.",
        },
    },
    {
        label: "Where test code comes from",
        cold: {
            human: "A git push checks out fresh code. A manual run usually reuses what is already on the agent.",
            tech: "Checkout unless the run was started by a user.",
        },
        warm: {
            human: "Same: a manual run does not clone if the tests are already on disk.",
            tech: "Checkout skipped on Build Now when the workspace exists.",
        },
        hot: {
            human: "The test job does not touch git. A separate sync job updates the tree. No code → the test fails with a hint.",
            tech: "No ls-remote / fetch / checkout. Missing gradlew → “run the sync job first”.",
        },
    },
    {
        label: "Close the browser after the test",
        cold: {
            human: "Yes. The container goes with it.",
            tech: "quit() after the test. Container rm.",
        },
        warm: {
            human: "Yes, the window closes. The container waits for the next run.",
            tech: "closeBrowserAfterEach defaults to true. Slot up, no session.",
        },
        hot: {
            human: "No. The window is left open for the next build on purpose.",
            tech: "closeBrowserAfterEach/All = false. Same Selenide thread.",
        },
    },
    {
        label: "Playwright",
        cold: {
            human: "Ordinary hub path, like any cold browser.",
            tech: "Hub POST /session → playwright-chromium 1.61.1.",
        },
        warm: {
            human: "Playwright containers are up, but the hub does not attach to them — that stays cold.",
            tech: "Slots :14501/:14502 up. No Playwright hub-attach.",
        },
        hot: {
            human: "A -min Playwright is up; the Java login job does not use it.",
            tech: "Slot :16441 up. Java hot-pool talks to Chrome :16440.",
        },
    },
];

export const ONE_RUN_ROWS: OneRunRow[] = [
    {
        pool: "Cold",
        cell: {
            human: "Ask for a browser → hub starts a container → open a window → log in → tear it all down.",
            tech: "hub → docker run chrome → New Session → login → DELETE session → rm container",
        },
    },
    {
        pool: "Warm",
        cell: {
            human: "Claim a warm Chrome → hub opens a new blank window → log in → close the window → free the slot.",
            tech: "reserve loopback → hub POST /session on :14441 → about:blank → login → quit → release",
        },
    },
    {
        pool: "Hot",
        cell: {
            human: "Mark the slot busy → tell the running Java to log in on the Chrome that is already open → clear the lock.",
            tech: "reserve (lock) → POST :17890/run → Chrome :16440 → login → release. Chrome does not quit.",
        },
    },
];
