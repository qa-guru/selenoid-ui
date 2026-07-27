# Release v3.0.12 — qa-guru/selenoid-ui

**Дата:** 27 июля 2026  
**Предыдущий:** [v3.0.11](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.11)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.12  
**Stack cut:** UI-only (Create Session Basic Auth fallback).

---

## Что нового

| Изменение            | Описание                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WD auth fallback** | Если `HUB_AUTH_USER`/`HUB_AUTH_PASS` пусты, duo `authUser`/`authPass` берёт `user:pass` из `HUB_ACCESS_KEY` — Create Session снова шлёт Basic Auth на nginx |
| **Playwright**       | По-прежнему только `HUB_ACCESS_KEY` (не собирается из `AUTH_*`)                                                                                             |

Корневая причина prod 401 на `POST /wd/hub/session`: в GitHub Secrets есть только `HUB_ACCESS_KEY`, а v3.0.11 убрал cross-derive для WD.

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.12/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.12`

Prod deploy: `SELENOID_UI_VERSION=v3.0.12` (hub **v3.0.2** / cm **v3.0.1** без изменений).

---

## Cut checklist

1. `main` green (hubAuth fallback + Capabilities caps/Playwright tests).
2. `git tag -a v3.0.12 -m "v3.0.12"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.12`.
3. Prod deploy pins → UI v3.0.12.
