# Release v3.0.57 — qa-guru/selenoid-ui

**Дата:** 9 сентября 2026  
**Предыдущий:** [v3.0.56](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.56)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.57  
**Stack cut:** hub **v3.0.15** · cm **v3.0.5** · UI → **v3.0.57**. Hub pin не меняется.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **VNC mosaic** | Session start/stop no longer resizes the remote desktop or re-scales noVNC on every SSE tick. Connecting and connected chrome keep the same box. |
| **Create Session** | Live session is seeded into the UI feed before navigate, so the details page does not flash a short LOADING panel. |
| **Stop** | VNC drops immediately; video waiting keeps the 16:9 slot. Playwright WS is released so hub teardown does not wait on the UI socket. |

```bash
docker pull qaguru/selenoid-ui:v3.0.57
```
