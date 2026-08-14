# Release v3.0.30 — qa-guru/selenoid-ui

**Дата:** 14 августа 2026  
**Предыдущий:** [v3.0.29](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.29)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.30  
**Stack cut:** hub → **v3.0.9**; cm → **v3.0.2**; UI → **v3.0.30**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Android skin** | Поле `skin` (QVGA/HVGA) убрано из Session options. Caps больше не шлют `selenoid:options.skin` — остаётся дефолт образа `SKIN=1080x1920` |
| **Create Session errors** | Timeout 5m и HTTP body хаба на плашке. Нет `AbortError: signal is aborted without reason` |
| **Session layout** | VNC заполняет колонку; лог и HAR скроллятся отдельно; gutter между VNC и логами |
| **Live / mock** | Заголовок Sessions и empty-state, `?mock=1` chip, xterm Canvas2D warning |
| **Go** | toolchain **1.26.6** + `golang.org/x/net` v0.55.0 — govulncheck (stdlib + idna) |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.30
```
