# Release v3.0.50 — qa-guru/selenoid-ui

**Дата:** 24 августа 2026  
**Предыдущий:** [v3.0.49](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.49)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.50  
**Stack cut:** hub **v3.0.13** · cm **v3.0.3** · UI → **v3.0.50**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Create Session → VNC** | Chrome/Edge: после create всегда `window/maximize` + `window/rect` под `screenResolution` (`--window-size` в Xvfb игнорируется). |
| **Firefox** | `moz:firefoxOptions --width/--height` + maximize/rect, чтобы окно заняло весь VNC. |
| **Mobile emulation** | `window/rect` по-прежнему не шлётся (телефонный viewport). |

Playwright headed VNC (UI Manual session) чинится в **browser-image** (`launch-headed-browser.js` + `SCREEN_RESOLUTION`) — пересборка `qaguru/playwright-*:1.61.1`.

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.50
```
