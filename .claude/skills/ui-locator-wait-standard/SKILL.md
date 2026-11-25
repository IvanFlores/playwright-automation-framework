---
name: ui-locator-wait-standard
description: 'Enforce and auto-apply locator and wait standards for Playwright + TypeScript projects. Assesses interaction maturity (levels 0-4) and enforces the locator hierarchy (team test-id contract first when defined, then role, label, placeholder, text, alt text, title, and justified CSS/XPath), element uniqueness and composition, action semantics, condition-based waits, bounded polling, timeout hierarchy, and diagnostic wait messages. Includes a verification mode that repeats tests to prove interactions are stable. Modes: M0 Interaction Assessment (default, read-only), M1 Locator Strategy, M2 Uniqueness & Composition, M3 Action & Read Semantics, M4 Wait Strategy, M5 Polling & Timeouts, M6 Interaction Verification. Triggers: "assess locators", "assess waits", "interaction maturity", "locator wait", "review locators", "locator strategy", "fix selectors", "locator uniqueness", "strict mode violation", "repeated elements", "review actions", "action semantics", "fix waits", "remove hardcoded waits", "synchronisation", "polling", "wait for api state", "timeouts", "verify interactions", "stress locators", "flaky interaction", "locator wait m0".."locator wait m6". Load when writing or reviewing locators, Page Object getters, actions, waits or polling, or when diagnosing timeouts, strict-mode violations, or timing-related flaky tests.'
---

# ui-locator-wait-standard

