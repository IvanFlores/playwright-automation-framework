---
name: test-standards
description: 'Enforce and auto-apply test writing and organisation standards for Playwright + TypeScript projects. Covers import hygiene (path aliases), fixture pattern, test structure, test independence, and data hygiene. Load when writing, reviewing, or refactoring spec files or fixture files.'
---

# test-standards

Enforces how tests are written and organised in this Playwright + TypeScript project.
For every rule below: **detect** the violation, then **auto-apply** the fix when it is
mechanical and safe. Anything that needs human judgement is reported as `[MANUAL]`.

---

## Project context

- `BasePage` lives at `src/ui/pages/BasePage.ts` — `abstract class`, `protected readonly page: Page`,
  `async navigate(path = '/')`. All Page Objects extend it.
- `tsconfig.json` has `target: ES2022`, which implies `useDefineForClassFields: true`. Locators in
  Page Objects are `get` properties (owned by `pom-architect`).
- `baseURL` is configured in `playwright.config.ts` via `process.env.BASE_URL` (loaded by dotenv),
  so fixtures navigate with relative paths.
- `src/config/Env.ts` validates all required env vars at startup with descriptive errors; import it
  as `import { Env } from '@config/Env';`.
- `src/data/auth.data.ts` defines test users: `appUser` (from `Env`), plus site-specific accounts;
  import it as `import { users } from '@data/auth.data';`.
- Specs live in `tests/` and are named `*.spec.ts`.
- Fixtures live in `src/fixtures/index.ts`, exported as `test` and `expect` via the `@fixtures` alias.
- Path aliases are the only allowed import style — relative paths are always a violation
  (rule 1 below lists the only exceptions).

---

## Run modes

| User says | Behaviour |
|---|---|
| (default) "apply", "fix", "enforce", "refactor" | Detect + auto-apply mechanical fixes; report the rest as `MANUAL`. |
| "check", "review only", "don't fix", "report only", "solo revisar" | Detect and report only. **Do not modify any file.** Every fix is tagged `NOT APPLIED (report-only)`. |

If the request is ambiguous, default to detect + auto-fix only for files the user pointed at;
for a whole-project run with no explicit "fix" wording, prefer report-only and offer to apply.

## Output format

Every violation is reported exactly like this:

```
[test-standards] SEVERITY — RULE NAME
File:  <path>
Line:  <number>
Issue: <one sentence>
Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

Severities:

- `ERROR` — breaks an architecture rule.
- `WARNING` — convention not followed, no functional risk.

`Line` is the line in the file **before** any fix was applied. End the run with a one-line summary:

```
[test-standards] X violations found — Y auto-applied, Z manual
```

## Procedure

1. Collect files: `tests/**/*.spec.ts`, `src/fixtures/**`, `src/data/**`, and every other `*.ts` under
   `src/` and `tests/` (for rule 1). Read `tsconfig.json` `compilerOptions.paths`.
2. Run detection for all rules and build the full violation list **before** editing anything.
3. Apply fixes in this order: rule 1 (aliases) → rule 2 (`@fixtures` import) → rule 8 (framework)
   → rule 6 (cross-spec imports) → rule 7 (credentials) → rule 4 (fixture registration)
   → rule 3 (`beforeEach`) → rule 5 (`describe` / names).
4. Re-read every modified file once and confirm imports resolve and fixtures used by tests exist.
   If `npx tsc --noEmit` is available, run it.
5. Print every violation, then the summary.

Safety limits for auto-fix:

- Never change what a test verifies; only how it is structured and where its values come from.
- Never edit `tsconfig.json` or `playwright.config.ts` silently — report `MANUAL`.
- Never invent credentials; if a value has no known source, report `MANUAL`.

---

## Rules

### Rule 1 — Path aliases on all imports (ERROR)

Every import in `src/` and `tests/` must use a path alias. Relative paths (`../`, `./`) are forbidden.

Aliases (defined in `tsconfig.json`):

| Alias | Resolves to |
|---|---|
| `@pages/*` | `src/ui/pages/*` |
| `@components/*` | `src/ui/components/*` |
| `@fixtures` | `src/fixtures/index` |
| `@fixtures/*` | `src/fixtures/*` |
| `@data/*` | `src/data/*` |
| `@config/*` | `src/config/*` |
| `@helpers/*` | `src/helpers/*` |
| `@api/*` | `src/api/*` |

Out of scope (not checked): root-level tooling files such as `playwright.config.ts`, and imports of
npm packages.

A specifier such as `'../../src/ui/pages/LoginPage'` is a violation; the correct form is:

```typescript
import { LoginPage } from '@pages/LoginPage';
```

Detect: any `import … from '…'` or `export … from '…'` in `src/**` or `tests/**` whose specifier starts
with `./` or `../`.

Auto-fix: resolve the relative path to its real file and replace it with the alias equivalent.
Verify the `paths` entries exist in `tsconfig.json`; if an alias is missing, report `[MANUAL]` instead
of editing `tsconfig.json` silently (state the exact `paths` entry that needs adding).

### Rule 2 — Import `test` and `expect` from `@fixtures` (ERROR)

Spec files must not import from `@playwright/test` directly.

Exception: `src/fixtures/index.ts` itself imports `test as base` from `@playwright/test` and
re-exports `expect`. Page Objects may import types (e.g. `Page`) from `@playwright/test`.

```typescript
// ❌ In a spec
import { test, expect } from '@playwright/test';
// ✅
import { test, expect } from '@fixtures';
```

Detect: `from '@playwright/test'` in `tests/**/*.spec.ts`.

Auto-fix: replace the import with `@fixtures`. If the spec also imported types (e.g. `Page`,
`Locator`), keep those in a separate `import type { … } from '@playwright/test';` and flag the use
under `pom-architect` rule 4 if they are used for direct page access.

### Rule 3 — No manual `beforeEach` for Page Object initialisation (ERROR)

That is the fixture's responsibility. This includes `page.goto()` / `navigate()` calls used only to
reach the page under test.

```typescript
// ❌
let loginPage: LoginPage;
test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.navigate('/login');
});

