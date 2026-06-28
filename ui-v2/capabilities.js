import { retainPlaywrightSocket } from "./playwright-sessions.js";
import {
  getSnippets,
  listBrowserOptions,
  playwrightEndpoint,
} from "./capabilities-snippets.js";

const DEFAULT_MORE_CAPS = JSON.stringify({ operaOptions: { binary: "/usr/bin/opera" } }, null, 2);

let state = {
  browserValue: "",
  lang: "curl",
  loading: false,
  error: "",
  showMoreCaps: false,
  moreCaps: DEFAULT_MORE_CAPS,
  moreCapsError: false,
};

let ctx = null;
let eventSource = null;
let lastBrowserOptionsKey = "";

export function mountCapabilities(root, context) {
  ctx = context;
  bindCapabilities(root);
  renderCapabilities(root);
  return () => {
    cleanupEventSource();
    if (copyResetTimer) {
      window.clearTimeout(copyResetTimer);
      copyResetTimer = null;
    }
    lastBrowserOptionsKey = "";
    ctx = null;
  };
}

export function updateCapabilities(root, context) {
  ctx = context;
  renderCapabilities(root, { background: true });
}

function bindCapabilities(root) {
  root.addEventListener(
    "focusout",
    (event) => {
      if (!event.target.closest(".capabilities-setup")) return;
      window.requestAnimationFrame(() => {
        if (!capabilitiesFormBusy(root)) {
          renderCapabilities(root, { background: true });
        }
      });
    },
    true
  );

  root.addEventListener("change", (event) => {
    if (event.target.id === "capabilities-browser") {
      state.browserValue = event.target.value;
      state.error = "";
    }
    if (
      event.target.id === "capabilities-browser" ||
      event.target.id === "capabilities-resolution"
    ) {
      renderCapabilities(root);
    }
  });

  root.addEventListener("click", (event) => {
    const toggleBtn = event.target.closest(".bool-toggle-btn");
    if (toggleBtn && !toggleBtn.closest(".bool-toggle.is-disabled")) {
      const toggle = toggleBtn.closest(".bool-toggle");
      if (toggle) {
        setBoolToggle(toggle, toggleBtn.dataset.value);
        renderCapabilities(root);
      }
      return;
    }

    const langBtn = event.target.closest("[data-lang]");
    if (langBtn) {
      state.lang = langBtn.dataset.lang;
      renderCapabilities(root);
      return;
    }

    if (event.target.id === "capabilities-create") {
      createSession(root);
      return;
    }

    if (event.target.id === "capabilities-more") {
      state.showMoreCaps = !state.showMoreCaps;
      renderCapabilities(root);
      return;
    }

    if (event.target.closest("#capabilities-code-copy")) {
      copyCapabilitiesCode(root);
    }
  });

  root.addEventListener("input", (event) => {
    if (event.target.id === "capabilities-more-json") {
      state.moreCaps = event.target.value;
      try {
        JSON.parse(state.moreCaps);
        state.moreCapsError = false;
      } catch {
        state.moreCapsError = true;
      }
      event.target.classList.toggle("is-invalid", state.moreCapsError);
      if (!state.moreCapsError) {
        renderCapabilities(root);
      }
      return;
    }

    if (
      event.target.id === "capabilities-name" ||
      event.target.id === "capabilities-token"
    ) {
      renderCapabilities(root);
    }
  });
}

function readAdditionalCaps() {
  if (!state.showMoreCaps || state.moreCapsError || !state.moreCaps) {
    return null;
  }
  try {
    return JSON.parse(state.moreCaps);
  } catch {
    return null;
  }
}

function selectedBrowser() {
  const options = listBrowserOptions(ctx?.stateBrowsers, ctx?.browserProtocols);
  return options.find((item) => item.value === state.browserValue) || options[0] || null;
}

function browserOptionsKey(options) {
  return options.map((item) => item.value).join("|");
}

function capabilitiesFormBusy(root) {
  const setup = root?.querySelector(".capabilities-setup");
  const active = document.activeElement;
  if (!setup || !active || !setup.contains(active)) return false;
  const tag = active.tagName;
  return tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA";
}

function syncBrowserSelect(select, options) {
  const optionsKey = browserOptionsKey(options);
  const nextDisabled = !options.length || state.loading;

  if (!options.length) {
    if (optionsKey !== lastBrowserOptionsKey) {
      select.innerHTML = `<option value="">No browsers available</option>`;
      lastBrowserOptionsKey = optionsKey;
    }
    if (select.disabled !== nextDisabled) {
      select.disabled = nextDisabled;
    }
    return;
  }

  if (optionsKey !== lastBrowserOptionsKey) {
    select.innerHTML = options
      .map(
        (item) =>
          `<option value="${escapeAttr(item.value)}"${item.value === state.browserValue ? " selected" : ""}>${escapeHtml(item.label)}</option>`
      )
      .join("");
    lastBrowserOptionsKey = optionsKey;
  } else if (select.value !== state.browserValue) {
    select.value = state.browserValue;
  }

  if (select.disabled !== nextDisabled) {
    select.disabled = nextDisabled;
  }
}

