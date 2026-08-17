# Release v3.0.40 — qa-guru/selenoid-ui

**Дата:** 17 августа 2026  
**Предыдущий:** [v3.0.39](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.39)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.40  
**Stack cut:** hub **v3.0.13** · cm **v3.0.3** · UI → **v3.0.40**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Docs · pool diagrams** | На `/docs` три схемы (topology, one-run, wall) с переключателем Cold / Warm / Hot. Hot путь — `POST /pool/lease` + daemon, не hub New Session. Пины wall: cold ~9.4s · warm [#14 4.216s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool/14/) · hot [#55 2.192s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/55/). |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.40
```
