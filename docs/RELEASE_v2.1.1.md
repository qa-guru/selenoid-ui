# Release v2.1.1 — qa-guru/selenoid-ui

**Дата:** 28 июня 2026  
**Предыдущий:** [v2.1.0](RELEASE_v2.1.0.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v2.1.1

Патч-релиз: сниппеты capabilities с **`enableVNC` и `enableVideo`**, правки layout страницы Capabilities.

---

## Что нового

| Изменение | Описание |
|-----------|----------|
| **WebDriver snippets** | `enableVNC` + `enableVideo` во всех языках (curl, Java, Go, C#, Python, JS, PHP, Ruby) |
| **Playwright snippets** | `enableVideo` в дефолтных selenoid options; curl без лишнего `\` |
| **Capabilities layout** | Селектор языка справа; перенос длинных строк в блоке кода |

---

## Установка / обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v2.1.1/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
./selenoid-ui -selenoid-uri http://127.0.0.1:4444
```
