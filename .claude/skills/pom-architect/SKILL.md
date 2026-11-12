---
name: pom-architect
description: 'Enforce and auto-apply Page Object Model rules for Playwright + TypeScript projects. Detects violations and fixes them: Page Objects extending BasePage, locators as getters, actions as async methods, no direct page usage in test bodies, navigate() using baseURL, assertions only in specs, correct folder placement. Load when creating, reviewing, or refactoring Page Objects or spec files.'
---

# pom-architect

Enforces the Page Object Model (POM) architecture of this Playwright + TypeScript project.
For every rule below: **detect** the violation, then **auto-apply** the fix when it is
mechanical and safe. Anything that needs human judgement is reported as `[MANUAL]`.

---

## Project context

- `BasePage` lives at `src/ui/pages/BasePage.ts` — `abstract class`, `protected readonly page: Page`,
  `async navigate(path = '/')`. All Page Objects extend it.
- `tsconfig.json` has `target: ES2022`, which implies `useDefineForClassFields: true`. Locators in
  Page Objects are written as `get` properties (lazy, always evaluated against a ready `this.page`,
  and immune to class-field initialisation-order problems).
- `baseURL` is configured in `playwright.config.ts` via `process.env.BASE_URL` (loaded by dotenv),
  so every navigation uses a relative path.
- `src/config/Env.ts` validates all required env vars at startup with descriptive errors.
- `src/data/auth.data.ts` defines test users: `appUser` (from `Env`), plus site-specific accounts.
- Specs live in `tests/` and are named `*.spec.ts`.
- Path aliases are the only allowed import style — relative paths are always a violation
  (see `test-standards` rule 1 for the only exceptions). Every import this skill writes uses an alias
  (`@pages/*`, `@components/*`, `@fixtures`, `@data/*`, `@config/*`, `@helpers/*`, `@api/*`).

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
[pom-architect] SEVERITY — RULE NAME
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
[pom-architect] X violations found — Y auto-applied, Z manual
```

## Procedure

1. Collect files: `src/ui/pages/**`, `src/ui/components/**`, `src/fixtures/**`, `tests/**/*.spec.ts`,
   plus any `*.ts` file that declares a class with `page` in its constructor (to catch misplaced POs).
2. Run detection for all rules and build the full violation list **before** editing anything.
3. Apply fixes in this order (later rules depend on earlier ones):
   rule 7 (folders) → rule 1 (BasePage) → rule 2 (getters) → rule 8 (data) → rule 5 (URLs)
   → rule 3 / rule 4 (move interactions into POs) → rule 6 (move assertions to specs).
4. Re-read every modified file once and confirm it still type-checks logically
   (imports resolve via aliases, no dangling references). If `npx tsc --noEmit` is available, run it.
5. Print every violation, then the summary.

Safety limits for auto-fix:

- Never change test behaviour: same interactions, same order, same assertions.
- Never delete a method that is referenced elsewhere — update the callers first.
- If a fix would require inventing a name the code does not suggest (e.g. a new Page Object for an
  unknown page), report `MANUAL` instead.

---

## Rules

### Rule 1 — All Page Objects extend BasePage (ERROR)

Never define a constructor or `navigate()` directly in a Page Object.

`BasePage` must exist at `src/ui/pages/BasePage.ts`:

```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
```

Every Page Object contains only getters and action methods:

```typescript
import { BasePage } from '@pages/BasePage';

export class LoginPage extends BasePage {
  get usernameInput() {
    return this.page.getByLabel('Username');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    // ...
  }
}
```

Detect:

- A class in `src/ui/pages/` (other than `BasePage`) without `extends BasePage`.
- A Page Object declaring its own `constructor(...)` or `navigate(...)`.
- `src/ui/pages/BasePage.ts` missing, or not matching the shape above.

Auto-fix:

- Add `extends BasePage` and `import { BasePage } from '@pages/BasePage';`.
- Remove the duplicate constructor and `navigate()`; replace `this.<ownPageField>` with `this.page`.
- Create `BasePage.ts` from the template above if missing.
- `MANUAL` if the constructor does more than store `page` (extra parameters, side effects), or if the
  local `navigate()` has logic beyond `page.goto(path)`.

### Rule 2 — Locators as getters (ERROR)

Page Object locators must be `get` properties, never constructor- or field-initialised.

Reason: Locators are lazy; getters are always evaluated against a ready `this.page` and avoid
class-field initialisation-order pitfalls under ES2022 (`useDefineForClassFields: true`), e.g. when a
class declares its own parameter properties.

```typescript
// ❌ Violation
readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
// or: this.submitButton = page.locator('#submit');  (inside a constructor)

