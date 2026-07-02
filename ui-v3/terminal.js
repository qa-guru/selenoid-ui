/**
 * xterm log viewer for session page.
 * Loads xterm from esm.sh — no bundler required (one-page-form style).
 */

let xtermModulePromise;
let fitModulePromise;

function loadXterm() {
  if (!xtermModulePromise) {
    xtermModulePromise = import("https://esm.sh/xterm@5.3.0").then((mod) => mod.Terminal);
  }
  return xtermModulePromise;
}

function loadFitAddon() {
  if (!fitModulePromise) {
    fitModulePromise = import("https://esm.sh/xterm-addon-fit@0.8.0").then((mod) => mod.FitAddon);
  }
  return fitModulePromise;
}

function wsUrl(sessionId) {
  const secure = window.location.protocol === "https:";
  const protocol = secure ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/logs/${sessionId}`;
}

export async function mountTerminal(container, { sessionId }) {
  if (!container || !sessionId) return () => {};

  container.innerHTML = `<div class="term-host" id="term-host"></div>`;

  const host = container.querySelector("#term-host");
  let terminal = null;
  let fitAddon = null;
  let socket = null;
  let resizeTimer = null;
  let disposed = false;

  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => fitAddon?.fit(), 100);
  };

  try {
    const Terminal = await loadXterm();
    const FitAddon = await loadFitAddon();
    if (disposed) return () => {};

    terminal = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      fontSize: 13,
      lineHeight: 1.2,
      theme: { background: "#151515" },
    });
    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(host);
    fitAddon.fit();
    terminal.writeln("Initialize...\r\n");

    const url = wsUrl(sessionId);
    terminal.writeln(`Connecting to ${url}...\r\n`);

    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";
    const decoder = new TextDecoder("utf8");

    socket.onopen = () => terminal.writeln("Connected!\r\n");
    socket.onmessage = (event) => {
      terminal.write(`${decoder.decode(event.data)}\r`);
    };
    socket.onclose = () => terminal.writeln("\r\nDisconnected\r\n");
    socket.onerror = () => terminal.writeln("\r\nConnection error\r\n");

    window.addEventListener("resize", onResize);
  } catch (err) {
    console.error("[terminal] init failed", err);
    host.innerHTML = `<p class="panel-note">Log viewer unavailable: ${err.message}</p>`;
  }

  return () => {
    disposed = true;
    window.removeEventListener("resize", onResize);
    window.clearTimeout(resizeTimer);
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    terminal?.dispose();
    container.innerHTML = "";
  };
}
