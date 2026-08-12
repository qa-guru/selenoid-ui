# Release v3.0.25 — qa-guru/selenoid-ui

**Дата:** 12 августа 2026  
**Предыдущий:** [v3.0.24](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.24)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.25  
**Stack cut:** hub → **v3.0.8**; cm → **v3.0.2**; UI → **v3.0.25**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **VNC disconnect** | `VncScreen.disconnect()` реально зовёт `rfb.disconnect()` (noVNC 1.5 `_rfbConnectionState`) — без утечки WebSocket при уходе со страницы |
| **VNC session switch** | `componentDidUpdate` переподключает RFB при смене `session`, не только `origin` |
| **Log session switch** | Log WS reconnect по ключу `origin\|session` — без чужих логов при смене `/sessions/:id` |
| **`/ws/` TLS** | Прокси `/ws/` выбирает `wss`, если `status-uri` — `https` (как `/playwright/`) |
| **a11y / DS sync** | autocomplete на session filter; sync design-system static + vendor react-ui |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.25
```