function setFormControlDisabled(root, id, disabled) {
  const el = root.querySelector(`#${id}`);
  if (el && el.disabled !== disabled) {
    el.disabled = disabled;
  }
}

function renderCapabilities(root, { background = false } = {}) {
  if (background && capabilitiesFormBusy(root)) {
    return;
  }

  const options = listBrowserOptions(ctx?.stateBrowsers, ctx?.browserProtocols);
  if (!state.browserValue && options[0]) {
    state.browserValue = options[0].value;
  }

  const browser = selectedBrowser();
  const sessionOptions = readSessionOptions(root);
  const snippets = browser
    ? getSnippets({
        name: browser.name,
        version: browser.version,
        protocol: browser.protocol,
        origin: ctx?.origin,
        browserProtocols: ctx?.browserProtocols,
        sessionOptions,
        additionalCaps: readAdditionalCaps(),
      })
    : {};
  const langKeys = Object.keys(snippets);
  if (!langKeys.includes(state.lang)) {
    state.lang = langKeys[0] || "curl";
  }

  const select = root.querySelector("#capabilities-browser");
  if (select) {
    syncBrowserSelect(select, options);
  }

  const code = root.querySelector("#capabilities-code");
  if (code) {
    const nextCode = snippets[state.lang] || "";
    if (code.textContent !== nextCode) {
      code.textContent = nextCode;
    }
  }

  const langs = root.querySelector("#capabilities-langs");
  if (langs) {
    const langMarkup = langKeys
      .map(
        (lang) =>
          `<button type="button" class="capabilities-lang${lang === state.lang ? " active" : ""}" data-lang="${escapeAttr(lang)}" data-testid="capabilities-lang-${escapeAttr(lang)}">${escapeHtml(lang)}</button>`
      )
      .join("");
    if (langs.innerHTML !== langMarkup) {
      langs.innerHTML = langMarkup;
    }
  }

  const formDisabled = !browser || state.loading;
  for (const id of [
    "capabilities-browser",
    "capabilities-resolution",
    "capabilities-name",
    "capabilities-token",
  ]) {
    setFormControlDisabled(root, id, formDisabled);
  }

  for (const id of [
    "capabilities-enable-vnc",
    "capabilities-enable-video",
    "capabilities-enable-har",
    "capabilities-headless",
  ]) {
    const toggle = root.querySelector(`#${id}`);
    if (toggle) toggle.classList.toggle("is-disabled", formDisabled);
  }

  const createBtn = root.querySelector("#capabilities-create");
  if (createBtn) {
    createBtn.disabled = !browser || state.loading || ctx?.mockMode;
    createBtn.textContent = state.loading ? "Starting…" : "Create Session";
  }

  const moreBtn = root.querySelector("#capabilities-more");
  const moreJson = root.querySelector("#capabilities-more-json");
  const isPlaywright = browser?.protocol === "playwright";

  if (moreBtn) {
    moreBtn.hidden = !browser || state.loading || isPlaywright;
    moreBtn.textContent = state.showMoreCaps ? "Hide capabilities" : "More capabilities";
  }

  if (moreJson) {
    moreJson.hidden = !state.showMoreCaps || isPlaywright;
    if (moreJson.value !== state.moreCaps) {
      moreJson.value = state.moreCaps;
    }
    moreJson.classList.toggle("is-invalid", state.moreCapsError);
  }

  const errorEl = root.querySelector("#capabilities-error");
  if (errorEl) {
    const message = ctx?.mockMode
      ? "Mock mode: Create Session needs selenoid-ui backend (open without ?mock=1)."
      : state.error;
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
    errorEl.classList.toggle("capabilities-hint", Boolean(ctx?.mockMode && !state.error));
  }
}

async function primeBasicAuth() {
  await fetch("/wd/hub/status", { method: "GET", credentials: "include" });
}

function sessionIdFrom(payload) {
  return payload.sessionId || payload.value?.sessionId || "";
}

function findPlaywrightSession(sessions, existingIds, name, version, sessionName) {
  for (const [id, session] of Object.entries(sessions || {})) {
    if (existingIds.has(id)) continue;
    const caps = session.caps || {};
    if (caps.browserName !== name) continue;
    if (caps.version && caps.version !== version) continue;
    if (sessionName && caps.name && caps.name !== sessionName) continue;
    return id;
  }
  return "";
}

function readSessionOptions(root) {
  const get = (id) => root.querySelector(`#${id}`);
  const bool = (id) => get(id)?.dataset.value === "true";
  const name = get("capabilities-name")?.value?.trim() || "Manual run from ui";
  const token = get("capabilities-token")?.value?.trim();

  const options = {
    enableVNC: bool("capabilities-enable-vnc"),
    enableVideo: bool("capabilities-enable-video"),
    enableHar: bool("capabilities-enable-har"),
    headless: bool("capabilities-headless"),
    screenResolution: get("capabilities-resolution")?.value || "1920x1080x24",
    name,
    sessionTimeout: "60m",
    labels: { manual: "true" },
  };

  if (token) {
    options.token = token;
  }

  return options;
}

