# Release v3.0.18 — qa-guru/selenoid-ui

**Дата:** 31 июля 2026  
**Предыдущий:** [v3.0.17](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.17)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.18  
**Stack cut:** hub → **v3.0.6**; cm → **v3.0.2**; UI → **v3.0.18**.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Kill DELETE auth** | `deleteSession` шлёт Basic Auth (`hubFetchInit`) — nginx 401 больше не блокирует Kill |
| **Remember create auth** | Токен Create Session запоминается для последующего DELETE (форма может отличаться от bake-time defaults) |

---

## Cut checklist

1. `yarn test` green.
2. Tag `v3.0.18` → release assets → deploy `ui_version=v3.0.18`.
3. Smoke: Create Session → Kill stays on `/#/sessions/<id>` → HAR in archive.
