# Release v3.0.1 — qa-guru/selenoid-ui

**Дата:** 22 июля 2026  
**Предыдущий:** [v3.0.0-rc.6](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.0-rc.6) (первый stable cut линии Selenoid 3; `v3.0.0` не выпускался)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.1  
**Stack cut:** UI-only — hub/cm pin отдельно (Docker API/Engine TBD в STACK-PIN).

---

## Что нового (Selenoid 3 UI)

| Изменение                | Описание                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**             | Vite 6 + react-router-dom 7; Node CI 24                                                                                                                                                   |
| **Design-system header** | StatusTile (`status-tile--connected`), SelenoidMetrics, brand/plaque magnet                                                                                                               |
| **Capabilities**         | Driver = PlaqueTagstrip (Webdriver / Playwright / Android / iOS); Browser caps (proxy, enableLog, timeZone, env, labels); Android device panel; Agent/Terminal/JSON tabs; Appium snippets |
| **Sessions**             | VncWindow (DS) вместо legacy VncCard                                                                                                                                                      |
| **Viewport**             | Content shell — VNC fullscreen под fixed header                                                                                                                                           |
| **PWA**                  | `vite-plugin-pwa` (shell precache; live API/SSE online-only)                                                                                                                              |
| **Fixture**              | Android 16 в `browsers.json`                                                                                                                                                              |

Линия rc.1–rc.6 собрана в этот stable tag на том же коммите, что `v3.0.0-rc.6`.

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.1/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.1`

Prod deploy: `SELENOID_UI_VERSION=v3.0.1`.

E2e: [selenoid-tests](https://github.com/qa-guru/selenoid-tests) — селекторы StatusTile / tagstrip на `main` (после `b88a93a66`).

---

## Cut checklist

1. ~~STACK-PIN + RELEASE_v3.0.1.md на `main`.~~
2. ~~`git tag -a v3.0.1` → push tag + GitHub Release (stable).~~
3. Release assets `dist/selenoid-ui_*`; Docker `qaguru/selenoid-ui:v3.0.1` / `latest-release`.
4. Prod: deploy workflow с `SELENOID_UI_VERSION=v3.0.1` — по команде.
