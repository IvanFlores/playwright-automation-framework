# Meta-prompt: Create new skill ui-locator-wait-standard

Use this prompt with the AI agent to create a new skill:
- Claude: `.claude/skills/ui-locator-wait-standard/SKILL.md`
- Kiro: `.kiro/skills/ui-locator-wait-standard/SKILL.md`

The skill is **project-agnostic**: rules and examples use generic elements (`<resource>`,
`order`, `Save`, `status`). Site-specific values (test-id attribute, page folders, API layer)
are resolved from the project at runtime, never written into the skill.

**Source material:** Module 7 — *Act: Locators, Selectors & DOM* and *Wait Strategies*;
Module 8 — *Assertions* (only the parts about waiting vs. validating and soft assertions).

**Decision record:** `docs/decisions/ADR-004-ui-locator-wait-standard.md`. Do not register the
skill before that ADR exists (Hub Growth Policy Rule 2).

**Orchestration:** this skill does NOT get its own hub mode. It is the **Act** phase (M1–M5)
and part of the **Run** phase (M6) of the TC lifecycle orchestrated by
`spec-quality-lifecycle-standard`. Hub Mode 7 routes to that orchestrator.

This is a NEW skill. It takes ownership of two existing rules of
`spec-quality-lifecycle-standard` (R3 NO_HARDCODED_WAITS, R5 RESILIENT_LOCATORS), which become
delegations — see `spec-quality-lifecycle-standard-prompt.md` **Revision 4**. After creating it,
apply the **Hub updates** and **Reinforcements** sections at the end of this prompt.

**Size budget:** the generated `SKILL.md` must stay under 400 lines. Keep rule text short and
use one example per rule.

---

## Skill overview

`ui-locator-wait-standard` owns **how a test interacts with the UI**: which locator identifies
an element, how repeated elements are disambiguated, which action represents the user
interaction, and how the test synchronises with the application.

