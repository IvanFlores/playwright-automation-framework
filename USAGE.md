# Playwright Automation Template – Usage Guide

## 1. Prerequisites
- Node.js 20+ (22 recommended) and npm
- Git (optional)

## 2. Setup
```bash
unzip playwright-automation-template.zip
cd playwright-automation-template
npm install
npx playwright install --with-deps   # downloads browsers
cp .env.example .env                  # then edit values
```

## 3. Running tests
| Command | What it does |
|---|---|
| `npm test` | All projects (chromium, firefox, webkit, api) |
| `npm run test:chromium` | Browser tests in Chromium only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run test:headed` | Visible browser |
| `npm run test:debug` | Playwright Inspector |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open the HTML report |
| `npm run codegen` | Record a test / discover locators |
| `npm run typecheck` / `lint` / `format` | Code quality |

Run one file: `npx playwright test tests/e2e/home.spec.ts`.
Use another environment: `TEST_ENV=staging npm test` (loads `.env.staging`).

## 4. Project layout
```
src/config/env.ts      typed env vars (.env, .env.<TEST_ENV>)
src/pages/             page objects (extend BasePage)
src/components/        reusable component objects
src/api/ApiClient.ts   API helper for setup/teardown and API tests
src/fixtures/index.ts  custom `test` injecting page objects and `api`
src/utils/testData.ts  data factories
tests/e2e/             browser specs
tests/api/             API specs
tests/setup/           login-once setup
features/              Cucumber feature files, steps/ and support/ (World, hooks)
cucumber.cjs           Cucumber profiles
```

## 5. Adapting it to your application
1. Set `BASE_URL` and `API_BASE_URL` in `.env` (and in CI variables).
2. Replace the sample `HomePage`, `NavBar` and specs with your own; delete the sample tests.
3. **Add a page:** create `src/pages/MyPage.ts` extending `BasePage` (set `path`), register it in `src/fixtures/index.ts`, then use `async ({ myPage }) => {}` in specs.
4. **Add a test:** create `tests/e2e/<feature>.spec.ts`, import `test`/`expect` from `@src/fixtures`, and tag the title with `@smoke` or `@regression`.
5. **Authentication:** in `playwright.config.ts` uncomment the `setup` project, the `dependencies: ['setup']` line and `storageState`. Adapt `tests/setup/auth.setup.ts` and set `USER_NAME` / `USER_PASSWORD`.
6. **Browsers:** remove unused projects in `playwright.config.ts` to speed up runs.

## 6. Conventions
- Import `test`/`expect` from `@src/fixtures`, not `@playwright/test`.
- Locators live in page/component objects; specs hold intent and assertions.
- Prefer `getByRole`, `getByLabel`, `getByTestId`; never use fixed sleeps.
- Tests must be independent and parallel-safe; create data via factories or the API and clean up.

## 7. CI
`.github/workflows/playwright.yml` has three jobs: `quality` (typecheck and lint) runs first, then `playwright` (Playwright Test specs) and `cucumber` (BDD scenarios, chromium only) run in parallel. Each uploads its report as an artifact (`playwright-report`, `cucumber-report`). Define repo variables `BASE_URL`, `API_BASE_URL` and secrets `USER_NAME`, `USER_PASSWORD`. A manual run accepts a `grep` filter (e.g. `@smoke`) for Playwright Test and a `cucumber_profile` choice (default, smoke, regression, api) for Cucumber.

## 8. BDD layer (Cucumber)
Gherkin scenarios in `features/` reuse the page objects and `ApiClient`, so both styles share one code base.

| Command | What it does |
|---|---|
| `npm run bdd` | All scenarios |
| `npm run bdd:smoke` / `bdd:regression` / `bdd:api` | Profile by tag (see `cucumber.cjs`) |
| `npm run bdd:headed` | Visible browser |
| `npm run bdd:dry-run` | Check all steps are defined without running |

Env vars: `PW_BROWSER` (chromium, firefox, webkit), `HEADLESS=false`, `PARALLEL=4`.
Reports: `reports/cucumber-report.html` (plus JSON and JUnit); failed scenarios add a screenshot and a trace in `reports/traces/`.

**Add a scenario:** write it in `features/<name>.feature`, tag it (`@smoke`, `@regression`, or `@api` for API-only), then run `npm run bdd:dry-run` to see undefined steps.
**Add steps:** create `features/steps/<name>.steps.ts`. Use `this.page`, `this.homePage`, `this.api` and `this.data` (scratch values shared between steps of one scenario) from `CustomWorld`. Keep steps thin and put locators in page objects.
**Add a page to BDD:** construct it in `startBrowser()` in `features/support/world.ts`.
Note: do not use the `BROWSER` env var; many systems already set it to something unrelated, which is why the template uses `PW_BROWSER`.

## 9. Troubleshooting
- *"Playwright requires Node.js 20 or higher"*: upgrade Node (`nvm use 22`).
- *Browsers missing*: run `npx playwright install --with-deps`.
- *Debugging a failure*: `npx playwright show-trace test-results/<test>/trace.zip`.
