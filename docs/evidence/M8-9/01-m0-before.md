# 01 — `ui-locator-wait-standard` M0 BEFORE (skill v1, code as on `main`)

- Trigger: `/ui-locator-wait-standard assess locators — M0 report-only (don't fix) on the whole project`
- Skill version: v1 = base prompt + overrides C1–C8 (commit `ed77039`), **before** iterations C9–C12
- Code: `main` at `1813d85` (unchanged)
- Date: 2026-11-25 · Claude Code desktop · Claude Opus 5.5
- DOM inspected first (R4): `ariaSnapshot()` and `outerHTML` of `/articles.html`, `/article.html?id=1`
  and `/login/` on the local GAD.

## Resolved conventions (M0 header)

| Placeholder | Resolved value | Source |
|---|---|---|
| `<pages-dir>` | `src/ui/pages` · `src/ui/components` | folder tree |
| `<specs-dir>` | `tests` (`tests/ui/**`, `tests/setup/**`; `tests/api/**` has no UI) | `playwright.config.ts` `testDir` |
| `<fixtures-module>` | `src/fixtures/index.ts` | `tsconfig.json` alias `@fixtures` |
| `<api-layer>` | `src/api` | folder tree |
| `<runner-config>` | `playwright.config.ts` | — |
| `<testid-contract>` | **none** — no `testIdAttribute` in the config, no ADR/README declares one | rule: "default only when the project defines nothing" |

## Report

```
[ui-locator-wait-standard] INTERACTION ASSESSMENT
─────────────────────────────────────────
Site: GAD     Test-id contract: none     Level: 0 — Time-driven
  Locators: 23 total · tier 1–7 19 (83%) · CSS/XPath 4 (0 justified) · positional 6
  Waits:    fixed 0 · explicit 2 · condition-based 2 (0 bounded) · redundant 0
  Blockers to level 1:
    - Dynamic ID in ArticlePage.commentCard (#gotoComment${id}) → M1 / R3
    - Dynamic ID in ArticlePage.commentAuthor ([id^="gotoUser${id}-"]) → M1 / R3
    - XPath index [1] in ArticlePage.commentBody → M1 / R3
  Blockers to level 2 (after level 1):
    - 9 test-id getters where a role / placeholder / text locator is unique → M1 / R1
    - 4 CSS/XPath locators without `// locator:` reason → M1 / R2
  Blockers to level 3: 6 positions without a business rule → M2 / R5
  Blockers to level 4: 2 toPass without intervals / message, magic timeouts → M5 / R17, R19, R20
Recommended next mode: M1
```

### Locator inventory (23)

| # | Locator | File | Tier (contract: none) |
|---|---|---|---|
| 1–3 | `getByTestId('article-title' / 'article-body' / 'user-name')` | `ArticlePage.ts` | 7 |
| 4 | `.comment-container` filtered by `#gotoComment${id}` | `ArticlePage.ts:30` | 8 (CSS) |
| 5 | `xpath=.//label[normalize-space()="comment:"]/following-sibling::span[1]` | `ArticlePage.ts:19` | 8 (XPath) |
| 6 | `[id^="gotoUser${commentId}-"]` | `ArticlePage.ts:26` | 8 (CSS) |
| 7 | `[data-testid^="article-"][data-testid$="-title"]` | `ArticlesPage.ts:7` | 8 (CSS) |
| 8–13 | `getByTestId('search-input' / 'search-button' / 'no-results' / 'current-page' / 'total-pages' / 'per-page-select')` | `ArticlesPage.ts` | 7 |
| 14–15 | `getByTestId('hello' / 'btn-dropdown')` | `HomePage.ts` | 7 |
| 16–18 | `getByRole('textbox' ×2 / 'button')` | `LoginPage.ts` | 1 |
| 19–21 | `getByTestId('login-error' / 'hello' / 'btn-dropdown')` | `LoginPage.ts` | 7 |
| 22–23 | `getByRole('navigation')`, `getByRole('link', { name })` | `NavBar.ts` | 1 |

### Wait inventory

| Wait | File | Type |
|---|---|---|
| `loginPage.greeting.waitFor()` after `login()` | `tests/setup/auth.setup.ts:14` | explicit (terminal state ✅) |
| `articleTitles.first().waitFor()` after `page.reload()` | `ArticlesPage.ts:46` | explicit (positional) |
| `expect(async () => { reload; … }).toPass({ timeout: 15_000 })` | `TC5…spec.ts:27`, `TC7…spec.ts:31` | condition-based, **no `intervals`, no message** |
| web-first assertions after each action (`toHaveCount`, `toHaveText`) | all specs | implicit retry — satisfies R14 |

## Violations (report-only)

```
[ui-locator-wait-standard] ERROR — NO_FRAGILE_SELECTORS (M1)
File:  src/ui/pages/ArticlePage.ts
Line:  33
Issue: Comment card is selected through `#gotoComment${commentId}`, an id with a digit segment.
Fix:   Role / label / text / test id; GAD comment cards expose none → markup request. NOT APPLIED (report-only)

