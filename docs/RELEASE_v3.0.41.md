# Release v3.0.41 — qa-guru/selenoid-ui

**Дата:** 17 августа 2026  
**Предыдущий:** [v3.0.40](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.40)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.41  
**Stack cut:** hub **v3.0.13** · cm **v3.0.3** · UI → **v3.0.41**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Java hot none** | Пин **[#59 1.303s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/59/)** — один Jenkins `sh` (lease + `/run` + trap release), `created:false`, daemon reuse. Не [#55](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/55/) 2.192s (три `sh`). Hint §0: cold 9.4 · warm 4.2 · **hot 1.3**. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.41
```
