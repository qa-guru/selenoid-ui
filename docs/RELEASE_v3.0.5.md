# Release v3.0.5 — qa-guru/selenoid-ui

**Дата:** 23 июля 2026  
**Предыдущий:** [v3.0.4](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.4)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.5  
**Stack cut:** UI + backend auth canon + design-system sync.

---

## Что нового

| Изменение         | Описание                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| **accessKey**     | Единый hub `accessKey` (`user:pass`) вместо `playwrightAccessKey`; флаг `-access-key`, JSON `/ui/status.accessKey` |
| **Auth UI**       | Поля `authUser` / `authPass` собирают `accessKey` для WebDriver, Playwright WS и Android                           |
| **hubOrigin**     | `remoteUrl` и Terminal-сниппеты показывают публичный origin, не internal docker host                               |
| **VncWindow**     | `screenSize` → CSS `--vnc-aspect` (flexible VNC screen по `screenResolution`)                                      |
| **Design system** | Re-sync embed CSS/JS (header, panel, tokens, plaque-field-magnet) + re-vendor `@zero-design-system/react`          |

Prod deploy: `SELENOID_UI_VERSION=v3.0.5`.
