# Release v2.2.1 — qa-guru/selenoid-ui

**Дата:** 10 июля 2026  
**Предыдущий:** [v2.2.0](RELEASE_v2.2.0.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.2.1 *(tag при cut)*  
**Stack cut:** hub + UI + cm → единый **v2.2.1** (patch после v2.2.0).

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Tag alignment** | `v2.2.1` = HEAD (post-cut CI: `workflow_dispatch` upload assets) |
| **README** | Единый блок «Экосистема qa-guru Selenoid» + [selenoid-tests](https://github.com/qa-guru/selenoid-tests) + [Docker Hub qaguru](https://hub.docker.com/u/qaguru) |
| **Runtime** | Без изменений UI/hub logic относительно v2.2.0 |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.2.1/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v2.2.1`

Prod deploy: `SELENOID_UI_VERSION=v2.2.1`.

Связанные: [selenoid v2.2.1](https://github.com/qa-guru/selenoid/releases/tag/v2.2.1), [cm v2.2.1](https://github.com/qa-guru/cm/releases/tag/v2.2.1), [selenoid-tests](https://github.com/qa-guru/selenoid-tests).

---

## Cut checklist (ручной)

1. Commit docs на `main` → `git tag -a v2.2.1 -m "v2.2.1"` → push tags *(по команде)*.
2. Release assets `dist/selenoid-ui_*`; Docker `qaguru/selenoid-ui:v2.2.1`.
3. OUT: `warm-pool-orchestrator/`.
