# M7 — Prompt iteration: what had to change to get the expected result, and why

Homework item 3. The changes come in two groups:

- **Adaptation** (before running): the course prompts describe another project (Kiro agent, demoqa,
  a `spec-quality-lifecycle-standard` orchestrator, a seven-mode hub). They are recorded as numbered
  overrides in [`docs/prompts/M7/`](../../prompts/M7/) — `A1–A7` for requirements, `B1–B10` for data —
  and summarised in section 1.
- **Iteration** (found while generating or running the skills): places where the prompt *as
  written* would not have produced the expected result on this code. Section 2. Each one says what
  was observed, what changed, and the result.

## 1. Adaptation summary (why the prompts could not run as-is)

| # | Course prompt said | Changed to | Why |
|---|---|---|---|
| A1/B1 | `.kiro/skills/...`, folded YAML `description` without triggers | `.claude/skills/...`, one-line description listing every trigger | Claude Code only discovers `.claude/skills/` and chooses a skill from its description alone |
| A2/B3 | `spec-organisation-standard`, `spec-code-standard`, `api-setup-teardown-standard`, `ui-pom-standard`, `spec-quality-lifecycle-standard` | `spec-standards`, `test-standards`, `lifecycle-architect`, `pom-architect`, hub Mode 6 | Those are the skills of this repo (M4–M6); a reference to a non-existent skill makes the agent invent its rules |
| A3 | Hub "Mode 7", orchestrator skill | **Mode 6** in `automation-architect` + ADR-003 | This hub has five modes and its Growth Policy requires an ADR before a mode |
| B2 | `ADR-002-spec-data-standard.md` | `ADR-004` | ADR-002 is the M6 lifecycle mode |
| A4/B4 | `<tc-docs-dir>`, `src/config/env.ts` → `ENV`, `sites/<site>/` | `docs/test-cases/gad`, `src/config/Env.ts` → `Env`, flat `src/data` | Real paths and names, so examples compile when copied |
| B5 | demoqa facts | GAD facts probed with the API (user create/delete, token behaviour, no cascade, id reuse, delete race) | Isolation strategy depends on what the backend allows |
| B6 | `ENV.testDataPrefix`, `allowDestructiveCleanup` | `Env.testDataPrefix` only | No bulk cleanup exists; adding an unused flag is noise |
| B7 | "query for leftover data" | `npm run data:orphans` | M5 had no tool for its own step 4 |
| A6/B10 | `Fix: … \| AUTO-APPLIED` | `Fix: … [AUTO-APPLIED \| MANUAL \| NOT APPLIED (report-only)]` | Same tag as the other five sub-skills so the hub can count |
| B9 | Reinforce `api-setup-teardown-standard` R4/R8 | `lifecycle-architect` R8 + decision table, net 0 lines | That skill is at its 400-line budget |
| — | Registry "Added M6" | "Added M7" | Module of this run |

## 2. Iterations

### 1. Nothing to assess: the TCs had no specification

- **Observed:** `spec-requirements-standard` M0 scans `docs/test-cases/**`, which did not exist. Run as
  written, M0 reports "no TCs" and M1 would write the TCs from scratch in the template — the
  baseline would be invisible and the before/after meaningless.
- **Change:** override A5 — copy the M6 description (README row + spec JSDoc) **verbatim** into the
  feature files, marked `<!-- as-was: M6 -->`, and score that. The skill says "never rewrite before
  the baseline is recorded".
- **Result:** honest baseline 32 % / 23 %.

### 2. Grading could call a TC "Ready" with a failed ERROR

- **Observed (generating the skill):** with weights 3/1 and Ready ≥ 90, a TC that fails one ERROR
  rule scores 28/31 = 90.3 % → *Ready*, contradicting "ERROR blocks Ready". The prompt also had no
  rule for rules that cannot apply (Q9 on a read-only TC).
- **Change:** Ready = ≥ 90 **and** no ERROR failed; N/A rules leave the total weight and are listed.

### 3. Vacuous passes inflate the baseline (not changed)

- **Observed:** Q7 (deterministic oracle) passes on a TC that has **no oracle at all** — there is no
  "or / should / any" to find. Both baselines got 3 free points.
- **Decision:** not changed, to keep scores comparable with the course rule set. Q6 and Q13 already
  fail in that case, so the grade is still *Incomplete*. Proposed for the next iteration: "Q6–Q8 fail
  together when a step has no oracle".

