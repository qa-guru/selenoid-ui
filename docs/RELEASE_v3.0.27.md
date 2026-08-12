# Release v3.0.27 — qa-guru/selenoid-ui

**Дата:** 12 августа 2026  
**Предыдущий:** [v3.0.26](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.26)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.27  
**Stack cut:** hub → **v3.0.8**; cm → **v3.0.2**; UI → **v3.0.27**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Session layout** | Панель Session info на всю ширину (как HAR) |
| **Session logs height** | Колонка Session logs не ниже Video/VNC; скролл внутри при длинном логе |
| **VNC/HAR chrome** | Синк `vnc-window`, `window-control`, `connection-status`, `har-viewer` из design-system — panel--vnc вместо fallback bar |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.27
```
