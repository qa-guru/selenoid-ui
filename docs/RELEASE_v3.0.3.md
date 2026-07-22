# Release v3.0.3 — qa-guru/selenoid-ui

**Дата:** 23 июля 2026  
**Предыдущий:** [v3.0.2](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.2)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.3  
**Stack cut:** UI-only hotfix.

---

## Что нового

| Изменение         | Описание                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Fit window**    | Create Session: `window/maximize` first (Firefox rejects full-screen `window/rect`), then rect/size fallback |
| **Chromium args** | Chrome/Edge get `--window-size` / `--start-maximized` from `screenResolution` at session create              |

Prod deploy: `SELENOID_UI_VERSION=v3.0.3`.
