---
name: automation-architect
description: 'Hub skill that orchestrates pom-architect and test-standards for Playwright + TypeScript projects. Use for full architecture enforcement (review + auto-fix) on existing files, to check structure only, or to scaffold new Page Objects, fixtures, and spec files following all agreed patterns. Triggers: "apply architecture", "aplicar arquitectura", "full review", "check structure", "revisar estructura", "scaffold", "generar", "new page object". Invoke sub-skills independently for targeted checks.'
---

# automation-architect (hub)

Orchestrates the two rule skills of this project:

| Sub-skill | File | Owns |
|---|---|---|
| `pom-architect` | `.claude/skills/pom-architect/SKILL.md` | Page Object Model rules 1–8 |
| `test-standards` | `.claude/skills/test-standards/SKILL.md` | Test writing / organisation rules 1–8 |

**The hub does not duplicate their rules.** For each pipeline step it loads
`.claude/skills/pom-architect/SKILL.md` and `.claude/skills/test-standards/SKILL.md`, applies their
rules exactly as written there, and aggregates their output. When this file refers to "pom-architect
rule N" or "test-standards rule N", the sub-skill file is the source of truth.

For a targeted check (one rule family only), invoke the sub-skill directly instead of the hub.

---

## Project context

- `BasePage` lives at `src/ui/pages/BasePage.ts` — `abstract class`, `protected readonly page: Page`,
  `async navigate(path = '/')`. All Page Objects extend it.
- `tsconfig.json` has `target: ES2022`, which implies `useDefineForClassFields: true`. Locators in
  Page Objects are written as `get` properties (lazy, always evaluated against a ready `this.page`,
  and immune to class-field initialisation-order problems).
- `baseURL` is configured in `playwright.config.ts` via `process.env.BASE_URL` (loaded by dotenv).
- `src/config/Env.ts` validates all required env vars at startup with descriptive errors.
- `src/data/auth.data.ts` defines test users: `appUser` (from `Env`), plus site-specific accounts.
- Specs live in `tests/` and are named `*.spec.ts`.
- Path aliases are the only allowed import style — relative paths are always a violation
  (see `test-standards` rule 1 for the only exceptions).

---

## Shared conventions

- **Report-only runs:** if the user says "check", "review only", "don't fix" (or Mode 2 is selected),
  no file is modified and every fix is tagged `NOT APPLIED (report-only)`.
- **Violation format:** each sub-skill prints its own violations in the common format:

  ```
  [skill-name] SEVERITY — RULE NAME
  File:  <path>
  Line:  <number>
  Issue: <one sentence>
  Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
  ```

- **Severities:** `ERROR` (breaks an architecture rule), `WARNING` (convention not followed, no
  functional risk).
- The hub prints all sub-skill violations first (grouped by skill), then its own summary block.

---

## Mode registry

| # | Mode | Domain | Status |
|---|---|---|---|
| 1 | Full pipeline | Architecture enforcement (detect + fix) | Active (M4) |
| 2 | Structure only | Folder placement + import style (report-only) | Active (M4) |
| 3 | Scaffold new file | Generation of PO + fixture + spec | Active (M4) |

Current total: **3 / 10** modes (see Hub Growth Policy, Rule 4).

Mode selection: match the user's wording against each mode's triggers. If nothing matches, use
Mode 1. If the wording matches Mode 1 **and** asks not to fix ("review only"), run Mode 1 in
report-only.

---

## Mode 1 — Full pipeline (default)

Triggered by: "aplicar arquitectura", "apply architecture", "full review", "enforce all rules".

Steps:

1. Identify all relevant files (specs, Page Objects, fixtures, data files):
   `tests/**/*.spec.ts`, `src/ui/**`, `src/fixtures/**`, `src/data/**`, `src/config/**`,
   `src/helpers/**`, `src/api/**`. If the user named specific files, limit the run to those plus the
   Page Objects / fixtures they depend on.
2. Apply `pom-architect` — load its SKILL.md, detect + auto-fix all POM violations.
3. Apply `test-standards` — load its SKILL.md, detect + auto-fix all test writing violations.
4. Re-scan once (both skills, detection only) to confirm no violation was introduced by the fixes.
   Newly introduced violations are fixed if mechanical, otherwise added to the manual list. Do not
   loop more than once.
5. Output unified summary.

Output:

```
[automation-architect] PIPELINE COMPLETE
─────────────────────────────────────────
pom-architect:    X violations found — Y auto-applied
test-standards:   X violations found — Y auto-applied
Remaining manual fixes: <list, or "none">
[automation-architect] ✅ All rules satisfied.      ← only when Remaining manual fixes is "none"
[automation-architect] ⚠️ Manual fixes pending.     ← otherwise
```

In report-only, `Y` is `0` and the closing line is `⚠️ Manual fixes pending.` whenever any violation
was found.

