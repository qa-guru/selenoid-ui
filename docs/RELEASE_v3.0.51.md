# Release v3.0.51 — qa-guru/selenoid-ui

**Дата:** 25 августа 2026  
**Предыдущий:** [v3.0.50](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.50)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.51  
**Stack cut:** hub **v3.0.14** · cm **v3.0.3** · UI → **v3.0.51**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **HAR after Stop** | When a live session ends, HAR Viewer polls `/har/<id>.har` immediately (not on the next 2.5s tick). |
| **Log after Stop** | If the archive has a `.log`, the live xterm is replaced by the finished log file so Stop actually attaches the artifact. Reload keeps HAR/log because the hub now writes the files. |

Needs hub **v3.0.14** (Playwright HAR flush + container log copy). Older hubs still drop PW HAR/log on Stop.

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.51
```
