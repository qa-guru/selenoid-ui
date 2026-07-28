# Release v3.0.13 — qa-guru/selenoid-ui

**Дата:** 28 июля 2026  
**Предыдущий:** [v3.0.12](RELEASE_v3.0.12.md)  
**GitHub:** https://github.com/qa-guru/selenoid-ui/releases/tag/v3.0.13  
**Stack cut:** UI + hub **v3.0.4** (`harContent` meta\|bodies).

---

## Что нового

| Изменение                     | Описание                                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`harContent` Capabilities** | Select meta\|bodies (default meta), только когда `enableHAR` on; в WD caps / PW query / codegen — opt-in `bodies`                                                |
| **HarViewer**                 | Без регресса meta (muted body note); при `content.text` — показывает body                                                                                        |
| **Session UX**                | VNC kill → DELETE session; kill control в Session panel bar; Live/Finished row packing; hide default Manual name next to MANUAL badge; soft `--many` plaque sync |

Требует hub ≥ **v3.0.4** для реального capture `harContent=bodies` (UI wire alone не пишет text).

---

## Обновление

```bash
curl -sL https://github.com/qa-guru/selenoid-ui/releases/download/v3.0.13/selenoid-ui_linux_amd64 -o selenoid-ui
chmod +x selenoid-ui
```

Docker: `docker pull qaguru/selenoid-ui:v3.0.13`

Prod deploy: `SELENOID_UI_VERSION=v3.0.13` вместе с hub **v3.0.4** / cm **v3.0.1**.

---

## Cut checklist

1. `main` green (Capabilities harContent tests + UI unit).
2. `git tag -a v3.0.13 -m "v3.0.13"` → push tag → GitHub Release (published) → `release.yml` assets + `qaguru/selenoid-ui:v3.0.13`.
3. Prod deploy pins → hub v3.0.4 + UI v3.0.13.
4. Smoke: Capabilities показывает `harContent` только при enableHAR; HarViewer text при bodies session.
