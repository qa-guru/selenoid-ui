# Release v3.0.32 — qa-guru/selenoid-ui

**Дата:** 15 августа 2026  
**Предыдущий:** [v3.0.31](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.31)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.32  
**Stack cut:** hub → **v3.0.9**; cm → **v3.0.2**; UI → **v3.0.32**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Benchmarks · Jenkins** | Секция **0** — Java / Python / JS: cold · warm · hot, у каждого пула **none** и **full-attachments** |
| **Warm full** | Allure screenshot / page source / console (video / VNC / HAR → cold). Строки pending, пока нет замера |
| **Hot** | Stub (phase 03 reuse-session), в том числе full-attachments |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.32
```
