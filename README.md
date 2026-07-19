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

## Стабильные билды — две ветки

Стабильные версии стека зафиксированы в **двух долгоживущих ветках** (а не в `main`). Имя ветки кодирует согласованный toolchain всего стека, включая React из paired `selenoid-ui`:

| Ветка                                                                                                                              | Стабильный билд                                                          | Docker API | Engine | Go     | React | UI                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------ | ------ | ----- | ----------------------- |
| [`selenoid2-1.45-engine26.1-go1.26-react16`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.45-engine26.1-go1.26-react16) | **v2.2.1** — прежний prod ([selenoid.qa.guru](https://selenoid.qa.guru)) | 1.45       | 26.1.x | 1.26.5 | 16    | CRA (react-scripts 3.x) |
| [`selenoid2-1.55-engine29.6-go1.26-react18`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.55-engine29.6-go1.26-react18) | **v2.3.0** — актуальный prod, до нового UI (Selenoid 3)                  | 1.55       | 29.6+  | 1.26.5 | 18    | Vite 6                  |

**Зачем две ветки:** каждая держит воспроизводимый набор версий (Docker API / Engine / Go / React). На **каждой** ветке свой `STACK-PIN.md`: на pin-ветках — v2.x; на `main` / v3-dev — Selenoid 3 / React 19 (этот checkout).

_Вы на `main` / v3-dev — активная разработка (рубеж **3.0.0**). Prod **v2.3.0** зафиксирован на [`selenoid2-1.55-engine29.6-go1.26-react18`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.55-engine29.6-go1.26-react18) (там React 18 `STACK-PIN.md`)._

**UI freeze для 2.x:** ветки и теги `v2.2.x` / `v2.3.x` принимают только maintenance-фиксы. Не добавляйте design-system components, новый header/navigation, layout/theme/button refresh или redesign экранов в 2.x. Visual changes идут в **Selenoid 3.0.0**; в 2.x допустимы только restoration-fixes, сохраняющие текущий Selenoid-визуал.

<!-- stack-branches-note:end -->

Web-интерфейс для [qa-guru/selenoid](https://github.com/qa-guru/selenoid) — форк [aerokube/selenoid-ui](https://github.com/aerokube/selenoid-ui) с поддержкой **Playwright-сессий** в Capabilities.

[![Build Status](https://github.com/qa-guru/selenoid-ui/workflows/build/badge.svg)](https://github.com/qa-guru/selenoid-ui/actions?query=workflow%3Abuild)
[![Coverage](https://codecov.io/github/qa-guru/selenoid-ui/coverage.svg)](https://codecov.io/gh/qa-guru/selenoid-ui)
[![Release](https://img.shields.io/github/release/qa-guru/selenoid-ui.svg)](https://github.com/qa-guru/selenoid-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/qaguru/selenoid-ui.svg)](https://hub.docker.com/r/qaguru/selenoid-ui)

|                   |                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **GitHub**        | [qa-guru/selenoid-ui](https://github.com/qa-guru/selenoid-ui)                                             |
| **Docker Hub**    | [`qaguru/selenoid-ui`](https://hub.docker.com/r/qaguru/selenoid-ui)                                       |
| **Текущий релиз** | **v2.3.0** (in progress) — [docs/RELEASE_v2.3.0.md](docs/RELEASE_v2.3.0.md) · `qaguru/selenoid-ui:v2.3.0` |

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
| Node (CI) | 24                                                           |

```bash
yarn --cwd ui install
yarn --cwd ui test    # 22 tests (unit + component)
yarn --cwd ui build
```

v1 (CRA) — git tag `v2.2.x` и ранее.

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
