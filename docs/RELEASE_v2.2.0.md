# Release v2.2.0 — qa-guru/selenoid-ui

**Дата:** 10 июля 2026  
**Предыдущий:** [v2.1.7](RELEASE_v2.1.7.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.2.0 *(tag при cut)*  
**Stack cut:** hub + UI + cm → единый **v2.2.0**.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **E2E selectors** | DOM ids `sse-status` / `selenoid-status` для UI e2e |
| **WS guard** | Reject plain HTTP на `/ws` и `/playwright` до dial backend |
| **CI smoke** | `workflow_call` callback chain + repository-dispatch summary |
| **browsers.json** | sync с hub catalog v2.2.0 (chrome 149 / firefox 151 / msedge 145) |
| **Go** | **1.26.5** (pin с v2.1.7) |
| **Docker API** | Engine **26.1.x** / API **1.45** в compose/docs (стек) |
| **UI console** | `highlight.js` **v11** вместо `react-highlight` / hljs v9 — убирает EOL warning в DevTools |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.2.0/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v2.2.0`

Prod deploy: `SELENOID_UI_VERSION=v2.2.0`.

Связанные: [selenoid v2.2.0](https://github.com/qa-guru/selenoid/releases/tag/v2.2.0), [cm v2.2.0](https://github.com/qa-guru/cm/releases/tag/v2.2.0).

---

## Cut checklist (ручной)

1. `git fetch --tags` (локально мог отсутствовать `v2.1.7`).
2. Commit на `main` → `git tag -a v2.2.0 -m "v2.2.0"` → push tags *(по команде)*.
3. Release assets `dist/selenoid-ui_*`; Docker `qaguru/selenoid-ui:v2.2.0`.
4. OUT: `warm-pool-orchestrator/`.
