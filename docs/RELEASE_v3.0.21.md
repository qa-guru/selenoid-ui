# Release v3.0.21 — qa-guru/selenoid-ui

**Дата:** 1 августа 2026  
**Предыдущий:** [v3.0.20](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.20)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.21  
**Stack cut:** hub → **v3.0.6**; cm → **v3.0.2**; UI → **v3.0.21**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Create Session wait** | `waitForLiveSession` polls `/ui/status` instead of relying on a second EventSource — fixes POST-200-but-no-navigate when the header SSE tile is stale/disconnected |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.21
```

Prod: `SELENOID_UI_VERSION=v3.0.21` with hub **v3.0.6** / cm **v3.0.2**.
