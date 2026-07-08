# Release v2.1.7 — qa-guru/selenoid-ui

**Дата:** 8 июля 2026  
**Предыдущий:** [v2.1.6](RELEASE_v2.1.6.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.1.7

Релиз **Go 1.26.5**: ethalon CI actions, blocking `govulncheck`, без функциональных изменений UI.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Go** | **1.26.5** (`go.mod`, `ci/test.sh`, `GOTOOLCHAIN`) |
| **govulncheck** | blocking в CI — GO-2026-5856 закрыт на go1.26.5 |
| **CI** | ethalon GitHub Actions (setup-go v6, checkout v6) |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.1.7/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v2.1.7`

Prod deploy: `SELENOID_UI_VERSION=v2.1.7`.
