/**
 * Selenoid UI v2 — vanilla JS shell.
 * SSE with exponential backoff + /status fallback polling.
 * SSE indicator uses last-message age (not raw onerror) to avoid flicker.
 * Does not reset selenoid status on transient SSE errors.
 */

import { mountCapabilities, updateCapabilities } from "./capabilities.js";
import { mountHeader } from "./header.js";
import { mountVnc } from "./vnc.js";
import { mountTerminal } from "./terminal.js";
import { releasePlaywrightSocket } from "./playwright-sessions.js";

const MOCK_MODE = new URLSearchParams(window.location.search).has("mock");
const FALLBACK_POLL_MS = 4_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
// Backend ticks every ~4s (-period); allow one missed tick before STALE.
const SSE_OK_MS = 4_000;
const SSE_STALE_MS = 16_000;
const SSE_WATCHDOG_MS = 2_000;

const ui = {
  data: null,
  sse: "unknown",
  selenoid: "unknown",
  lastUpdate: null,
  query: "",
  route: parseRoute(),
};

let eventSource = null;
let reconnectTimer = null;
let reconnectAttempt = 0;
let fallbackTimer = null;
let sseWatchdogTimer = null;
let lastSseAt = null;
let mockTimer = null;
let unmountCapabilities = null;
let unmountVnc = null;
let unmountTerminal = null;
let activeSessionId = null;
let header = null;

const els = {
  versionLabel: document.getElementById("version-label"),
  lastUpdateLabel: document.getElementById("last-update-label"),
  browserGrid: document.getElementById("browser-grid"),
  sessionsGrid: document.getElementById("sessions-grid"),
  sessionsEmpty: document.getElementById("sessions-empty"),
  videoList: document.getElementById("video-list"),
  videosEmpty: document.getElementById("videos-empty"),
  sessionTitle: document.getElementById("session-title"),
  sessionDetails: document.getElementById("session-details"),
  sessionInteractive: document.getElementById("session-interactive"),
  sessionViewer: document.getElementById("session-viewer"),
  sessionLog: document.getElementById("session-log"),
  sessionNoVnc: document.getElementById("session-no-vnc"),
  capabilitiesRoot: document.getElementById("capabilities-root"),
  navVideos: document.querySelector(".nav-link-videos"),
  panels: {
    stats: document.getElementById("panel-stats"),
    sessions: document.getElementById("panel-sessions"),
    capabilities: document.getElementById("panel-capabilities"),
    videos: document.getElementById("panel-videos"),
    session: document.getElementById("panel-session"),
  },
};

init();

function init() {
  header = mountHeader(document.getElementById("app-header"), {
    onFilterChange: (query) => {
      ui.query = query;
      renderSessions();
    },
    onFilterClear: () => {
      ui.query = "";
      renderSessions();
    },
  });

  bindEvents();
  mountCapabilitiesPanel();
  renderRoute();
  renderAll();

  if (MOCK_MODE) {
    startMockFeed();
    return;
  }

  loadStatus();
  connectSSE();
  startSseWatchdog();
  fallbackTimer = window.setInterval(loadStatus, FALLBACK_POLL_MS);
}

function markSseActivity() {
  lastSseAt = Date.now();
  ui.sse = "ok";
}

function refreshSseStatus() {
  if (lastSseAt == null) {
    ui.sse = ui.data ? "stale" : "unknown";
    return;
  }

  const age = Date.now() - lastSseAt;
  if (age <= SSE_OK_MS) {
    ui.sse = "ok";
  } else if (age <= SSE_STALE_MS) {
    ui.sse = "stale";
  } else {
    ui.sse = ui.data ? "stale" : "error";
  }
}

function startSseWatchdog() {
  clearInterval(sseWatchdogTimer);
  sseWatchdogTimer = window.setInterval(() => {
    const prev = ui.sse;
    refreshSseStatus();
    if (prev !== ui.sse) {
      renderStatusMetrics();
    }
    renderFooter();
  }, SSE_WATCHDOG_MS);
}

