# Release v3.0.33 — qa-guru/selenoid-ui

**Дата:** 15 августа 2026  
**Предыдущий:** [v3.0.32](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.32)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.33  
**Stack cut:** hub → **v3.0.12**; cm → **v3.0.2**; UI → **v3.0.33**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Statistics · Warm / Hot** | Рядом с Browser usage — таблицы **Warm pool** и **Hot pool** (browser, protocol, Ready/Reserved). Пустой пул остаётся видимым (`No slots`). Слоты приходят из hub SSE `state.warmSlots` / `state.hotSlots`. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.33
```