function setBoolToggle(toggle, value) {
  toggle.dataset.value = value;
  for (const btn of toggle.querySelectorAll(".bool-toggle-btn")) {
    btn.classList.toggle("is-active", btn.dataset.value === value);
  }
}

function cleanupEventSource() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

async function createSession(root) {
  const browser = selectedBrowser();
  if (!browser || ctx?.mockMode) return;

  state.error = "";
  state.loading = true;
  renderCapabilities(root);

  try {
    if (browser.protocol === "playwright") {
      await createPlaywrightSession(browser, root);
    } else {
      await createWebDriverSession(browser, root);
    }
  } catch (err) {
    console.error("[capabilities] create session failed", err);
    state.error = err.message || "Failed to create session";
    state.loading = false;
    renderCapabilities(root);
  }
}

async function createWebDriverSession(browser, root) {
  const sessionOptions = readSessionOptions(root);
  let desiredCapabilities = {
    browserName: browser.name,
    version: browser.version,
    ...sessionOptions,
  };
  let selenoidOptions = { ...sessionOptions };

  if (state.showMoreCaps && !state.moreCapsError) {
    const additionalCaps = JSON.parse(state.moreCaps);
    desiredCapabilities = { ...desiredCapabilities, ...additionalCaps };
    selenoidOptions = { ...selenoidOptions, ...additionalCaps };
  }

  await primeBasicAuth();

  const response = await fetch("/wd/hub/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      desiredCapabilities,
      capabilities: {
        alwaysMatch: {
          browserName: browser.name,
          browserVersion: browser.version,
          "selenoid:options": selenoidOptions,
        },
        firstMatch: [{}],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const sessionId = sessionIdFrom(payload);
  if (!sessionId) {
    throw new Error("Session ID missing in response");
  }

  state.loading = false;
  ctx?.onNavigate?.(`#/sessions/${encodeURIComponent(sessionId)}`);
}

async function createPlaywrightSession(browser, root) {
  const sessionOptions = readSessionOptions(root);
  const existingIds = new Set(Object.keys(ctx?.sessions || {}));
  const wsUrl = playwrightEndpoint(browser.name, browser.version, sessionOptions);
  let navigated = false;
  let playwrightSocket = null;

  const finish = (message, closeSocket) => {
    if (closeSocket && playwrightSocket) {
      playwrightSocket.close();
      playwrightSocket = null;
    }
    cleanupEventSource();
    state.loading = false;
    if (message) {
      state.error = message;
      renderCapabilities(root);
    }
  };

  const tryNavigate = (data) => {
    if (navigated) return;
    const sessionId = findPlaywrightSession(
      data?.sessions,
      existingIds,
      browser.name,
      browser.version,
      sessionOptions.name
    );
    if (!sessionId) return;
    navigated = true;
    retainPlaywrightSocket(sessionId, playwrightSocket);
    cleanupEventSource();
    state.loading = false;
    ctx?.onNavigate?.(`#/sessions/${encodeURIComponent(sessionId)}`);
  };

  cleanupEventSource();
  eventSource = new EventSource("/events");
  eventSource.onmessage = (event) => {
    try {
      tryNavigate(JSON.parse(event.data));
    } catch (err) {
      console.error("[capabilities] SSE parse error", err);
    }
  };
  eventSource.onerror = () => {
    if (!navigated) {
      finish("Lost connection to events stream", true);
    }
  };

  tryNavigate({ sessions: ctx?.sessions });

  await primeBasicAuth();

  await new Promise((resolve, reject) => {
    playwrightSocket = new WebSocket(wsUrl);

    playwrightSocket.onopen = () => resolve();
    playwrightSocket.onerror = () => {
      if (!navigated) {
        reject(new Error("Failed to start Playwright session"));
      }
    };
    playwrightSocket.onclose = () => {
      if (!navigated) {
        reject(new Error("Playwright session closed before it was ready"));
      }
    };
  });

  const timeout = window.setTimeout(() => {
    if (!navigated) {
      finish("Timed out waiting for Playwright session", true);
    }
  }, 300_000);

  const poll = window.setInterval(() => {
    if (navigated) {
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    }
  }, 500);
}

let copyResetTimer = null;

async function copyCapabilitiesCode(root) {
  const code = root.querySelector("#capabilities-code");
  const button = root.querySelector("#capabilities-code-copy");
  if (!code?.textContent || !button) return;

  try {
    await navigator.clipboard.writeText(code.textContent);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = code.textContent;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  button.classList.add("is-copied");
  if (copyResetTimer) {
    window.clearTimeout(copyResetTimer);
  }
  copyResetTimer = window.setTimeout(() => {
    button.classList.remove("is-copied");
    copyResetTimer = null;
  }, 1500);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
