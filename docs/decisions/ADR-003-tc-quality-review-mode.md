# ADR-003 — Add `spec-requirements-standard` and Mode 6 (TC quality review) to automation-architect

- Status: Accepted
- Date: 2026-11-23
- Module: M7 — Skill execution (spec requirements + spec data)

## Context (the gap)

M7 asks to run two course prompts — `spec-requirements-standard` and `spec-data-standard` — against
this framework and the two TCs of M6 (TC8, TC9). The hub had five modes; none looks at the **TC
specification** or at the **robustness of test data**:

| Mode / skill | Looks at | Covers TC specs? | Covers data isolation / portability / exact values? |
|---|---|---|---|
| 1 — Full pipeline | Page Objects, spec code, spec organisation, API layer | No — `docs/` is out of scope | No — `lifecycle-architect` checks that teardown **exists**, not that data is isolated |
| 2 — Structure only | Folders, import style | No | No |
| 3 — Scaffold | PO + fixture + spec | No — generates code from a verbal request, not from a spec | No |
| 4 — Git workflow | Branches, commits | No | No |
| 5 — Lifecycle infrastructure | API layer scaffold | No | No |

The TCs were documented as one README row plus a spec header comment. Nothing could detect a missing
oracle, an undeclared postcondition, a fixture that mutates data of an account shared by all
parallel workers, or an assertion that only checks presence.

## Options considered

1. **Add the rules to existing skills** (`spec-standards` for specs, `lifecycle-architect` for data)
   — rejected: different domains (organisation vs. content; API structure vs. data robustness), and
   `lifecycle-architect` is already at its 400-line budget.
2. **Two new sub-skills, run only inside Mode 1** — rejected on its own: Mode 1 is detect + fix on
   code; a TC specification is written **before** code, and M5 (robustness verification) executes
   tests, which Mode 1 never does.
3. **Port the course orchestrator `spec-quality-lifecycle-standard`** — rejected: it would duplicate
   rules owned here by `test-standards`, `spec-standards` and `pom-architect`.
4. **Two new sub-skills + one routing mode (Mode 6)** — accepted. Rules live in the sub-skills; the
   hub only routes the TC lifecycle phases.

## Decision

- Create `.claude/skills/spec-requirements-standard/SKILL.md` (Q1–Q13, M0–M4) — phase 1, Specify.
- Create `.claude/skills/spec-data-standard/SKILL.md` (R1–R15, M0–M5) — phases 2, 4, 5
  (see `ADR-004-spec-data-standard.md`).
- Add **Mode 6 — TC quality review**. Mode total becomes **6 / 10**.
- Mode 1 gains step 0 (`spec-requirements-standard` M0, report-only) and step 6
  (`spec-data-standard` rules).

The course prompts call this "Mode 7" and route through `spec-quality-lifecycle-standard`; this hub
has five modes and no such orchestrator, so it is Mode 6 and routes directly.

## Consequences

- `docs/test-cases/gad/` becomes the home of TC specifications (TC8, TC9 first; TC1–TC7 pending).
- Code generation from a spec reuses Mode 3 and `lifecycle-architect` Add (handoff block).
