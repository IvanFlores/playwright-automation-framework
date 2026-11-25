# M7 — Skill execution: runbook and evidence index

Homework: run the course prompts `spec-requirements-standard` and `spec-data-standard` against this
framework, trigger the resulting skills on the existing code (the two M6 test cases, TC8 and TC9),
and document what they found and what had to change.

- Agent: Claude Code desktop · model Claude Opus 5.5 · 2026-11-23
- Branch: `test/m7-spec-requirements-data` → PR into `main`
- Starting point: commit `ec85fac` (M6 code + M6 evidence)

## Evidence index

| Homework item | File |
|---|---|
| 1. Prompt execution — adapted prompts | [`docs/prompts/M7/spec-requirements-standard-prompt.adapted.md`](../../prompts/M7/spec-requirements-standard-prompt.adapted.md) · [`docs/prompts/M7/spec-data-standard-prompt.adapted.md`](../../prompts/M7/spec-data-standard-prompt.adapted.md) (originals in [`original/`](../../prompts/M7/original/)) |
| 1. Prompt execution — generated skills | [`.claude/skills/spec-requirements-standard/SKILL.md`](../../../.claude/skills/spec-requirements-standard/SKILL.md) · [`.claude/skills/spec-data-standard/SKILL.md`](../../../.claude/skills/spec-data-standard/SKILL.md) · hub Mode 6 · [ADR-003](../../decisions/ADR-003-tc-quality-review-mode.md) · [ADR-004](../../decisions/ADR-004-spec-data-standard.md) |
| 2. Skill verification — requirements BEFORE / AFTER | [`01-requirements-before.md`](01-requirements-before.md) · [`02-requirements-after.md`](02-requirements-after.md) |
| 2. Skill verification — data BEFORE / AFTER | [`03-data-before.md`](03-data-before.md) · [`04-data-after.md`](04-data-after.md) |
| 2. Skill verification — findings + format check | [`05-skill-verification.md`](05-skill-verification.md) |
| 3. Prompt iteration | [`06-prompt-iteration.md`](06-prompt-iteration.md) |
| Spec files (TC specifications) | [`docs/test-cases/gad/articles-test-cases.md`](../../test-cases/gad/articles-test-cases.md) · [`docs/test-cases/gad/comments-test-cases.md`](../../test-cases/gad/comments-test-cases.md) |
| Test execution (HTML report, Chromium) | [`07-test-execution.md`](07-test-execution.md) |
| Follow-up: TC1–TC7 migrated to specifications | [`08-tc1-tc7-spec-migration.md`](08-tc1-tc7-spec-migration.md) |

## The process, phase by phase (one commit per phase)

| # | Phase | What the AI did | Human decision / check | Commit |
|---|---|---|---|---|
| 0 | Understand | Read both course prompts, the hub, the six skills, TC8/TC9, fixtures; probed GAD's user API | Confirm the two TCs in scope and where the prompts are | — |
| 1 | Adapt | Wrote override files (A1–A7, B1–B10) instead of editing the course prompts | Review the mapping table: every skill name must exist in this repo | `75de4de` |
| 2 | Execute prompts | Generated both `SKILL.md`, ADR-003/004, hub Mode 6, reinforcements (lifecycle-architect kept at 400 lines) | Skills appear in Claude Code's list | `75de4de` |
| 3 | Baseline the spec | Copied the M6 TC description **as-is** into `docs/test-cases/gad/` | Never score a rewritten baseline | `a28a4c1` |
| 4 | Trigger `spec-requirements-standard` M0 | Report-only: 32 % / 23 %, *Incomplete* | Does every gap a human would see map to a Q rule? | — |
| 5 | M2 + M4 | Refined to 100 % *Ready*, added change logs and the automation handoff | Scope kept? Oracles verified against GAD? | `5f3c83a` |
| 6 | M5 baseline | Stress run 8/8 green | Green ≠ hermetic | — |
| 7 | Trigger `spec-data-standard` M0 | Report-only: 15 findings, level 2, readiness 4/10 | Which findings are in scope | — |
| 8 | Fix (M1 → M4) | `lifecycle-architect` Add for `users`; `workerUser`; prefixed factories; config; tags; exact assertions | First run failed (masked author) → spec + code fixed | `bc9b41d` |
| 9 | M5 after + orphan check | 8/8, 0 orphans; orphan check self-tested | — | `601501f` |
| 10 | Regression on other browsers | Found an orphan user → `finally` teardown | Root cause not reproduced — said so | `1e80bc5` |
| 11 | Document | Verification, iteration, execution, README | — | last commit |

