# Release v3.0.49 — qa-guru/selenoid-ui

**Дата:** 21 августа 2026  
**Предыдущий:** [v3.0.48](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.48)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.49  
**Stack cut:** hub **v3.0.13** · cm **v3.0.3** · UI → **v3.0.49**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Benchmarks §0b** | Warm isolation — one option at a time (wall + KB vs `allure3-empty`). |
| **Benchmarks §4** | Artifacts cost на **Java** cold (не Go). Все пресеты `art-java-*` one-shot: none / log / video / har / combos. |
| **Java cold pins** | Honest walls + artifact KB (video/log/HAR weighing). HAR bodies mirrors meta until CDP bodies mode. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.49
```
