# Selenoid UI v3 (vanilla JS + QA.GURU header)

Same backend as v2 (`/status`, `/events`, `/ws`, …). Header uses the shared QA.GURU shell from one-page-form plus Selenoid metrics.

## Quick start (mock, no backend)

```bash
cd ui-v3
python -m http.server 3000
```

Open [http://localhost:3000/?mock=1](http://localhost:3000/?mock=1)

Header-only preview: [header-preview.html](http://localhost:3000/header-preview.html)

## Header layout

```
[QA.GURU logo] | Selenoid 2.0 | SSE | SELENOID | USED | QUEUE | QUOTA | [filter]
```

- **Selenoid 2.0** — bold link to `#/`, no underline
- **Metrics** — same fonts/colors as v2 stats bar (`--ok`, `--muted`, green CONNECTED underline)
- **Filter** — visible on sessions panel only

## Files

| File | Purpose |
|------|---------|
| `index.html` | Shell: header mount point, nav, panels |
| `qa-guru-header.css` | QA.GURU logo + Selenoid 2.0 brand row |
| `header.js` | Header mount + metrics update API |
| `header.css` | Metrics + filter styling |
| `header-preview.html` | Standalone header sandbox |
| `app.js` | SSE reconnect, routing, session viewers |

v2 remains in `../ui-v2/` unchanged.
