---
name: automation-architect
description: 'Hub skill that orchestrates pom-architect, ui-locator-wait-standard, test-standards, spec-standards, lifecycle-architect, spec-requirements-standard, spec-data-standard and git-standards for Playwright + TypeScript projects. Use for full architecture enforcement (review + auto-fix) on existing files, to check structure only, to scaffold new Page Objects, fixtures, and spec files following all agreed patterns, to validate / run the git workflow, to scaffold API-based setup/teardown (lifecycle infrastructure), or to review TC quality (specification, test data robustness, locators and waits). Triggers: "apply architecture", "aplicar arquitectura", "full review", "check structure", "revisar estructura", "scaffold", "generar", "new page object", "check git", "verify commits", "git conventions", "git workflow", "commit push PR", "create PR", "setup api layer", "scaffold api", "new controller", "add lifecycle support", "lifecycle architect", "tc quality review", "assess test cases", "refine test case", "automation readiness", "assess test data", "data robustness", "parallel safe", "multi environment", "verify robustness", "assess locators", "review locators", "fix waits", "strict mode violation", "polling", "verify interactions", "flaky interaction". Invoke sub-skills independently for targeted checks.'
---

# automation-architect (hub)

Orchestrates the rule skills of this project:

| Sub-skill | File | Owns |
|---|---|---|
| `pom-architect` | `.claude/skills/pom-architect/SKILL.md` | Page Object Model rules 1–8 |
| `test-standards` | `.claude/skills/test-standards/SKILL.md` | Test code quality rules 1–8 (imports, fixtures, credentials, framework) |
| `spec-standards` | `.claude/skills/spec-standards/SKILL.md` | Spec organisation rules R1–R5 (TC folders, file naming, TC IDs, `test.step()`) |
| `lifecycle-architect` | `.claude/skills/lifecycle-architect/SKILL.md` | API layer + setup/teardown rules R1–R8, R10, R11 (`src/api/**`, lifecycle fixtures, spec injection) — added M6 |
| `spec-requirements-standard` | `.claude/skills/spec-requirements-standard/SKILL.md` | TC specification Q1–Q13 · M0–M4 (`docs/test-cases/**/*.md`) — added M7 |
| `spec-data-standard` | `.claude/skills/spec-data-standard/SKILL.md` | Test data R1–R15 · M0–M5: classification · isolation · sourcing · environments · expected values (`src/data/**` · `src/config/**` · `src/fixtures/**` · `playwright.config.ts` · `tests/**/*.spec.ts`) — added M7 |
| `ui-locator-wait-standard` | `.claude/skills/ui-locator-wait-standard/SKILL.md` | Locator strategy · uniqueness · action semantics · waits · polling · timeouts R1–R20 · M0–M6 (lifecycle phases 3 Act · 5 Run) — added M8-9 |
| `git-standards` | `.claude/skills/git-standards/SKILL.md` | Git workflow conventions C1–C4 + execute E1–E5 (Mode 4 only) |

**The hub does not duplicate their rules.** For each pipeline step it loads the sub-skill's
`SKILL.md`, applies its rules exactly as written there, and aggregates their output. When this file
refers to "pom-architect rule N", "test-standards rule N" or "spec-standards RN", the sub-skill file
is the source of truth.

For a targeted check (one rule family only), invoke the sub-skill directly instead of the hub.

### Sub-skill invocation reference

| Goal | Skill to load | Trigger phrase example |
|---|---|---|
| Full architecture review + fix | `automation-architect` (Mode 1) | "apply architecture" |
| Page Object rules only | `pom-architect` | "check page objects" |
| Spec code quality only | `test-standards` | "check test standards" |
| Fix TC folder / naming / step violations | `spec-standards` | "check spec structure" |
| Validate git conventions or run full git workflow | `git-standards` | "check git" / "git workflow" |
| Review or scaffold the API layer / API setup-teardown | `lifecycle-architect` | "lifecycle review" / "scaffold api for articles" |
| Score TC specifications | `spec-requirements-standard` | "assess test cases" |
| Upgrade an incomplete TC / prepare it for automation | `spec-requirements-standard` | "refine test case TC8" / "automation readiness TC8" |
| Assess test data maturity / make tests safe in parallel | `spec-data-standard` | "assess test data" / "parallel safe" |
| Verify robustness with evidence | `spec-data-standard` | "verify robustness" |
| Assess locator and wait maturity | `ui-locator-wait-standard` | "assess locators" |
| Fix fragile locators / strict-mode violations | `ui-locator-wait-standard` | "review locators" |
| Replace fixed waits / add bounded polling | `ui-locator-wait-standard` | "fix waits" |
| Prove interactions are stable with evidence | `ui-locator-wait-standard` | "verify interactions" |

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
- API layer (`lifecycle-architect`): `src/api/client/` (ApiClient, only HTTP entry point) ·
  `src/api/endpoints/` (path constants) · `src/api/models/` (interfaces) · `src/api/controllers/`
  (business operations) · `src/api/mocks/` (route stubs). Specs get API data only through
  `<resource>Controller` / `created<Resource>` / `worker<Resource>` fixtures.
