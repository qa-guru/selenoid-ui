# Selenoid UI v2 (vanilla JS)

Lightweight replacement shell for the React UI. Same Go backend (`/status`, `/events`, `/ws`, …).

Static files only — no npm/webpack, same approach as [one-page-form](https://github.com/qa-guru/one-page-form).

## Quick start (mock, no backend)

```bash
cd ui-v2
python -m http.server 3000
```

Open [http://localhost:3000/?mock=1](http://localhost:3000/?mock=1)

Header-only preview (separate tab): [header-preview.html](http://localhost:3000/header-preview.html)

Mock mode loads `mock-data.json` and skips SSE/`/status` calls. Capabilities **Create Session** is disabled in mock mode; open a session card to preview the session page layout.

## With selenoid-ui backend

1. Run selenoid-ui as usual (port 8080).
2. Serve `ui-v2` through the Go binary once wired (see below), **or** temporarily replace `ui/build` contents:

```bash
cd ui-v2
cp -r . ../ui/build/
cd ..
go generate ./...
go run . -listen :8080 -selenoid-uri http://localhost:4444
```

3. Open [http://localhost:8080/](http://localhost:8080/)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Shell: header mount point, nav, panels |
| `header.js` | QA.GURU shell + stats bar: logo, filter, SSE/selenoid metrics |
| `qa-guru-header.css` | Shared QA.GURU header shell (same as one-page-form) |
| `header.css` | Metrics bar layout (filter, status indicators) |
| `header-preview.html` | Standalone header sandbox (open in separate tab) |
| `selenoid.css` | Responsive layout (mobile-friendly) |
| `app.js` | SSE reconnect, routing, session viewers |
| `capabilities.js` | Browser picker, snippets, manual session launch |
| `capabilities-snippets.js` | curl/java/go/C#/python/javascript/PHP/ruby code templates |
| `playwright-sessions.js` | Keeps Playwright WS alive until session page loads |
| `mock-data.json` | Offline demo data |
| `vnc.js` | noVNC viewer (CDN via esm.sh) |
| `terminal.js` | xterm log viewer (CDN via esm.sh) |

## Status logic (vs old React UI)

- **Immediate** `GET /status` on load — no 5s wait for first SSE tick
- **SSE reconnect** with exponential backoff (1s → 30s max)
- **SSE status** derived from last message time (CONNECTED &lt; 4s, STALE &lt; 16s)
- **Fallback poll** every 4s via `/status`
- On prolonged SSE silence: **STALE**, last data kept; selenoid status is **not** reset to UNKNOWN
- Footer shows time since last successful update

## Routing (hash)

- `#/` — stats + sessions
- `#/capabilities` — browser picker, code snippets, create session (WebDriver + Playwright)
- `#/videos` — video list (tab hidden when empty)
- `#/sessions/:id` — session detail, VNC + logs (when `enableVNC`)

## Next steps

1. Clipboard upload/download on VNC toolbar
2. Session delete button
3. Swap statik source from `ui/build` to `ui-v2` in `main.go` / CI

## Statik integration (when ready)

In `main.go`:

```go
//go:generate statik -src=./ui-v2
```

Then `go generate && go build`.
