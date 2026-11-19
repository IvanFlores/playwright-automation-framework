# M6 — Prompt execution notes: `lifecycle-architect-skill-prompt` → Claude Code

- Date: 2026-11-18
- AI agent: **Claude Code** (desktop app, model Claude Opus 5.5). The course prompt was written for **Kiro**.
- Source prompt: `docs/skills/lifecycle-architect-skill-prompt.md` in the course repo
  (`anaelince/web-automation`, version before commit `d07f9d7`, where it was later renamed to
  `api-setup-teardown-standard-prompt.md`).
- Branch: `test/m6-lifecycle-architect` → PR into `main`.

## Evidence index

| Phase | File |
|---|---|
| Prompt execution (this file) | `notes.md` |
| Skill verification — BEFORE (existing code, report-only) | [`01-before-report.md`](01-before-report.md) |
| Skill verification — fixes + scaffold + AFTER | [`02-after-report.md`](02-after-report.md) |
| Skill verification — findings and format check | [`03-skill-verification.md`](03-skill-verification.md) |
| Prompt iteration | [`04-prompt-iteration.md`](04-prompt-iteration.md) |
| Test execution | [`05-test-execution.md`](05-test-execution.md) |

## What running the prompt produced

| File | Change |
|---|---|
| `.claude/skills/lifecycle-architect/SKILL.md` | **New skill** — rules R1–R8, R10, R11; modes Review / New / Add |
| `.claude/skills/automation-architect/SKILL.md` | Registered as 5th sub-skill; Mode 1 step 5 runs it; **Mode 5 — Lifecycle infrastructure**; total 5 / 10; triggers in `description`; project context lists the API layer |
| `docs/decisions/ADR-002-lifecycle-infrastructure-mode.md` | ADR for the new mode (hub Growth Policy Rule 2) |

## Changes made while adapting the prompt to Claude Code

| # | Kiro prompt said | Adapted for Claude Code | Why |
|---|---|---|---|
| 1 | Create `.kiro/skills/lifecycle-architect/SKILL.md` | `.claude/skills/lifecycle-architect/SKILL.md` | Claude Code discovers project skills only under `.claude/skills/`. It appeared in the skill list right after the file was written and was invoked as `/lifecycle-architect`. |
| 2 | `description: >` folded YAML, no trigger words | Single-quoted one-line `description` listing every trigger phrase | Claude Code chooses when to load a skill from `description` only; same style as the other 5 skills. |
| 3 | Sibling skills `spec-code-standard`, `spec-organisation-standard` | `test-standards`, `spec-standards` | Those are the names in this repo (M5). |
| 4 | Add **Mode 6** and "(6 of 10 slots used)" | **Mode 5**, "5 / 10" | This hub has 4 modes; the reference hub had 5. |
| 5 | Just add the mode | ADR-002 written first | This hub's Growth Policy Rule 2 forbids a mode without an ADR. |
| 6 | Two modes: New, Add | Added **Review** (default) | The prompt has rules but no mode that only *checks existing code*; the homework asks to trigger the skill against existing code. See `04-prompt-iteration.md` #1. |
| 7 | Controller file `<resource>.controller.ts` (Step 4) but example `BookController.ts` | `<Resource>Controller.ts` | The prompt contradicts itself; PascalCase file = class name matches `src/ui/pages/*Page.ts`. |
| 8 | Endpoints for demoqa (`/api/v1/Books`, `/BookStore/...`) | GAD paths (`/api/login`, `/api/articles`, `/api/comments`) + JSONPlaceholder `/posts` | Must describe the real app under test. |
| 9 | `ENV.userId`, `ENV.testUser` | `users.appUser` from `@data/auth.data` (backed by `Env`) | Existing credential source; `test-standards` rule 7 forbids literals. |
| 10 | — | GAD constraints documented: Bearer token from `POST /api/login`; `date` must be `YYYY-MM-DDTHH:mm:ssZ` and not in the future | Found by probing the API: the first create calls returned `422` for both. |
| 11 | `ApiClient.get` has no status check in the canonical example (contradicts R11) | Every method uses one `ensureOk()` that throws | The example would itself violate R11. |
| 12 | R11 only checks for a missing `ok()` | R11 also flags `expect()` used for status | Existing `ApiClient` used `expect()` — `pom-architect` rule 6 keeps assertions in specs, and a setup failure must read as an API error. |
| 13 | Scan scope table has duplicated rows; registry says "R1–R8" but R10, R11 exist; R9 missing | De-duplicated table; "R1–R8, R10, R11"; R9 marked reserved | Remove ambiguity for the agent; keep rule IDs stable with the course. |
| 14 | R1 "any file calls `request.*`" | Excludes `route.fetch()` in `page/context.route` handlers | The existing WebKit CSP fixture uses `route.fetch()`; it is a browser route, not an API call. |
| 15 | R2 scope: controllers, fixtures, mocks | + specs | The only hardcoded API paths in the repo were in `tests/api/posts.spec.ts`. |
| 16 | R7 "instantiates ApiClient / controller" | + "receives the raw `ApiClient` through a fixture and calls HTTP methods" + explicit exception for `tests/api/**` | The existing `api` fixture let specs bypass controllers; API specs legitimately call the operation under test. |
| 17 | Violation output `Fix: … \| AUTO-APPLIED` | `Fix: … [AUTO-APPLIED \| MANUAL \| NOT APPLIED (report-only)]` + `REVIEW COMPLETE` summary block | Same format as the other sub-skills so the hub can aggregate it. |
| 18 | Mode 1 runs step "6" | Step 5 (+ re-scan becomes 6, summary 7), re-scan covers four skills | Numbering of this hub's Mode 1. |
| 19 | Fixture example `createdBook` | Added dependent-fixture note (`createdComment` depends on `createdArticle`, torn down first) | TC9 needs two related resources. |
