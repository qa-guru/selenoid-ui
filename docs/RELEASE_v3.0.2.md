# Release v3.0.2 — qa-guru/selenoid-ui

**Дата:** 23 июля 2026  
**Предыдущий:** [v3.0.1](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.1)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.2  
**Stack cut:** UI-only hotfix.

---

## Что нового

| Изменение                 | Описание                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Create Session window** | После создания WebDriver-сессии UI ставит `window/rect` в WxH из `screenResolution` (Xvfb уже был 1920×1080, окно браузера — нет) |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.2/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.2`

Prod deploy: `SELENOID_UI_VERSION=v3.0.2`.
