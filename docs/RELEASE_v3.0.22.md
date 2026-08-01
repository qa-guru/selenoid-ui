# Release v3.0.22 — qa-guru/selenoid-ui

**Дата:** 1 августа 2026  
**Предыдущий:** [v3.0.21](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.21)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.22  
**Stack cut:** hub → **v3.0.6**; cm → **v3.0.2**; UI → **v3.0.22**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Playwright Create Session** | Same as v3.0.21 WebDriver wait: poll `/ui/status`, do not abort on second EventSource error (`Lost connection to events stream`) |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.22
```

Prod: `SELENOID_UI_VERSION=v3.0.22` with hub **v3.0.6** / cm **v3.0.2**.
