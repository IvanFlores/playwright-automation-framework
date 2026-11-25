# 04 — Prompt iteration: what had to change to get the expected result, and why

Base prompt: [`docs/prompts/M8-9/original/ui-locator-wait-standard-prompt.md`](../../prompts/M8-9/original/ui-locator-wait-standard-prompt.md)
(unchanged course copy). Every change lives in the override file
[`ui-locator-wait-standard-prompt.adapted.md`](../../prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md)
— the course prompt is never edited, so a replay applies the same overrides.

There were two kinds of change:

1. **Adaptation (C1–C8)** — needed *before* the first run, because the prompt targets the course's
   reference repo, not this one.
2. **Iteration (C9–C12)** — found by *running* the generated skill (M0 on the real code) and
   reviewing its output against the DOM and the TCs. Each is recorded in `SKILL.md` under its rule
   as *Iteration N*, as the prompt's validation loop asks.

## Part 1 — Adaptation (before the first run)

| # | What the prompt said | What this repo has | Change | Why |
|---|---|---|---|---|
| C1 | `.claude/` **and** `.kiro/` skill, YAML folded `description` | Claude Code only; other skills use a one-line quoted description with every trigger | one `.claude/` file, one-line description with M0–M6 triggers | Claude Code matches skills on the description; consistency with 8 sibling skills |
| C2 | `ADR-004-ui-locator-wait-standard.md`, hub "7 of 10" | ADR-004 is `spec-data-standard`; hub has 6 modes | `ADR-005`; hub stays 6 / 10 | numbers were taken; no new mode is needed (prompt agrees) |
| C3 | `ui-pom-standard`, `spec-code-standard`, `api-setup-teardown-standard`, `spec-quality-lifecycle-standard`, … | `pom-architect`, `test-standards`, `lifecycle-architect`; **no** `spec-quality-lifecycle-standard` | name map; orchestrator = hub Mode 6; R3/R5 "delegations" → nothing to delegate, README/USAGE lines repointed | a generated skill that cites skills that don't exist sends the agent to dead ends |
| C4 | placeholders `<pages-dir>` … | resolved values (and only one UI site: GAD) | table of resolved values | the M0 header must print them |
| C5 | hub sections *Scan Scope Ownership*, *Error Handling*, *Breaking change propagation*, *Playwright version compatibility*, *Inter-skill order*; "run hub Mode 5 (README sync, Rule 6)" | none of those sections; Mode 5 is lifecycle; no Rule 6 | one compact "Locators and waits" block; Mode 1 step 3; Mode 3 getter rule; Mode 6 phases 3/5; README synced by hand | creating five near-empty sections would bloat the hub (358 → 390 lines instead of ~450) |
| C6 | reinforce `CLAUDE.md`, `AGENTS.md`, `docs/agents/…`, `docs/wiki/…` | none exist; `lifecycle-architect` at its 400-line budget | README + USAGE; lifecycle note at **net 0 lines** | don't create files the prompt assumed; respect the size budget |
| C7 | "refactor the scenario" | whole project | refactor TC8 + TC9 only; M0 still reports everything | homework scope = the two TCs of the previous module |
| C8 | output tag, rule IDs | — | keep R1–R20 / M0–M6 exactly | evidence must map 1:1 to the course |

**Size budget.** The first generated `SKILL.md` was **434** lines (budget: under 400). Trimmed to
380 without dropping a rule: merged the timeout-layer table into one sentence, removed two
duplicated examples (R13, R20 code blocks → inline), compacted M0 steps, removed the blank line
after each rule heading. After the 4 iterations: **387** lines.

## Part 2 — Iterations (found by running the skill)

### Iteration #1 — the test-id contract must be *declared*, not inferred (C9 · R1)

- **Symptom (run A):** contract resolved to **none**; R1 flagged 9 working `getByTestId` getters
  and proposed `getByText(createdArticle.title)`, `getByText(<login error text>)`, … for elements
  whose text is exactly what the step asserts.
- **Why it is wrong:** locating an element by the value you are about to assert is circular — if
  the app renders the wrong title, the locator simply finds nothing, and the failure says "element
  not found" instead of "expected X, got Y". Also, GAD ships `data-testid` on purpose (it is an
  automation training app): it *is* a team test contract, it just was never written down.
- **Change:** prompt override C9 + ADR-005 declare the contract; `playwright.config.ts` sets
  `use.testIdAttribute: 'data-testid'` so R1 resolves it from config (the prompt's preferred source).
  `SKILL.md` R1 gained: *declare a shipped contract; never locate by the asserted value*.
- **Result:** R1 findings 9 → 0; `getByTestId` is tier 1; the login inputs (no test id in the DOM)
  correctly stay on `getByRole`.

### Iteration #2 — families of test ids (C10 · R1)

- **Symptom:** R2 correctly flagged `[data-testid^="article-"][data-testid$="-title"]`, but v1 had
  no tier-1 alternative for "all elements whose test id follows a pattern", so the only exit was a
  `// locator:` comment.
- **Change:** R1 lists `getByTestId(RegExp)` (verified in the DOM: 6 matches, identical to the CSS).
- **Result:** `ArticlesPage.articleTitles` → `getByTestId(/^article-\d+-title$/)`; tier 8 → tier 1
  for TC5–TC8 at once.

### Iteration #3 — a business-key id is not a dynamic id (C11 · R3)

- **Symptom:** R3 classed `#gotoComment${comment.id}` as a "dynamic ID (digits segment)", which
  alone dropped the whole site to **level 0 — Time-driven** although there is not a single fixed wait.
- **Why it is wrong:** R3 targets ids the test cannot predict (`#button-847392`, generated per
  render). `comment.id` comes from the `createdComment` fixture — the test created it.
- **Change:** R3 exempts ids composed only of a key the test created / received from the API; they
  remain tier 8 and need an R2 reason. The **id prefix** `[id^="gotoUser${commentId}-"]` stays R3
  (its user-id half is not matched) — that one was rewritten to a scoped label + `getByRole('link')`.
- **Result:** level scoring reflects reality (0 → 2 site-wide, 4 for the TC8/TC9 slice).

### Iteration #4 — presence of a list without a position (C12 · R5)

- **Symptom:** R5 flagged `expect(articleTitles.first()).toBeVisible()` ("list is loaded"), but the
  fix text ("scope and filter by business data") does not apply — there is no business item yet.
- **Change:** R5 names the replacement: `await expect(list).not.toHaveCount(0)`.
- **Result:** TC8 step 1 rewritten; the same fix is ready for TC6/TC7 (out of scope, pending).

## Part 3 — What did *not* need to change

- R13–R16: the suite already waited on terminal states; the rules found nothing and needed no edit.
- R17, R19, R20: correct on the first run (TC5/TC7 `toPass` without `intervals`/message, magic
  timeouts). Not fixed — outside the two-TC scope — and recorded as pending in ADR-005.
- Output format: matched on the first run (see `03-skill-verification.md` §5).

## Lessons for the next prompt

1. A project-agnostic prompt needs a **name/number map** step before generation, or it cites
   skills, ADRs and modes that don't exist (C2, C3, C5).
2. "Resolve the contract; default to none" silently produces wrong advice when the contract is
   real but undocumented — an M0 run should *ask* when it sees a consistent test-id attribute in the
   DOM and nothing declares it.
3. Heuristic rules (digits in an id) need the data-ownership context the other skills already have
   (`created<Resource>` fixtures) to avoid false positives.
