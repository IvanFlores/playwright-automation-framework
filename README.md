# Playwright Automation Template

A generic, opinionated starter for UI + API test automation with
[Playwright Test](https://playwright.dev) and TypeScript.

## Structure

```
src/
  config/env.ts        # typed env vars, loads .env / .env.<TEST_ENV>
  pages/               # page objects (extend BasePage)
  components/          # reusable component objects (nav bars, modals, tables)
  api/ApiClient.ts     # thin API helper for setup/teardown and API tests
  fixtures/index.ts    # custom `test` with page objects + api injected
  utils/testData.ts    # test data factories
tests/
  e2e/                 # browser specs (chromium, firefox, webkit projects)
  api/                 # API-only specs (api project)
  setup/auth.setup.ts  # optional login-once storageState setup
.github/workflows/     # CI example
```

## Getting started

```bash
npm install
npx playwright install
cp .env.example .env
npm test
npm run report
```

## Conventions

- Import `test`/`expect` from `@src/fixtures`, never directly from `@playwright/test`.
- Locators live in page/component objects; specs contain intent and assertions only.
- Prefer user-facing locators (`getByRole`, `getByLabel`, `getByTestId`). No fixed sleeps.
- Tag tests in the title: `@smoke`, `@regression`. Run with `npm run test:smoke`.
- Tests must be independent and parallel-safe; create data via factories/API, clean up after.
- Environments: set `TEST_ENV=staging` to load `.env.staging`.

## Adding a page

1. Create `src/pages/MyPage.ts` extending `BasePage` (set `path`).
2. Register it in `src/fixtures/index.ts`.
3. Use it in a spec: `test('...', async ({ myPage }) => { ... })`.

## Authentication

Enable the `setup` project and `storageState` lines in `playwright.config.ts`,
adapt `tests/setup/auth.setup.ts`, and set `USER_NAME` / `USER_PASSWORD`.

## BDD layer (Cucumber)

Gherkin scenarios in `features/` reuse the same page objects and `ApiClient` as the
Playwright Test specs.

```
features/
  *.feature            scenarios (Gherkin)
  steps/               step definitions (thin: delegate to page objects / ApiClient)
  support/world.ts     per-scenario World: browser, page, api client, scratch `data`
  support/hooks.ts     Before/After: launches browser (or API client for @api), screenshot + trace on failure
cucumber.cjs           profiles: default, smoke, regression, api
```

| Command | What it does |
|---|---|
| `npm run bdd` | All scenarios |
| `npm run bdd:smoke` / `bdd:regression` / `bdd:api` | Profile by tag |
| `npm run bdd:headed` | Visible browser |
| `npm run bdd:dry-run` | Validate that every step is defined, run nothing |

Options via env vars: `PW_BROWSER=firefox|webkit|chromium`, `HEADLESS=false`, `PARALLEL=4`.
Reports are written to `reports/` (HTML, JSON, JUnit; traces for failed scenarios in `reports/traces/`).
Tag a scenario `@api` to get an API client instead of a browser.
