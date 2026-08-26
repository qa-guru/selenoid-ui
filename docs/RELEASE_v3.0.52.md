# Release v3.0.52 — qa-guru/selenoid-ui

**Дата:** 26 августа 2026  
**Предыдущий:** [v3.0.51](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.51)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.52  
**Stack cut:** hub **v3.0.14** · cm **v3.0.3** · UI → **v3.0.52**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Playwright mobileDevice** | New Session capabilities expose Playwright `mobileDevice` via `newContext` (device presets, not a separate engine). |
| **New Session columns** | Config / terminal columns scroll independently; Browser and device image stay on screen while options scroll. |
| **Config + terminal** | Scroll the column, not inner panels — long capability lists no longer trap the viewport. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.52
```
