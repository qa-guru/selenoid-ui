# Release v3.0.35 — qa-guru/selenoid-ui

**Дата:** 15 августа 2026  
**Предыдущий:** [v3.0.34](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.34)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.35  
**Stack cut:** hub → **v3.0.12**; cm → **v3.0.2**; UI → **v3.0.35**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Benchmarks · §0** | Колонки **variant** (`none` / `allure-lite` / `allure-heavy`) и две Δ: vs cold none (пул) и vs none (налог Allure). Не смешивать lite↔heavy между пулами. |
| **Java none** | cold **9.414** · warm **[#14 4.216s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-warm-pool/14/)** · hot **[#5 4.781s](https://jenkins.qa.guru/job/autotests-ai-multistack-tests-pipeline-java-hot-pool/5/)** (New Session на hot ChromeDriver, не UUID attach). |
| **JS warm** | **n/a** — Playwright без hub-attach, не pending. Остальные hot-строки **stub**. |

## Обновление

```bash
docker pull qaguru/selenoid-ui:v3.0.35
```