### 4. Q13 and Q10 did not cover what was actually wrong

- **Observed:** Q13 only checked gaps in numbering and wrong step references; the baseline had no
  numbered steps, so Q13 would pass. Q10 only checked dependence on *another TC's* data; the real
  dependence was on an **account shared with every parallel worker**.
- **Change:** Q13 adds "no numbered steps at all"; Q10 adds "identity/data shared with TCs running
  in parallel".
- **Result:** both TCs fail Q10 in the baseline — the finding that drives the whole data phase.

### 5. Rules in `spec-data-standard` that would have missed this code

| Rule | As written | Would miss | Change |
|---|---|---|---|
| R4 | `workers: 1` | `workers: Env.isCI ? 1 : undefined` | "also conditional" |
| R9 | scan scope ran R9 only on `src/config/**` and specs | the second dotenv load in `playwright.config.ts` | `playwright.config.ts` added to R9 scope and condition |
| R13 | presence-only or unknown literal | TC9's `toContainText(created.body)` on the whole card (known value, but partial match) | "partial (`toContainText` on a container when the field is addressable)" |
| R2 | "`Date.now()` alone is not unique" | our `Date.now()` + random (unique in practice, but no worker index) | "or a suffix without `parallelIndex`" |
| R1 | "fixture creates, mutates or bulk-deletes state" | — would wrongly flag `authenticatedPage` (UI login with the shared account, no data) | Wording kept; the report explains why a read-only login is not R1 |

### 6. The first refined oracle was wrong (M2 → first run)

- **Observed:** TC9 failed on its new author oracle: expected `qa_worker w0`, received
  `qa_worker ****`. GAD masks the last name (and email) for visitors who are not logged in. In M2 I
  had verified the `data-testid`s, not the **rendered value**. Also, `qa_worker` was the same for all
  workers, so even the right format would not prove which user wrote the comment.
- **Change:** firstname unique per worker (`qa_w{parallelIndex}{random5}`), oracle
  `publicName()` = `<firstname> ****`, TC9 spec doc with a second change log entry, and the skill's M2
  step 2 now says "read the rendered value as the test's user sees it".
- **Result:** TC9 green; the author oracle now identifies this worker's user.

### 7. A green run printed the wrong verdict

- **Observed:** the baseline M5 run was 8/8 green. The M5 verdict as written is based on run results
  only → `✅ HERMETIC`, while M0 had just found a shared mutable identity.
- **Change:** M5 verdict is ❌ while any R1/R2/R15 finding is open, even if every run passes.
- **Result:** baseline verdict `❌ NOT HERMETIC (latent)`; after the fixes `✅ HERMETIC`.

### 8. The orphan check found a real leftover — and the canonical fixture had a hole

- **Observed:** after the fixes, a firefox + webkit + api run had one WebKit TC8 failure and left one
  `qa_` user (`id 18`, no articles) — found by `npm run data:orphans`. It did not reproduce in 60+
  further runs (3 × 20 multi-project, 27 WebKit repeats) nor in a 40-way concurrent create+login
  probe, so the root cause is **not confirmed**. Reading the fixture showed a real gap: anything that
  throws after `POST /api/users` (the login, for example) skips the teardown, and GAD only lets a user
  delete itself — such a user can never be cleaned up. The prompt's canonical `workerUser` has the
  same gap.
- **Change:** `workerUser` deletes the user in a `finally` block that logs in again first; same
  change in the skill's canonical example.
- **Result:** 24/24 on three browsers (4 × 4); a forced-failure test left no new orphans. User 18
  remains (its password existed only in that worker's memory); resetting the local GAD database
  removes it.

### 9. Orphan detection needed a visible field

- **Observed:** the prompt prefixes "generated data". GAD masks `email` (and `lastname`) for anonymous
  reads, so a prefix only in the email is invisible to the orphan check.
- **Change:** the prefix is also in `firstname`; the check filters users by `firstname`.

## 3. What was not changed

- Rule ids and mode numbers inside the skills (Q1–Q13, R1–R15, M0–M5) — kept so the evidence maps
  1:1 to the course prompts.
- M3 / M5 environment run — only `local` exists; the Readiness Map is the evidence (course
  iteration 3 already allows it).
- Findings outside TC8/TC9 (TC5, TC7, JSONPlaceholder) — reported as MANUAL, not fixed.
