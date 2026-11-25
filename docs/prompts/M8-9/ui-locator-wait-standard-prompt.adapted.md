# Adapted prompt — `ui-locator-wait-standard` for this framework (Claude Code + GAD)

**Base prompt (unchanged copy):** [`original/ui-locator-wait-standard-prompt.md`](original/ui-locator-wait-standard-prompt.md)
— course material for Modules 8 & 9, pasted verbatim into this repo on 2026-11-25.

**How to run it:**

> Read `docs/prompts/M8-9/original/ui-locator-wait-standard-prompt.md` and apply every override in
> `docs/prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md`. Where they conflict, the override
> wins. Create the skill, the ADR, the hub updates and the reinforcements. Do not run the skill yet.

Input of the validation loop: the Page Objects, fixtures and specs of **TC8** and **TC9** (the two
test cases of the previous module, M7).

The base prompt was written for the course's reference repo. Its skill names, ADR numbers, hub mode
numbers and agent files differ from this repo; the overrides below map every one of them. An
override never weakens a rule — it only says where it lives here.

---

## Overrides

### C1 — Skill location and frontmatter (agent)

`.claude/skills/ui-locator-wait-standard/SKILL.md` (Claude Code only — no `.kiro/`). Frontmatter
`description` is a single-quoted one-line string that also lists every mode trigger, like the other
skills of this repo (Claude Code matches skills on the description).

### C2 — Decision record

`ADR-004` is taken (`spec-data-standard`). Write `docs/decisions/ADR-005-ui-locator-wait-standard.md`.
No new hub mode (the base prompt agrees): the hub stays at **6 / 10** modes.

### C3 — Sibling skill names

| Base prompt | This repo |
|---|---|
| `ui-pom-standard` R2 (getters) / R4 (no `page.*` in specs) | `pom-architect` rule 2 / rule 4 |
| `spec-code-standard` | `test-standards` |
| `spec-organisation-standard` | `spec-standards` |
| `api-setup-teardown-standard` R1 / R11 / Add mode | `lifecycle-architect` R1 / R11 / Add mode |
| `git-workflow-docs-standard` | `git-standards` |
| `spec-requirements-standard` Q5–Q7 · `spec-data-standard` R10 · R13 | same names and IDs |
| `spec-quality-lifecycle-standard` (orchestrator) | **not present** → the orchestrator is hub **Mode 6 — TC quality review** (`ADR-003`) |
| `spec-quality-lifecycle-standard` R3 / R5 (taken over) | **not present** → nothing to delegate; the only prior statements are the convention lines in `README.md` / `USAGE.md` ("Prefer user-facing locators … No fixed sleeps"), which now point to this skill |
| `spec-quality-lifecycle-standard` R1 / R4 / R6 / R9 / R10 (assertions, preconditions) | **not present** → refer to "the step's web-first assertion" and `spec-requirements-standard` Q6 instead of a rule ID |
| Hub Mode 7 | Hub **Mode 6** |
| `CLAUDE.md` / `AGENTS.md` | not present → `README.md` "Conventions" + `USAGE.md` |
| `docs/agents/claude/skill-reference.md` · `docs/wiki/anti-flakiness-reference.md` | not present → README "AI skills" table only (do not create the wiki) |

### C4 — Resolved project conventions

| Placeholder | Value in this repo |
|---|---|
| `<pages-dir>` | `src/ui/pages` · `src/ui/components` |
| `<specs-dir>` | `tests` (UI specs under `tests/ui/**`; `tests/setup/**` included; `tests/api/**` has no UI) |
| `<fixtures-module>` | `src/fixtures/index.ts` |
| `<api-layer>` | `src/api` (`client/` · `endpoints/` · `models/` · `controllers/`) |
| `<runner-config>` | `playwright.config.ts` |
| `<testid-contract>` | resolve at run time (see C9) |
| Sites | **GAD** (UI projects). JSONPlaceholder is API-only → not assessed |

Rewrite canonical examples with path aliases (`@pages/*`, `@fixtures`) and this repo's classes.

### C5 — Hub updates that have no section in this hub

