# ADR-004 — Add `spec-data-standard` (test data robustness) as a sub-skill

- Status: Accepted
- Date: 2026-11-23
- Module: M7
- Related: ADR-003 (Mode 6 routes to this skill; no mode of its own)

## Context (the gap)

`lifecycle-architect` (M6) guarantees that every `created<Resource>` fixture has a teardown. It does
not ask:

- **Isolation** — `createdArticle` and `createdComment` create data as `users.appUser`, the single
  account every worker uses (one `.env` value). Any future cleanup "by user" would delete another
  worker's data.
- **Uniqueness** — `uniqueSuffix()` is `Date.now()` + random, without the worker index; no prefix
  marks test data, so orphans after a crashed run cannot be found.
- **Portability** — `playwright.config.ts` reads `process.env` and loads dotenv a second time,
  outside `src/config/Env.ts`.
- **Exact values** — TC9 checks the comment with `toContainText` on the whole card.

## Options considered

1. **Extend `lifecycle-architect`** — rejected: 400-line budget reached; its domain is the API layer
   structure, not the data that flows through it.
2. **Extend `test-standards`** — rejected: code hygiene domain; data maturity needs its own model
   (classification, levels 0–4, M5 execution).
3. **New sub-skill `spec-data-standard`**, no hub mode (routed by Mode 6, rules run in Mode 1) —
   accepted.

## Decision

- `.claude/skills/spec-data-standard/SKILL.md` with R1–R15 and modes M0–M5, adapted from the course
  prompt (`docs/prompts/M7/spec-data-standard-prompt.adapted.md`).
- `Env` gains `testDataPrefix` (`TEST_DATA_PREFIX`, default `qa_`).
- `npm run data:orphans` supports the M5 orphan check.
- Reinforcements: `lifecycle-architect` R8 adds `worker<Resource>` (net 0 lines);
  `test-standards` rule 7 points mutating identities to `worker<Resource>`; `spec-standards` lists the
  data-impact tags as informational.

## Consequences

- Fixtures that create data use a per-worker identity (`workerUser`), created and deleted through
  `POST/DELETE /api/users`.
- Only one environment (`local`) exists: environment portability is evidenced with the Readiness Map
  until a second environment is available.
