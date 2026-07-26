# Release v3.0.9 — qa-guru/selenoid-ui

**Дата:** 26 июля 2026  
**Предыдущий:** [v3.0.8](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.8)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.9  
**Stack cut:** UI-only hotfix (`@types/node` для release typecheck).

---

## Что нового

| Изменение     | Описание                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| **Vite / TS** | Добавлен `@types/node`, чтобы Stage 1 release typecheck покрывал `vite.config.ts` |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.9/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.9`

Prod deploy (отдельный чат): `SELENOID_UI_VERSION=v3.0.9` (+ hub/cm **v3.0.1** для meta/HAR API).

Связанные: [selenoid v3.0.1](https://github.com/qa-guru/selenoid/releases/tag/v3.0.1), [cm v3.0.1](https://github.com/qa-guru/cm/releases/tag/v3.0.1).

---

## Cut checklist

1. `main` green (CI build / Vite).
2. `git tag -a v3.0.9 -m "v3.0.9"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.9`.
3. Prod deploy pins → UI v3.0.9.