## Replaying the process from scratch

The run is repeatable: the course prompts are pinned in `docs/prompts/M7/original/` and every
change needed to make them work here is in the `*.adapted.md` override files (including the
overrides found by iteration, A8–A10 and B11–B14). A replay on a fresh branch should reach the same
result without repeating the iterations.

**Requirements:** GAD running at `BASE_URL`, `.env` filled (see `.env.example`), `npm ci`.

1. Create a branch from the starting point and bring in the prompts only:

   ```powershell
   git switch -c test/m7-replay-<yyyymmdd> ec85fac
   ```

   ```powershell
   git checkout test/m7-spec-requirements-data -- docs/prompts/M7
   ```

   (after the PR is merged use `main` instead of the branch name).

2. Open Claude Code in the repo and send, one at a time (wait for each to finish):

   | Step | Prompt to send |
   |---|---|
   | Skill 1 | `Read docs/prompts/M7/original/spec-requirements-standard-prompt.md and apply every override in docs/prompts/M7/spec-requirements-standard-prompt.adapted.md. Where they conflict, the override wins. Create the skill, the ADR and the hub updates. Do not run the skill yet.` |
   | Skill 2 | `Read docs/prompts/M7/original/spec-data-standard-prompt.md and apply every override in docs/prompts/M7/spec-data-standard-prompt.adapted.md. Where they conflict, the override wins. Create the skill, the ADR, the hub updates and the reinforcements. Do not run the skill yet.` |
   | Baseline | `Create docs/test-cases/gad/articles-test-cases.md (TC8) and comments-test-cases.md (TC9) copying verbatim the README row and the spec JSDoc header, marked <!-- as-was: M6 -->. Commit.` |
   | Requirements M0 | `/spec-requirements-standard assess test cases — report-only (don't fix) on docs/test-cases/gad/**` |
   | Requirements M2/M4 | `/spec-requirements-standard refine test case TC8 and TC9, then automation readiness for both, then assess test cases again` |
   | Data M5 baseline | `npx playwright test TC8 TC9 --project=chromium --workers=4 --repeat-each=4 --retries=0` |
   | Data M0 | `/spec-data-standard assess test data — report-only (don't fix). Input: the M4 handoff of TC8/TC9` |
   | Data fixes | `/spec-data-standard parallel safe — apply M1, M3 and M4 to the TC8/TC9 findings; use lifecycle-architect Add for missing controllers` |
   | Data M5 after | `/spec-data-standard verify robustness on TC8 and TC9 (chromium, workers=4, repeat=4) and run the orphan check` |
   | Execution | `npx playwright test --project=chromium` then `npm run report` |

3. Compare with this run: requirements 32/23 % → 100/100 %; data 15 findings → 4 pending (out of
   scope); readiness 4/10 → 8/10; M5 8/8 and 0 orphans.

Each replay goes on its own branch (`test/m7-replay-<date>`), so runs can be compared with
`git diff test/m7-spec-requirements-data test/m7-replay-<date> -- .claude docs src tests`.

## Notes for the class presentation

- **Adapt, don't edit**: keeping the course prompt untouched and putting every difference in an
  override file makes the adaptation reviewable and replayable.
- **Baseline first**: score what exists before improving it, otherwise the improvement cannot be
  shown.
- **Green is not hermetic**: the baseline stress run passed; the findings were latent.
- **The AI was wrong twice, and the process caught both**: an oracle written without reading the
  rendered value (caught by the first run), and a teardown hole (caught by the orphan check).
- **Say what is not known**: the orphan's root cause was not reproduced; the document says so.
