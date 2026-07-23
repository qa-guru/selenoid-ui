# Release v3.0.6 — qa-guru/selenoid-ui

**Дата:** 23 июля 2026  
**Предыдущий:** [v3.0.5](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.5)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.6  
**Stack cut:** UI-only hotfix.

---

## Что нового

| Изменение     | Описание                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Log panel** | Убран «вложенный» xterm-фрейм: фон `#1a1917` как у `panel--terminal`, без двухцветного inset и лишней высоты |

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.6/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.6`

Prod deploy: `SELENOID_UI_VERSION=v3.0.6`.
