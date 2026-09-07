# Release v3.0.55 — qa-guru/selenoid-ui

**Дата:** 7 сентября 2026  
**Предыдущий:** [v3.0.54](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.54)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.55  
**Stack cut:** hub **v3.0.15** · cm **v3.0.4** · UI → **v3.0.55**. Hub pin не меняется.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **New Session default** | Auto-pick the newest full Chrome image (`152.0`), not the `-min` sibling. `-min` is used only when no full Chrome tag exists. |

```bash
docker pull qaguru/selenoid-ui:v3.0.55
```
