# Release v3.0.59 — qa-guru/selenoid-ui

**Дата:** 10 сентября 2026  
**Предыдущий:** [v3.0.58](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.58)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.59  
**Stack cut:** hub **v3.0.16** · cm **v3.0.5** · UI → **v3.0.59**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **VNC fullscreen** | `contain: layout` on the mosaic slot trapped `position: absolute` fullscreen in the cell. Isolation stays on `.vnc-window__screen`; the frame fills the viewport under the header again. |
| **Geometry tests** | Playwright asserts VNC / log / HAR fullscreen grow out of the mosaic and fill the viewport. Compiled CSS forbids `contain: layout` on `.session-media-slot`. |

```bash
docker pull qaguru/selenoid-ui:v3.0.59
```
