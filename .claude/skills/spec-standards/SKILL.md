---
name: spec-standards
description: 'Enforce and auto-apply organisational and lifecycle standards for spec files in Playwright + TypeScript projects. Covers folder hierarchy (tests/ui/{suite}/{feature}), file naming (TC{N}-short-name.spec.ts), TC ID format in test names, describe-block naming, and step definition with test.step(). Triggers: "check spec structure", "spec standards", "organise specs", "TC naming". Load when creating, reviewing, or reorganising UI spec files.'
---

# spec-standards

Owns the **organisation and lifecycle** of spec files. It is distinct from `test-standards`, which owns
code-level quality (imports, fixtures, credentials, framework).

| Skill | Domain |
|---|---|
| `pom-architect` | Page Object layer structure |
| `test-standards` | Spec code quality — imports, fixtures, credentials, framework |
| `spec-standards` | Spec organisation — folder hierarchy, file naming, TC IDs, `test.step()` |

Future growth (not active yet): tagging conventions, `beforeAll`/`afterAll` policies, `test.only` /
`test.skip` justification.

---

## Project context

- UI spec files live under `tests/ui/{suite}/{feature}/TC{N}-{short-name}.spec.ts`.
- Suites: `smoke` (critical path) and `regression` (edge cases, negative paths).
- `{feature}` is the **functionality under test**, not the page name.
- TC IDs are assigned by the team; this skill validates the format only. `TC0` is reserved for
  examples outside the main suite.
- One spec file per TC; data-driven variants of the same TC stay in the same file.
- `test.step()` is the only accepted way to label steps — `// Step N:` comments and JSDoc `@steps`
  are violations.
- Suite tags (`@smoke` / `@regression`) are set with Playwright's `tag` option and should match the
  suite folder (informational — a tagging rule is planned, not enforced yet).
- Out of scope: `tests/api/**` (API project, own `testMatch` in `playwright.config.ts`) and
  `tests/setup/**` (`*.setup.ts`, not specs).
- Application under test: GAD (`BASE_URL`). Typical feature folders:

| Functionality validated | Feature folder |
|---|---|
| User authentication | `login/` |
| Signed-in landing page | `home/` |
| Article list / search / detail | `articles/` |
| Comments | `comments/` |
| Account creation | `register/` |

---

## Run modes

| User says | Behaviour |
|---|---|
| (default) "apply", "fix", "enforce", "organise" | Detect + auto-apply; report the rest as `MANUAL`. |
| "check", "review only", "don't fix", "report only" | Detect and report only. **Do not modify any file.** Every fix is tagged `NOT APPLIED (report-only)`. |

## Output format

Same format as the other sub-skills, so the hub can aggregate it:

```
[spec-standards] SEVERITY — RULE_NAME
File:  <relative path from project root>
Line:  <line number, or — for file-level issues>
Issue: <one sentence>
Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

End with: `[spec-standards] X violations found — Y auto-applied, Z manual`

## Procedure

1. Collect `tests/**/*.spec.ts`, excluding `tests/api/**` and `tests/setup/**`.
2. Detect all rules and build the full list **before** editing.
3. Fix in order R1 (split/move) → R2 (rename) → R3 (describe) → R4 (TC prefix) → R5 (steps).
   Moves use `git mv` when the project is a git repository, so history is kept.
4. After moving, re-check `test-standards` rule 1 (aliases) and rule 6 (cross-spec imports) on the
   moved files, then run `npx tsc --noEmit` and `npx playwright test --list` to confirm discovery.
5. Print every violation, then the summary.

Safety limits: never change what a test verifies (same fixtures, actions, assertions, order);
when the TC number of an un-numbered spec cannot be inferred, take the next free `N` across
`tests/ui/**` and say so in the `Fix:` line.

---

## Rules

### R1 — FOLDER_STRUCTURE (ERROR, auto-fix)

Condition: a spec is not at `tests/ui/{suite}/{feature}/TC{N}-{short-name}.spec.ts` — including
files directly under `tests/`, under another folder such as `tests/e2e/`, or under `tests/ui/`
without both sub-levels.

Auto-fix:

1. Suite: `smoke` unless the test is a negative/edge path or tagged `@regression`.
2. Feature: from the `test.describe()` name, PascalCase/words → kebab-case (`'Login'` → `login`).
3. If the file holds tests that are different TCs, split into one file per TC first.
4. Move the file and update every import referring to the old path.

```
tests/example.spec.ts           ❌  → tests/ui/smoke/login/TC1-valid-login.spec.ts
tests/e2e/home.spec.ts          ❌  → tests/ui/smoke/home/TC3-home-greeting-user-menu.spec.ts
```

### R2 — FILE_NAMING_CONVENTION (ERROR, auto-fix)

Condition: the file name does not match `^TC(0|[1-9]\d*)-[a-z0-9]+(-[a-z0-9]+){0,4}\.spec\.ts$`
(no padding, 1–5 kebab words, no underscores, no hyphen between `TC` and `N`), or `N` differs from
the `TC{N}:` used in its tests.

Auto-fix: take `N` from the tests (or R1's assignment), derive up to 5 significant words from the
test name, rename.

```
TC1-valid-login.spec.ts                ✅
TC10-subscription-home-page.spec.ts    ✅
example.spec.ts                        ❌  no TC ID
TC8_VerifyAllProducts.spec.ts          ❌  underscore and PascalCase
TC-8-verify-products.spec.ts           ❌  hyphen between TC and number
```

### R3 — DESCRIBE_MATCHES_FEATURE_FOLDER (ERROR, auto-fix)

Condition: the top-level `test.describe()` name is not the PascalCase of the feature folder
(`login/` → `'Login'`, `user-registration/` → `'UserRegistration'`).

Auto-fix: rename the describe string (after R1).

### R4 — TC_ID_NAMING_CONVENTION (ERROR, auto-fix)

Condition: a `test()` name does not start with `TC{N}: ` (capital `TC`, integer, colon, space) or
`N` differs from the file name. After the prefix the name still describes the expected behaviour
(`test-standards` rule 5).

```typescript
test('TC1: greets the user by email after a valid login', …)   ✅
test('TC8 Verify All Products', …)                             ❌ missing colon
test('verify all products', …)                                 ❌ no TC ID
```

Data-driven variants keep the prefix plus a distinguishing suffix:
`'TC2: shows an error for invalid credentials — empty email'`.

Auto-fix: prepend `TC{N}: ` or correct the number.

### R5 — USE_TEST_STEP (ERROR, auto-fix)

Condition: a `test()` body labels steps with `// Step N:` comments, or contains action/assertion
statements that are not inside an `await test.step('…', async () => { … })` block.

Why: `test.step()` labels appear as collapsible entries in the HTML report and trace viewer;
comments are invisible to the reporter.

Auto-fix: remove step comments, group each logical action + its assertions into a `test.step()`
named after the intent, and return values from the callback when a later step needs them.

```typescript
test('TC4: lists articles with pagination', { tag: '@smoke' }, async ({ articlesPage }) => {
  await test.step('Verify the article list is populated', async () => {
    await expect(articlesPage.articleTitles.first()).toBeVisible();
  });

  await test.step('Verify pagination shows the first page', async () => {
    await expect(articlesPage.currentPage).toHaveText('1');
  });
});
```

---

## Quick checklist

- [ ] Every UI spec is at `tests/ui/{smoke|regression}/{feature}/`
- [ ] File names are `TC{N}-short-kebab-name.spec.ts` and match the TC IDs inside
- [ ] `test.describe()` = PascalCase of the feature folder
- [ ] Every `test()` name starts with `TC{N}: `
- [ ] Every test body is organised in `test.step()` blocks, no `// Step` comments