**Objective — the deterministic interaction:** every interaction targets exactly one element
through a locator that expresses user intent (or the team's explicit test contract), and every
wait is a bounded condition that proves the operation completed and explains itself when it fails.

| Skill | Domain |
|-------|--------|
| `ui-pom-standard` | Page Object layer **structure** (BasePage, getters, async actions, no assertions) |
| `spec-code-standard` | Spec code quality: imports, fixtures, credentials |
| `spec-organisation-standard` | Spec organisation: folders, naming, TC IDs, steps, tag syntax |
| `api-setup-teardown-standard` | API layer · setup/teardown infrastructure · mocks |
| `spec-data-standard` | Test data: classification · isolation · sourcing · environments · expected values |
| `spec-quality-lifecycle-standard` | TC lifecycle orchestrator · preconditions · assertions |
| `git-workflow-docs-standard` | Git workflow conventions |
| **`ui-locator-wait-standard`** | **Locator strategy · uniqueness · action semantics · waits · polling · timeouts** |

**Gap this skill fills:** `ui-pom-standard` guarantees that locators live in getters, not that
they are the **right** locators. `spec-quality-lifecycle-standard` has one locator rule (R5)
and one wait rule (R3). No skill governs the locator hierarchy, test-id contracts, collections
and filtering, action semantics, terminal-state synchronisation, bounded polling, timeout
hierarchy, or wait diagnostics.

---

## Prompt

Create the skill `SKILL.md` with the following content.

---

### Frontmatter

```yaml
---
name: ui-locator-wait-standard
description: >
  Enforce and auto-apply locator and wait standards for Playwright + TypeScript projects.
  Assesses interaction maturity (levels 0-4) and enforces the locator hierarchy (team
  test-id contract first when defined, then role, label, placeholder, text, alt text, title,
  and justified CSS/XPath), element uniqueness and composition, action semantics,
  condition-based waits, bounded polling, timeout hierarchy, and diagnostic wait messages.
  Includes a verification mode that repeats tests to prove interactions are stable. Load when
  writing or reviewing locators, Page Object getters, actions, waits or polling, or when
  diagnosing timeouts, strict-mode violations, or timing-related flaky tests.
---
```

---

### Project Context section

```markdown
## Project Context

- **Selector vs. locator:** a selector is a string (the address). A locator is a lazy
  Playwright object that wraps it, re-queries the DOM on every use, auto-waits for
  actionability, and retries assertions. Pass locators, never selector strings or handles.
- **Auto-waiting synchronises actions; assertions verify behaviour.** A clickable button
  does not prove that the operation completed. Every action that changes state is followed
  by a wait for the observable state that proves completion.
- **Strict mode:** a locator that matches more than one element fails on action. That
  failure is information — fix the locator, never silence it with a position.
- Locators are declared in Page Object getters (`ui-pom-standard` R2). This skill decides
  **which** locator; `ui-pom-standard` decides **where** it lives.
- AI may inspect, compare, and propose locators, but must never invent attributes, roles,
  names, or API states that were not observed.

### Project conventions (agnostic — resolve before applying rules)

Resolve each placeholder from the project (CLAUDE.md / AGENTS.md, ADRs, `tsconfig.json`
paths, folder tree, runner config); use the default only when the project defines nothing.
Report the resolved values in the M0 header.

| Placeholder | Meaning | Default |
|-------------|---------|---------|
| `<pages-dir>` | Page Objects and components | `src/ui/pages` · `src/ui/components` |
| `<specs-dir>` | Spec files | `tests` |
| `<fixtures-module>` | Playwright fixtures (`test.extend`) | `src/fixtures` |
| `<api-layer>` | API client + controllers (used for polling) | `src/api` |
| `<runner-config>` | Playwright config | `playwright.config.ts` |
| `<testid-contract>` | Team test-id contract: `testIdAttribute` in `<runner-config>` (per project or global) **or** a convention declared in CLAUDE.md / AGENTS.md / an ADR | none |
| `<testid-attribute>` | Attribute name of the contract | `data-testid` |

### Locator hierarchy (R1)

Resolve `<testid-contract>` **per site** before ranking. The contract applies to an element
only when the attribute exists on that element in the inspected DOM.

| # | Contract defined and element carries it | No contract, or element lacks it |
|---|-----------------------------------------|----------------------------------|
| 1 | `getByTestId()` | `getByRole()` |
| 2 | `getByRole()` | `getByLabel()` |
| 3 | `getByLabel()` | `getByPlaceholder()` |
| 4 | `getByPlaceholder()` | `getByText()` |
| 5 | `getByText()` | `getByAltText()` |
| 6 | `getByAltText()` | `getByTitle()` |
| 7 | `getByTitle()` | `getByTestId()` |
| 8 | CSS / XPath — with a reason (R2) | CSS / XPath — with a reason (R2) |

Choose the highest tier that identifies the element uniquely. Composition (`filter`, scoping,
child locators) is preferred over going down a tier.

### Wait types

| Type | Example | Status |
|------|---------|--------|
| Fixed | `waitForTimeout(3000)`, sleep | Forbidden (R13) |
| Implicit | Actionability auto-wait, web-first assertion retry | Rely on it; do not duplicate (R15) |
| Explicit | `expect(locator).toHaveText()`, `expect(page).toHaveURL()`, `waitForResponse` tied to the action | Preferred after every state-changing action (R14) |
| Condition-based | `expect.poll()`, `expect().toPass()` | For state not visible in the DOM (API jobs); always bounded (R17–R20) |

Preferred direction: fixed time → condition → terminal state → bounded failure.

### Timeout layers

| Layer | Governs | Set in |
|-------|---------|--------|
| Test timeout | Whole test duration | `<runner-config>` or `test.setTimeout` / test options |
| Assertion timeout | One `expect` condition | `<runner-config>` `expect.timeout` or the matcher option |
| Action / navigation timeout | One action or navigation | `<runner-config>` `use.actionTimeout` / `navigationTimeout` |
| Request timeout | One HTTP response | API client options |
| Polling timeout | Reaching a terminal state | `expect.poll` options |

Invariant: **test timeout > polling timeout > single request / assertion timeout**.

### Maturity levels

| Level | State | Exit criteria (to reach the next level) |
|-------|-------|-----------------------------------------|
| 0 — Time-driven | Fixed waits; positional or generated selectors | No fixed waits (R13); no dynamic IDs or generated classes (R3) |
| 1 — Structural | CSS/XPath dominate; waits by element presence | Hierarchy applied per contract (R1); every CSS/XPath justified (R2) |
| 2 — Semantic | Intent-based locators; positions still used to disambiguate | Positions replaced by scope/filter (R5–R8); actions match element (R9–R11) |
| 3 — Synchronised | Every state change waits for its terminal state | Polling bounded with failure states (R17–R18); timeout hierarchy (R19); diagnostics (R20) |
| 4 — Bounded & diagnosable | Deterministic interaction | Maintain: run M6 on every new TC |

### Domain coordination

| Concern | Owner | How this skill interacts |
|---------|-------|--------------------------|
| TC lifecycle orchestration | `spec-quality-lifecycle-standard` | Invokes this skill in phase 3 Act (M1–M5) and phase 5 Run (M6) |
| Where locators live (getters, no constructor fields) | `ui-pom-standard` R2 | Not re-checked; this skill judges the locator **expression** |
| No `page.*` in test bodies | `ui-pom-standard` R4 | Not re-checked; spec-level locator chains on PO getters are in scope |
| Observable completion condition per step | `spec-requirements-standard` Q5–Q7 | Input: the oracle each wait must reach (R14) |
| Values used inside filters (`hasText`) | `spec-data-standard` R10 · R13 | Filters use created / mock / dataset values, not env literals |
| HTTP calls during polling | `api-setup-teardown-standard` R1 · R11 | Polling calls a controller; status is checked by the client |
| Assertion type, messages, hard vs. soft for validation | `spec-quality-lifecycle-standard` R4 · R6 · R10 | R16 covers only soft assertions used as synchronisation |
| Preconditions / navigate-then-assert | `spec-quality-lifecycle-standard` R1 · R9 | Not re-checked |
```

---

### Modes

Each mode targets one domain question and owns its own rules (one rule belongs to exactly one
mode). **M0 is the default** when no mode is specified.

---

#### M0 — Interaction Assessment (read-only)

**Triggers:** `"assess locators"` · `"assess waits"` · `"interaction maturity"` · `"locator wait"`

**Steps:**
1. Discover `<pages-dir>/**`, `<specs-dir>/**/*.spec.ts`, `<fixtures-module>/**`, `<runner-config>`
2. Resolve `<testid-contract>` per site
3. Inventory every locator expression and classify it by hierarchy tier (1–8)
4. Inventory every wait and classify it (fixed / implicit / explicit / condition-based)
5. Score the maturity level **per site** (the highest level whose exit criteria are fully met)
6. List the blockers for the next level, each mapped to the mode and rule that fixes it
7. Do NOT modify files

**Output:**
```
[ui-locator-wait-standard] INTERACTION ASSESSMENT
─────────────────────────────────────────
Site: <site>     Test-id contract: <attribute> (<source>) | none     Level: <0-4> — <name>
  Locators: <N> total · tier 1–7 <N> (<pct>%) · CSS/XPath <N> (<N> justified) · positional <N>
  Waits:    fixed <N> · explicit <N> · condition-based <N> (<N> bounded) · redundant <N>
  Blockers to level <N+1>:
    - <issue> → M<n> / R<n>
Recommended next mode: M<n>
```

---

#### M1 — Locator Strategy

**Triggers:** `"review locators"` · `"locator strategy"` · `"fix selectors"` · `"locator wait m1"`

**Question:** Does each locator express user intent or the team's explicit test contract?

**Steps:**
1. Inspect the DOM before deciding: DevTools (HTML, accessibility tree), `npx playwright codegen`,
   `npx playwright test --debug` (Inspector locator picker)
2. Run R1–R4 on Page Objects, components, and spec-level locator chains
3. Auto-fix AUTO-FIX violations; list MANUAL-FIX items with the proposed locator per tier
4. When an element has no stable contract (no role/name, no label, no test id), report it as a
   **markup request** for the development team instead of building a fragile selector

**Fragile → robust decision table:**

| Situation | Strategy |
|-----------|----------|
| Dynamic ID (`#button-847392`) | Role / label / text / test id |
| Generated class (`.css-1x2y3z`, `.sc-abc`) | Role / test id |
| Deep structural chain | Scope to a region + semantic child locator |
| Same label in several places | Scope to the region (form, dialog, row) — see M2 |
| No stable contract | Request markup change; temporary CSS/XPath with reason (R2) |

---

#### M2 — Uniqueness & Composition

**Triggers:** `"locator uniqueness"` · `"strict mode violation"` · `"repeated elements"` · `"locator wait m2"`

**Question:** Does every locator resolve to exactly one element, by business criteria instead of position?

**Steps:**
1. Run R5–R8
2. Replace positions with scope (region/component) + `filter({ hasText })` / `filter({ has })`
   + unique child locator
3. For collections: filter first, assert the count, then iterate or read the list

**Canonical composition:**
```typescript
get rowFor() {
  return (name: string) => this.page.getByRole('row').filter({ hasText: name });
}
// spec
const row = ordersPage.rowFor(created.name);
await expect(row, `Exactly one row should exist for ${created.name}`).toHaveCount(1);
await row.getByRole('button', { name: 'Archive' }).click();
```

---

#### M3 — Action & Read Semantics

**Triggers:** `"review actions"` · `"action semantics"` · `"locator wait m3"`

**Question:** Does each action represent the real user interaction, without bypassing Playwright's checks?

**Action by element type:**

| Element | Action |
|---------|--------|
| Button / link | `click()` |
| Text input | `fill()` (`pressSequentially()` only when per-key behaviour is under test) |
| Checkbox / radio | `check()` / `uncheck()` / `setChecked()` |
| Select | `selectOption()` |
| File input | `setInputFiles()` |
| Keyboard | `press()` |

**Steps:**
1. Run R9–R12
2. Use role, HTML type, and the manual user behaviour to choose the action

---

#### M4 — Wait Strategy

**Triggers:** `"fix waits"` · `"remove hardcoded waits"` · `"synchronisation"` · `"locator wait m4"`

**Question:** Does the test wait for the observable condition that proves completion — never for time?

**Steps:**
1. Run R13–R16
2. For each state-changing action, identify the terminal state from the TC oracle
   (`spec-requirements-standard` Q6): text, visibility, hidden spinner, URL, attribute, count
3. Replace fixed and generic waits with an explicit wait on that state

**Observable conditions:**

| Change | Wait |
|--------|------|
| Text / status | `expect(locator).toHaveText(...)` |
| Element appears / disappears | `toBeVisible()` / `toBeHidden()` |
| Navigation | `expect(page).toHaveURL(...)` |
| Attribute / state | `toHaveAttribute(...)` · `toBeEnabled()` · `toBeChecked()` |
| List size | `toHaveCount(n)` on owned data |
| Backend response the UI depends on | `page.waitForResponse(...)` started **before** the action, then a UI assertion |

---

#### M5 — Polling & Timeouts

**Triggers:** `"polling"` · `"wait for api state"` · `"timeouts"` · `"locator wait m5"`

**Question:** Is every condition-based wait bounded, aware of failure states, and diagnosable?

**Steps:**
1. Run R17–R20 on specs, fixtures, and helpers
2. Take the state model from the API contract (`<api-layer>` models / docs). If states are not
   documented, report `TBD: state model` — never invent states
3. Check the timeout hierarchy against `<runner-config>`

**Canonical bounded polling:**
```typescript
const FAILED = ['failed', 'cancelled', 'expired'];
await expect.poll(async () => {
  const { status } = await jobController.getStatus(job.id);   // controller, not request.*
  if (FAILED.includes(status)) throw new Error(`Job ${job.id} reached terminal failure "${status}"`);
  return status;
}, {
  message: `Job ${job.id} should reach "completed"`,
  timeout: 5 * 60_000,
  intervals: [2_000, 5_000, 10_000, 15_000],
}).toBe('completed');
// test options: { timeout: 6 * 60_000 }  → test timeout > polling timeout
```

---

#### M6 — Interaction Verification (evidence)

**Triggers:** `"verify interactions"` · `"stress locators"` · `"flaky interaction"` · `"locator wait m6"`

**Question:** Do the interactions actually stay green when repeated, in parallel, under load?

This mode **executes** tests and produces evidence. It never modifies code.

**Steps:**
1. Select the scope (single TC, feature, or site) and one browser project
2. **Repeat run:**
   `npx playwright test <scope> --project=<browser> --repeat-each=<K> --workers=<N> --retries=0 --trace=retain-on-failure`
   (default K=5, N=4)
3. Classify every failure from the trace and error message:

| Category | Signal | Rule |
|----------|--------|------|
| Strict-mode violation | `resolved to N elements` | R5–R8 |
| Locator not found | Timeout waiting for locator | R1–R4 |
| Not actionable | Not visible / not stable / intercepted | R10 · R14 |
| Premature assertion | Action passed, assertion saw the old state | R14 · R15 |
| Polling exhausted | `expect.poll` timeout / terminal failure | R17–R20 |
| Data / isolation | Collision, 401, missing record | hand off to `spec-data-standard` M5 |

4. Compare with the previous run (before/after) when available

**Output:**
```
[ui-locator-wait-standard] INTERACTION VERIFICATION
─────────────────────────────────────────
Scope:   <scope>   Project: <browser>   repeat=<K> workers=<N>
Result:  <passed>/<total> passed · <flaky> flaky
Failures by cause: strict <n> · not-found <n> · actionability <n> · premature <n> · polling <n> · data <n>
Verdict: ✅ DETERMINISTIC  |  ❌ NOT DETERMINISTIC → run M<n> for <rule>
```

---

### Rules

---

#### R1 — LOCATOR_HIERARCHY (ERROR, MANUAL-FIX) · M1

**Condition:** A locator uses a lower tier of the hierarchy (Project Context) when a higher tier
identifies the same element uniquely. When `<testid-contract>` is defined and the element
carries `<testid-attribute>`, any other strategy is a lower tier.

**Auto-fix (partial):** `locator('[<testid-attribute>="x"]')` → `getByTestId('x')` when the
contract is configured in `<runner-config>`.

```typescript
// contract: testIdAttribute = 'data-test'
get submitButton() { return this.page.locator('[data-test="login-button"]'); }  // ❌
get submitButton() { return this.page.getByTestId('login-button'); }            // ✅
// no contract
get submitButton() { return this.page.getByRole('button', { name: 'Login' }); } // ✅
```

If the contract exists but the element lacks the attribute, fall back to the semantic order and
report a markup request. Never add the attribute to the locator without seeing it in the DOM (R4).

---

#### R2 — JUSTIFIED_CSS_XPATH (WARNING, MANUAL-FIX) · M1

**Condition:** A CSS or XPath locator (tier 8) has no `// locator: <reason>` comment explaining
why no tier 1–7 locator works.

**Fix:** Move to a higher tier, or add the reason (e.g. `// locator: third-party widget, no role or label`).

---

#### R3 — NO_FRAGILE_SELECTORS (ERROR, MANUAL-FIX) · M1

**Condition:** A locator depends on: a dynamic ID (digits/hash segment), a generated class
(`css-*`, `sc-*`, `jss*`, hashed suffix), a CSS/XPath chain deeper than 3 levels, `:nth-child`,
or XPath indexes (`[2]`).

**Fix:** Apply the M1 fragile → robust decision table.

---

#### R4 — NO_INVENTED_ATTRIBUTES (ERROR, MANUAL-FIX) · M1

**Condition:** A locator references a test id, role name, label, or attribute that was not
observed in the DOM (codegen, Inspector, DevTools, or page snapshot) — typically AI-generated.

**Fix:** Inspect the page and replace it with an observed value. If the value cannot be verified,
mark the getter `// TODO: verify locator in DOM` and report it; never guess.

---

#### R5 — NO_POSITIONAL_WITHOUT_RULE (WARNING, MANUAL-FIX) · M2

**Condition:** `.first()`, `.last()`, or `.nth(n)` is used as the only disambiguation, without a
`// position: <business rule>` comment (e.g. "newest item is always first").

**Fix:** Scope and filter by business data (R6). Keep the position only when the order itself is the requirement.

---

#### R6 — SCOPE_AND_FILTER (WARNING, MANUAL-FIX) · M2

**Condition:** Similar elements are distinguished by a long selector string instead of composition:
region scoping, `filter({ hasText })`, `filter({ has })`, `filter({ hasNot })`, or a unique child locator.

```typescript
this.page.locator('div.cards > div:has-text("Playwright") button.add');           // ❌
this.page.getByRole('article').filter({ hasText: 'Playwright' })
  .getByRole('button', { name: 'Add to cart' });                                   // ✅
```

Filter values come from controlled data (`spec-data-standard` R13), not environment literals.

---

#### R7 — FILTER_BEFORE_ITERATE (WARNING, MANUAL-FIX) · M2

**Condition:** A collection is iterated (`for`, `.all()`, `count()` loop) or read as a list
(`allTextContents`, `evaluateAll`) before it is filtered by business criteria and its expected
count is asserted.

**Fix:** Filter → `expect(collection).toHaveCount(n)` → iterate or read.

---

#### R8 — AMBIGUITY_FAILS_CLEARLY (ERROR, MANUAL-FIX) · M2

**Condition:** A strict-mode ambiguity is silenced: `.first()` added after a `resolved to N
elements` failure, `{ strict: false }`, or a `try/catch` around an action that hides a missing element.

**Fix:** Make the locator unique (R6). A missing or ambiguous element must fail with a clear error.

---

#### R9 — ACTION_MATCHES_ELEMENT (ERROR, AUTO-FIX) · M3

**Condition:** The action does not represent the user interaction for the element type:
`click()` on a checkbox/radio, `type()` (deprecated) or `pressSequentially()` for plain input,
`click()` on an `<option>`, keyboard tricks to choose a select value, or `fill()` on a file input.

**Auto-fix:** Replace with the action from the M3 table.

---

#### R10 — NO_ACTIONABILITY_BYPASS (ERROR, MANUAL-FIX) · M3

**Condition:** An action bypasses actionability checks: `{ force: true }`, `dispatchEvent('click')`,
`evaluate(el => el.click())`, or JavaScript value assignment instead of `fill()`.

**Why:** If a real user cannot click it (covered, hidden, disabled), the test must not either.

**Fix:** Wait for the blocking condition to clear (overlay hidden, element enabled), or scroll/
open the region the user would. Allowed only with `// bypass: <reason>` for a documented product limitation.

---

#### R11 — LOCATOR_NOT_HANDLE (ERROR, AUTO-FIX) · M3

**Condition:** `page.$()`, `page.$$()`, `ElementHandle`, `page.waitForSelector()`, or a raw
selector string passed between methods instead of a `Locator`.

**Auto-fix:** `page.$(s)` → `page.locator(s)`; `waitForSelector(s)` → `await expect(locator).toBeVisible()`;
methods receive and return `Locator`.

---

#### R12 — INTENTIONAL_READS (WARNING, MANUAL-FIX) · M3

**Condition:** A locator read (`textContent`, `innerText`, `getAttribute`, `inputValue`,
`boundingBox`, `evaluate(getComputedStyle)`) is used for something other than (a) capturing a
value that a later step needs, or (b) an intentional visual check marked `// visual: <reason>`.

**Fix:** To verify a value, use a web-first assertion (`spec-quality-lifecycle-standard` R4).
Prefer accessibility and business behaviour over styles and coordinates.

---

#### R13 — NO_FIXED_WAITS (ERROR, AUTO-FIX) · M4

*Owner moved from `spec-quality-lifecycle-standard` R3 (Revision 4).*

**Condition:** `page.waitForTimeout(n)`, `setTimeout`, `new Promise(r => setTimeout(r, n))`, or any
sleep helper in a spec, Page Object, fixture, or helper.

**Auto-fix:** Replace with the explicit wait on the terminal state (M4 table). If the terminal
state is unknown, replace with a `// TODO: wait for <terminal state>` and report MANUAL-FIX.

```typescript
await page.getByRole('button', { name: 'Save' }).click();
await page.waitForTimeout(3000);                                           // ❌
await expect(page.getByRole('status')).toHaveText('Saved');                // ✅
```

---

#### R14 — WAIT_FOR_TERMINAL_STATE (ERROR, MANUAL-FIX) · M4

**Condition:** A state-changing action (submit, save, delete, navigate, upload) is followed by:
1. No wait for the state that proves completion before the next action, or
2. A generic wait that does not prove completion: `waitForLoadState('networkidle')`,
   `waitForLoadState()` alone, a wait on an intermediate state (spinner visible) instead of the final one

**Fix:** Wait for the final observable state from the TC oracle (`toHaveText`, `toBeHidden` on
the spinner **and** the result, `toHaveURL`, `toHaveCount`).

---

#### R15 — NO_REDUNDANT_WAITS (WARNING, AUTO-FIX) · M4

**Condition:** An explicit wait duplicates auto-waiting: `locator.waitFor()` or
`expect(locator).toBeVisible()` immediately before an action on the **same** locator, with no
other purpose.

**Auto-fix:** Remove the redundant wait. Keep it only when it is the step's assertion or a
precondition (`spec-quality-lifecycle-standard` R1).

---

#### R16 — NO_SOFT_ASSERT_AS_SYNC (ERROR, AUTO-FIX) · M4

**Condition:** `expect.soft()` checks a state that the next action depends on (the element it
waits for is then acted on, or it gates navigation).

**Why:** A failed soft assertion does not stop the test; the next action runs in the wrong state
and fails with a misleading error. Soft assertions are for independent evidence only (Module 8).

**Auto-fix:** Convert to a hard `expect()`.

---

#### R17 — BOUNDED_POLLING (ERROR, MANUAL-FIX) · M5

**Condition:** A condition-based wait has no explicit bound or is hand-rolled: `expect.poll` or
`toPass` without `timeout` and `intervals`, or a `while` / `for` / recursive loop with
`try/catch` and retries.

**Fix:** Use `expect.poll` (state value) or `expect(...).toPass` (block of assertions) with
`timeout` and `intervals`. Poll through the API layer controller (`api-setup-teardown-standard` R1).

---

#### R18 — TERMINAL_FAILURE_STATES (ERROR, MANUAL-FIX) · M5

**Condition:** A polling loop only checks the success state, so a terminal failure state
(`failed`, `cancelled`, `expired`, error page) keeps polling until timeout, or the polled states
are not in the API contract.

**Fix:** Fail immediately on terminal failure states with the observed state in the error. Take
states from the API models; unknown → `TBD: state model`.

---

#### R19 — TIMEOUT_HIERARCHY (WARNING, MANUAL-FIX) · M5

**Condition:** Any of:
1. A polling or assertion timeout is greater than or equal to the effective test timeout
2. A magic-number timeout in a spec/PO with no constant or comment (`{ timeout: 47000 }`)
3. A global timeout raised in `<runner-config>` to hide one slow operation

**Fix:** Keep test > polling > request/assertion. Raise the timeout only on the slow operation,
with a named constant or a `// timeout: <business reason>` comment.

---

#### R20 — DIAGNOSTIC_WAIT_MESSAGE (WARNING, AUTO-FIX) · M5

**Condition:** A long-running wait (`expect.poll`, `toPass`, or a matcher with a custom
`timeout`) has no message, or its failure does not state the last observed state.

**Auto-fix:** Add `message` stating the expected state and the entity; on custom failure, throw
with the last state and elapsed time:
```typescript
throw new Error(`Job ${id} did not complete within ${elapsed}s. Last known status: "${last ?? 'unknown'}".`);
```

---

### Violation Output Format

```
[ui-locator-wait-standard] SEVERITY — RULE_NAME (M<n>)
File:  <relative path from project root>
Line:  <line number>
Issue: <one sentence describing the problem>
Fix:   <one sentence describing the fix> | AUTO-APPLIED | MANUAL-FIX
```

---

### Scan Scope

| File glob | Rules |
|-----------|-------|
| `<pages-dir>/**/*.ts` | R1–R13, R15 |
| `<specs-dir>/**/*.spec.ts` | R5–R20 |
| `<fixtures-module>/**/*.ts` · helpers | R13, R17–R20 |
| `<runner-config>` | R1 (contract resolution), R19 |

---

## Hub updates (automation-architect/SKILL.md)

1. **Sub-Skill Registry**: add a row:

   | Skill | Domain | File Scope | Rules / Checks | Added | Status |
   |-------|--------|-----------|----------------|-------|--------|
   | `ui-locator-wait-standard` | Locator strategy · uniqueness · action semantics · waits · polling · timeouts (lifecycle phases 3 Act · 5 Run) | `src/ui/pages/**` · `src/ui/components/**` · `tests/**/*.spec.ts` · `src/fixtures/**` · `playwright.config.ts` | R1–R20 · M0–M6 | M7 | Active |

   Update `spec-quality-lifecycle-standard`'s Domain to
   `TC lifecycle orchestrator · preconditions · assertions · independence` (selectors and waits move out).

2. **Scan Scope Ownership**: replace and add rows:

   | File / Scope | Owner skill | Concern |
   |--------------|-------------|---------|
   | `src/ui/pages/**/*.ts` — locator expression and actions | `ui-locator-wait-standard` | R1–R12 (replaces `spec-quality-lifecycle-standard` R5) |
   | `tests/**/*.spec.ts` — waits and synchronisation | `ui-locator-wait-standard` | R13–R16 (replaces `spec-quality-lifecycle-standard` R3) |
   | `tests/**/*.spec.ts` · `src/fixtures/**` — polling and timeouts | `ui-locator-wait-standard` | R17–R20 |
   | `playwright.config.ts` — test-id contract, timeout layers | `ui-locator-wait-standard` | R1, R19 |

   Change the row `tests/**/*.spec.ts — assertion quality and waits` to
   `tests/**/*.spec.ts — assertion quality` with rules `R4, R6, R9, R10`.
   `src/ui/pages/**/*.ts` (POM structure) stays with `ui-pom-standard`.

3. **Mode 1 — Full Pipeline**: insert a step after `ui-pom-standard` and before `spec-code-standard`:
   ```markdown
   4. Run `ui-locator-wait-standard` (M1–M5 rules) on Page Objects, specs, fixtures and config:
      - Auto-fix R1 (test-id contract), R9, R11, R13, R15, R16, R20
      - Collect R1–R8, R10, R12, R14, R17–R19 as manual fixes
   ```
   Renumber the following steps. In the `spec-quality-lifecycle-standard` step change the
   auto-fix list to `(R4)` and the manual list to `R1, R2, R6–R10`. Add
   `ui-locator-wait-standard:` to the pipeline output after `ui-pom-standard:`.

4. **Mode 3 — Scaffold New Page Object**: generated getters follow the R1 hierarchy for the
   resolved `<testid-contract>`, and only use values observed in the DOM (R4).

5. **Mode 7 — TC Lifecycle & Quality** (no new mode, slot count unchanged at 7 of 10): add triggers
   `"review locators"` · `"fix waits"` · `"assess locators"` · `"strict mode violation"` ·
   `"polling"` · `"verify interactions"` · `"flaky interaction"`, and add to its Steps:
   ```markdown
   - Locator and wait triggers → phase 3 Act (M0–M5) and phase 5 Run (M6), `ui-locator-wait-standard`
   ```
   Update the Note: the orchestrator coordinates `ui-pom-standard` (POM structure),
   `ui-locator-wait-standard` (locators and waits) and `api-setup-teardown-standard` (teardown).

6. **Inter-skill execution order**: insert `ui-locator-wait-standard` right after `ui-pom-standard`
   (locators are judged once the PO structure is correct, before spec-level checks).

7. **Sub-Skill Invocation Reference**: add rows:

   | Goal | Skill to load | Trigger phrase example |
   |------|---------------|------------------------|
   | Assess locator and wait maturity | `ui-locator-wait-standard` | `"assess locators"` |
   | Fix fragile locators / strict-mode violations | `ui-locator-wait-standard` | `"review locators"` |
   | Replace fixed waits / add bounded polling | `ui-locator-wait-standard` | `"fix waits"` |
   | Prove interactions are stable with evidence | `ui-locator-wait-standard` | `"verify interactions"` |

8. **Error Handling**: replace the row *Ambiguous locator selector* with:
   `Ambiguous or unverified locator → apply R1 hierarchy; if the value is not observed in the DOM,
   generate the getter with // TODO: verify locator in DOM (R4)`.

9. **Breaking change propagation**: add the row
   `playwright.config.ts (testIdAttribute / timeouts)` → `ui-locator-wait-standard`, `ui-pom-standard` → R1, R19, PO getter examples.

10. **Playwright version compatibility**: list `getByTestId`, `getByAltText`, `getByTitle`,
    `pressSequentially` (≥ 1.38, replaces `type`), `expect.poll` / `toPass` options as APIs this skill depends on.

---

## Reinforcements to existing skills

| Skill | Change | Rule / section |
|-------|--------|----------------|
| `spec-quality-lifecycle-standard` | Revision 4: phase 3 Act and phase 5 Run list this skill; R3 and R5 become delegations; Enforce step 3 forwards to this skill — see `spec-quality-lifecycle-standard-prompt.md` Revision 4 | Domain orchestration, R3, R5, Enforce |
| `ui-pom-standard` | Getter examples follow R1: with a test-id contract use `getByTestId('x')`, not `locator('[data-test="x"]')`. Add to Project Context: "Which locator → `ui-locator-wait-standard`" | R2 examples, Project Context |
| `api-setup-teardown-standard` | Controllers expose state reads (`get<Resource>Status`) needed by bounded polling (R17), with the state union in `models/` (R18) | Add mode, models |
| `spec-data-standard` | R13 note: values used in `filter({ hasText })` follow the same controlled sources | R13 |
| `spec-requirements-standard` | Q6 note: an oracle for an asynchronous step states the terminal state and its failure states (input for R14, R18) | Q6 |
| `CLAUDE.md` / `AGENTS.md` | Critical Rules → Page Objects: "Locator hierarchy: test-id contract (if defined) → role → label → placeholder → text → alt text → title → CSS/XPath with reason". Test cases: "Wait for the terminal state; polling is bounded" | Critical rules |
| `docs/agents/claude/skill-reference.md` | Add the skill row and its 20 rules | Skill list |
| `docs/wiki/anti-flakiness-reference.md` | Point the selector and wait sections to this skill | Reference |

After applying the reinforcements, run `wc -l` on each modified `SKILL.md`. Report any file over
400 lines as a split candidate instead of trimming its rules. Then run hub Mode 5 (README sync,
Hub Growth Policy Rule 6).

---

## Validation loop (course workflow)

1. **Objective:** deterministic interaction (robust locators + condition-based waits)
2. **Prompt:** this file (input: the Page Objects and specs of the two TCs from Module 7)
3. **Skill:** generate `SKILL.md`, then apply the hub updates, the reinforcements, and
   `spec-quality-lifecycle-standard` Revision 4
4. **Execute:** run M0 on the project, then M6 on one scenario to get the **baseline** evidence
5. **Analyse:** map every failure and every blocker to a mode and rule
6. **Refactor:** apply M1 → M2 → M3 → M4 → M5 to the scenario. If a failure has no matching rule,
   refine this prompt and record the iteration under the rule (*Added in iteration N*)
7. **Re-verify:** run M6 again. The before/after evidence is the proof that the skill works
