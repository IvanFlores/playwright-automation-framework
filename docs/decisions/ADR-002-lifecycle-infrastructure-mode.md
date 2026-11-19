# ADR-002 — Add `lifecycle-architect` and Mode 5 (Lifecycle infrastructure) to automation-architect

- Status: Accepted
- Date: 2026-11-18
- Module: M6 — Test Lifecycle Control

## Context (the gap)

M6 asks for test cases whose **preconditions and postconditions run through the API**. The hub had
four modes and four sub-skills; none of them governs `src/api/` or the setup/teardown contract of
fixtures:

| Mode / skill | Looks at | Covers API setup/teardown? |
|---|---|---|
| 1 — Full pipeline (pom-architect, test-standards, spec-standards) | Page Objects, spec code, spec organisation | No — `src/api/**` is listed in step 1 but no sub-skill has rules for it |
| 2 — Structure only | Folder placement, import style | Only folder placement of Page Objects |
| 3 — Scaffold | Page Object + fixture + spec | No — generates UI fixtures only |
| 4 — Git workflow | Branches, commits | No |

Nothing could detect: a fixture that creates data and never deletes it, a spec that builds an
`ApiClient` itself, hardcoded API paths, or an `ApiClient` that swallows non-2xx responses.

## Options considered

1. **Add API rules to `test-standards`** — rejected: that skill owns test-code quality (imports,
   fixtures registration, credentials); mixing the API layer into it breaks "one domain per skill".
2. **Only add `lifecycle-architect` as a Mode 1 sub-skill, no new mode** — rejected on its own:
   Mode 1 detects and fixes; it cannot *scaffold* an API resource (endpoints, models, controller,
   fixture) for a new test case, which is the main M6 workflow.
3. **New sub-skill `lifecycle-architect` + run it in Mode 1 + thin Mode 5 for scaffolding** —
   accepted. Rules live in one place; the hub only routes (same shape as Mode 4 / `git-standards`).

## Decision

- Create `.claude/skills/lifecycle-architect/SKILL.md` (rules R1–R8, R10, R11; Review / New / Add).
- Mode 1 runs it as step 5 (after `spec-standards`).
- Add **Mode 5 — Lifecycle infrastructure** as a wrapper. Mode total becomes **5 / 10**.

The course prompt numbered this "Mode 6" because the reference hub already had five modes; this hub
has four, so it is Mode 5.

## Consequences

- `src/api/` is reorganised into `client/`, `endpoints/`, `models/`, `controllers/`.
- The generic `api` fixture (raw `ApiClient`) is replaced by `<resource>Controller` /
  `created<Resource>` fixtures.
- Future API work (database setup, token caching) extends `lifecycle-architect`, not the hub.