function mountCapabilitiesPanel() {
  if (!els.capabilitiesRoot) return;

  unmountCapabilities?.();
  unmountCapabilities = mountCapabilities(els.capabilitiesRoot, capabilitiesContext());
}

function capabilitiesContext() {
  return {
    stateBrowsers: ui.data?.state?.browsers || {},
    browserProtocols: ui.data?.browserProtocols || {},
    sessions: ui.data?.sessions || {},
    origin: ui.data?.origin,
    mockMode: MOCK_MODE,
    onNavigate: (hash) => {
      window.location.hash = hash.replace(/^#/, "");
    },
  };
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    const prevRoute = ui.route.name;
    ui.route = parseRoute();
    if (ui.route.name === "capabilities" && prevRoute !== "capabilities") {
      window.scrollTo(0, 0);
    }
    renderRoute();
    renderAll();
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      ui.query = "";
      header?.clearFilter();
    });
  });
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const sessionMatch = hash.match(/^\/sessions\/([^/]+)/);
  if (sessionMatch) {
    return { name: "session", sessionId: decodeURIComponent(sessionMatch[1]) };
  }
  if (hash.startsWith("/capabilities")) return { name: "capabilities" };
  if (hash.startsWith("/videos")) return { name: "videos" };
  return { name: "home" };
}

function isUiStatusPayload(payload) {
  return Boolean(payload && typeof payload === "object" && payload.state);
}

function applyPayload(payload) {
  if (!payload || typeof payload !== "object") return;

  ui.data = payload;
  ui.lastUpdate = Date.now();

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    ui.selenoid = "error";
  } else if (payload.state) {
    ui.selenoid = "ok";
  }

  if (payload.version) {
    els.versionLabel.textContent = payload.version;
  }
}

async function loadStatus() {
  try {
    const response = await fetch("/status", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    // Prod nginx may expose raw hub /status (no .state wrapper) for monitoring;
    // ignore it so fallback poll does not overwrite SSE/UI-shaped data.
    if (!isUiStatusPayload(payload)) {
      return;
    }
    applyPayload(payload);
    renderAll();
  } catch (err) {
    console.error("[status] fetch failed", err);
    if (!ui.data) {
      ui.selenoid = "error";
      renderStatusMetrics();
    }
  }
}

function connectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  eventSource = new EventSource("/events");

  eventSource.onopen = () => {
    reconnectAttempt = 0;
    markSseActivity();
    renderStatusMetrics();
  };

  eventSource.onmessage = (event) => {
    markSseActivity();
    try {
      const payload = JSON.parse(event.data);
      applyPayload(payload);
      renderAll();
    } catch (err) {
      console.error("[sse] parse error", err);
    }
  };

  eventSource.onerror = () => {
    // Transient EventSource errors are common between backend ticks — keep
    // showing CONNECTED while lastSseAt is fresh; watchdog updates STALE later.
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    const delay = Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempt, RECONNECT_MAX_MS);
    reconnectAttempt += 1;

    clearTimeout(reconnectTimer);
    reconnectTimer = window.setTimeout(connectSSE, delay);
  };
}

async function startMockFeed() {
  ui.sse = "ok";
  ui.selenoid = "ok";

  const response = await fetch("./mock-data.json");
  const payload = await response.json();
  applyPayload(payload);
  renderAll();

  mockTimer = window.setInterval(() => {
    renderAll();
  }, 5000);
}

function renderAll() {
  renderStatusMetrics();
  renderFooter();
  renderNav();
  renderBrowsers();
  renderSessions();
  renderVideos();
  renderSessionDetail();
  if (ui.route.name === "capabilities") {
    updateCapabilities(els.capabilitiesRoot, capabilitiesContext());
  }
}

