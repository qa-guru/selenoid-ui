# Release v2.1.6 — qa-guru/selenoid-ui

**Дата:** 7 июля 2026  
**Предыдущий:** v2.1.5  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.1.6

Stable legacy release: React UI (`ui/`) + Go backend fixes перед линией UI v2.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **SSE resilience** | React UI: immediate `/status`, poll 4s, reconnect backoff, STALE indicator |
| **WS proxy** | `-allowed-origin` на per-proxy Upgrader (`/ws/`, `/playwright/`) |
| **Go tests** | `/browsers-config`, proxy error paths, `configureWsProxy` |
| **Build** | statik из `ui/build` (React); удалены экспериментальные ui-v2/ui-v3 |
| **Docs** | README без дубля Aerokube; `browser-image`; docker-compose `qaguru/*` |

---

## Установка / обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.1.6/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
./selenoid-ui -selenoid-uri http://127.0.0.1:4444 -browsers-conf /path/to/browsers.json
```

Docker: `docker pull qaguru/selenoid-ui:v2.1.6`
