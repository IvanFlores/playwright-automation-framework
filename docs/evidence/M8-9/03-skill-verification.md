# 03 — Skill verification: what `ui-locator-wait-standard` found, and did the output match the format?

Homework item: *trigger the skill against your existing code, document what it found and whether
the output matched the expected format.*

- Skill: `.claude/skills/ui-locator-wait-standard/SKILL.md` (registered by Claude Code — it appeared
  in the skill list right after the file was written; triggered with `/ui-locator-wait-standard`)
- Existing code: the two test cases of the previous module, **TC8** (search an API-created article)
  and **TC9** (API-created comment on its article page), plus the Page Objects, fixtures and config
  they run through. M0 reports the whole project.

## 1. Triggers used

| Run | Trigger (as typed) | Mode | Files changed |
|---|---|---|---|
| A | `assess locators — M0 report-only (don't fix) on the whole project` | M0 | none |
| B | `locator wait m6` on TC8 TC9, chromium, repeat 5, workers 4 (baseline) | M6 | none |
| C | `review locators` / `locator uniqueness` / `fix waits` / `polling` on TC8 + TC9 | M1 → M5 | config, 2 POs, TC8 |
| D | `locator wait m6` again (after) | M6 | none |
| E | `assess locators` again (after, skill v2) | M0 | none |

## 2. What it found (run A, skill v1) — full report in [`01-m0-before.md`](01-m0-before.md)

| Rule | # | Where | Valid? |
|---|---|---|---|
| R3 NO_FRAGILE_SELECTORS | 3 | `ArticlePage`: `#gotoComment${id}`, `[id^="gotoUser${id}-"]`, XPath `span[1]` | 1 valid (XPath index), 1 valid (id **prefix** with an unknown user id), 1 **false positive** (business-key id) |
| R1 LOCATOR_HIERARCHY | 9 | test-id getters in 4 POs | **Wrong advice** — caused by the undeclared contract (iteration #1) |
| R2 JUSTIFIED_CSS_XPATH | 4 | `ArticlesPage.articleTitles`, 3 in `ArticlePage` | valid |
| R5 NO_POSITIONAL_WITHOUT_RULE | 6 | TC6/TC7/TC8 `first()`, `ArticlesPage.reload`, `NavBar` ×2 | valid |
| R17 BOUNDED_POLLING | 2 | TC5, TC7 `toPass` without `intervals` | valid |
| R19 TIMEOUT_HIERARCHY | 2 files | TC5, TC7 magic `1_000` / `15_000` | valid |
| R20 DIAGNOSTIC_WAIT_MESSAGE | 2 | TC5, TC7 `toPass` without message | valid |

Level: **0 — Time-driven** (blocked by R3). No R4 (invented attribute): every test id and role
name in the code was found in the live DOM.

## 3. What was fixed (run C, TC8/TC9 scope only)

| Rule | Before | After |
|---|---|---|
| R1 (contract) | contract not declared | `playwright.config.ts` `use.testIdAttribute: 'data-testid'` + ADR-005 → `getByTestId` is tier 1 |
| R1 / R2 | `locator('[data-testid^="article-"][data-testid$="-title"]')` | `getByTestId(/^article-\d+-title$/)` |
| R3 / R2 | XPath `.//label[normalize-space()="comment:"]/following-sibling::span[1]` | `commentField(id, 'comment:')` = card › `label:text-is("comment:") + span`, with `// locator:` reason |
| R3 / R2 | `[id^="gotoUser${commentId}-"]` | `commentField(id, 'author:').getByRole('link')` |
| R2 | `.comment-container` + `#gotoComment${id}` | kept (business-key id, iteration #3) with `// locator:` reason + markup request in ADR-005 |
| R5 | TC8 `expect(articleTitles.first()).toBeVisible()` | `expect(articleTitles).not.toHaveCount(0)` |
| R13–R16 | — | nothing to fix: no fixed waits; every action is followed by a web-first assertion on its terminal state (`search()` → `toHaveCount(1)` + `toHaveText(title)`) |
| R17–R20 | — | not applicable to TC8/TC9 (no polling, default timeouts) |

## 4. After (run E, skill v2)

```
[ui-locator-wait-standard] INTERACTION ASSESSMENT
─────────────────────────────────────────
Site: GAD     Test-id contract: data-testid (playwright.config.ts · ADR-005)     Level: 2 — Semantic
  Locators: 23 total · tier 1–7 21 (91%) · CSS/XPath 2 (2 justified) · positional 5
  Waits:    fixed 0 · explicit 2 · condition-based 2 (0 bounded) · redundant 0
  Blockers to level 3:
    - TC6 / TC7 `articleTitles.first()` presence check → M2 / R5
    - ArticlesPage.reload() `articleTitles.first().waitFor()` → M2 / R5
    - NavBar.root / NavBar.goTo `.first()` → M2 / R5
  Blockers to level 4 (after level 3):
    - TC5 / TC7 `toPass` without intervals / message, magic timeouts → M5 / R17, R19, R20
Recommended next mode: M2
TC8/TC9 slice: 0 findings → level 4 — Bounded & diagnosable
```

The remaining blockers are all **outside** the M8-9 scope (TC5–TC7, `NavBar`); they are listed in
ADR-005 "Consequences" as pending. Runtime (runs B and D): 10/10 both times — see
[`02-m6-verification.md`](02-m6-verification.md).

## 5. Did the output match the expected format?

| Check | Expected (prompt) | Observed | Result |
|---|---|---|---|
| M0 block | `[ui-locator-wait-standard] INTERACTION ASSESSMENT` header, `Site/contract/Level`, Locators, Waits, Blockers → `M<n> / R<n>`, Recommended next mode | identical lines and order | ✅ |
| Violation block | `[tag] SEVERITY — RULE_NAME (M<n>)` + File / Line / Issue / Fix | identical; grouped `× N` for repeated rules | ✅ (grouping is a readability choice, every file:line is listed) |
| Report-only | no file modified, `NOT APPLIED (report-only)` | `git status` clean after run A; every fix tagged | ✅ |
| M6 block | Scope / Result / Failures by cause / Verdict | identical | ✅ |
| Resolved placeholders in the M0 header | required | table of 6 values with source | ✅ |
| Level scoring | "highest level whose exit criteria are fully met" | v1: level 0 because of an R3 false positive | ⚠️ format right, **substance wrong** → iteration #3 |
| Advice quality | fix moves to a higher tier | v1 R1 advice was circular (locate by the asserted text) | ⚠️ → iteration #1 |

**Verdict:** the format matched on the first run. The content needed four prompt iterations
(documented in [`04-prompt-iteration.md`](04-prompt-iteration.md)); after them every finding on
TC8/TC9 was either fixed or justified, and the re-run reported 0 findings for that slice.

## 6. Side finding (not caused by this work)

`scripts/orphan-check.ts` lists 2 `qa_` users (ids 18, 20) on the local GAD. A fresh
`TC8 TC9 --repeat-each=5 --workers=4` run before and after the check left the count unchanged
(2 → 2), so the current fixtures do not leak; they are leftovers from an earlier run. GAD only lets
a user delete itself and their passwords are not stored, so they were not removed — a GAD database
reset clears them.