function renderRoute() {
  Object.values(els.panels).forEach((panel) => {
    panel.hidden = true;
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    const route = link.getAttribute("data-route");
    const active =
      (ui.route.name === "home" && route === "/") ||
      (ui.route.name === "capabilities" && route === "/capabilities") ||
      (ui.route.name === "videos" && route === "/videos");
    link.classList.toggle("active", active);
  });

  header?.setFilterVisible(ui.route.name === "home");

  switch (ui.route.name) {
    case "capabilities":
      els.panels.capabilities.hidden = false;
      break;
    case "videos":
      els.panels.videos.hidden = false;
      break;
    case "session":
      els.panels.session.hidden = false;
      break;
    default:
      els.panels.stats.hidden = false;
      els.panels.sessions.hidden = false;
      break;
  }
}

function renderStatusMetrics() {
  header?.update({
    sse: ui.sse,
    selenoid: ui.selenoid,
    state: ui.data?.state || {},
  });
}

function renderFooter() {
  if (!ui.lastUpdate) {
    els.lastUpdateLabel.textContent = "Waiting for data…";
    return;
  }
  const ago = Math.round((Date.now() - ui.lastUpdate) / 1000);
  els.lastUpdateLabel.textContent = `Updated ${ago}s ago`;
}

function renderNav() {
  const videos = ui.data?.state?.videos || [];
  const hasVideos = videos.length > 0;
  if (els.navVideos) {
    els.navVideos.hidden = !hasVideos;
  }
}

function renderBrowsers() {
  const browsers = ui.data?.browsers || {};
  const totalUsed = ui.data?.state?.used ?? 0;
  const entries = Object.keys(browsers)
    .sort((a, b) => browsers[b] - browsers[a])
    .map((name) => ({ name, used: browsers[name] }));

  els.browserGrid.innerHTML = entries
    .map(({ name, used }) => {
      const perc = totalUsed > 0 ? Math.round((used / totalUsed) * 100) : 0;
      const color = browserBarColor(perc);
      return `
        <article class="browser-card">
          <div class="percent">${perc}%</div>
          <div class="count">${used} sessions</div>
          <div class="name">${escapeHtml(name)}</div>
          <div class="usage-bar" style="width:${perc}%;border-bottom-color:${color}"></div>
        </article>
      `;
    })
    .join("");
}

function renderSessions() {
  if (ui.route.name !== "home") return;

  const sessions = ui.data?.sessions || {};
  const ids = Object.keys(sessions)
    .filter((id) => matchesQuery(id, sessions[id]))
    .sort((a, b) => {
      const aManual = sessions[a]?.caps?.labels?.manual ? -1 : 0;
      const bManual = sessions[b]?.caps?.labels?.manual ? -1 : 0;
      return aManual - bManual;
    });

  els.sessionsGrid.innerHTML = ids.map((id) => sessionCardHtml(id, sessions[id])).join("");
  els.sessionsEmpty.hidden = ids.length > 0;
}

function renderVideos() {
  const videos = ui.data?.state?.videos || [];
  els.videoList.innerHTML = videos
    .map((file) => `<li><a href="/video/${encodeURIComponent(file)}" target="_blank" rel="noopener">${escapeHtml(file)}</a></li>`)
    .join("");
  els.videosEmpty.hidden = videos.length > 0;
}

