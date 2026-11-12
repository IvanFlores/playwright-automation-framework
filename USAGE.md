# Playwright Automation Framework – Usage Guide

How to set up, run and extend the GAD test suite. For an overview, see [README.md](README.md).

## 1. Prerequisites
- Node.js 20+ (22 recommended) and npm
- Git and the GitHub CLI (`gh`), used by the `git-standards` workflow
- A running GAD instance (e.g. `http://localhost:3001`) and an account on it
- Claude Code, to run the skills in `.claude/skills/`

## 2. Setup
```bash
git clone https://github.com/IvanFlores/playwright-automation-framework.git
cd playwright-automation-framework
npm install
npx playwright install --with-deps   # downloads browsers
cp .env.example .env                  # then edit values
```

`.env` values (validated at startup by `src/config/Env.ts`):

| Variable | Required | Purpose |
|---|---|---|
| `BASE_URL` | yes | GAD URL for UI tests |
| `TEST_USERNAME` / `TEST_PASSWORD` | yes | GAD account used by the `authenticatedPage` fixture |
| `API_BASE_URL` | no | API tests host (default JSONPlaceholder) |
| `TEST_ENV` | no | loads `.env.<TEST_ENV>` before `.env` |

## 3. Running tests
| Command | What it does |
|---|---|
| `npm test` | All projects (chromium, firefox, webkit, api) |
| `npm run test:chromium` | UI tests in Chromium only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run test:headed` | Visible browser |
| `npm run test:debug` | Playwright Inspector |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open the HTML report (`playwright-report/`) |
| `npm run codegen` | Record a test / discover locators |
| `npm run typecheck` / `lint` / `format` | Code quality |

Run one file: `npx playwright test tests/ui/smoke/login/TC1-valid-login.spec.ts`.
Use another environment: `TEST_ENV=staging npm test` (loads `.env.staging`).

## 4. Project layout
```
src/config/Env.ts        validated env vars (.env, .env.<TEST_ENV>)
src/ui/pages/            page objects (extend BasePage): Login, Home, Articles
src/ui/components/       reusable component objects (NavBar)
src/api/ApiClient.ts     API helper for setup/teardown and API tests
src/fixtures/index.ts    custom `test` (alias `@fixtures`) injecting page objects and `api`
src/data/                users, messages and data factories
tests/ui/<suite>/<feature>/TC{N}-<name>.spec.ts   UI test cases (smoke | regression)
tests/api/               API specs
tests/setup/             optional login-once setup
features/                Cucumber feature files, steps/ and support/ (World, hooks)
docs/decisions/          ADRs
docs/evidence/           skill run reports, screenshots
.claude/skills/          Claude Code skills
```

## 5. Extending the suite
1. **Add a page:** create `src/ui/pages/MyPage.ts` extending `BasePage` (locators as `get`
   properties, actions as `async` methods, no `expect`). Register a fixture in
   `src/fixtures/index.ts`: `{ page }` for public pages, `{ page, authenticatedPage }` when
   login is needed.
2. **Add a test case:** create `tests/ui/<smoke|regression>/<feature>/TC{N}-<short-name>.spec.ts`
   using the next free `N`. Import `test`/`expect` from `@fixtures` and data from `@data/*`.
   Name the describe block after the feature folder in PascalCase, start the test name with
   `TC{N}: `, set `{ tag: '@smoke' }` or `{ tag: '@regression' }`, and wrap steps in `test.step()`.
3. **Check it:** in Claude Code, say "apply architecture" (automation-architect hub) and expect
   `✅ All rules satisfied.`
4. **Authentication once per run (optional):** add a `setup` project
   (`testMatch: /.*\.setup\.ts/`) and point the UI projects' `storageState` at the file
   written by `tests/setup/auth.setup.ts`.

## 6. Conventions
- Path aliases only (`@pages/*`, `@fixtures`, `@data/*`, `@config/*`, …), no relative imports.
- Import `test`/`expect` from `@fixtures`, not `@playwright/test`.
- Locators live in page/component objects; specs hold intent and assertions.
- Prefer `getByRole`, `getByLabel`, `getByTestId`; never use fixed sleeps.
- Credentials come from `users.*` (`@data/auth.data`), never literals in specs.
- Tests must be independent and parallel-safe.

## 7. AI skills and git workflow
| Say in Claude Code | Skill | Result |
|---|---|---|
| "apply architecture" / "full review, report only" | `automation-architect` (Mode 1) | pom-architect + test-standards + spec-standards |
| "check structure" | `automation-architect` (Mode 2) | folder placement + import style |
| "new page object" | `automation-architect` (Mode 3) | scaffolds PO + fixture + spec |
| "check git" / "create PR" | `git-standards` (or hub Mode 4) | validates or runs the git workflow |

Git rules (`git-standards`): branches `test/<scope>` or `fix/<scope>`; commit subjects
`type(scope): description` with `feat`, `fix`, `refactor`, `chore`, `docs`; at least one
`feat`/`fix` commit per branch; PRs into `main` with `gh`; stage files explicitly.

## 8. CI
`.github/workflows/playwright.yml` runs on pushes and PRs to `main`: installs dependencies and
browsers, runs `npx playwright test` and uploads `playwright-report/` as an artifact (30 days).
It needs `BASE_URL`, `TEST_USERNAME` and `TEST_PASSWORD` in the job environment and a GAD
instance reachable from the runner. Neither is configured yet, so CI only works after you add them.

## 9. BDD layer (Cucumber)
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
Note: the browser is chosen with `PW_BROWSER`, not `BROWSER`, because many systems already set `BROWSER` to something unrelated.

## 10. Troubleshooting
- *"Missing required environment variable(s)"*: fill `.env` from `.env.example`.
- *TC1/TC3 fail with "Invalid username or password"*: the GAD data was reset; register the
  account again or update `TEST_USERNAME` / `TEST_PASSWORD`.
- *"Playwright requires Node.js 20 or higher"*: upgrade Node (`nvm use 22`).
- *Browsers missing*: run `npx playwright install --with-deps`.
- *Debugging a failure*: `npx playwright show-trace test-results/<test>/trace.zip`.
