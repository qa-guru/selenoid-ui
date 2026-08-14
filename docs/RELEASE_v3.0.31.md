# Release v3.0.31 — qa-guru/selenoid-ui

**Дата:** 14 августа 2026  
**Предыдущий:** [v3.0.30](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.30)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.31  
**Stack cut:** hub → **v3.0.9**; cm → **v3.0.2**; UI → **v3.0.31**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Benchmarks · Jenkins** | Секция **0. Jenkins login-test**: cold headless, cold full-attachments, warm hub-attach, hot stub — ссылки на [jenkins.qa.guru](https://jenkins.qa.guru/) |
| **Wall times** | Замеры 14.08: warm #17 **4.773 s**, cold #8 **9.414 s**, cold-full #8 **18.897 s** |
| **Header Hot** | Метрика Hot в шапке из hub SSE (`used` / quota) |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.31
```
