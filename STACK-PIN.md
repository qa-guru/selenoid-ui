# Stack pin: main / v3-dev (Selenoid 3)

**Репозиторий:** Web UI (qa-guru/selenoid-ui)

Этот файл на **этой ветке** (`main`, `feat/selenoid-3-*` и др. v3-dev) описывает **живой** toolchain checkout’а. Источник правды по фронту — [`ui/package.json`](ui/package.json).

| Поле            | Значение                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| Линия           | Selenoid 3 (dev)                                                          |
| Stack semver    | v3.0.0 (target; cut ещё нет)                                              |
| Docker API      | TBD (paired с hub)                                                        |
| Docker Engine   | TBD (paired с hub)                                                        |
| Go              | 1.26.5                                                                    |
| Go (примечание) | Факт `go.mod` + `toolchain go1.26.5`                                      |
| React           | 19                                                                        |
| Router          | react-router-dom 7                                                        |
| UI              | Vite 6                                                                    |
| Frontend        | Vite 6, React 19 (`^19.2.7`), react-router-dom 7 (`^7.1.1`), Vitest + RTL |
| Node CI         | 24                                                                        |
| Git anchor      | `main` / `feat/selenoid-3-*`                                              |
| PWA             | landed (`vite-plugin-pwa`: shell precache, live API/SSE online-only)      |

## Selenoid 2 maintenance pin (не путать)

Стабильный prod **v2.3.0** / React **18** живёт **только** на pin-ветке
[`selenoid2-1.55-engine29.6-go1.26-react18`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.55-engine29.6-go1.26-react18)
— там свой `STACK-PIN.md` (React 18, Vite 6, semver v2.3.0). Rollback **v2.2.1** / React 16 —
[`selenoid2-1.45-engine26.1-go1.26-react16`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.45-engine26.1-go1.26-react16).

Не переносить React 19 / design-system UI на pin-ветки 2.x без явного OK (rule `selenoid-2-maintenance-ui`).

См. также: [`projects/selenoid-home/README.md`](https://github.com/qa-guru/zero-design-system/blob/master/projects/selenoid-home/README.md) (monorepo SSOT).