---

## Mode 2 — Structure only (report-only)

Triggered by: "revisar estructura", "check structure", "verify folders".

Steps:

1. Check all files are in their correct folder (`pom-architect` rule 7).
2. Check all imports use path aliases (`test-standards` rule 1).
3. Report only — no auto-fix unless the user explicitly requests it.

Output:

```
[automation-architect] STRUCTURE CHECK COMPLETE
─────────────────────────────────────────
Misplaced files:      X
Relative imports:     Y
(report-only — no changes made)
```

If the user explicitly asks to fix, apply only those two rules' auto-fixes and replace the last line
with `(fixes applied: N)`.

---

## Mode 3 — Scaffold new file

Triggered by: "generar", "crear", "scaffold", "nuevo Page Object", "new page".

Steps:

1. Ask (only for what cannot be inferred from context): page name, URL path, locators, requires
   authentication?
2. Generate `src/ui/pages/<Name>Page.ts` extending `BasePage` — only getters and action methods, no
   constructor, no `navigate()`, no `expect()`.
3. Register the fixture in `src/fixtures/index.ts` following `test-standards` rule 4:
   - No auth → `async ({ page }, use)` → create PO, `navigate('<path>')`, `use()`
   - Auth required → `async ({ page, authenticatedPage }, use)` → create PO with `page`,
     `navigate('<path>')` if the path differs from the post-login landing page, `use()`
4. Generate `tests/<name>.spec.ts` importing `test` and `expect` from `@fixtures` and data from
   `@data/*`, with a `describe` block and behaviour-named tests.
5. Verify zero relative imports in all generated files.

Templates (adapt names, path and locators; never copy placeholder selectors into real code):

`src/ui/pages/CheckoutPage.ts`

```typescript
import { BasePage } from '@pages/BasePage';

export class CheckoutPage extends BasePage {
  get firstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get errorMessage() {
    return this.page.getByTestId('error');
  }

  async fillCustomerInfo(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.continueButton.click();
  }
}
```

Fixture entry added to `src/fixtures/index.ts` (auth required, path differs from landing page):

```typescript
import { CheckoutPage } from '@pages/CheckoutPage';
// ...
type Fixtures = {
  // ...
  checkoutPage: CheckoutPage;
};
// ...
  checkoutPage: async ({ page, authenticatedPage }, use) => {
    void authenticatedPage; // dependency only: login already ran on this `page`
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.navigate('/checkout-step-one.html');
    await use(checkoutPage);
  },
```

`tests/checkout.spec.ts`

```typescript
import { test, expect } from '@fixtures';
import { checkoutData } from '@data/checkout.data';

test.describe('Checkout', () => {
  test('shows an error when first name is missing', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo(checkoutData.emptyFirstName);
    await expect(checkoutPage.errorMessage).toBeVisible();
  });
});
```

If the spec needs a data file that does not exist, create it in `src/data/` and list it under
`Created:`. After generating, run Mode 1 detection (report-only) on the generated files; any finding
is fixed before printing the summary.

Output:

```
[automation-architect] SCAFFOLD COMPLETE
─────────────────────────────────────────
Created:  src/ui/pages/<Name>Page.ts
Updated:  src/fixtures/index.ts
Created:  tests/<name>.spec.ts
```

---

## Hub Growth Policy

The hub grows by adding new modes as the course progresses (M5 adds Modes 4–6, later modules may add
more). To prevent uncontrolled growth and context overload, the following rules are **mandatory**:

**Rule 1 — Add a mode only for a real gap.**
A new mode is justified only when no existing mode (1–N) can detect the problem it targets. Before adding a mode, state explicitly which existing modes were considered and why they do not cover the gap.

**Rule 2 — Document the gap in an ADR first.**
Every new mode must be preceded by an ADR in `docs/decisions/` that records: the gap, the options considered (including extending an existing mode vs. adding a new one), and the decision. The mode is not added until the ADR exists.

**Rule 3 — One domain per mode.**
Each mode targets exactly one domain (e.g., git conventions, lifecycle process, refactor guidance). A mode that detects across multiple unrelated domains must be split or merged into the closest existing mode.

**Rule 4 — Maximum 10 modes.**
If a new mode would exceed 10 total modes, the team must first review existing modes for consolidation opportunities before adding. This limit exists to keep the SKILL.md within a size that an LLM agent can process reliably in a single context window.

**Rule 5 — Retire modes that no longer apply.**
When a module's scope is complete and a mode is no longer relevant to the active project, mark it as `[RETIRED]` in the SKILL.md with the reason. Do not delete — the history is part of the ADR record.

These rules are enforced by the team, not by the skill itself.

When adding a mode, also: add a row to the Mode registry (with the ADR file name), update the
"Current total" count, and add the mode's triggers to the frontmatter `description`.
