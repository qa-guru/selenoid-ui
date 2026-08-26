# Selenoid UI (qa-guru fork)

[![Selenoid UI](https://qa-guru.github.io/selenoid-tests/readme/badge-selenoid-ui.svg)](https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/)

[![Selenoid UI stats](https://qa-guru.github.io/selenoid-tests/readme/stats-selenoid-ui.svg)](https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/)

[![Selenoid UI metrics](https://qa-guru.github.io/selenoid-tests/readme/metrics-panel-selenoid-ui.svg)](https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/)

<a href="https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://qa-guru.github.io/selenoid-tests/readme/dashboard-preview-dark.png">
    <img
      src="https://qa-guru.github.io/selenoid-tests/readme/dashboard-preview.png"
      alt="Allure 3 dashboard — pyramid, stability, success distribution"
      width="800"
    />
  </picture>
</a>
Dashboard PNG updates after each orchestrator run on `main` (Playwright screenshot of Allure 3 dashboard).

| Link                                                                            | Description                                           |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [Dashboard](https://qa-guru.github.io/selenoid-tests/reports/latest/dashboard/) | Full pyramid — filter epic **selenoid-ui** in awesome |
| [Awesome](https://qa-guru.github.io/selenoid-tests/reports/latest/awesome/)     | UI test details                                       |
| [selenoid-tests](https://github.com/qa-guru/selenoid-tests)                     | Orchestrator + merged Allure                          |

<!-- stack-branches-note:start -->

> ## Стабильные билды
>
> **Prod UI:** [selenoid.qa.guru](https://selenoid.qa.guru) — **Selenoid 3** (`main` / v3-dev, React 19). Pin-ветки 2.x — **заморожены** (maintenance-only в git, без публичного стенда).
>
> | Ветка                      | Semver      | Назначение                           |
> | -------------------------- | ----------- | ------------------------------------ |
> | **`main`**                 | **v3.0.0+** | Активная prod-линия UI               |
> | `selenoid2-1.55-…-react18` | v2.3.0      | frozen maintenance pin (React 18)    |
> | `selenoid2-1.45-…-react16` | v2.2.1      | frozen rollback reference (React 16) |
>
> На **`main`** — `STACK-PIN.md` описывает живой v3 toolchain; на pin-ветках — v2.x pin. **UI freeze для 2.x:** только maintenance-фиксы; visual refresh → Selenoid 3 (rule `selenoid-2-maintenance-ui`).

<!-- stack-branches-note:end -->

Web-интерфейс для [qa-guru/selenoid](https://github.com/qa-guru/selenoid) — форк [aerokube/selenoid-ui](https://github.com/qa-guru/selenoid-ui) с поддержкой **Playwright-сессий** на странице New Session.

[![Build Status](https://github.com/qa-guru/selenoid-ui/workflows/build/badge.svg)](https://github.com/qa-guru/selenoid-ui/actions?query=workflow%3Abuild)
[![Coverage](https://codecov.io/github/qa-guru/selenoid-ui/coverage.svg)](https://codecov.io/gh/qa-guru/selenoid-ui)
[![Release](https://img.shields.io/github/release/qa-guru/selenoid-ui.svg)](https://github.com/qa-guru/selenoid-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/qaguru/selenoid-ui.svg)](https://hub.docker.com/r/qaguru/selenoid-ui)

|                   |                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **GitHub**        | [qa-guru/selenoid-ui](https://github.com/qa-guru/selenoid-ui)                                   |
| **Docker Hub**    | [`qaguru/selenoid-ui`](https://hub.docker.com/r/qaguru/selenoid-ui)                             |
| **Текущий релиз** | **v3.0.52** — [docs/RELEASE_v3.0.52.md](docs/RELEASE_v3.0.52.md) · `qaguru/selenoid-ui:v3.0.52` |

## Роль в экосистеме

UI не заменяет hub — он **подключается к уже запущенному Selenoid** и даёт:

- **Statistics** (`#/statistics`) — статус квот и обзор hub;
- **Sessions** (`#/sessions`) — живые сессии сверху и архив завершённых с артефактами (видео + логи + HAR, удаление сессии целиком). Заменяет прежнюю вкладку Videos;
- **New Session** (`#/new-session`) — создание сессии и сниппеты для WebDriver / Playwright (бывшая Capabilities);
- **Benchmarks** (`#/benchmarks`) — каталог замеров login-теста;
- **Docs** (`#/docs`) — Cold / Warm / Hot пулы; **Resources** (`#/docs/resources`) — GitHub / Docker Hub / live (без github.com/aerokube);
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

- В **New Session** отображаются **Playwright-браузеры** (`playwright-chromium`, `playwright-firefox`, …) наряду с WebDriver (`chrome`, `firefox`).
- **Create Session** для Playwright открывает WebSocket через прокси UI (`/playwright/…`), а не POST `/wd/hub/session`.
- Нужен тот же `browsers.json`, что у hub — иначе Playwright-версии в UI не совпадут с hub.
- **SSE resilience:** immediate `GET /status`, fallback poll каждые 4s, reconnect с backoff, индикатор **STALE** вместо мгновенного сброса в UNKNOWN.

## Каталог браузеров (без релиза UI)

Окно default + regression (warm + min) на [selenoid.qa.guru](https://selenoid.qa.guru) **не едет в релизе UI**. Его пишет watch [qa-guru/browser-image](https://github.com/qa-guru/browser-image):

1. Cron [`watch.yml`](https://github.com/qa-guru/browser-image/blob/main/.github/workflows/watch.yml) резолвит stable → [`pins.json`](https://github.com/qa-guru/browser-image/blob/main/pins.json).
2. После Docker Hub 200 тот же пайплайн переписывает `browsers.json` в hub / cm / tests / **этом репо** и **последним** `deploy/browsers-production.json`. На Box1 это **не** stop/start стека: копируется файл, `docker pull`, хаб перечитывает конфиг по **SIGHUP**. UI не гасится — New Session берёт список версий с хаба (`/status`).
3. Пины хаба (`qaguru/selenoid:v3.0.14`) и UI (`qaguru/selenoid-ui:v3.0.52`) **отдельные**: watch не передаёт `version` / `ui_version`. Полный deploy.sh (restart hub/UI) — только когда в dispatch явно передали тег хаба или UI.

UI только **читает** каталог (`-browsers-conf` → New Session) и `/status` с хаба. Таблица версий: [selenoid/docs/browser-versions.md](https://github.com/qa-guru/selenoid/blob/main/docs/browser-versions.md).

Upstream docs: [aerokube/selenoid-ui](https://github.com/qa-guru/selenoid-ui) · [aerokube.com/selenoid-ui](https://aerokube.com/selenoid-ui/latest/). AsciiDoc `docs/*.adoc` — **deprecated** (оставлены как upstream history); канон — этот README + `docs/RELEASE_*.md`.

## Сборка и запуск

Сначала поднимите hub ([qa-guru/selenoid](https://github.com/qa-guru/selenoid)). Затем соберите и запустите UI:

```bash
yarn --cwd ui install && yarn --cwd ui build
go generate .
go build -o selenoid-ui .

./selenoid-ui \
  -listen :8080 \
  -selenoid-uri http://127.0.0.1:4444 \
  -browsers-conf /path/to/browsers.json
```

Monorepo dev: `projects/selenoid-home/dev/scripts/build-selenoid-ui.sh`.

### Frontend stack (`ui/`)

Current `main` / v3-dev toolchain — [`STACK-PIN.md`](STACK-PIN.md) + [`ui/package.json`](ui/package.json) (React 19 / react-router 7). Prod **v2.3.0** / React 18 — только pin-ветка [`selenoid2-…-react18`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.55-engine29.6-go1.26-react18) (её `STACK-PIN.md`).

| Tool      | Version                                                      |
| --------- | ------------------------------------------------------------ |
| React     | 19.x (`^19.2.7`)                                             |
| Router    | react-router-dom 7 (`HashRouter` / `Routes` / `useNavigate`) |
| Bundler   | Vite 6                                                       |
| Test      | Vitest 3 + React Testing Library (jsdom)                     |
| Node (CI) | 26                                                           |

```bash
yarn --cwd ui install
yarn --cwd ui test    # 22 tests (unit + component)
yarn --cwd ui build
```

**Guest hub auth (New Session):** не хранится в git. CI подставляет при `yarn build`:

- **`HUB_AUTH_USER`** / **`HUB_AUTH_PASS`** → `VITE_HUB_AUTH_*` — WebDriver Basic Auth (duo `authUser` / `authPass`);
- **`HUB_ACCESS_KEY`** → `VITE_HUB_ACCESS_KEY` — Playwright `?accessKey=` (одно поле).

Если `AUTH_*` пусты, WD duo берёт `user:pass` из `ACCESS_KEY` (prod часто печёт только этот secret). Playwright никогда не собирается из `AUTH_*`.

Локально — [`ui/.env.example`](ui/.env.example) → `ui/.env.local`, либо пусто (поля auth вручную).

v1 (CRA) — git tag `v2.2.x` и ранее.

`-browsers-conf` — тот же [`config/browsers.json`](https://github.com/qa-guru/selenoid/blob/main/config/browsers.json), что у hub (в monorepo: `projects/selenoid-home/dev/browsers.json`).

Nav: [Statistics](http://127.0.0.1:8080/#/statistics) · [Sessions](http://127.0.0.1:8080/#/sessions) · [New Session](http://127.0.0.1:8080/#/new-session)  
(`#/` и `#/capabilities` редиректят на `#/statistics` и `#/new-session`.)

- **WebDriver** (chrome, firefox): **Create Session** → POST `/wd/hub/session`
- **Playwright**: сниппеты WebSocket; **Create Session** → прокси `ws://…/playwright/{browser}/{version}` и переход в сессию по SSE `/events`

Прокси Playwright в UI: путь `/playwright/` → Selenoid `ws://host:4444/playwright/…`.

## Docker (qa-guru)

`browsers.json` должен быть смонтирован в UI по пути из `--browsers-conf` (тот же файл, что у hub). Корневой [`browsers.json`](browsers.json) — qaguru/dev-канон.

```bash
docker run -d --name selenoid-ui \
  -p 8080:8080 \
  -v "$PWD:/etc/selenoid:ro" \
  qaguru/selenoid-ui:v3.0.52 \
  --selenoid-uri http://host.docker.internal:4444 \
  --browsers-conf /etc/selenoid/browsers.json
```

Compose: [`docker-compose.yml`](docker-compose.yml) монтирует `$PWD` в `/etc/selenoid/` и для hub, и для UI.

## Ручная проверка Playwright

1. Соберите hub (`go build -o selenoid .` в [qa-guru/selenoid](https://github.com/qa-guru/selenoid)) и поднимите с `config/browsers.json`
2. Соберите UI (команды выше)
3. Запустите UI с `-browsers-conf`, указывающим на тот же `browsers.json`
4. New Session → **playwright-chromium: 1.62.1** → **Create Session** → должен открыться экран сессии с VNC
5. Для chrome/firefox — создание сессии через WebDriver без изменений

Проверка только Go-backend (без React):

```bash
go build .
```

Для полной сборки с UI нужны предварительные `yarn --cwd ui build` и `go generate`.