- TC specifications (`spec-requirements-standard`): `docs/test-cases/gad/{feature}-test-cases.md`.
  Test data (`spec-data-standard`): `src/data/` (factories prefixed with `Env.testDataPrefix`) and
  `src/config/Env.ts` (environment selection and validation).
- Path aliases are the only allowed import style — relative paths are always a violation
  (see `test-standards` rule 1 for the only exceptions).

### Locators and waits (`ui-locator-wait-standard`, ADR-005)

| File / scope | Owner | Concern |
|---|---|---|
| `src/ui/pages/**` · `src/ui/components/**` — locator expression and actions | `ui-locator-wait-standard` | R1–R12 (PO *structure* stays with `pom-architect`) |
| `tests/**/*.spec.ts` — waits and synchronisation | `ui-locator-wait-standard` | R13–R16 |
| `tests/**/*.spec.ts` · `src/fixtures/**` — polling and timeouts | `ui-locator-wait-standard` | R17–R20 |
| `playwright.config.ts` — test-id contract (`testIdAttribute`), timeout layers | `ui-locator-wait-standard` | R1, R19 |

- Execution order: right after `pom-architect` (locators are judged once the PO structure is
  correct), before spec-level checks.
- Changing `testIdAttribute` or global timeouts in `playwright.config.ts` → re-run R1 / R19 and
  update the `pom-architect` getter examples.
- Depends on Playwright `getByTestId` (string or RegExp), `getByAltText`, `getByTitle`,
  `pressSequentially` (≥ 1.38, replaces `type`), `expect.poll` / `toPass` `timeout` + `intervals`.

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
| 4 | Git workflow | Git conventions (validate + execute) | Active (M5) — `docs/decisions/ADR-001-git-workflow-mode.md` |
| 5 | Lifecycle infrastructure | API layer scaffold for setup/teardown | Active (M6) — `docs/decisions/ADR-002-lifecycle-infrastructure-mode.md` |
| 6 | TC quality review | TC lifecycle phases: specification · test data robustness · locators and waits | Active (M7; phases 3/5 extended M8-9, `ADR-005`) — `docs/decisions/ADR-003-tc-quality-review-mode.md` |

Current total: **6 / 10** modes (see Hub Growth Policy, Rule 4).

Mode selection: match the user's wording against each mode's triggers. If nothing matches, use
Mode 1. If the wording matches Mode 1 **and** asks not to fix ("review only"), run Mode 1 in
report-only.

---

## Mode 1 — Full pipeline (default)

Triggered by: "aplicar arquitectura", "apply architecture", "full review", "enforce all rules".

Steps:

0. Run `spec-requirements-standard` M0 on `docs/test-cases/**` (report only, no auto-fix except
   Q13). TCs graded Incomplete are listed as manual items.
1. Identify all relevant files (specs, Page Objects, fixtures, data files):
   `tests/**/*.spec.ts`, `src/ui/**`, `src/fixtures/**`, `src/data/**`, `src/config/**`,
   `src/helpers/**`, `src/api/**`. If the user named specific files, limit the run to those plus the
   Page Objects / fixtures they depend on.
2. Apply `pom-architect` — load its SKILL.md, detect + auto-fix all POM violations.
3. Apply `ui-locator-wait-standard` (M1–M5 rules) on Page Objects, specs, fixtures and config:
   auto-fix R1 (test-id contract), R9, R11, R13, R15, R16, R20; collect R1–R8, R10, R12, R14,
   R17–R19 as manual fixes.
4. Apply `test-standards` — load its SKILL.md, detect + auto-fix all test writing violations.
5. Apply `spec-standards` — load its SKILL.md, detect + auto-fix all spec organisation violations
   (folder / file name / TC ID / `test.step()`).
