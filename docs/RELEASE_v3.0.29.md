# Release v3.0.29 — qa-guru/selenoid-ui

**Дата:** 13 августа 2026  
**Предыдущий:** [v3.0.28](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.28)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.29  
**Stack cut:** hub → **v3.0.8**; cm → **v3.0.2**; UI → **v3.0.29**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **`?mock=1`** | Чип рядом с Sessions (в burger, когда нав свёрнут): max / min / starting-freeze live mocks, fake VNC desktop, overlay на finished details |
| **Session chrome** | Имена панелей: Session details, VNC window, HAR Viewer; New Session — Browser / device image, Session options, Browser proxy; Statistics → Browser usage |
| **Session logs** | Высота по строкам xterm, пол не ниже VNC без пустой строки, без flicker на первых строках, `Initialize...` пока лог растёт |
| **VNC / layout** | Статус в header bar, gutters, focus SSOT без leftover click rings, burger только при свёрнутом нав |
| **Vite-dev** | Не blank page от HTML fallback на `/sw.js` |
| **Visual CI** | Playwright snapshots по OS-папкам (`linux` / `macos`) |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.29
```
