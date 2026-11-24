# M7 — Skill verification: both skills triggered against the existing code

Homework item 2: *trigger the skills against your existing code; document what they found and
whether the output matched the expected format.*

- Date: 2026-11-23 · Agent: Claude Code desktop (Claude Opus 5.5)
- Existing code = the M6 state (commit `ec85fac`): TC8/TC9 with API pre/postconditions, no TC
  specification documents, data fixtures logged in as the `.env` account.

## 1. Did the skills trigger?

| Check | `spec-requirements-standard` | `spec-data-standard` |
|---|---|---|
| Discovered by Claude Code | Yes — appeared in the skill list right after `SKILL.md` was written | Yes — same |
| Invocation | Skill tool, args `assess test cases — report-only (don't fix) …` | Skill tool, args `assess test data — report-only (don't fix) …` |
| Mode selected | **M0 Assess** (trigger "assess test cases"), report-only ("don't fix") | **M0 Maturity** (trigger "assess test data"), report-only |
| Files modified by the report-only run | None | None |
| Hub routing | `automation-architect` description now lists both skills and the Mode 6 triggers (reloaded by Claude Code after the hub update) | Same |
| Cross-skill call | — | M1 step 3 delegated the missing `users` resource to `lifecycle-architect` **Add** (triggered with `lifecycle add — new api resource "users" …`) |

## 2. What they found

### `spec-requirements-standard` (Q1–Q13) — [`01-requirements-before.md`](01-requirements-before.md)

| | TC8 | TC9 |
|---|---|---|
| Baseline score | **32 %** Incomplete | **23 %** Incomplete |
| Failed rules | Q1, Q2, Q3, Q4, Q5, Q6, Q10, Q12, Q13 | Q1, Q2, Q3, Q4, Q5, Q6, Q8, Q10, Q12, Q13 |
| After M2 + M4 | **100 %** Ready + handoff | **100 %** Ready + handoff |

Most useful findings:

1. **No oracle** (Q6): "search finds an article", "shows a comment" — presence only, although the
   exact values (title, count, comment text) are known because the test created them.
2. **Hidden shared identity** (Q10): the documents said "logs in via POST /api/login" without saying
   which account. The spec cross-check showed it was `users.appUser`, the same account for every
   worker. This finding became the main input of `spec-data-standard`.
3. **No steps at all** (Q13): the M6 TC was a sentence and an implementation note, not a test case.

### `spec-data-standard` (R1–R15) — [`03-data-before.md`](03-data-before.md)

15 findings (7 ERROR, 8 WARNING); 11 in TC8/TC9 scope, all fixed in
[`04-data-after.md`](04-data-after.md); 4 out of scope (TC5, TC7, JSONPlaceholder) left as MANUAL.

| Rule | Where | What it means |
|---|---|---|
| R1 ×2 | `createdArticle`, `createdComment` | all workers create data as one `.env` account |
| R15 | `createdComment` | TC9 logged in twice for the same identity |
| R2 | `uniqueSuffix()` | no worker index in generated values |
| R3 ×2 | article / comment factories | no prefix → leftovers could not be found |
| R4 | `playwright.config.ts` | CI serialised without a reason |
| R9 | `playwright.config.ts` | second `process.env` / dotenv entry point outside `Env.ts` |
| R11 ×2 | TC8, TC9 | data-creating tests without `@mutates-data` |
| R13 | TC9 | `toContainText` on the whole comment card |
| R5, R10, R13 ×2 | TC7, `posts.data.ts`, TC5, `posts.spec.ts` | out of M7 scope (MANUAL) |

Maturity: GAD level **2** → TC8/TC9 scope level **3 — Isolated**. Readiness map 4/10 → 8/10.

Most important observation: **the baseline stress run was green** (8/8, 4 workers × 4 repeats). The
skill still reported "NOT HERMETIC" from static findings. The value of the skill is finding latent
problems that a green run hides — and the M5 orphan check later found a real leftover user in a
multi-browser run (see `06-prompt-iteration.md` #8).

### `lifecycle-architect` (called by `spec-data-standard`)

Add mode created `users.endpoints.ts`, `user.model.ts`, `UserController`, `users.data.ts`; its Review
after the change: 0 violations.

## 3. Did the output match the expected format?

Expected formats are the ones in the adapted prompts (A6, B10): the common violation block of this
repo plus each skill's summary block.

```
[skill] SEVERITY — RULE_NAME (rule id)
File:  <path>
Line / TC: <line> | TC{N} · step <n>
Issue: <one sentence>
Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

| Element | spec-requirements | spec-data | Notes |
|---|---|---|---|
| `[skill-name]` prefix on every block | ✅ | ✅ | |
| `SEVERITY — RULE_NAME (id)` | ✅ `(Qn)` | ✅ `(Rn, Mn)` | ids kept from the course prompts |
| `File:` relative path | ✅ | ✅ | |
| `Line:` / `TC:` | ✅ `TC: TC8` | ✅ real line numbers (`grep -n`) | requirements uses TC/step instead of line (doc sections) |
| `Issue:` one sentence | ✅ | ✅ | |
| `Fix:` + bracket tag | ✅ `NOT APPLIED (report-only)` | ✅ | out-of-scope items use `MANUAL — out of M7 scope (…)` — an extension of the tag, see deviations |
| Summary block | ✅ `ASSESSMENT` with score/grade, average, most frequent gaps, next mode | ✅ `MATURITY ASSESSMENT` + `REVIEW COMPLETE` + `ROBUSTNESS VERIFICATION` + `ENVIRONMENT READINESS` | |
| Mode-specific blocks | ✅ `REFINED — TC{N}` with before → after | ✅ M5 verdict, readiness map | |
| Handoff YAML (M4) | ✅ appended under each TC | consumed ✅ | |

Deviations, and how they were handled:

1. **Out-of-scope MANUAL items.** The format has no tag for "valid finding, deliberately not fixed in
   this task". Used `[MANUAL — out of M7 scope (TC7)]` so the summary still counts them as pending
   (`⚠️ 4 pending`) instead of hiding them.
2. **M5 verdict vs. a green run.** The base format keys the verdict on run results; a green baseline
   would have printed ✅. The skill now keys it on open R1/R2/R15 findings too (iteration #7).
3. **Scores show N/A rules.** None were N/A here (both TCs create data); the summary would list them.
4. **Spec cross-check notes** are printed after the score, not as violations (scan scope says "not
   scored") — matches the skill.

## 4. Verification of the skills' effect on the code

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ no errors |
| `npx eslint .` | ✅ no errors |
| Prettier on changed files | ✅ (repo-wide warnings are pre-existing CRLF line endings) |
| TC8/TC9 stress, chromium, 4 workers × 4 | ✅ 8/8 |
| TC8/TC9 stress, chromium + firefox + webkit, 4 × 4 | ✅ 24/24 (after the `finally` fix) |
| Forced-failure test using `createdComment` | teardown ran — no new orphans |
| Full Chromium suite | ✅ 9/9 — [`07-test-execution.md`](07-test-execution.md) |
| `npm run data:orphans` | 1 user (`id 18`) — left by the incident in iteration #8, before the fix; cannot be deleted without its password (GAD only lets a user delete itself) |