[ui-locator-wait-standard] ERROR — NO_FRAGILE_SELECTORS (M1)
File:  src/ui/pages/ArticlePage.ts
Line:  26
Issue: Comment author is selected by the id prefix `gotoUser<commentId>-`, a digit-segment id.
Fix:   Scope to the card and use a semantic child locator. NOT APPLIED (report-only)

[ui-locator-wait-standard] ERROR — NO_FRAGILE_SELECTORS (M1)
File:  src/ui/pages/ArticlePage.ts
Line:  20
Issue: XPath uses an index (`span[1]`) to reach the comment text.
Fix:   Scope to the card + adjacent-sibling of the "comment:" label, without an index. NOT APPLIED (report-only)

[ui-locator-wait-standard] ERROR — LOCATOR_HIERARCHY (M1)          × 9
File:  src/ui/pages/ArticlesPage.ts (11, 15, 19) · LoginPage.ts (19, 24) · HomePage.ts (6) · ArticlePage.ts (6, 10, 14)
Issue: With no test-id contract, getByTestId is tier 7, and a higher tier is unique:
       search-input → getByRole('textbox', { name: 'Search...' }) · search-button → getByRole('link', { name: 'GO' }) ·
       no-results / login-error / hello / article-title / article-body / user-name → getByText(<the text>).
Fix:   Move up the hierarchy. NOT APPLIED (report-only)

[ui-locator-wait-standard] WARNING — JUSTIFIED_CSS_XPATH (M1)       × 4
File:  src/ui/pages/ArticlesPage.ts (7) · ArticlePage.ts (19, 26, 31)
Issue: Tier-8 locators carry a JSDoc description but no `// locator: <reason>`.
Fix:   Move up a tier or add the reason. NOT APPLIED (report-only)

[ui-locator-wait-standard] WARNING — NO_POSITIONAL_WITHOUT_RULE (M2) × 6
File:  tests/ui/smoke/articles/TC8…spec.ts (10) · TC6…spec.ts (15) · TC7…spec.ts (21) ·
       src/ui/pages/ArticlesPage.ts (46) · src/ui/components/NavBar.ts (8, 16)
Issue: `.first()` is the only disambiguation, with no `// position:` business rule.
Fix:   Scope and filter (R6), or document the rule. NOT APPLIED (report-only)

[ui-locator-wait-standard] ERROR — BOUNDED_POLLING (M5)             × 2
File:  tests/ui/smoke/articles/TC5…spec.ts (34) · tests/ui/regression/articles/TC7…spec.ts (40)
Issue: `toPass` has `timeout` but no `intervals`.
Fix:   Add `intervals` (and a message, R20). NOT APPLIED (report-only)

[ui-locator-wait-standard] WARNING — TIMEOUT_HIERARCHY (M5)          × 2 files
File:  TC5…spec.ts (32, 34) · TC7…spec.ts (34, 38, 40)
Issue: Magic-number timeouts (`1_000`, `15_000`) with no constant or `// timeout:` reason.
Fix:   Named constant or reason comment. NOT APPLIED (report-only)

[ui-locator-wait-standard] WARNING — DIAGNOSTIC_WAIT_MESSAGE (M5)    × 2
File:  TC5…spec.ts (27) · TC7…spec.ts (31)
Issue: `toPass` without a message stating the expected state.
Fix:   Add a message. NOT APPLIED (report-only)
```

No findings for R4 (every test id / role name above was observed in the DOM), R6–R16 and R18 (no
polling of an API state model). `features/**` (Cucumber) is outside `<specs-dir>`; its
`.first()` in `home.steps.ts:10` is noted, not scored.

## TC8 / TC9 slice (scope of the refactor, C7)

| TC | Findings |
|---|---|
| TC8 | R5 `articleTitles.first()` (spec:10) · R2 `articleTitles` CSS · R1 `search-input`, `search-button` |
| TC9 | R3 ×3 + R2 ×3 on `commentCard` / `commentBody` / `commentAuthor` · R1 `article-title`, `article-body`, `user-name` |

## Human review of this report (what the format check found)

- **Format:** matches the M0 block and the violation format exactly (tag, severity, rule name with
  mode, File/Line/Issue/Fix, `NOT APPLIED (report-only)`). ✅
- **Level 0 is wrong in substance.** The suite has zero fixed waits; it lands in "Time-driven" only
  because R3 treats `#gotoComment${comment.id}` as a dynamic ID. That id is built from a key the
  test itself created → deterministic. → iteration #3 (C11).
- **R1 ×9 is the wrong advice.** GAD's `data-testid` is a deliberate automation contract, but nothing
  in the repo *declared* it, so the skill resolved "none". Seven of the nine proposals locate an
  element **by the text the test is about to assert** (`getByText(createdArticle.title)` then
  `toHaveText(createdArticle.title)`) — a circular oracle. → iteration #1 (C9).
- The R2 finding on `articleTitles` is right, but the proposed fix ("move up a tier") had no
  candidate in v1: a family of test ids has no tier-1 form without RegExp. → iteration #2 (C10).
- R5 on `first()` "list is loaded" is right; v1 gives no replacement for a *presence* check.
  → iteration #4 (C12).
