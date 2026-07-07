# Release v2.1.5 — qa-guru/selenoid-ui

**Дата:** 2 июля 2026  
**Предыдущий:** v2.1.4  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.1.5

Патч-релиз стека **v2.1.5**: выравнивание версии с hub и cm.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Стек v2.1.5** | Общий semver с `qaguru/selenoid` и `qaguru/cm` |
| **Тесты** | Go unit: readable display names через `t.Run` для Allure/TestOps |

---

## Установка / обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.1.5/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
./selenoid-ui -selenoid-uri http://127.0.0.1:4444
```

Docker: `docker pull qaguru/selenoid-ui:v2.1.5`
