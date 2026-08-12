# Release v3.0.28 — qa-guru/selenoid-ui

**Дата:** 12 августа 2026  
**Предыдущий:** [v3.0.27](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.27)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.28  
**Stack cut:** hub → **v3.0.8**; cm → **v3.0.2**; UI → **v3.0.28**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **DevTools autocomplete** | `PlaqueField` / `PlaqueSelect`: явный `autocomplete` на configurator params (`name`, `sessionTimeout`, …) — убирает Issues в Remote hub |
| **Auth autofill** | `authUser` → `username`, `authPass` → `current-password` через vendor `@zero-design-system/react` |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.28
```
