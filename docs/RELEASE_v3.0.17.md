# Release v3.0.17 — qa-guru/selenoid-ui

**Дата:** 31 июля 2026  
**Предыдущий:** [v3.0.16](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.16)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.17  
**Stack cut:** hub → **v3.0.6**; cm → **v3.0.2**; UI → **v3.0.17**.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Kill in-place** | Delete session больше не уводит на `/`; страница остаётся на `/#/sessions/<id>`, kill-кнопка → placeholder, FINISHED без layout jump |
| **Artifact poll** | После kill опрашиваем archive: VNC → video waiting → video; live HarViewer остаётся один, без remount jump |
| **Create Session SSE wait** | `waitForLiveSession` — навигация после появления id в `/events`, без stale not-found |
| **DS public sync** | `ui/public` css/js/templates синхронизированы с design-system |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.17/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.17`

Prod deploy: `SELENOID_UI_VERSION=v3.0.17` вместе с hub **v3.0.6** / cm **v3.0.2**.

---

## Cut checklist

1. `main` green (`yarn typecheck` + `yarn test` + Session/capabilities suites).
2. `git tag -a v3.0.17 -m "v3.0.17"` → push tag → GitHub Release → `release.yml` assets + `qaguru/selenoid-ui:v3.0.17`.
3. Prod deploy pins → hub v3.0.6 + UI v3.0.17 + cm v3.0.2.
4. Smoke: `/ui/status` → `v3.0.17…`; selenoid-tests `TestUiManualHar` + kill-smooth e2e.