function renderSessionDetail() {
  if (ui.route.name !== "session") {
    teardownSessionViewers();
    return;
  }

  const session = ui.data?.sessions?.[ui.route.sessionId];
  if (!session) {
    teardownSessionViewers();
    els.sessionTitle.textContent = "Session not found";
    els.sessionDetails.innerHTML = "";
    els.sessionInteractive.hidden = true;
    els.sessionNoVnc.hidden = true;
    return;
  }

  const { caps = {}, quota = "—" } = session;
  const shortId = shortSessionId(ui.route.sessionId);

  els.sessionTitle.textContent = `${caps.browserName || "session"} · ${shortId}`;

  const rows = [
    ["Session ID", ui.route.sessionId],
    ["Quota", quota],
    ["Browser", caps.browserName || "—"],
    ["Version", caps.version || "—"],
    ["Test name", caps.name || "—"],
    ["Resolution", caps.screenResolution || "—"],
    ["VNC", caps.enableVNC ? "enabled" : "disabled"],
    ["Timezone", caps.timeZone || "—"],
  ];

  els.sessionDetails.innerHTML = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd>`)
    .join("");

  mountSessionViewers(ui.route.sessionId, caps);
}

function teardownSessionViewers() {
  if (activeSessionId) {
    releasePlaywrightSocket(activeSessionId);
  }
  activeSessionId = null;
  unmountVnc?.();
  unmountTerminal?.();
  unmountVnc = null;
  unmountTerminal = null;
}

async function mountSessionViewers(sessionId, caps) {
  if (activeSessionId === sessionId) return;

  teardownSessionViewers();
  activeSessionId = sessionId;

  const vncEnabled = caps.enableVNC !== false && caps.enableVNC !== "false";
  els.sessionNoVnc.hidden = vncEnabled;
  els.sessionInteractive.hidden = !vncEnabled;

  if (!vncEnabled) return;

  unmountVnc = await mountVnc(els.sessionViewer, { sessionId });
  unmountTerminal = await mountTerminal(els.sessionLog, { sessionId });
}

function sessionCardHtml(id, session) {
  const { caps = {}, quota = "—" } = session;
  const isManual = caps.labels?.manual;
  const shortId = shortSessionId(id);
  const tags = [];

  if (isManual) tags.push('<span class="tag tag-manual">Manual</span>');
  if (caps.enableVNC) tags.push('<span class="tag">VNC</span>');
  if (caps.screenResolution) tags.push(`<span class="tag">${escapeHtml(caps.screenResolution)}</span>`);

  return `
    <a class="session-card${isManual ? " manual" : ""}" href="#/sessions/${encodeURIComponent(id)}">
      <div class="session-id"><span>${escapeHtml(quota)}</span> / <strong>${escapeHtml(shortId)}</strong></div>
      <div class="session-browser">
        <span class="name">${escapeHtml(caps.browserName || "unknown")}</span>
        ${caps.version ? `<span class="version">${escapeHtml(caps.version)}</span>` : ""}
      </div>
      ${caps.name ? `<div class="session-name" title="${escapeHtml(caps.name)}">${escapeHtml(caps.name)}</div>` : ""}
      ${tags.length ? `<div class="session-tags">${tags.join("")}</div>` : ""}
    </a>
  `;
}

function matchesQuery(id, session) {
  const q = ui.query.toLowerCase();
  if (!q) return true;

  if (id.toLowerCase().includes(q)) return true;

  const caps = session?.caps || {};
  if (caps.name && caps.name.toLowerCase().includes(q)) return true;
  if (caps.browserName && caps.browserName.toLowerCase().includes(q)) return true;

  return false;
}

function shortSessionId(id) {
  const dash = id.indexOf("-");
  return dash === -1 ? id.slice(0, 8) : id.slice(0, dash);
}

function browserBarColor(percent) {
  const pct = Math.min(100, Math.max(0, percent)) / 100;
  const stops = [
    { pct: 0, r: 0x41, g: 0x59, b: 0xd3 },
    { pct: 0.5, r: 0x66, g: 0x9d, b: 0x9e },
    { pct: 1, r: 0xe8, g: 0x78, b: 0x6f },
  ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 1; i < stops.length; i += 1) {
    if (pct <= stops[i].pct) {
      lower = stops[i - 1];
      upper = stops[i];
      break;
    }
  }

  const range = upper.pct - lower.pct || 1;
  const t = (pct - lower.pct) / range;
  const r = Math.round(lower.r + (upper.r - lower.r) * t);
  const g = Math.round(lower.g + (upper.g - lower.g) * t);
  const b = Math.round(lower.b + (upper.b - lower.b) * t);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("beforeunload", () => {
  clearTimeout(reconnectTimer);
  clearInterval(fallbackTimer);
  clearInterval(sseWatchdogTimer);
  clearInterval(mockTimer);
  if (eventSource) eventSource.close();
  unmountCapabilities?.();
  teardownSessionViewers();
});

export {};
