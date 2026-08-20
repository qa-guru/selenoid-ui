# Release v3.0.47 — qa-guru/selenoid-ui

**Дата:** 21 августа 2026  
**Предыдущий:** [v3.0.46](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.46)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.47  
**Stack cut:** hub **v3.0.13** · cm **v3.0.3** · UI → **v3.0.47**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Chrome mobileEmulation** | Каталог 12 устройств в Capabilities (chrome/msedge). Off по умолчанию. Create Session и сниппеты Java/Python/JS — `deviceMetrics` + UA. VNC: окно по размеру устройства + страница с innerWidth/UA. Не Android/iOS grid. |
| **Docker Chromium** | `goog:chromeOptions` / `ms:edgeOptions` всегда с `--no-sandbox` `--disable-dev-shm-usage` — иначе Chrome instance exited в контейнере. |
| **Graphite / IDE light** | Публичные токены, panel bars и PWA splash как в design-system. |
| **Java warm lite** | login-test wall **5.616s** без allure generate. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.47
```