**Objective — the deterministic interaction:** every interaction targets exactly one element
through a locator that expresses user intent (or the team's explicit test contract), and every
wait is a bounded condition that proves the operation completed and explains itself when it fails.

Decision record: `docs/decisions/ADR-005-ui-locator-wait-standard.md`. No hub mode of its own: it
is phase **3 Act** (M0–M5) and phase **5 Run** (M6) of hub Mode 6 (TC quality review).

## Project Context

- **Selector vs. locator:** a selector is a string; a locator is a lazy object that re-queries the
  DOM on every use, auto-waits for actionability and retries assertions. Pass locators, never
  selector strings or handles.
- **Auto-waiting synchronises actions; assertions verify behaviour.** A clickable button does not
  prove the operation completed: every state-changing action is followed by a wait for the state
  that proves completion.
- **Strict mode:** a locator matching several elements fails on action — fix the locator, never
  silence it with a position.
- `pom-architect` rule 2 decides **where** a locator lives (getters); this skill decides **which**.
- AI may inspect and propose locators but never invents attributes, roles, names or API states.

### Project conventions (resolve from README / ADRs / tsconfig / config; report in the M0 header)

| Placeholder | Meaning | Default |
|---|---|---|
| `<pages-dir>` | Page Objects and components | `src/ui/pages` · `src/ui/components` |
| `<specs-dir>` | Spec files | `tests` |
| `<fixtures-module>` | Playwright fixtures (`test.extend`) | `src/fixtures` |
| `<api-layer>` | API client + controllers (used for polling) | `src/api` |
| `<runner-config>` | Playwright config | `playwright.config.ts` |
| `<testid-contract>` | `testIdAttribute` in `<runner-config>` (per project or global) **or** a convention declared in an ADR / README | none |
| `<testid-attribute>` | Attribute name of the contract | `data-testid` |

### Locator hierarchy (R1)

Resolve `<testid-contract>` **per site**. The contract applies to an element only when the
attribute exists on that element in the inspected DOM.

| # | Contract defined and element carries it | No contract, or element lacks it |
|---|---|---|
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
|---|---|---|
| Fixed | `waitForTimeout(3000)`, sleep | Forbidden (R13) |
| Implicit | Actionability auto-wait, web-first assertion retry | Rely on it; do not duplicate (R15) |
| Explicit | `expect(locator).toHaveText()`, `expect(page).toHaveURL()`, `waitForResponse` tied to the action | Preferred after every state-changing action (R14) |
| Condition-based | `expect.poll()`, `expect().toPass()` | For state not visible in the DOM; always bounded (R17–R20) |

### Timeout layers

Test (`timeout` / `test.setTimeout`) · assertion (`expect.timeout` / matcher option) · action and
navigation (`use.actionTimeout` / `navigationTimeout`) · request (API client options) · polling
(`expect.poll` / `toPass` options). Invariant: **test > polling > single request / assertion**.

### Maturity levels

| Level | State | Exit criteria (to reach the next level) |
|---|---|---|
| 0 — Time-driven | Fixed waits; positional or generated selectors | No fixed waits (R13); no dynamic IDs or generated classes (R3) |
| 1 — Structural | CSS/XPath dominate; waits by element presence | Hierarchy applied per contract (R1); every CSS/XPath justified (R2) |
| 2 — Semantic | Intent-based locators; positions still disambiguate | Positions replaced by scope/filter (R5–R8); actions match element (R9–R11) |
| 3 — Synchronised | Every state change waits for its terminal state | Polling bounded with failure states (R17–R18); timeout hierarchy (R19); diagnostics (R20) |
| 4 — Bounded & diagnosable | Deterministic interaction | Maintain: run M6 on every new TC |

### Domain coordination

| Concern | Owner | How this skill interacts |
|---|---|---|
| TC lifecycle orchestration | hub Mode 6 | Invokes this skill in phase 3 Act (M0–M5) and phase 5 Run (M6) |
| Where locators live | `pom-architect` rule 2 | Not re-checked; this skill judges the locator **expression** |
| No `page.*` in test bodies | `pom-architect` rule 4 | Not re-checked; spec-level chains on PO getters are in scope |
| Observable completion per step | `spec-requirements-standard` Q5–Q7 | Input: the oracle each wait must reach (R14) |
| Values inside filters (`hasText`) | `spec-data-standard` R10 · R13 | Filters use created / mock / dataset values, not env literals |
| HTTP calls during polling | `lifecycle-architect` R1 · R11 | Polling calls a controller; status is checked by the client |
| Assertion choice for validation | the step's web-first assertion · `spec-requirements-standard` Q6 | R16 covers only soft assertions used as synchronisation |

## Modes

One rule belongs to exactly one mode. **M0 is the default.** Report-only wording ("check",
"don't fix") → no file is modified and fixes are tagged `NOT APPLIED (report-only)`.

### M0 — Interaction Assessment (read-only)

Triggers: "assess locators" · "assess waits" · "interaction maturity" · "locator wait"

1. Discover `<pages-dir>/**`, `<specs-dir>/**/*.spec.ts`, `<fixtures-module>/**`, `<runner-config>`;
   resolve `<testid-contract>` per site
2. Inventory every locator (tier 1–8) and every wait (fixed / implicit / explicit / condition-based)
3. Score the level **per site** (highest level whose exit criteria are fully met)
4. List the blockers to the next level, each mapped to mode + rule. Do NOT modify files

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

### M1 — Locator Strategy

Triggers: "review locators" · "locator strategy" · "fix selectors" · "locator wait m1"
Question: does each locator express user intent or the team's explicit test contract?

1. Inspect the DOM first: DevTools (HTML, accessibility tree), `npx playwright codegen`,
   `npx playwright test --debug` (Inspector picker), or a page `ariaSnapshot()`
2. Run R1–R4 on Page Objects, components and spec-level locator chains
3. Auto-fix AUTO-FIX items; list MANUAL-FIX items with the proposed locator per tier
4. No stable contract (no role/name, label or test id) → **markup request** for the dev team

| Situation | Strategy |
|---|---|
| Dynamic ID (`#button-847392`) | Role / label / text / test id |
| Generated class (`.css-1x2y3z`, `.sc-abc`) | Role / test id |
| Deep structural chain | Scope to a region + semantic child locator |
| Same label in several places | Scope to the region (form, dialog, row) — M2 |
| No stable contract | Markup request; temporary CSS/XPath with reason (R2) |

### M2 — Uniqueness & Composition

Triggers: "locator uniqueness" · "strict mode violation" · "repeated elements" · "locator wait m2"
Question: does every locator resolve to exactly one element, by business criteria, not position?

1. Run R5–R8
2. Replace positions with scope + `filter({ hasText })` / `filter({ has })` + unique child locator
3. Collections: filter first, assert the count, then iterate or read

```typescript
rowFor(name: string) { return this.page.getByRole('row').filter({ hasText: name }); } // PO
const row = ordersPage.rowFor(created.name);
await expect(row, `Exactly one row should exist for ${created.name}`).toHaveCount(1);
await row.getByRole('button', { name: 'Archive' }).click();
```

### M3 — Action & Read Semantics

Triggers: "review actions" · "action semantics" · "locator wait m3"
Question: does each action represent the real user interaction, without bypassing checks? Run
R9–R12, choosing the action from role, HTML type and the manual user behaviour:

| Element | Action |
|---|---|
| Button / link | `click()` |
| Text input | `fill()` (`pressSequentially()` only when per-key behaviour is under test) |
| Checkbox / radio | `check()` / `uncheck()` / `setChecked()` |
| Select | `selectOption()` |
| File input | `setInputFiles()` |
| Keyboard | `press()` |

### M4 — Wait Strategy

Triggers: "fix waits" · "remove hardcoded waits" · "synchronisation" · "locator wait m4"
Question: does the test wait for the observable condition that proves completion — never time?

1. Run R13–R16
2. For each state-changing action, take the terminal state from the TC oracle
   (`spec-requirements-standard` Q6): text, visibility, hidden spinner, URL, attribute, count
3. Replace fixed and generic waits with an explicit wait on that state

| Change | Wait |
|---|---|
| Text / status | `expect(locator).toHaveText(...)` |
| Appears / disappears | `toBeVisible()` / `toBeHidden()` |
| Navigation | `expect(page).toHaveURL(...)` (or a PO path read asserted in the spec) |
| Attribute / state | `toHaveAttribute(...)` · `toBeEnabled()` · `toBeChecked()` |
| List size | `toHaveCount(n)` on owned data |
| Backend response the UI depends on | `page.waitForResponse(...)` started **before** the action, then a UI assertion |

### M5 — Polling & Timeouts

Triggers: "polling" · "wait for api state" · "timeouts" · "locator wait m5"
Question: is every condition-based wait bounded, aware of failure states, and diagnosable?

1. Run R17–R20 on specs, fixtures and helpers
2. Take the state model from `<api-layer>/models`; undocumented → `TBD: state model`, never invent
3. Check the timeout hierarchy against `<runner-config>`

```typescript
const FAILED = ['failed', 'cancelled', 'expired'];
await expect.poll(async () => {
  const { status } = await jobController.getStatus(job.id); // controller, not request.*
  if (FAILED.includes(status)) throw new Error(`Job ${job.id} reached terminal failure "${status}"`);
  return status;
}, { message: `Job ${job.id} should reach "completed"`, timeout: 5 * 60_000,
     intervals: [2_000, 5_000, 10_000, 15_000] }).toBe('completed');
// test options: { timeout: 6 * 60_000 } → test timeout > polling timeout
```

### M6 — Interaction Verification (evidence)

Triggers: "verify interactions" · "stress locators" · "flaky interaction" · "locator wait m6"
Question: do the interactions stay green when repeated, in parallel? Executes tests; never edits code.

1. Select the scope (TC, feature or site) and one browser project
2. `npx playwright test <scope> --project=<browser> --repeat-each=<K> --workers=<N> --retries=0 --trace=retain-on-failure` (default K=5, N=4)
3. Classify every failure from the trace and error:

| Category | Signal | Rule |
|---|---|---|
| Strict-mode violation | `resolved to N elements` | R5–R8 |
| Locator not found | Timeout waiting for locator | R1–R4 |
| Not actionable | Not visible / not stable / intercepted | R10 · R14 |
| Premature assertion | Action passed, assertion saw the old state | R14 · R15 |
| Polling exhausted | `expect.poll` timeout / terminal failure | R17–R20 |
| Data / isolation | Collision, 401, missing record | hand off to `spec-data-standard` M5 |

4. Compare with the previous run (before/after) when available

```
[ui-locator-wait-standard] INTERACTION VERIFICATION
─────────────────────────────────────────
Scope:   <scope>   Project: <browser>   repeat=<K> workers=<N>
Result:  <passed>/<total> passed · <flaky> flaky
Failures by cause: strict <n> · not-found <n> · actionability <n> · premature <n> · polling <n> · data <n>
Verdict: ✅ DETERMINISTIC  |  ❌ NOT DETERMINISTIC → run M<n> for <rule>
```

## Rules

### R1 — LOCATOR_HIERARCHY (ERROR, MANUAL-FIX) · M1
A locator uses a lower tier than one that identifies the same element uniquely. With a contract
and the attribute on the element, any other strategy is a lower tier. **Auto-fix (partial):**
`locator('[<testid-attribute>="x"]')` → `getByTestId('x')` when the contract is in `<runner-config>`.

```typescript
get submitButton() { return this.page.locator('[data-test="login-button"]'); }  // ❌ contract
get submitButton() { return this.page.getByTestId('login-button'); }            // ✅ contract
get submitButton() { return this.page.getByRole('button', { name: 'Login' }); } // ✅ no contract
```

Contract defined but attribute missing → semantic order + markup request. Never add the attribute
without seeing it in the DOM (R4).

### R2 — JUSTIFIED_CSS_XPATH (WARNING, MANUAL-FIX) · M1
A CSS or XPath locator (tier 8) has no `// locator: <reason>` comment saying why no tier 1–7
locator works. Fix: move up a tier, or add the reason.

### R3 — NO_FRAGILE_SELECTORS (ERROR, MANUAL-FIX) · M1
A locator depends on a dynamic ID (digits/hash segment), a generated class (`css-*`, `sc-*`,
`jss*`, hashed suffix), a CSS/XPath chain deeper than 3 levels, `:nth-child`, or XPath indexes
(`[2]`). Fix: M1 fragile → robust table.

### R4 — NO_INVENTED_ATTRIBUTES (ERROR, MANUAL-FIX) · M1
A locator references a test id, role name, label or attribute not observed in the DOM (codegen,
Inspector, DevTools, snapshot). Fix: replace it with an observed value; if unverifiable, mark the
getter `// TODO: verify locator in DOM` and report it. Never guess.

### R5 — NO_POSITIONAL_WITHOUT_RULE (WARNING, MANUAL-FIX) · M2
`.first()`, `.last()` or `.nth(n)` is the only disambiguation and has no
`// position: <business rule>` comment. Fix: scope and filter by business data (R6); keep the
position only when the order itself is the requirement.

### R6 — SCOPE_AND_FILTER (WARNING, MANUAL-FIX) · M2
Similar elements are told apart by a long selector string instead of composition (region scope,
`filter({ hasText | has | hasNot })`, unique child locator).

```typescript
this.page.locator('div.cards > div:has-text("Playwright") button.add');            // ❌
this.page.getByRole('article').filter({ hasText: 'Playwright' })
  .getByRole('button', { name: 'Add to cart' });                                    // ✅
```

Filter values come from controlled data (`spec-data-standard` R13), not environment literals.

### R7 — FILTER_BEFORE_ITERATE (WARNING, MANUAL-FIX) · M2
A collection is iterated (`for`, `.all()`, `count()` loop) or read as a list (`allTextContents`,
`evaluateAll`) before it is filtered and its expected count asserted. Fix: filter →
`toHaveCount(n)` → iterate / read.

### R8 — AMBIGUITY_FAILS_CLEARLY (ERROR, MANUAL-FIX) · M2
A strict-mode ambiguity is silenced: `.first()` added after `resolved to N elements`,
`{ strict: false }`, or a `try/catch` around an action that hides a missing element. Fix: make
the locator unique (R6).

### R9 — ACTION_MATCHES_ELEMENT (ERROR, AUTO-FIX) · M3
`click()` on a checkbox/radio, `type()` or `pressSequentially()` for plain input, `click()` on an
`<option>`, keyboard tricks for a select, `fill()` on a file input. Auto-fix: M3 table action.

### R10 — NO_ACTIONABILITY_BYPASS (ERROR, MANUAL-FIX) · M3
`{ force: true }`, `dispatchEvent('click')`, `evaluate(el => el.click())`, or JS value assignment
instead of `fill()`. If a user cannot click it, the test must not either. Fix: wait for the
blocker to clear or open the region the user would. Allowed only with `// bypass: <reason>`.

### R11 — LOCATOR_NOT_HANDLE (ERROR, AUTO-FIX) · M3
`page.$()`, `page.$$()`, `ElementHandle`, `page.waitForSelector()`, or selector strings passed
between methods. Auto-fix: `page.$(s)` → `page.locator(s)`; `waitForSelector(s)` →
`await expect(locator).toBeVisible()`; methods receive and return `Locator`.

### R12 — INTENTIONAL_READS (WARNING, MANUAL-FIX) · M3
A read (`textContent`, `innerText`, `getAttribute`, `inputValue`, `boundingBox`,
`getComputedStyle`) is used for anything other than (a) capturing a value a later step needs or
(b) a visual check marked `// visual: <reason>`. Fix: verify values with a web-first assertion.

### R13 — NO_FIXED_WAITS (ERROR, AUTO-FIX) · M4
`page.waitForTimeout(n)`, `setTimeout`, `new Promise(r => setTimeout(r, n))` or any sleep helper
in a spec, Page Object, fixture or helper. Auto-fix: explicit wait on the terminal state (M4
table, e.g. `waitForTimeout(3000)` after Save → `expect(status).toHaveText('Saved')`); unknown
state → `// TODO: wait for <terminal state>` + MANUAL-FIX.

### R14 — WAIT_FOR_TERMINAL_STATE (ERROR, MANUAL-FIX) · M4
A state-changing action (submit, save, delete, navigate, upload) is followed by (1) no wait for
the state that proves completion before the next action, or (2) a generic wait that proves
nothing: `waitForLoadState('networkidle')`, bare `waitForLoadState()`, or an intermediate state
(spinner visible). Fix: wait for the final observable state from the TC oracle.

### R15 — NO_REDUNDANT_WAITS (WARNING, AUTO-FIX) · M4
`locator.waitFor()` or `expect(locator).toBeVisible()` right before an action on the **same**
locator, with no other purpose. Auto-fix: remove it, unless it is the step's assertion or a
precondition check.

### R16 — NO_SOFT_ASSERT_AS_SYNC (ERROR, AUTO-FIX) · M4
`expect.soft()` checks a state the next action depends on. A failed soft assertion does not stop
the test, so the next action runs in the wrong state with a misleading error. Auto-fix: hard
`expect()`. Soft assertions are for independent evidence only.

### R17 — BOUNDED_POLLING (ERROR, MANUAL-FIX) · M5
`expect.poll` / `toPass` without `timeout` **and** `intervals`, or a hand-rolled `while` / `for` /
recursive retry loop. Fix: `expect.poll` (a value) or `toPass` (a block) with both options;
poll through a controller (`lifecycle-architect` R1).

### R18 — TERMINAL_FAILURE_STATES (ERROR, MANUAL-FIX) · M5
Polling checks only the success state, so a terminal failure (`failed`, `cancelled`, `expired`,
error page) polls until timeout; or the polled states are not in the API contract. Fix: fail
immediately with the observed state; states from the API models, unknown → `TBD: state model`.

### R19 — TIMEOUT_HIERARCHY (WARNING, MANUAL-FIX) · M5
(1) a polling/assertion timeout ≥ the effective test timeout; (2) a magic-number timeout in a
spec/PO with no constant or comment; (3) a global timeout raised in `<runner-config>` to hide one
slow operation. Fix: test > polling > request/assertion; raise only the slow operation, with a
named constant or `// timeout: <business reason>`.

### R20 — DIAGNOSTIC_WAIT_MESSAGE (WARNING, AUTO-FIX) · M5
A long-running wait (`expect.poll`, `toPass`, a matcher with custom `timeout`) has no message, or
its failure does not state the last observed state. Auto-fix: add `message` with the expected
state and entity; custom failures throw with the last state and elapsed time
(`Job 42 did not complete within 300s. Last known status: "queued".`).

## Violation output format

```
[ui-locator-wait-standard] SEVERITY — RULE_NAME (M<n>)
File:  <relative path from project root>
Line:  <line number>
Issue: <one sentence describing the problem>
Fix:   <one sentence describing the fix> | AUTO-APPLIED | MANUAL-FIX | NOT APPLIED (report-only)
```

## Scan scope

| File glob | Rules |
|---|---|
| `<pages-dir>/**/*.ts` | R1–R13, R15 |
| `<specs-dir>/**/*.spec.ts` | R5–R20 |
| `<fixtures-module>/**/*.ts` · helpers | R13, R17–R20 |
| `<runner-config>` | R1 (contract resolution), R19 |

Playwright APIs this skill depends on: `getByTestId`, `getByAltText`, `getByTitle`,
`pressSequentially` (≥ 1.38, replaces `type`), `expect.poll` / `toPass` `timeout` + `intervals`.