// ✅ The fixture creates and navigates; the test consumes it
test('shows an error for invalid credentials', async ({ loginPage }) => { … });
```

Detect: `test.beforeEach` / `beforeAll` hooks that construct a Page Object (`new XxxPage(`), assign a
PO to an outer `let`, or only navigate.

Auto-fix: move the initialisation into a fixture in `src/fixtures/index.ts` (following rule 4),
remove the hook and the outer `let`, and add the fixture name to each test's destructured
arguments. If the hook also does unrelated setup (data seeding, API calls), move only the PO part and
report the rest as `MANUAL`.

### Rule 4 — New Page Objects registered in a fixture with the correct auth dependency (ERROR)

- **No auth required** → fixture depends on `{ page }`, creates the Page Object, calls
  `navigate('<path>')` with the page's path, then `use()`.
- **Auth required** → fixture depends on `{ page, authenticatedPage }`, creates the Page Object with
  `page` (the same instance the login used, because fixtures are shared per test), does NOT log in
  again, and calls `navigate('<path>')` only if the target path differs from the post-login landing
  page, then `use()`.

> `authenticatedPage` is a `LoginPage` and `page` is `protected` on Page Objects, so fixtures must
> never read `authenticatedPage.page`.

The `authenticatedPage` fixture MUST always exist in `src/fixtures/index.ts`:

```typescript
authenticatedPage: async ({ page }, use) => {
  const lp = new LoginPage(page);
  await lp.navigate();
  await lp.login(users.appUser.username, users.appUser.password);
  await use(lp);
},
```

(`LoginPage` imported from `@pages/LoginPage`, `users` from `@data/auth.data`.)
Playwright destroys the browser context after each test — no logout needed.

Reference shape of `src/fixtures/index.ts`:

```typescript
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { InventoryPage } from '@pages/InventoryPage';
import { users } from '@data/auth.data';

type Fixtures = {
  authenticatedPage: LoginPage;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.navigate();
    await lp.login(users.appUser.username, users.appUser.password);
    await use(lp);
  },

  // No auth
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/');
    await use(loginPage);
  },

  // Auth required — post-login landing page, so no extra navigate()
  inventoryPage: async ({ page, authenticatedPage }, use) => {
    void authenticatedPage; // dependency only: guarantees login ran on this `page`
    await use(new InventoryPage(page));
  },
});