6. Apply `lifecycle-architect` (Mode Review) on `src/api/**`, `src/fixtures/index.ts` (lifecycle
   concerns only) and `tests/**/*.spec.ts` (R2, R7): auto-fix R1–R3, R5–R8, R11; collect R4 and R10
   as manual fixes.
7. Apply `spec-data-standard` (R1–R15) on fixtures, data, config, `playwright.config.ts` and specs:
   auto-fix R2, R3, R6–R9, R11; collect R1, R4, R5, R10, R12–R15 as manual fixes.
8. Re-scan once (all code skills, detection only) to confirm no violation was introduced by the
   fixes. Newly introduced violations are fixed if mechanical, otherwise added to the manual list.
   Do not loop more than once.
9. Output unified summary.

`git-standards` is **not** part of Mode 1 (it inspects git state, not code) — use Mode 4.

Output:

```
[automation-architect] PIPELINE COMPLETE
─────────────────────────────────────────
pom-architect:    X violations found — Y auto-applied
ui-locator-wait-standard: X violations found — Y auto-applied
test-standards:   X violations found — Y auto-applied
spec-standards:   X violations found — Y auto-applied
lifecycle-architect: X violations found — Y auto-applied
spec-data-standard: X violations found — Y auto-applied
spec-requirements-standard: <n> TCs assessed — <r> Ready (report-only)
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
   constructor, no `navigate()`, no `expect()`. Getters follow the `ui-locator-wait-standard` R1
   hierarchy for the resolved test-id contract and use only values observed in the DOM; an
   ambiguous or unverified locator is generated with `// TODO: verify locator in DOM` (R4).
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

## Mode 4 — Git workflow

Triggered by: "check git", "verify commits", "git conventions", "pre-PR check", "git workflow",
"commit push PR", "create PR".

Thin wrapper — the rules live only in `git-standards`.

Steps:

1. Load `.claude/skills/git-standards/SKILL.md`.
2. Pick the capability from the wording: Validate (check / verify / pre-PR) or Execute
   (branch / commit / push / PR / workflow).
3. Forward the sub-skill output verbatim.

Load `git-standards` directly for standalone git work without activating the hub.

---

## Mode 5 — Lifecycle infrastructure

Triggered by: "setup api layer", "scaffold api", "new controller", "add lifecycle support",
"lifecycle architect", "api precondition", "api postcondition".

When to use: implementing API-based preconditions/postconditions for a test case, or extending the
API layer with a new resource. Thin wrapper — the rules live only in `lifecycle-architect`.

Steps:

1. Load `.claude/skills/lifecycle-architect/SKILL.md`.
2. Pick its mode: `src/api/client/ApiClient.ts` missing → **New**; resource has no controller →
   **Add**; wording is review/check → **Review**.
3. Forward the sub-skill output verbatim.

Load `lifecycle-architect` directly for standalone API layer work without activating the hub.

---

## Mode 6 — TC quality review

Triggered by: "tc quality review", "assess test cases", "refine test case", "write test case",
"tc coverage", "automation readiness", "assess test data", "data robustness", "parallel safe",
"multi environment", "verify robustness", "review locators", "fix waits", "assess locators",
"strict mode violation", "polling", "verify interactions", "flaky interaction".

Routes the TC lifecycle phases to their owners (no rules here):

| Phase | Skill · mode |
|---|---|
| 1. Specify | `spec-requirements-standard` M0–M4 |
| 2. Arrange | `spec-data-standard` M1–M3 · `lifecycle-architect` Add (missing controllers) |
| 3. Act | Mode 3 (PO / fixture / spec) · `pom-architect` · `ui-locator-wait-standard` M0–M5 |
| 4. Assert | `spec-data-standard` M4 |
| 5. Run | `spec-data-standard` M5 · `ui-locator-wait-standard` M6 |

Steps:

1. Pick the phase from the wording (specification words → phase 1; data / parallel / environment
   words → phases 2–5). With no hint, run phase 1 M0 then `spec-data-standard` M0 (both read-only).
   Locator and wait triggers → phase 3 Act (M0–M5) and phase 5 Run (M6), `ui-locator-wait-standard`.
2. Load the skill, run the mode, forward its output verbatim.
3. When phase 1 produces an M4 handoff, pass it as the input of `spec-data-standard`.

Note: the orchestrator coordinates `pom-architect` (POM structure), `ui-locator-wait-standard`
(locators and waits) and `lifecycle-architect` (teardown).

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
