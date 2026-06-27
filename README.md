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
| **selenoid-ui** (этот) | Web UI |
| [cm](https://github.com/qa-guru/cm) | Установщик hub + UI |
| [playwright-image](https://github.com/qa-guru/playwright-image) | Образы для Playwright-сессий в UI |

## Отличия от upstream

- В Capabilities отображаются **Playwright-браузеры** (`playwright-chromium`, `playwright-firefox`, …) наряду с WebDriver (`chrome`, `firefox`).
- **Create Session** для Playwright открывает WebSocket через прокси UI (`/playwright/…`), а не POST `/wd/hub/session`.
- Нужен тот же `browsers.json`, что у hub — иначе Playwright-версии в UI не совпадут с hub.

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

`-browsers-conf` — тот же [`config/browsers.json`](https://github.com/qa-guru/selenoid/blob/main/config/browsers.json), что у hub.

Capabilities: [http://127.0.0.1:8080/#/capabilities](http://127.0.0.1:8080/#/capabilities)

- **WebDriver** (chrome, firefox): **Create Session** → POST `/wd/hub/session`
- **Playwright**: сниппеты WebSocket; **Create Session** → прокси `ws://…/playwright/{browser}/{version}` и переход в сессию по SSE `/events`

Прокси Playwright в UI: путь `/playwright/` → Selenoid `ws://host:4444/playwright/…`.

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

Production-деплой UI: [qa-guru/cm deploy/README.md](https://github.com/qa-guru/cm/blob/main/deploy/README.md).

----------------------------------
## Оригинальная документация (Aerokube)

# Selenoid UI

[![Build Status](https://travis-ci.org/aerokube/selenoid-ui.svg?branch=master)](https://travis-ci.org/aerokube/selenoid-ui)
[![Coverage](https://codecov.io/github/aerokube/selenoid-ui/coverage.svg)](https://codecov.io/gh/aerokube/selenoid-ui)
[![Release](https://img.shields.io/github/release/aerokube/selenoid-ui.svg)](https://github.com/aerokube/selenoid-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/aerokube/selenoid-ui.svg)](https://hub.docker.com/r/aerokube/selenoid-ui)

**UNMAINTAINED**. Consider https://aerokube.com/moon/latest as alternative.

Simple status page with UI updates by SSE,
backed by constant polling of status handle
of [selenoid](https://github.com/aerokube/selenoid) on small go backend.

![ui](docs/img/stats-sessions.png)

## Usage

We distribute UI as a lightweight [Docker](http://docker.com/) container. To run it type:
```
$ docker run -d --name selenoid-ui  \
    --link selenoid                 \
    -p 8080:8080                    \
    aerokube/selenoid-ui --selenoid-uri=http://selenoid:4444
```

where `--link selenoid` links with running container named `selenoid` with selenoid inside

Then access the UI on port 8080:
```
http://localhost:8080/
```
The following flags are supported:

- `--listen` - host and port to listen (e.g. `:1234`)
- `--period` - data refresh period (e.g. `5s` or `1m`)
- `--selenoid-uri` - selenoid uri to fetch data from (e.g. `http://selenoid.example.com:4444/`)

## Features, Screenshots and Complete Guide

Can be found at http://aerokube.com/selenoid-ui/latest/

## Usage note

This UI is designed for debug purposes for one selenoid node. If you need
monitoring capabilities on more than one selenoid, consider
to use [external monitoring system](http://aerokube.com/selenoid/latest/#_sending_statistics_to_external_systems)
