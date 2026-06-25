# Release v2.0.0 — qa-guru/selenoid-ui

**Дата:** 25 июня 2026  
**База:** форк [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.0.0

Первый публичный релиз UI для [qa-guru/selenoid](https://github.com/qa-guru/selenoid) v2.0.0 с поддержкой **Playwright-сессий**.

---

## Кратко

| | |
|---|---|
| **WebDriver UI** | Capabilities, VNC, логи — как в upstream |
| **Playwright UI** | Сниппеты WS, Create Session, прокси `/playwright/` |
| **browsers.json** | Флаг `-browsers-conf` для различения WebDriver / Playwright |
| **Docker Hub** | `qaguru/selenoid-ui:v2.0.0`, `qaguru/selenoid-ui:latest-release` |
| **Бинарники** | `selenoid-ui_linux_amd64`, `selenoid-ui_darwin_arm64`, … |

---

## Новое в v2.0.0

### Capabilities — Playwright

- Определение протокола по `browsers.json` (`protocol: playwright`)
- Браузеры: `chromium`, `webkit`, `firefox-playwright`
- Готовые сниппеты: Java, C#, Python, JavaScript, TypeScript, Ruby
- Кнопка **Create Session** открывает WebSocket-прокси и переходит на экран сессии (SSE `/events`)

### Backend

- Загрузка локального `browsers.json` (`-browsers-conf`) для отображения протоколов на странице Capabilities
- Прокси Playwright: путь `/playwright/` → hub `ws://selenoid:4444/playwright/…`
- Утилита `playwrightSessions` для удержания WS при переходе в UI сессии

### CI / релиз

- Node.js 18 в release workflow (сборка React UI)
- Docker-образ **`qaguru/selenoid-ui`**
- Quay.io — опционально (без secrets шаг пропускается)

---

## Установка

### Бинарник

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.0.0/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

### Docker (рядом с hub)

```bash
docker run -d --name selenoid-ui --network selenoid --restart unless-stopped \
  -p 8080:8080 \
  -v ~/.aerokube/selenoid:/etc/selenoid:ro \
  qaguru/selenoid-ui:v2.0.0 \
  -listen :8080 \
  -selenoid-uri http://selenoid:4444 \
  -browsers-conf /etc/selenoid/browsers.json
```

### Через cm

```bash
cm selenoid-ui start -v v2.0.0
```

Открыть: http://localhost:8080/#/capabilities

---

## Миграция с aerokube/selenoid-ui

1. Использовать в паре с **qa-guru/selenoid** v2.0.0 (stock aerokube hub не знает `/playwright/`).
2. Передать тот же `browsers.json`, что у hub (`-browsers-conf`).
3. Для Playwright за reverse proxy — проксировать и `/playwright/` на hub (см. nginx-сниппет в монорепо).

---

## Связанные релизы

- [qa-guru/selenoid v2.0.0](https://github.com/qa-guru/selenoid/releases/tag/v2.0.0) — hub с Playwright
- [qa-guru/playwright-image](https://github.com/qa-guru/playwright-image) — browser node
