# Release v3.0.15 — qa-guru/selenoid-ui

**Дата:** 29 июля 2026  
**Предыдущий:** [v3.0.14](RELEASE_v3.0.14.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.15  
**Stack cut:** hub → **v3.0.5**; cm → **v3.0.2**; UI → **v3.0.15**.

---

## Что нового

| Изменение              | Описание                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Full TypeScript UI** | `ui/src/` — только `.ts` / `.tsx` (ноль `.js` / `.jsx`); `strict: true`, `allowJs: false`                             |
| **Toolchain bar**      | `typescript@7` + `yarn typecheck` (`tsc --noEmit`) в CI (`ci/test.sh`); Vite 6 bundler retained (no `tsc → js/` emit) |
| **Domain types**       | `src/types/hub.ts` (SSE/session/caps) + ambient shims for noVNC / xterm / etc.                                        |
| **PropTypes removed**  | Runtime `prop-types` dependency dropped; props typed in TS                                                            |

Поведение UI / wire без functional changes — tooling cut.

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.15/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.15`

Prod deploy: `SELENOID_UI_VERSION=v3.0.15` вместе с hub **v3.0.5** / cm **v3.0.2**.

---

## Cut checklist

1. `main` green (`yarn typecheck` + `yarn test` + `yarn build`).
2. `git tag -a v3.0.15 -m "v3.0.15"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.15`.
3. Prod deploy pins → hub v3.0.5 + UI v3.0.15 + cm v3.0.2.
4. Smoke: `/ui/status` → version stamp `v3.0.15…`; selenoid-tests `api,smoke`.
