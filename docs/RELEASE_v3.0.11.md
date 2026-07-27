# Release v3.0.11 — qa-guru/selenoid-ui

**Дата:** 27 июля 2026  
**Предыдущий:** [v3.0.10](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.10)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.11  
**Stack cut:** UI-only (New Session auth + Playwright panel).

---

## Что нового

| Изменение                  | Описание                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Playwright `accessKey`** | Одно поле на панели Playwright вместо duo `authUser`/`authPass`                                                 |
| **Три env-переменные**     | `HUB_AUTH_USER` / `HUB_AUTH_PASS` (WD Basic Auth) и `HUB_ACCESS_KEY` (PW `?accessKey=`) — без cross-derive в UI |
| **Proxy panel (PW)**       | Browser capabilities / socksProxy общий с WebDriver, под панелью session                                        |
| **Finished sessions**      | Пустые video/log-плейсхолдеры скрыты; missing session в Panel empty-state                                       |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.11/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.11`

Prod deploy: `SELENOID_UI_VERSION=v3.0.11` (hub **v3.0.2** / cm **v3.0.1** без изменений).

---

## Cut checklist

1. `main` green (hubAuth + Capabilities Playwright/caps tests).
2. `git tag -a v3.0.11 -m "v3.0.11"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.11`.
3. Prod deploy pins → UI v3.0.11.
