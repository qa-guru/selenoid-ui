# Release v3.0.60 — qa-guru/selenoid-ui

**Дата:** 11 сентября 2026  
**Предыдущий:** [v3.0.59](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.59)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.60  
**Stack cut:** hub **v3.0.16** · cm **v3.0.5** · UI → **v3.0.60**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **401 plaque** | Proxy 401 on Create Session is a login/password rejection (`authUser`/`authPass`), not a hub crash. No HTTP status in the plaque, no body echo. |
| **Human errors** | Missing Docker image, proxy down, and `Failed to fetch` map to actionable copy. Opaque W3C codes are not dumped as the message. |
| **Error box** | Failed Create Session shows a bordered plaque next to the button with Dismiss (`capabilities-create-error`). |

Hub stays **v3.0.16** (no bounce). Pyramid Stop/Delete + New Session contract lives in [selenoid-tests](https://github.com/qa-guru/selenoid-tests) `docs/TEST-CONTRACT.md`.

```bash
docker pull qaguru/selenoid-ui:v3.0.60
```
