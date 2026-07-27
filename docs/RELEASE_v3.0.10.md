# Release v3.0.10 — qa-guru/selenoid-ui

**Дата:** 27 июля 2026  
**Предыдущий:** [v3.0.9](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.9)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.10  
**Stack cut:** UI-only hotfix (Session page layout).

---

## Что нового

| Изменение          | Описание                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Session layout** | Session info panel больше не растягивается на весь viewport (`flex: 0 0 auto`) — VNC/Video + Log не обрезаются |
| **Session gutter** | Восстановлен нижний отступ Session info (`--wt-post-gap`) — панель не слипается с VNC/Video                    |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.10/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.10`

Prod deploy: `SELENOID_UI_VERSION=v3.0.10` (hub **v3.0.2** / cm **v3.0.1** без изменений).

---

## Cut checklist

1. `main` green (layout CSS + Session unit tests).
2. `git tag -a v3.0.10 -m "v3.0.10"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.10`.
3. Prod deploy pins → UI v3.0.10.