The hub has no *Scan Scope Ownership*, *Inter-skill execution order*, *Error Handling*,
*Breaking change propagation* or *Playwright version compatibility* section. Instead of creating
five sections (hub is at 358 lines):

- Items 1, 7 → sub-skill table and invocation reference (as in the base prompt).
- Items 2, 6, 9, 10 → one compact **"Locators and waits"** block under Project context: ownership
  table (4 rows), execution order sentence, config-change propagation and the API list.
- Item 3 → Mode 1 step after `pom-architect` (step 3); renumber; add the output line. There is no
  `spec-quality-lifecycle-standard` step to edit.
- Item 4 + 8 → Mode 3 step 2 (R1 hierarchy, R4 `// TODO: verify locator in DOM`).
- Item 5 → Mode 6 triggers, phase table (3 Act, 5 Run) and steps.
- "Run hub Mode 5 (README sync, Hub Growth Policy Rule 6)" → this hub has no Rule 6 and Mode 5 is
  lifecycle: sync the README "AI skills" table and the hub frontmatter by hand.

### C6 — Reinforcements in this repo

| Base prompt target | Change here |
|---|---|
| `ui-pom-standard` | `pom-architect`: Project context line "Which locator → `ui-locator-wait-standard`"; rule 2 example notes `getByTestId('x')` over `locator('[data-testid="x"]')` |
| `api-setup-teardown-standard` | `lifecycle-architect` is at its **400-line budget**: add the state-read note to the Add mode **without growing the file** (net 0 lines) |
| `spec-data-standard` R13 | one-line note: values inside `filter({ hasText })` follow the same controlled sources |
| `spec-requirements-standard` Q6 | one-line note: an asynchronous step's oracle names the terminal state and its failure states |
| `CLAUDE.md` / `AGENTS.md` | `README.md` + `USAGE.md` convention lines |

Then `wc -l` every modified `SKILL.md`; report any over 400 lines.

### C7 — Scope of the refactor

The validation loop refactors only **TC8 + TC9** and the code they execute (`ArticlesPage`,
`ArticlePage`, `src/fixtures/index.ts`). M0 still reports the whole project; blockers outside that
scope are listed as pending, not fixed (same rule as M7).

### C8 — Output format

Bracket tag `[ui-locator-wait-standard]`. Rules keep the base prompt IDs (R1–R20) and modes
(M0–M6) so the evidence maps to the course.

---

## Overrides added by iteration (see `docs/evidence/M8-9/04-prompt-iteration.md`)

### C9 — Test-id contract declared, not inferred (iteration #1)

GAD ships `data-testid` on its interactive and content elements on purpose (it is a test-automation
training app). With no `testIdAttribute` in the config and no ADR, the base prompt resolves the
contract to **none** and ranks `getByTestId` at tier 7 — M0 then asks to replace 14 working
test-id getters with role/placeholder locators. Decision: declare the contract in **ADR-005** and
make it explicit in `playwright.config.ts` (`use.testIdAttribute: 'data-testid'`) so R1 resolves it
from the config, as the base prompt prefers.

### C10 — `getByTestId(RegExp)` for families of test ids (iteration #2)

A collection whose test ids share a pattern (`article-<id>-title`) is matched with
`getByTestId(/^article-\d+-title$/)` (tier 1), not with a CSS attribute prefix/suffix selector
(tier 8). Added to R1's auto-fix list.

### C11 — Business-key IDs are not dynamic IDs (iteration #3)

R3's "dynamic ID (digits segment)" also matches ids built from a **business key the test owns**
(`#gotoComment${comment.id}`), which are deterministic. R3 is narrowed: an id that is composed from
a value the test created or received from the API is allowed **as a tier-8 locator with a
`// locator:` reason** (R2); a digit segment the test cannot predict is still R3.

### C12 — Presence of a collection without a position (iteration #4)

`expect(list.first()).toBeVisible()` as "the list is loaded" is R5 (position as the only
disambiguation). The fix is `await expect(list).not.toHaveCount(0)` — added to R5's fix text.
