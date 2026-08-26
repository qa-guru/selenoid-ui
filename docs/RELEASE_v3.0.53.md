# Release v3.0.53 — qa-guru/selenoid-ui

**Дата:** 26 августа 2026  
**Предыдущий:** [v3.0.52](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.52)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.53  
**Stack cut:** hub **v3.0.14** · cm **v3.0.3** · UI → **v3.0.53**. Hub pin не меняется.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Docs → Catalog** | `#/docs/catalog` — copy `browsers.json` + `docker pull` + SIGHUP хабу. Живые сессии и UI не рестартятся. |
| **Watch scripts** | Ссылки на `pins.json`, `watch.yml`, `watch_upstream.py`, `catalog_sync.sh` и выдержки из файлов. |
| **Sources** | Откуда watch читает Chrome / Firefox / Edge / Playwright. Android — pin в каталоге, watch его не двигает. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.53
```
