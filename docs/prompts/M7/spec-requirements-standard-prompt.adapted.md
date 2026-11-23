# Adapted prompt — `spec-requirements-standard` for this framework (Claude Code + GAD)

**Base prompt (unchanged copy):** [`original/spec-requirements-standard-prompt.md`](original/spec-requirements-standard-prompt.md)
— course repo `anaelince/web-automation`, commit `3252f88` (2026-11-19).

**How to run it:** give the agent this file **and** the base prompt in the same message:

> Read `docs/prompts/M7/original/spec-requirements-standard-prompt.md` and apply every override in
> `docs/prompts/M7/spec-requirements-standard-prompt.adapted.md`. Where they conflict, the override
> wins. Create the skill, the ADR and the hub updates. Do not run the skill yet.

The base prompt was written for a reference hub (Kiro, demoqa, a `spec-quality-lifecycle-standard`
orchestrator and seven hub modes). This framework has a different skill set, a different hub and a
different app under test, so the overrides below are required to get a skill that works here.

---

## Overrides

### A1 — Skill location and frontmatter (agent)

- Create `.claude/skills/spec-requirements-standard/SKILL.md` (Claude Code only discovers project
  skills under `.claude/skills/`). Ignore the `.kiro/` path.
- `description` is a **single-quoted one-line string** that lists every trigger phrase of every mode.
  Claude Code decides when to load a skill from `description` alone; the folded YAML block with no
  triggers would never be auto-selected. Same style as the other six skills of this repo.

### A2 — Sibling skill names (model mapping)

Every reference in the base prompt is renamed to the skill that owns that domain in this repo:

| Base prompt name | This repo |
|---|---|
| `spec-organisation-standard` | `spec-standards` |
| `spec-code-standard` | `test-standards` |
| `api-setup-teardown-standard` | `lifecycle-architect` |
| `ui-pom-standard` | `pom-architect` |
| `git-workflow-docs-standard` | `git-standards` |
| `spec-quality-lifecycle-standard` (orchestrator + Create mode) | **does not exist** → `automation-architect` **Mode 6** routes the phases (A3); code generation = `automation-architect` Mode 3 (PO / fixture / spec) + `lifecycle-architect` Add (API resources) |
| Hub "Mode 5 — Docs Sync" | **does not exist** — the README "Test cases" table is the index; this skill owns the content of `docs/test-cases/**` |
| Hub "Mode 7" | **Mode 6** (this hub has five modes) |

### A3 — Orchestration and hub growth

- This hub has no lifecycle orchestrator. Add **Mode 6 — TC quality review** to
  `automation-architect`: Specify (`spec-requirements-standard`) → Arrange/Assert/Run
  (`spec-data-standard`) → Act (existing `pom-architect` / `lifecycle-architect`).
- Hub Growth Policy Rule 2: write `docs/decisions/ADR-003-tc-quality-review-mode.md` **before** the
  mode (covers both new skills; `ADR-002` is already taken by the lifecycle mode). Mode total
  becomes **6 / 10**; add the triggers to the hub `description`.
- Registry rows say **Added: M7** (the base prompt says M6; in this course run it is module 7).
- Mode 1 step 0 (`spec-requirements-standard` M0, report-only) is added as in the base prompt.

### A4 — Project values

| Placeholder | Value |
|---|---|
| `<tc-docs-dir>` | `docs/test-cases/gad` |
| Feature files | `articles-test-cases.md` (TC8), `comments-test-cases.md` (TC9) |
| Spec files | `tests/ui/{suite}/{feature}/TC{N}-<name>.spec.ts` (`spec-standards` R1–R3) |
| Fixtures available for the M4 handoff | `created<Resource>` (exists), `worker<Resource>` (introduced by `spec-data-standard`), `<resource>Controller`, page fixtures (`articlesPage`, `articlePage`) |
| Suite tags | `@smoke` / `@regression` (`spec-standards`); data-impact tags from `spec-data-standard` R11 |

Scope for M7: **TC8 and TC9** only (the two TCs from M6 with API pre/postconditions). TC1–TC7 are
not migrated; the skill must say so instead of reporting them as missing.

### A5 — Baseline when no TC document exists

`docs/test-cases/**` does not exist in this repo: TCs were described only in the README table and the
spec JSDoc header. Before M0, copy that description **verbatim** into the feature file as the TC body
(mark it `<!-- as-was: M6 -->`). M0 scores that baseline; M2 rewrites it in the template. Never
create the baseline in the template — that would hide the real gaps.

### A6 — Output format aligned with the other skills

- Violation `Fix:` line uses the bracket tag of this repo:
  `Fix: <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]`
  (the base prompt uses `| AUTO-APPLIED | MANUAL-FIX`; the hub aggregates by the bracket tag).
- "check / review only / don't fix" → report-only, as in every skill of this repo.

### A7 — Handoff block

Add `spec:` (target spec path) and keep `tags` with both the suite tag and the data-impact tag, so
`spec-data-standard` and Mode 3 receive everything in one block.

---

## Validation loop (as executed in M7)

Same seven steps as the base prompt. Evidence lands in `docs/evidence/M7/` — see
[`00-runbook.md`](../../evidence/M7/00-runbook.md).
