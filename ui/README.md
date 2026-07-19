## selenoid-ui (React 19 + react-router 7)

Current toolchain on `main` / v3-dev: **React 19.x** + **react-router-dom 7** (`HashRouter` / `Routes` / `useNavigate`) with Vite 6 + Vitest 3 + React Testing Library.
Component tests run via `yarn test` and emit Allure results (`allure-results/`).

### Install note

This package is managed with **yarn** (`yarn.lock`); do not use npm here.
CI runs `yarn --cwd ui install --frozen-lockfile` (`ci/test.sh`, `ci/build.sh`).

`yarn install` succeeds. A non-fatal peer warning may appear from legacy transitive deps under yarn.

### Selenoid 2.x UI freeze

Prod **v2.x** pin branches (`selenoid2-…-react16` / `selenoid2-…-react18`) stay maintenance-only: keep the native Selenoid header, navigation, filter, buttons, layout, and theme. Functional fixes may touch UI code on those pins, but they must preserve the existing visual design. Visual refresh and design-system work land on the Selenoid 3 line (this tree).

### Deferred to 3.0.0

-   Design-system `AppHeader`, `Input`, `Button`, `Badge`, static assets, and bridge scripts.
-   Header/navigation unification and sessions/layout redesign.

<!-- stack-branches-note:start -->

**Stack pin:** стабильные сборки всего стека — ветки [`selenoid2-1.45-engine26.1-go1.26-react16`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.45-engine26.1-go1.26-react16) (**v2.2.1**, API 1.45 / Engine 26.1.x / Go 1.26.5 / React 16) и [`selenoid2-1.55-engine29.6-go1.26-react18`](https://github.com/qa-guru/selenoid-ui/tree/selenoid2-1.55-engine29.6-go1.26-react18) (**v2.3.0**, API 1.55 / Engine 29.6+ / Go 1.26.5 / React 18). Детали — [`STACK-PIN.md`](../STACK-PIN.md) · [корневой README](../README.md) · [monorepo SSOT](https://github.com/qa-guru/zero-design-system/blob/master/projects/selenoid-home/README.md).

<!-- stack-branches-note:end -->

## Available Scripts

This app is built with [Vite](https://vitejs.dev/). In the project directory, run:

### `yarn start`

Runs the app in development mode (Vite dev server).<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page reloads on edits.

### `yarn test`

Runs the Vitest + React Testing Library component suite once (`vitest run`) and
writes Allure results to `allure-results/`. Use `yarn test:watch` for watch mode.

### `yarn build`

Builds the app for production into the `build/` folder (minified, hashed assets),
ready to be embedded by the Go backend / deployed.

### `yarn preview`

Serves the production build locally for a quick smoke check.

## Learn More

-   [Vite documentation](https://vitejs.dev/guide/)
-   [Vitest documentation](https://vitest.dev/)
-   [React documentation](https://react.dev/)
