# Selenoid UI (qa-guru fork)

Web-интерфейс для [qa-guru/selenoid](https://github.com/qa-guru/selenoid) — форк [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui) с поддержкой **Playwright-сессий** в Capabilities.

[![Build Status](https://github.com/qa-guru/selenoid-ui/workflows/build/badge.svg)](https://github.com/qa-guru/selenoid-ui/actions?query=workflow%3Abuild)
[![Coverage](https://codecov.io/github/qa-guru/selenoid-ui/coverage.svg)](https://codecov.io/gh/qa-guru/selenoid-ui)
[![Release](https://img.shields.io/github/release/qa-guru/selenoid-ui.svg)](https://github.com/qa-guru/selenoid-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/qaguru/selenoid-ui.svg)](https://hub.docker.com/r/qaguru/selenoid-ui)

| | |
|---|---|
| **GitHub** | [qa-guru/selenoid-ui](https://github.com/qa-guru/selenoid-ui) |
| **Docker Hub** | [`qaguru/selenoid-ui`](https://hub.docker.com/r/qaguru/selenoid-ui) |

## Роль в экосистеме

UI не заменяет hub — он **подключается к уже запущенному Selenoid** и даёт:

- список активных сессий и статус квот;
- страницу **Capabilities** с готовыми сниппетами для WebDriver и Playwright;
- VNC-просмотр браузера и логи сессии;
- прокси WebSocket `/playwright/` → hub (нужно для Create Session из браузера).

```
Браузер пользователя  ──►  selenoid-ui :8080  ──►  selenoid hub :4444  ──►  browser containers
```

## Связанные репозитории

| GitHub | Роль |
|--------|------|
| [selenoid](https://github.com/qa-guru/selenoid) | **Hub** — обязательная зависимость |
| **selenoid-ui** (этот) | Web UI (React) |
| [cm](https://github.com/qa-guru/cm) | Установщик hub + UI |
| [browser-image](https://github.com/qa-guru/browser-image) | Playwright + WebDriver browser nodes |

## Отличия от upstream

- В Capabilities отображаются **Playwright-браузеры** (`playwright-chromium`, `playwright-firefox`, …) наряду с WebDriver (`chrome`, `firefox`).
- **Create Session** для Playwright открывает WebSocket через прокси UI (`/playwright/…`), а не POST `/wd/hub/session`.
- Нужен тот же `browsers.json`, что у hub — иначе Playwright-версии в UI не совпадут с hub.
- **SSE resilience:** immediate `GET /status`, fallback poll каждые 4s, reconnect с backoff, индикатор **STALE** вместо мгновенного сброса в UNKNOWN.

Upstream docs: [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui) · [aerokube.com/selenoid-ui](https://aerokube.com/selenoid-ui/latest/)

## Сборка и запуск

Сначала поднимите hub ([qa-guru/selenoid](https://github.com/qa-guru/selenoid)). Затем соберите и запустите UI:

```bash
export NODE_OPTIONS=--openssl-legacy-provider   # Node.js 17+ для react-scripts
yarn --cwd ui install && yarn --cwd ui build
go generate .
go build -o selenoid-ui .

./selenoid-ui \
  -listen :8080 \
  -selenoid-uri http://127.0.0.1:4444 \
  -browsers-conf /path/to/browsers.json
```

Monorepo dev: `projects/selenoid-home/dev/scripts/build-selenoid-ui.sh`.

`-browsers-conf` — тот же [`config/browsers.json`](https://github.com/qa-guru/selenoid/blob/main/config/browsers.json), что у hub (в monorepo: `projects/selenoid-home/dev/browsers.json`).

Capabilities: [http://127.0.0.1:8080/#/capabilities](http://127.0.0.1:8080/#/capabilities)

- **WebDriver** (chrome, firefox): **Create Session** → POST `/wd/hub/session`
- **Playwright**: сниппеты WebSocket; **Create Session** → прокси `ws://…/playwright/{browser}/{version}` и переход в сессию по SSE `/events`

Прокси Playwright в UI: путь `/playwright/` → Selenoid `ws://host:4444/playwright/…`.

## Docker (qa-guru)

```bash
docker run -d --name selenoid-ui \
  -p 8080:8080 \
  qaguru/selenoid-ui:latest-release \
  --selenoid-uri http://host.docker.internal:4444 \
  --browsers-conf /etc/selenoid/browsers.json
```

## Ручная проверка Playwright

1. Соберите hub (`go build -o selenoid .` в [qa-guru/selenoid](https://github.com/qa-guru/selenoid)) и поднимите с `config/browsers.json`
2. Соберите UI (команды выше)
3. Запустите UI с `-browsers-conf`, указывающим на тот же `browsers.json`
4. Capabilities → **playwright-chromium: 1.61.1** → **Create Session** → должен открыться экран сессии с VNC
5. Для chrome/firefox — создание сессии через WebDriver без изменений

Проверка только Go-backend (без React):

```bash
go build .
```

Для полной сборки с UI нужны предварительные `yarn --cwd ui build` и `go generate`.
