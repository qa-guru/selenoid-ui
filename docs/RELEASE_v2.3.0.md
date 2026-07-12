# Release v2.3.0 — qa-guru/selenoid-ui

**Дата:** 12 июля 2026  
**Предыдущий:** [v2.2.1](RELEASE_v2.2.1.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.3.0 _(tag при cut)_  
**Stack cut:** hub + UI + cm → единый **v2.3.0**.

---

## Что нового

| Изменение                | Описание                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **React 18**             | `react` / `react-dom` / `react-is` → `^18.3.1`                                                                                         |
| **Vite 6**               | CRA (`react-scripts`) заменён на Vite 6 + `@vitejs/plugin-react`; build → `ui/build/` (statik embed без изменений)                     |
| **styled-components 6**  | `styled-components/macro` → plain `styled-components` (Vite-compatible)                                                                |
| **react-router-dom 5.3** | HashRouter и маршруты `/`, `/capabilities/`, `/videos` — без изменений UX                                                              |
| **TypeScript (partial)** | `uiFeed`, `capabilitiesLogic`, `sessionsLogic`, `useUiFeed` — TS; JSX-компоненты остаются `.jsx`                                       |
| **Vitest + RTL**         | 22 теста (7 files): unit (`uiFeed`, `capabilitiesLogic`, `sessionsLogic`) + component (`Status`, `Navigation`, `Sessions`, `Viewport`) |
| **Allure labels**        | `allure-vitest` reporter → `ui/allure-results/`; CI artifact `allure-ui-react-testing-library`                                         |
| **Node CI**              | **24** (build/test/release/docker-publish); v2.2.x использовал Node 12                                                                 |
| **Dependencies**         | `@novnc/novnc` 1.5.0, `react-select` 5.x, `highlight.js` v11, обновлены `xterm`, `rxjs`                                                |
| **Preserved**            | `#sse-status` / `#selenoid-status`, SSE/status UX, header/routes, Java `@Layer("component")` Selenide tests                            |

---

## Frontend dev

```bash
cd ui
yarn install --frozen-lockfile
yarn test          # vitest run — 22 tests
yarn build         # → ui/build/
yarn start         # vite dev server :3000 (proxy → hub :8080/:4444)
```

Go embed (без изменений пути):

```bash
yarn --cwd ui build
go generate .      # statik -src=./ui/build
go build -o selenoid-ui .
```

Monorepo: `projects/selenoid-home/dev/scripts/build-selenoid-ui.sh`.

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.3.0/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v2.3.0`

Prod deploy: `SELENOID_UI_VERSION=v2.3.0`.

Связанные: [selenoid v2.3.0](https://github.com/qa-guru/selenoid/releases/tag/v2.3.0), [cm v2.3.0](https://github.com/qa-guru/cm/releases/tag/v2.3.0), [selenoid-tests](https://github.com/qa-guru/selenoid-tests).

---

## Cut checklist (ручной)

1. ~~Commit UI migration + docs на `main`.~~ ✓ `b476fa7` (local; push — по команде).
2. Push `main` + align hub/cm `v2.3.0` tags (stack cut) — **по команде**.
3. `git tag -a v2.3.0 -m "v2.3.0"` → push tags — **по команде**.
4. Release assets `dist/selenoid-ui_*`; Docker `qaguru/selenoid-ui:v2.3.0`.
5. OUT: `warm-pool-orchestrator/`, `@zero-design-system/react` header (v3).
