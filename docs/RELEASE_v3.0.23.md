# Release v3.0.23 — qa-guru/selenoid-ui

**Дата:** 1 августа 2026  
**Предыдущий:** [v3.0.22](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.22)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.23  
**Stack cut:** hub → **v3.0.6**; cm → **v3.0.2**; UI → **v3.0.23**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Playwright Create flake** | Do not abort on WebSocket `onerror` / immediate `onclose`; 15s grace so `/ui/status` poll can navigate |
| **Credentialed document URL** | `fetch` / `EventSource` use `location.origin` absolute URLs so Chromium does not reject relative requests when the page was opened as `https://user:pass@host/` |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.23
```
