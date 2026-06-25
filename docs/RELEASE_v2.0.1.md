# Release v2.0.1 — qa-guru/selenoid-ui

**Дата:** 25 июня 2026  
**Предыдущий:** [v2.0.0](RELEASE_v2.0.0.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.0.1

Патч-релиз: выровнена версия **Go 1.23** в `go.mod` и CI. Требует **qa-guru/selenoid v2.0.1** (Docker API 1.45).

---

## Что нового

| Изменение | Было | Стало |
|-----------|------|-------|
| **Go** | 1.20 | **1.23.x** |
| **CI** (build/test) | 1.21.5 | **1.23.8** |
| **docker-compose** | — | `DOCKER_API_VERSION=1.45` для selenoid |

Функциональность Playwright UI без изменений относительно v2.0.0.

---

## Установка / обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.0.1/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui

docker pull qaguru/selenoid-ui:v2.0.1
./cm selenoid-ui start
```

Связанный релиз hub: [qa-guru/selenoid v2.0.1](https://github.com/qa-guru/selenoid/releases/tag/v2.0.1).
