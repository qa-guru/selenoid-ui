# Selenoid UI (qa-guru fork)

<!-- stack-branches-note:start -->

> ## Стабильные билды — две ветки
>
> Стабильные версии стека зафиксированы в **двух долгоживущих ветках** (а не в `main`):
>
> | Ветка                              | Стабильный билд                                                                          | Docker API | Engine | Go     |
> | ---------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | ------ | ------ |
> | `selenoid2-1.45-engine26.1-go1.23` | **v2.2.1** — прежний prod ([selenoid.autotests.cloud](https://selenoid.autotests.cloud)) | 1.45       | 26.1.x | 1.26.5 |
> | `selenoid2-1.55-engine29-go1.26`   | **v2.3.0** — актуальный, до нового UI (Selenoid 3)                                       | 1.55       | 29.x   | 1.26.5 |
>
> **Зачем две ветки:** каждая держит воспроизводимый набор версий. Обновление Docker Engine 26.1.x → 29.x (API 1.45 → 1.55) вынесено в отдельную ветку, чтобы прежний prod-стек собирался в любой момент. `main` — активная разработка, может меняться. Точные версии — в `STACK-PIN.md` в корне ветки.
>
> _Вы на ветке `selenoid2-1.45-engine26.1-go1.23`._

<!-- stack-branches-note:end -->

Web-интерфейс для [qa-guru/selenoid](https://github.com/qa-guru/selenoid) — форк [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui) с поддержкой **Playwright-сессий** в Capabilities.

[![Build Status](https://github.com/qa-guru/selenoid-ui/workflows/build/badge.svg)](https://github.com/qa-guru/selenoid-ui/actions?query=workflow%3Abuild)
[![Coverage](https://codecov.io/github/qa-guru/selenoid-ui/coverage.svg)](https://codecov.io/gh/qa-guru/selenoid-ui)
[![Release](https://img.shields.io/github/release/qa-guru/selenoid-ui.svg)](https://github.com/qa-guru/selenoid-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/qaguru/selenoid-ui.svg)](https://hub.docker.com/r/qaguru/selenoid-ui)

|                   |                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **GitHub**        | [qa-guru/selenoid-ui](https://github.com/qa-guru/selenoid-ui)                               |
| **Docker Hub**    | [`qaguru/selenoid-ui`](https://hub.docker.com/r/qaguru/selenoid-ui)                         |
| **Текущий релиз** | **v2.2.1** — [docs/RELEASE_v2.2.1.md](docs/RELEASE_v2.2.1.md) · `qaguru/selenoid-ui:v2.2.1` |

## Роль в экосистеме

UI не заменяет hub — он **подключается к уже запущенному Selenoid** и даёт:

- список активных сессий и статус квот;
- страницу **Capabilities** с готовыми сниппетами для WebDriver и Playwright;
- VNC-просмотр браузера и логи сессии;
- прокси WebSocket `/playwright/` → hub (нужно для Create Session из браузера).

```
Браузер пользователя  ──►  selenoid-ui :8080  ──►  selenoid hub :4444  ──►  browser containers
```

## Экосистема qa-guru Selenoid

| Ресурс                 | Ссылка                                                                         | Роль                    |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| selenoid               | [github.com/qa-guru/selenoid](https://github.com/qa-guru/selenoid)             | Hub                     |
| **selenoid-ui** (этот) | [github.com/qa-guru/selenoid-ui](https://github.com/qa-guru/selenoid-ui)       | Web UI                  |
| cm                     | [github.com/qa-guru/cm](https://github.com/qa-guru/cm)                         | Установщик              |
| browser-image          | [github.com/qa-guru/browser-image](https://github.com/qa-guru/browser-image)   | Docker browser nodes    |
| selenoid-tests         | [github.com/qa-guru/selenoid-tests](https://github.com/qa-guru/selenoid-tests) | E2e/integration ethalon |
| Docker Hub             | [hub.docker.com/u/qaguru](https://hub.docker.com/u/qaguru)                     | Образы `qaguru/*`       |

## Отличия от upstream

- В Capabilities отображаются **Playwright-браузеры** (`playwright-chromium`, `playwright-firefox`, …) наряду с WebDriver (`chrome`, `firefox`).
- **Create Session** для Playwright открывает WebSocket через прокси UI (`/playwright/…`), а не POST `/wd/hub/session`.
- Нужен тот же `browsers.json`, что у hub — иначе Playwright-версии в UI не совпадут с hub.
- **SSE resilience:** immediate `GET /status`, fallback poll каждые 4s, reconnect с backoff, индикатор **STALE** вместо мгновенного сброса в UNKNOWN.

Upstream docs: [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui) · [aerokube.com/selenoid-ui](https://aerokube.com/selenoid-ui/latest/). AsciiDoc `docs/*.adoc` — **deprecated** (оставлены как upstream history); канон — этот README + `docs/RELEASE_*.md`.

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

`browsers.json` должен быть смонтирован в UI по пути из `--browsers-conf` (тот же файл, что у hub). Корневой [`browsers.json`](browsers.json) — qaguru/dev-канон.

```bash
docker run -d --name selenoid-ui \
  -p 8080:8080 \
  -v "$PWD:/etc/selenoid:ro" \
  qaguru/selenoid-ui:v2.2.1 \
  --selenoid-uri http://host.docker.internal:4444 \
  --browsers-conf /etc/selenoid/browsers.json
```

Compose: [`docker-compose.yml`](docker-compose.yml) монтирует `$PWD` в `/etc/selenoid/` и для hub, и для UI.

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
