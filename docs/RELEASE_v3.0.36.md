# Release v3.0.36 — qa-guru/selenoid-ui

**Дата:** 15 августа 2026  
**Предыдущий:** [v3.0.35](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.35)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.36  
**Stack cut:** hub → **v3.0.12**; cm → **v3.0.2**; UI → **v3.0.36**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Java hot none** | Пин **[#13 2.246s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/13/)** — long-lived JUnit daemon reuse + keep-alive Chrome session (JUnit 710ms). Не [#12](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/12/) restart 7.389s и не [#5](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/5/) New Session 4.781s. |
| **Hint §0** | Java none: cold 9.4 · warm 4.2 · **hot 2.2**. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.36
```
