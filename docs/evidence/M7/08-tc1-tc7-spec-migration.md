# M7 follow-up — TC1–TC7 migrated to TC specifications

- Date: 2026-11-25 · Agent: Claude Code
- Branch: `test/tc1-tc7-spec-migration` (from `main` at `69c5500`)
- Skill: `spec-requirements-standard` — same process as TC8/TC9 in M7: as-was baseline → M0 →
  verify values in GAD → M2 refine → M4 handoff → M0 again.
- Scope: first the specification documents (sections 1–6), then the spec code updated to match
  them (section 7).

## 1. Baseline (as-was)

TC1–TC7 were described only by their README row (no JSDoc header in the specs). Each row was copied
verbatim into `docs/test-cases/gad/{login,home,articles}-test-cases.md`, marked
`<!-- as-was: M5 -->`.

## 2. M0 — BEFORE (report-only)

Invocation: `/spec-requirements-standard assess test cases — report-only (don't fix) on docs/test-cases/gad/** for TC1–TC7`.
No file was modified by the run.

Q9 is **N/A** for all seven (none creates data), so the total weight is 28 instead of 31.
Violations are grouped by rule (one block per rule, listing the TCs) to keep the report readable.

```
[spec-requirements-standard] ERROR — TC_METADATA_COMPLETE (Q1)
File:  docs/test-cases/gad/{login,home,articles}-test-cases.md
TC:    TC1, TC2, TC3, TC4, TC5, TC6, TC7
Issue: Only the suite is stated; requirement/AC, priority, type and automation decision are missing.
Fix:   Fill the metadata table. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — OBJECTIVE_STATED (Q2)
TC:    TC1–TC7
Issue: No objective; the README phrase is the only statement of intent.
Fix:   One sentence with the behaviour and why it matters. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — PRECONDITIONS_PROVISIONED (Q3)
TC:    TC1, TC3, TC4 (an existing account / a signed-in user) · TC5, TC6, TC7 (seeded articles)
Issue: The state the TC needs is not stated, so nothing says how it is provisioned or its scope.
Fix:   Preconditions table with provisioning and scope. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — TEST_DATA_DECLARED (Q4)
TC:    TC1–TC7
Issue: Credentials, search term, page size and expected texts are not declared.
Fix:   Data table with class and source; credentials as env references. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — ONE_ACTION_PER_STEP (Q5)
TC:    TC1–TC7
Issue: No user action is written.
Fix:   One row per action with its oracle. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — EXACT_ORACLE (Q6)
TC:    TC1, TC2, TC3, TC4, TC5, TC7
Issue: "greets", "shows an error", "renders", "limits the list size" are presence statements; the exact values are knowable.
Fix:   Exact texts, counts and page numbers read in GAD. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — VERIFIABLE_ORACLE (Q8)
TC:    TC6, TC7
Issue: Nothing guarantees that the search term matches no article (TC6) or that enough articles exist (TC7).
Fix:   Verifiable preconditions through the articles API. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — AUTOMATION_DECISION (Q12)
TC:    TC1–TC7
Issue: No automation decision.
Fix:   Automation: Automatable. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — STEP_REFERENCES_VALID (Q13)
TC:    TC1–TC7
Issue: No numbered steps at all.
Fix:   Numbered steps table. [NOT APPLIED (report-only)]

[spec-requirements-standard] ASSESSMENT
─────────────────────────────────────────
File: docs/test-cases/gad/login-test-cases.md
TC1   36%  Incomplete   top gaps: Q1, Q3, Q4, Q6, Q13
TC2   46%  Incomplete   top gaps: Q1, Q4, Q6, Q13
File: docs/test-cases/gad/home-test-cases.md
TC3   36%  Incomplete   top gaps: Q1, Q3, Q4, Q6, Q13
TC4   36%  Incomplete   top gaps: Q1, Q3, Q4, Q6, Q13
File: docs/test-cases/gad/articles-test-cases.md
TC5   36%  Incomplete   top gaps: Q1, Q3, Q4, Q6, Q13
TC6   36%  Incomplete   top gaps: Q1, Q3, Q4, Q8, Q13
TC7   25%  Incomplete   top gaps: Q1, Q3, Q4, Q6, Q8, Q13
TC8  100%  Ready  ·  TC9 100% Ready (unchanged)
N/A: Q9 for TC1–TC7 (no data created)
Average TC1–TC7: 36%   Ready: 2/9
Most frequent gaps: Q1 (7) · Q4 (7) · Q13 (7) · Q3 (6) · Q6 (6)
Recommended next mode: M2 on TC7
```

