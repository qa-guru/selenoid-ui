# Stack pin: selenoid2-1.55-engine29.6-go1.26-react18

**Репозиторий:** Web UI (qa-guru/selenoid-ui)

| Поле            | Значение                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Линия           | Selenoid 2 (maintenance)                                                                       |
| Stack semver    | v2.3.0 (in progress)                                                                           |
| Docker API      | 1.55                                                                                           |
| Docker Engine   | 29.x (рекоменд. 29.6+)                                                                         |
| Go              | 1.26.5                                                                                         |
| Go (примечание) | Целевой toolchain cut v2.3.0; часть файлов на main может ещё показывать 1.45 до завершения cut |
| React           | 18                                                                                             |
| UI              | Vite 6                                                                                         |
| Prod reference  | selenoid.autotests.cloud остаётся на v2.2.x до отдельного cut                                  |
| До              | До фазы 3 / Selenoid 3 UI (selenoid.qa.guru)                                                   |
| Git anchor      | `main` (Vite migration committed)                                                              |
| Frontend        | Vite 6, React 18 (`^18.3.1`), Vitest + RTL                                                     |
| Node CI         | 24                                                                                             |

См. также: [`projects/selenoid-home/README.md`](https://github.com/qa-guru/zero-design-system/blob/master/projects/selenoid-home/README.md) (monorepo SSOT).
