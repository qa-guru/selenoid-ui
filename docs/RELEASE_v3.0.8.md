# Release v3.0.8 — qa-guru/selenoid-ui

**Дата:** 26 июля 2026  
**Предыдущий:** [v3.0.7](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.7) (tag-only; без `RELEASE_v3.0.7.md`)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.8  
**Stack cut:** UI **v3.0.8** + hub/cm **v3.0.1** (Finished sessions + native HAR).

> **Note:** между v3.0.6 и этим файлом был tag **v3.0.7** (hubAuth build-time defaults) без release notes в `docs/`. Changelog ниже — все коммиты `v3.0.7..v3.0.8`.

---

## Что нового

| Изменение             | Описание                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Finished sessions** | Список ссылками (не video-previews); nested page: video + HAR + logs; meta/artifact icons; tighten row when meta missing |
| **HAR viewer**        | Session HAR viewer + artifact proxies; expandable rows (headers, timings, response)                                      |
| **Nav**               | Statistics / Sessions / New Session; Sessions title → Live sessions; Capabilities wording → New Session                  |
| **WARM metric**       | Header hub stats показывает WARM                                                                                         |
| **Layout / DS**       | Page content в Panel shells; sync public DS css/js; IconTrash from react-ui on Stats delete                              |
| **Timestamps**        | 24h padded session timestamps; left-align finished fields, actions right; empty-session label one row                    |
| **Vite / TS**         | Stage 1 `typescript@7` typecheck; strip TS in Vite dev (capabilitiesLogic); skip SW registration in Vite dev             |
| **Session size**      | Drop `window/maximize`; size via `window/rect`                                                                           |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.8/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.8`

Prod deploy (отдельный чат): `SELENOID_UI_VERSION=v3.0.8` (+ hub/cm **v3.0.1** для meta/HAR API).

Связанные: [selenoid v3.0.1](https://github.com/qa-guru/selenoid/releases/tag/v3.0.1), [cm v3.0.1](https://github.com/qa-guru/cm/releases/tag/v3.0.1).

---

## Cut checklist

1. `main` green (CI build / Vite).
2. `git tag -a v3.0.8 -m "v3.0.8"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.8`.
3. Prod deploy pins → UI v3.0.8.