// ✅ Correct
get submitButton() {
  return this.page.getByRole('button', { name: 'Submit' });
}
```

Detect: class fields or constructor assignments whose value is a `Locator`
(`this.page.locator`, `getByRole`, `getByLabel`, `getByText`, `getByTestId`, `frameLocator`, …).

Auto-fix: convert each to a `get` property with the same name and visibility, returning the same
expression rewritten against `this.page`. Remove the now-unused field declaration.

### Rule 3 — Actions as async methods (ERROR)

UI interactions (`click`, `fill`, `check`, `selectOption`, `press`, `hover`, `setInputFiles`, …) must be
encapsulated in `async` methods of the Page Object, never written directly in spec files.

Detect: interaction calls in `tests/**/*.spec.ts` on a locator — whether obtained from `page.*` or from
a Page Object getter (e.g. `await loginPage.submitButton.click()`).

Auto-fix:

- Group consecutive interactions on the same Page Object into one method named after intent
  (`login`, `addToCart`, `search`), with values the spec passed as parameters.
- Add the method to the Page Object; replace the spec lines with a single call.
- Reuse an existing method if one already performs the same sequence.
- `MANUAL` if the interactions span several pages and the target Page Object is unclear.

### Rule 4 — No direct `page.*` in test bodies (ERROR)

Spec files must go through Page Objects for everything, including navigation. No exceptions in specs;
`page.*` is allowed only inside Page Objects, `BasePage` and fixtures.

Detect: any `page.` member access in `tests/**/*.spec.ts` (`page.goto`, `page.locator`, `page.click`,
`page.getBy*`, `page.waitFor*`, …), including in hooks, and any spec test that destructures `{ page }`
to use it directly.

Auto-fix:

- Replace each call with the equivalent Page Object method or getter, creating it if needed.
- `page.goto(...)` used to reach the page under test → remove it; navigation belongs in the fixture
  (see `test-standards` rule 3/4).
- For assertions such as `expect(page).toHaveURL(...)`, prefer a Page Object getter for the needed
  locator; if the assertion is on the page itself (URL, title), report `MANUAL` and suggest the team
  decide the convention rather than inventing one.

### Rule 5 — `navigate()` uses baseURL (ERROR)

Navigation must use `'/'` or a relative path, never a hardcoded full URL (in Page Objects, fixtures
or specs).

```typescript
// ❌
await this.page.goto('https://example.com/login');
// ✅
await loginPage.navigate('/login');
```

Detect: `goto(` or `navigate(` with a string starting with `http://` or `https://`.

Auto-fix: replace with the path portion (`'/'` for the root). If the host differs from `BASE_URL`
(a different site), report `MANUAL` — it needs a separate project or config entry.

### Rule 6 — `expect()` only in spec files (ERROR)

Page Objects must not contain `expect()`, unless the method name starts with `assert` and has a JSDoc
comment explaining why. Post-action locators needed for assertions must be public `get` properties.

```typescript
// ❌ In a Page Object
async login(u: string, p: string) {
  // ...
  await expect(this.page.getByText('Welcome')).toBeVisible();
}

// ✅ Page Object exposes the locator
get welcomeMessage() {
  return this.page.getByText('Welcome');
}

// ✅ Spec asserts
await expect(loginPage.welcomeMessage).toBeVisible();
```

Detect: `expect(` inside `src/ui/pages/**` or `src/ui/components/**`, except in a method named
`assert*` that has a JSDoc block directly above it.

Auto-fix:

- Expose the asserted locator as a public getter (Rule 2 form).
- Move the `expect()` into every spec that calls the method, right after the call.
- Remove the now-unused `expect` import from the Page Object.
- `MANUAL` if the assertion is used as a synchronisation wait mid-flow (removing it could change
  behaviour) — suggest replacing it with `locator.waitFor()` inside the Page Object.

### Rule 7 — Correct folder placement (WARNING)

| Kind | Folder |
|---|---|
| Page Objects | `src/ui/pages/` |
| Components | `src/ui/components/` |
| Fixtures | `src/fixtures/` |
| Test data | `src/data/` |
| Config / Env | `src/config/` |
| Helpers | `src/helpers/` |
| API clients | `src/api/` |

Detect by content, not by name:

- Class extending `BasePage` → Page Object.
- Class wrapping a `Page` or root `Locator` for a reusable widget (nav bar, modal, table) → Component.
- Module calling `base.extend(` → fixtures.
- Module exporting only constants / objects of test values → data.
- Module reading `process.env` / dotenv → config.
- Class wrapping `APIRequestContext` → API client.
- Stateless utility functions → helpers.

Auto-fix: move the file to the correct folder and update all imports (aliases make this a
path-alias rewrite, e.g. `@pages/NavBar` → `@components/NavBar`). If the target alias is not
defined in `tsconfig.json`, move nothing and report `MANUAL` (see `test-standards` rule 1).

### Rule 8 — No hardcoded credentials or test data in Page Objects (ERROR)

Parametrise, or use data files (`@data/*`, `@config/Env`).

```typescript
// ❌
async login() {
  await this.usernameInput.fill('admin');
  await this.passwordInput.fill('secret123');
}

// ✅
async login(username: string, password: string) {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
}

// Caller (fixture or spec)
import { users } from '@data/auth.data';
await loginPage.login(users.appUser.username, users.appUser.password);
```

Detect: string literals passed to `fill`, `type`, `pressSequentially`, `selectOption`, or compared
against in a Page Object, that look like credentials or business data (usernames, passwords, emails,
tokens, product names, amounts). Locator selectors and accessible names are not test data.

Auto-fix: replace each literal with a method parameter and update every caller to pass the value from
`users.*` (`@data/auth.data`) or `Env.*` (`@config/Env`). If no matching data entry exists, add the
parameter but report `MANUAL` for where the value should live.

---

## Quick checklist

- [ ] `src/ui/pages/BasePage.ts` exists with `navigate(path = '/')`
- [ ] Every PO `extends BasePage`, no constructor, no `navigate()`
- [ ] All locators are `get` properties
- [ ] All interactions live in `async` PO methods
- [ ] No `page.*` in spec bodies
- [ ] No full URLs in `goto` / `navigate`
- [ ] No `expect()` in POs (except documented `assert*` methods)
- [ ] Files in the right folder
- [ ] No hardcoded credentials or data in POs
