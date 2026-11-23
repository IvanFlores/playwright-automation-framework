# M7 — `spec-requirements-standard` M0 — BEFORE (baseline, report-only)

- Date: 2026-11-23 · Agent: Claude Code (Opus 5.5)
- Invocation: Skill tool → `spec-requirements-standard`, args
  `assess test cases — report-only (don't fix) on docs/test-cases/gad/** (TC8, TC9 as-was baseline)`
- Input: commit `a28a4c1` — TC8/TC9 copied **verbatim** from the README row and the spec JSDoc
  header (the only places where the M6 TCs were described).
- Files modified by the run: none (`git status` clean before writing this evidence file).

## Raw output

```
[spec-requirements-standard] ERROR — TC_METADATA_COMPLETE (Q1)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: Only the suite is stated; requirement/AC, priority, type and automation decision are missing.
Fix:   Fill the metadata table; unknown values become `TBD:`. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — OBJECTIVE_STATED (Q2)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: There is no objective; the title is the only statement of intent.
Fix:   Add one sentence with the behaviour and why it matters. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — PRECONDITIONS_PROVISIONED (Q3)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: The precondition says how the article is created (API) but not its scope (test / worker / shared).
Fix:   State the scope of each precondition in the preconditions table. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — TEST_DATA_DECLARED (Q4)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: "a uniquely titled article" has no generation rule, class or source, and the login account is not declared.
Fix:   Data table: articleTitle (prefix + unique suffix, Transactional, factory) and the identity (env reference). [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — ONE_ACTION_PER_STEP (Q5)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: No user action is written ("search finds" is the whole flow in one phrase).
Fix:   One row per action (open list, search) each with its own oracle. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — EXACT_ORACLE (Q6)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: "finds an article" is presence only, although the exact expected value (the created title, result count) is knowable.
Fix:   Oracle: exactly 1 result whose title = {articleTitle}. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — INDEPENDENT_TC (Q10)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: The article is created after "logs in via POST /api/login" with an undeclared account; the spec cross-check shows it is `users.appUser`, the account every parallel worker and TC9 also use.
Fix:   Declare a per-worker identity as precondition (P1) so the TC owns the data it creates. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — AUTOMATION_DECISION (Q12)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: No automation decision is recorded.
Fix:   Automation: Automatable. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — STEP_REFERENCES_VALID (Q13)
File:  docs/test-cases/gad/articles-test-cases.md
TC:    TC8
Issue: There are no numbered steps at all.
Fix:   Numbered steps table with {captured} references. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — TC_METADATA_COMPLETE (Q1)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: Only the suite is stated; requirement/AC, priority, type and automation decision are missing.
Fix:   Fill the metadata table. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — OBJECTIVE_STATED (Q2)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: There is no objective.
Fix:   Add one sentence with the behaviour and why it matters. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — PRECONDITIONS_PROVISIONED (Q3)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: Article and comment are provisioned by API but no scope is given, and "authenticated with a token" does not say whose.
Fix:   Preconditions table with provisioning, scope and the owning identity. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — TEST_DATA_DECLARED (Q4)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: Article title/body and comment body are not declared (no value rule, class or source).
Fix:   Data table with articleTitle, articleBody, commentBody (Transactional, factory). [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — ONE_ACTION_PER_STEP (Q5)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: No user action is written.
Fix:   One row per action (open the article page) with its oracle(s). [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — EXACT_ORACLE (Q6)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: "shows a comment" is presence only; title, body and comment text are knowable from the created data.
Fix:   Exact oracles: title = {articleTitle}, body = {articleBody}, comment {commentId} text = {commentBody}. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — VERIFIABLE_ORACLE (Q8)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: Nothing says how "a comment" is told apart from other comments on the page (no unique body, no id).
Fix:   Reference the created comment by {commentId} and a unique {commentBody}. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — INDEPENDENT_TC (Q10)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: Data is created with the same undeclared shared account as TC8 (spec cross-check: `users.appUser`).
Fix:   Per-worker identity as precondition. [NOT APPLIED (report-only)]

[spec-requirements-standard] WARNING — AUTOMATION_DECISION (Q12)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: No automation decision is recorded.
Fix:   Automation: Automatable. [NOT APPLIED (report-only)]

[spec-requirements-standard] ERROR — STEP_REFERENCES_VALID (Q13)
File:  docs/test-cases/gad/comments-test-cases.md
TC:    TC9
Issue: There are no numbered steps; the last sentence is an implementation note ("listed before `articlePage`"), not a step.
Fix:   Numbered steps; move the fixture-order note to Risks / notes. [NOT APPLIED (report-only)]

[spec-requirements-standard] ASSESSMENT
─────────────────────────────────────────
File: docs/test-cases/gad/articles-test-cases.md
TC8   32%  Incomplete   top gaps: Q1, Q4, Q6, Q10, Q13
File: docs/test-cases/gad/comments-test-cases.md
TC9   23%  Incomplete   top gaps: Q1, Q4, Q6, Q8, Q10, Q13
Not migrated: TC1–TC7
Average: 27%   Ready: 0/2
Most frequent gaps: Q1 (2) · Q3 (2) · Q4 (2) · Q6 (2) · Q10 (2) · Q13 (2)
Recommended next mode: M2 on TC9
```

## Score detail

Weights: ERROR = 3 (Q1, Q3, Q4, Q6, Q7, Q8, Q9, Q10, Q13 → 27), WARNING = 1 (Q2, Q5, Q11, Q12 → 4).
Total 31, no rule N/A (both TCs create data).

| Rule | TC8 | TC9 |
|---|---|---|
| Q1 | ❌ | ❌ |
| Q2 | ❌ | ❌ |
| Q3 | ❌ | ❌ |
| Q4 | ❌ | ❌ |
| Q5 | ❌ | ❌ |
| Q6 | ❌ | ❌ |
| Q7 | ✅ (3) — no alternative-outcome wording | ✅ (3) |
| Q8 | ✅ (3) — "uniquely titled" gives a reference | ❌ |
| Q9 | ✅ (3) — delete by id after the test | ✅ (3) |
| Q10 | ❌ | ❌ |
| Q11 | ✅ (1) — relative API paths | ✅ (1) |
| Q12 | ❌ | ❌ |
| Q13 | ❌ | ❌ |
| **Score** | 10/31 = **32 %** | 7/31 = **23 %** |

Note: Q7 passes because the baseline has **no oracle at all** — a vacuous pass. See
`06-prompt-iteration.md` #3.

## Spec cross-check notes (not scored)

- TC IDs and suites agree (`TC8` smoke `tests/ui/smoke/articles/`, `TC9` regression
  `tests/ui/regression/comments/`).
- Neither spec carries a data-impact tag although both create data (input for `spec-data-standard` R11).
