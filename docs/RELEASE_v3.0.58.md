# Release v3.0.58 — qa-guru/selenoid-ui

**Дата:** 9 сентября 2026  
**Предыдущий:** [v3.0.57](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.57)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.58  
**Stack cut:** hub **v3.0.16** · cm **v3.0.5** · UI → **v3.0.58**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Delete / video slot** | Waiting-for-recording and the `<video>` probe keep the same 16:9 box as live VNC. Delete is enabled once the archive settles, even with no files. Artifact/hub 404 counts as already gone. |
| **List trash** | Live-row Delete strips the session from the UI feed immediately (and across tabs), so an open VNC page drops without waiting on SSE. |
| **Playwright Create** | Optimistic live seed before navigate — no LOADING flash. |
| **-min extras** | Create Session with `*-min` + VNC/video/HAR is rejected in the form with a visible alert. Hub **v3.0.16** returns the same text as HTTP 400 `invalid argument` for API clients. |

```bash
docker pull qaguru/selenoid-ui:v3.0.58
```
