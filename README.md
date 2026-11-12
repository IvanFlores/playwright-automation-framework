# Playwright Automation Template

A generic, opinionated starter for UI + API test automation with
[Playwright Test](https://playwright.dev) and TypeScript.

## Structure

```
src/
  config/Env.ts        # validated env vars, loads .env / .env.<TEST_ENV>
  ui/pages/            # page objects (extend BasePage, locators as getters)
  ui/components/       # reusable component objects (nav bars, modals, tables)
  api/ApiClient.ts     # thin API helper for setup/teardown and API tests
  fixtures/index.ts    # custom `test` with page objects + api injected (`@fixtures`)
  data/                # test data (users, messages, factories)
tests/
  ui/smoke/<feature>/TC{N}-<name>.spec.ts       # critical-path UI test cases
  ui/regression/<feature>/TC{N}-<name>.spec.ts  # negative / edge-case UI test cases
  api/                 # API-only specs (api project)
  setup/auth.setup.ts  # optional login-once storageState setup
docs/decisions/        # ADRs (required before adding a hub mode)
docs/evidence/         # skill execution reports and screenshots
.claude/skills/        # AI skills (see "AI skills" below)
.github/workflows/     # CI example
```

## UI test cases (GAD, `BASE_URL`)

| TC | Suite | Feature | Verifies |
|---|---|---|---|
| TC1 | smoke | login | valid login greets the user by email |
| TC2 | regression | login | invalid credentials show an error, user stays signed out |
| TC3 | smoke | home | signed-in greeting on the landing page |
| TC4 | smoke | home | user menu button for a signed-in user |
| TC5 | smoke | articles | article list renders, pagination starts on page 1 |
| TC6 | regression | articles | search with no match shows "No data" |
| TC7 | regression | articles | "Items/Page" limits the list size |

## AI skills (Claude Code, `.claude/skills/`)

| Skill | Owns | Trigger |
|---|---|---|
| `automation-architect` | hub — Mode 1 pipeline, 2 structure, 3 scaffold, 4 git | "apply architecture" |
| `pom-architect` | Page Object rules 1–8 | "check page objects" |
| `test-standards` | spec code quality rules 1–8 | "check test standards" |
| `spec-standards` | TC folders, file names, TC IDs, `test.step()` (R1–R5) | "check spec structure" |
| `git-standards` | branch / commit / PR conventions (C1–C4, E1–E5) | "check git" |

## Getting started

```bash
npm install
npx playwright install
cp .env.example .env
npm test
npm run report
```

## Conventions

- Import `test`/`expect` from `@fixtures`, never directly from `@playwright/test`.
- Locators live in page/component objects; specs contain intent and assertions only.
- Prefer user-facing locators (`getByRole`, `getByLabel`, `getByTestId`). No fixed sleeps.
- One TC per file, steps in `test.step()`, tags via the `tag` option (`@smoke`, `@regression`).
  Run with `npm run test:smoke`.
- Git: branches `test/<scope>` or `fix/<scope>`; commits `type(scope): description`
  (feat, fix, refactor, chore, docs); PRs into `main`.
- Tests must be independent and parallel-safe; create data via factories/API, clean up after.
- Environments: set `TEST_ENV=staging` to load `.env.staging`.

## Adding a page

1. Create `src/ui/pages/MyPage.ts` extending `BasePage` (getters + async actions only).
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
