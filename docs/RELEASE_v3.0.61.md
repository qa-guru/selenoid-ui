# Release v3.0.61 — qa-guru/selenoid-ui

**Дата:** 18 сентября 2026  
**Предыдущий:** [v3.0.60](https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.60)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.61  
**Stack cut:** hub **v3.0.16** · cm **v3.0.5** · UI → **v3.0.61**.

## Что нового

| Изменение | Описание |
|-----------|----------|
| **Class-shell CSS** | Page hosts (Viewport, Sessions, Archive, Session, Log, FilterInput, Browsers, Stats, Docs, Benchmarks, Capabilities) and leftover widgets (Quota/Queue/Used, MockVncDesktop) use peer `.css` + `className` instead of `styled-components`. |
| **No styles barrel** | `index.html` links design-system `/css/*` and local host CSS; the react-ui `styles.css` barrel is not loaded (no dual `:root`). |
| **Dependency** | `styled-components` removed from `ui/package.json`. |

Hub stays **v3.0.16** (no bounce).

```bash
docker pull qaguru/selenoid-ui:v3.0.61
```