export { expect };
```

Detect:

- A Page Object in `src/ui/pages/` (other than `BasePage`) with no fixture in `src/fixtures/index.ts`.
- A fixture for an auth-required page that does not depend on `authenticatedPage`, or that logs in again.
- A fixture that reads `authenticatedPage.page`.
- A fixture that navigates to a full URL (also `pom-architect` rule 5) or does not navigate when the
  page is not the post-login landing page.
- `authenticatedPage` missing.

Auto-fix: register the fixture with the correct dependencies (add it to the `Fixtures` type too);
create `authenticatedPage` if missing. Whether a page requires auth, and its path, are inferred from
existing specs/hooks; if they cannot be inferred, report `MANUAL`. If `LoginPage` or
`src/data/auth.data.ts` does not exist, report `MANUAL` rather than inventing them.

### Rule 5 — Tests wrapped in `describe` with descriptive names (WARNING)

Every `test()` must be inside `test.describe()`.

- Describe name = feature or page name.
- Test name = expected behaviour (not the action).

```typescript
// ❌
test('test', async ({ loginPage }) => { … });
test('click login', async ({ loginPage }) => { … });

// ✅
test.describe('Login', () => {
  test('redirects to inventory after valid login', async ({ loginPage }) => { … });
});
```

Detect: top-level `test(` calls outside a `test.describe(`; test names that are generic (`'test'`,
`'works'`, `'test 1'`, `'should work'`) or that only describe an action (start with `click`, `fill`,
`go to`, `open`).

Auto-fix: wrap bare `test()` calls in a `describe` named after the Page Object / feature used; rename
generic names to a behaviour-based name derived from the test body (its assertions). If the body has
no assertion to derive a behaviour from, report `MANUAL`.

### Rule 6 — No cross-spec imports (ERROR)

Specs must not import from other spec files. Shared data → `src/data/`. Shared setup →
`src/fixtures/`.

Detect: any import in `tests/**` whose resolved target is a `*.spec.ts` file.

Auto-fix: move the shared constants/objects to a file in `src/data/` (named after the feature, e.g.
`src/data/cart.data.ts`) and update every import to `@data/<file>`. Shared setup functions or hooks
→ `MANUAL` (they should become fixtures; the shape needs a decision).

### Rule 7 — No hardcoded credentials in specs (ERROR)

Credentials must come from `users.*` (`@data/auth.data`) or `Env.*` (`@config/Env`).

```typescript
// ❌
await loginPage.login('standard_user', 'secret_sauce');
// ✅
import { users } from '@data/auth.data';
await loginPage.login(users.appUser.username, users.appUser.password);
```

Detect: string literals in specs that look like usernames, emails, passwords, tokens or API keys —
especially arguments to `login(…)` / `fill(…)` and values assigned to variables named
`user*`, `pass*`, `email`, `token`, `apiKey`.

Auto-fix: replace string literals with `users.appUser.username` / `users.appUser.password` (or the
matching site-specific account in `src/data/auth.data.ts`) when the literal matches a known user;
otherwise `[MANUAL]`. Intentionally invalid credentials used by negative tests should move to
`src/data/auth.data.ts` (e.g. `users.invalidUser`) — `MANUAL` if that entry does not exist yet.

### Rule 8 — Only `@playwright/test` as test framework (ERROR)

No jest, mocha, chai, sinon, or any other test utility.

Detect: imports from `jest`, `@jest/globals`, `mocha`, `chai`, `sinon`, `vitest`, `jasmine`, `expect`
(the standalone package), or use of their globals (`describe`, `it`, `beforeAll` without the `test.`
prefix, `assert.*`).

Auto-fix: only for mechanical equivalents (e.g. `expect(...).toBe(...)` from chai/jest → Playwright
`expect` via `@fixtures`; `it(` → `test(`; `describe(` → `test.describe(`). Anything else
(mocks, spies, chai plugins, `should` style) → `[MANUAL]`.

---

## Quick checklist

- [ ] No relative imports in `src/` or `tests/`
- [ ] Specs import `test` / `expect` from `@fixtures`
- [ ] No `beforeEach` that creates or navigates Page Objects
- [ ] Every Page Object has a fixture; auth fixtures depend on `authenticatedPage`
- [ ] `authenticatedPage` exists in `src/fixtures/index.ts`
- [ ] Every `test()` inside `test.describe()` with behaviour-based names
- [ ] No spec imports another spec
- [ ] No hardcoded credentials in specs
- [ ] Only `@playwright/test` is used
