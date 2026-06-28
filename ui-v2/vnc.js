/**
 * noVNC viewer for session page.
 * Loads RFB from esm.sh — no bundler required (one-page-form style).
 */

let rfbModulePromise;

function loadRfb() {
  if (!rfbModulePromise) {
    rfbModulePromise = import("https://esm.sh/@novnc/novnc@1.5.0/core/rfb.js").then((mod) => mod.default);
  }
  return rfbModulePromise;
}

function wsUrl(sessionId) {
  const secure = window.location.protocol === "https:";
  const port = window.location.port || (secure ? "443" : "80");
  const protocol = secure ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:${port}/ws/vnc/${sessionId}`;
}

export async function mountVnc(container, { sessionId, viewOnly = true, onStateChange }) {
  if (!container || !sessionId) return () => {};

  container.innerHTML = `
    <div class="vnc-shell" data-testid="vnc-shell">
      <div class="vnc-toolbar">
        <span class="vnc-status" id="vnc-status" data-testid="vnc-status">connecting</span>
        <button type="button" class="vnc-btn" id="vnc-lock" data-testid="vnc-lock" hidden>Unlock</button>
        <button type="button" class="vnc-btn" id="vnc-fullscreen" data-testid="vnc-fullscreen" hidden>Fullscreen</button>
      </div>
      <div class="vnc-screen" id="vnc-screen" data-testid="vnc-screen"></div>
    </div>
  `;

  const statusEl = container.querySelector("#vnc-status");
  const screenEl = container.querySelector("#vnc-screen");
  const lockBtn = container.querySelector("#vnc-lock");
  const fullscreenBtn = container.querySelector("#vnc-fullscreen");

  let rfb = null;
  let unlocked = false;
  let fullscreen = false;
  let disposed = false;

  const setStatus = (value) => {
    if (statusEl) statusEl.textContent = value;
    onStateChange?.(value);
    const connected = value === "connected";
    if (lockBtn) lockBtn.hidden = !connected;
    if (fullscreenBtn) fullscreenBtn.hidden = !connected;
  };

  const disconnect = () => {
    if (rfb && rfb._rfb_connection_state !== "disconnected") {
      rfb.disconnect();
    }
    rfb = null;
  };

  lockBtn?.addEventListener("click", () => {
    unlocked = !unlocked;
    if (rfb) rfb.viewOnly = !unlocked;
    lockBtn.textContent = unlocked ? "Lock" : "Unlock";
  });

  fullscreenBtn?.addEventListener("click", () => {
    fullscreen = !fullscreen;
    container.classList.toggle("vnc-fullscreen", fullscreen);
    fullscreenBtn.textContent = fullscreen ? "Exit fullscreen" : "Fullscreen";
  });

  try {
    const RFB = await loadRfb();
    if (disposed) return () => {};

    setStatus("connecting");
    rfb = new RFB(screenEl, wsUrl(sessionId), {
      credentials: { password: "selenoid" },
    });
    rfb.scaleViewport = true;
    rfb.resizeSession = true;
    rfb.viewOnly = viewOnly;

    rfb.addEventListener("connect", () => setStatus("connected"));
    rfb.addEventListener("disconnect", () => setStatus("disconnected"));
  } catch (err) {
    console.error("[vnc] init failed", err);
    screenEl.innerHTML = `<p class="panel-note">VNC unavailable: ${err.message}</p>`;
    setStatus("error");
  }

  return () => {
    disposed = true;
    disconnect();
    container.innerHTML = "";
  };
}