| Rule (weight) | TC1 | TC2 | TC3 | TC4 | TC5 | TC6 | TC7 |
|---|---|---|---|---|---|---|---|
| Q3 (3) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Q6 (3) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ "No data" | ❌ |
| Q7 (3) | ✅* | ✅* | ✅* | ✅* | ✅* | ✅* | ✅* |
| Q8 (3) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Q10 (3) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q11 (1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q1, Q2, Q4, Q5, Q12, Q13 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Score** | 10/28 = **36 %** | 13/28 = **46 %** | **36 %** | **36 %** | **36 %** | **36 %** | 7/28 = **25 %** |

\* Vacuous pass: there is no oracle with alternatives because there is no oracle at all
(same as TC8/TC9, `06-prompt-iteration.md` #3).

## 3. Values verified in GAD before writing oracles (M2 step 2)

Read with a temporary read-only probe spec (deleted after use) as the test's user would see them:

| Value | Observed (GAD 2.9.0) | Used in |
|---|---|---|
| URL after a valid login | `/welcome` | TC1 |
| Greeting | `Hi <email>!` | TC1, TC3 |
| Error after invalid login | `Invalid username or password` (surrounded by whitespace) | TC2 |
| URL and greeting after invalid login | still `/login/`, 0 greeting elements | TC2 |
| User menu button | `<button>` with no text (icon only) | TC4 |
| Articles in the API / cards on page 1 | 59 / 6 | TC5 |
| Pagination, default page size | current `1`, total `10` (= ceil(59 / 6)) | TC5 |
| "Items/Page" options and default | 3, 6, 9, 12, 24 · default 6 | TC5, TC7 |
| After selecting 3 | 3 cards, current `1`, total `20` (= ceil(59 / 3)) | TC7 |
| Search with no match | "No data", 0 cards, pagination `0` / `0`; API `?q=` returns `[]` | TC6 |

## 4. M2 + M4 — AFTER

```
[spec-requirements-standard] REFINED — TC1   Score: 36% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC2   Score: 46% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC3   Score: 36% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC4   Score: 36% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC5   Score: 36% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC6   Score: 36% → 100%   Grade: Incomplete → Ready
[spec-requirements-standard] REFINED — TC7   Score: 25% → 100%   Grade: Incomplete → Ready
Open questions: none

[spec-requirements-standard] ASSESSMENT
─────────────────────────────────────────
TC1–TC9  100%  Ready
Not migrated: none
Average: 100%   Ready: 9/9
```

Each TC has a change log and an automation handoff block under it.

Notable decisions:

- **TC4** keeps a presence oracle on purpose: the button has no text, so "one element, visible, role
  button" is the exact observable result. Q6 only applies when a value is knowable.
- **TC5 / TC7** depend on the article total, which TC8/TC9 change while running in parallel
  (59 → 61 turns 10 pages into 11). The specs state this as a Q10 risk: the count is read from the API
  in the same step and the check is retried until both agree.
- **TC2** relies on `unknown.user@example.test` not existing; generated test users always start with
  `qa_`, so they can never collide with it.

## 5. Specification vs. code (before the code update)

The new oracles were stricter than the specs at that point. This list drove the code update in section 7:

| TC | Spec now says | Code today | Gap |
|---|---|---|---|
| TC1 | URL `/welcome`; greeting = `Hi {email}!` | greeting visible + `toContainText(email)`; no URL check | exact text, URL |
| TC1 | inputs empty before login | not checked | step 1 oracle |
| TC2 | URL stays `/login/` | button visible + greeting hidden | URL check |
| TC3 | greeting = `Hi {email}!` | `toContainText(email)` | exact text |
| TC4 | one button, visible, role button | `toBeVisible()` | count + role (minor) |
| TC5 | 6 cards; total = ceil(API count / 6) | first card visible; total matches `/^\d+$/` | exact count and total (R13), API discovery |
| TC6 | API `?q=` returns `[]`; pagination `0` / `0` | message + 0 cards | precondition check, pagination |
| TC7 | total = ceil(API count / 3) | 3 cards + current page | total pages, API discovery (R5) |

Needed for the code step: `articlesData.defaultPageSize = 6`, an `articleController` fixture for
read-only discovery (the `ArticleController.getAll()` method already exists), and a `toPass` retry
for the page-count checks.

## 6. Skill change

`spec-requirements-standard` Project Context said "TC1–TC7 have no specification document yet —
report them as not migrated". After the migration that sentence would have been wrong, so it now
lists the four feature files and adds the rule used for TC5/TC7: read-only TCs that depend on a total
changed by parallel TCs state that dependency (Q10) and read the value in the same step.

## 7. Code updated to the new specifications

Same branch, after the specification step. Every gap in section 5 is closed:

| TC | Change in the spec code |
|---|---|
| TC1 | Step 1 checks empty inputs; greeting `toHaveText(greetingFor(email))`; URL path `/welcome`; button `toHaveRole('button')` |
| TC2 | URL path stays `/login/`; greeting `toHaveCount(0)` |
| TC3 | Greeting exact text instead of `toContainText` |
| TC4 | One element, visible, role `button` |
| TC5 | Precondition (≥ 6 articles, API); exactly 6 cards; total pages = `pageCountFor(API total, 6)` |
| TC6 | Precondition (`search(term)` returns `[]`); pagination `0` / `0` |
| TC7 | Precondition (≥ 3 articles); total pages = `pageCountFor(API total, 3)` |
| all | `@read-only` tag; spec header points to its specification |

Supporting code: `BasePage.currentPath()` (URL checks without `page` in specs, `pom-architect`
rule), `ArticlesPage.reload()`, `ArticleController.search()`, `articleController` fixture
(read-only discovery, `lifecycle-architect` decision table), `authPaths`, `greetingFor`,
`articlesData.defaultPageSize` / `emptyResultPage`, `pageCountFor`.

### Iteration found by running

The first full Chromium run failed TC5 with `Expected "10"`, `Received "11"`. The spec's mitigation
said "re-read the API until both agree", but GAD had drawn the page while TC8/TC9 articles existed
(61 → 11 pages) and the page does not update by itself, so re-reading only the API could never
converge. The retry now **reloads the list and re-reads the API** (TC7 also selects the page size
again). TC5/TC7 specifications got a second change log entry.

### Verification

| Run | Result |
|---|---|
| `tsc --noEmit`, `eslint .` | clean |
| Full Chromium suite, 11 consecutive runs after the fix | 10 × 9/9; 1 run with 8/9 before the cause was captured (not reproduced in the next 6 runs and 2 stress runs) |
| Chromium stress, `--workers=4 --repeat-each=4`, twice (TC5/TC7 running next to TC8/TC9) | 36/36 · 36/36 |
| `npm run data:orphans` | 0 articles, 0 comments; users 2 (`id 18` from M7, `id 20` new) |

### Open issue: leftover worker users

A second leftover `qa_` user (`id 20`, worker 3) appeared during these runs. TC1–TC7 do not create
users and `workerUser` (TC8/TC9) was not changed, so it is not caused by this change. A forced test
failure after a `workerUser` test in the same worker (serial and default mode) left no orphan, so
"worker restart skips teardown" is ruled out. The root cause is still unknown; GAD server logs
during a stress run are the next thing to check. Both users can only be removed by resetting the
GAD database.
