# Adapted prompt — `spec-data-standard` for this framework (Claude Code + GAD)

**Base prompt (unchanged copy):** [`original/spec-data-standard-prompt.md`](original/spec-data-standard-prompt.md)
— course repo `anaelince/web-automation`, commit `3252f88` (2026-11-19).

**How to run it:**

> Read `docs/prompts/M7/original/spec-data-standard-prompt.md` and apply every override in
> `docs/prompts/M7/spec-data-standard-prompt.adapted.md`. Where they conflict, the override wins.
> Create the skill, the ADR, the hub updates and the reinforcements. Do not run the skill yet.

Run it **after** `spec-requirements-standard` (its M4 handoff is this skill's input).

---

## Overrides

### B1 — Skill location and frontmatter (agent)

`.claude/skills/spec-data-standard/SKILL.md`, single-quoted one-line `description` with every mode
trigger (same reason as A1 in the requirements prompt).

### B2 — Decision record

`ADR-002` is taken (lifecycle mode). Write `docs/decisions/ADR-004-spec-data-standard.md`. Mode 6
(`ADR-003`) is the only new hub mode; this skill gets no mode of its own (base prompt agrees).

### B3 — Sibling skill names

Same mapping as A2 of the requirements prompt. In particular:

| Base prompt | This repo |
|---|---|
| `spec-code-standard` R7 (credentials) | `test-standards` rule 7 |
| `spec-organisation-standard` (tag syntax) | `spec-standards` (tags are informational there) |
| `api-setup-teardown-standard` Add mode / R4 / R8 | `lifecycle-architect` Add mode / R4 / R8 |
| `spec-quality-lifecycle-standard` R7 / R8 / R10 | not present → the cross-check stays inside this skill (R13) and the hub Mode 6 notes |
| `CLAUDE.md` / `AGENTS.md` fixture naming | not present → naming lives in `lifecycle-architect` R8 |

### B4 — Resolved project conventions

| Placeholder | Value in this repo |
|---|---|
| `<data-dir>` | `src/data` (single site, flat — no `sites/<site>/`) |
| `<config-module>` | `src/config/Env.ts`, exported as **`Env`** (not `ENV` / `env.ts`) |
| `<fixtures-module>` | `src/fixtures/index.ts` |
| `<api-layer>` | `src/api` (`client/` · `endpoints/` · `models/` · `controllers/`) |
| `<runner-config>` | `playwright.config.ts` |
| `<tc-docs-dir>` | `docs/test-cases/gad` |
| Sites | **GAD** (UI projects, `BASE_URL`) and **JSONPlaceholder** (`api` project, `API_BASE_URL`) — assess each |

Rewrite every canonical example with `Env`, path aliases (`@api/*`, `@data/*`, `@config/*`,
`@fixtures`) and this repo's class names.

### B5 — GAD facts the skill must know (probed on 2026-11-23, GAD 2.9.0)

- `POST /api/users` is public and returns `201` with the new `id`; `avatar` is required.
- `DELETE /api/users/:id` needs the user's **own** bearer token (`401` without it).
- Deleting a user does **not** delete their articles/comments, and user ids are **reused** → a
  worker identity must be deleted **after** every resource it created (worker teardown runs after
  test teardown, so the ordering is natural).
- `DELETE` issued immediately after the matching `POST` can return `404`; it succeeds a moment later.
  Cleanup must not run in the same tick as creation.
- A new login returns a **new** token and the previous one keeps working (no single-session
  invalidation in GAD). R15 is still enforced: one token per identity per test is cheaper and
  portable to systems that do invalidate.

### B6 — Config additions

- Add `testDataPrefix` to `Env` (`TEST_DATA_PREFIX`, optional, default `qa_`) and document it in
  `.env.example` — R3 needs a configurable prefix.
- Do **not** add `allowDestructiveCleanup` unless a bulk cleanup exists (there is none; every
  teardown deletes by id). Report E8 as ✅ with that reason.

### B7 — Mode 5 evidence tooling

The base prompt says "query for leftover data with the test prefix" without a tool. Add an npm script
`data:orphans` (`scripts/orphan-check.ts`) that lists GAD users, articles and comments whose text
starts with `Env.testDataPrefix`; exit code `1` when any exists. Default stress run for the scenario:
`--project=chromium --workers=4 --repeat-each=4 --retries=0` on TC8 + TC9.

### B8 — Environments

Only `local` exists. M3/M5 produce the **Environment Readiness Map** instead of a second
environment run (the base prompt already allows this since its iteration 3).

### B9 — Hub and reinforcements

- Hub Mode 1: insert `spec-data-standard` after `lifecycle-architect` (step 5) → step 6; re-scan
  becomes 7, summary 8. Add `spec-data-standard:` and `spec-requirements-standard:` lines to the
  pipeline output.
- Hub Mode 6 (from ADR-003) forwards data requests to this skill.
- `lifecycle-architect` is at its 400-line budget: add `worker<Resource>` to the R8 naming list and
  the decision table **without growing the file** (net 0 lines). Do not touch other rules.
- `test-standards` rule 7: one line saying identities that mutate data come from `worker<Resource>`.
- `spec-standards`: register the data-impact tag vocabulary as informational (no new rule).

### B10 — Output format

Same bracket tag as A6. Rules keep the base prompt IDs (R1–R15) so the evidence maps to the course.
