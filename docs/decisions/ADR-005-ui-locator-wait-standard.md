# ADR-005 — Add `ui-locator-wait-standard` (locators and waits) as a sub-skill

- Status: Accepted
- Date: 2026-11-25
- Module: M8 & M9
- Related: ADR-003 (Mode 6 routes to this skill as phase 3 Act and phase 5 Run; no mode of its own)

## Context (the gap)

`pom-architect` guarantees that locators live in getters; it does not judge whether they are the
**right** locators. No skill of this repo governs:

- **Locator hierarchy** — `ArticlesPage.articleTitles` is a CSS attribute prefix/suffix selector;
  `ArticlePage.commentBody` is an XPath; neither says why a semantic or test-id locator is not used.
- **Uniqueness** — specs prove "the list is loaded" with `articleTitles.first()`; `NavBar` resolves
  its root with `.first()`; nothing records which positions are business rules.
- **Synchronisation** — `ArticlesPage.reload()` waits for `first().waitFor()`; TC5/TC7 poll with
  `toPass` without `intervals` and with magic 1 s inner timeouts.

The only statements were two convention lines in `README.md` / `USAGE.md` ("Prefer user-facing
locators … No fixed sleeps"), with no rule IDs, no detection and no evidence mode.

## Options considered

1. **Extend `pom-architect`** — rejected: its domain is Page Object *structure*; locator choice,
   waits in specs and polling in fixtures are outside its file scope and would push it past the
   400-line budget.
2. **Extend `test-standards`** — rejected: code-hygiene domain (imports, fixtures, credentials);
   a maturity model (levels 0–4) and a repeat-run evidence mode do not fit there.
3. **New hub mode** — rejected (Hub Growth Policy Rule 1): Mode 6 already orchestrates the TC
   lifecycle; locators and waits are its phase 3 Act and phase 5 Run.
4. **New sub-skill `ui-locator-wait-standard`, routed by Mode 6 and run in Mode 1** — accepted.

## Decision

- `.claude/skills/ui-locator-wait-standard/SKILL.md` with R1–R20 and modes M0–M6, generated from the
  course prompt (`docs/prompts/M8-9/original/`) plus the overrides in
  `docs/prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md`.
- **Test-id contract (site GAD): `data-testid`.** GAD publishes `data-testid` on its interactive and
  content elements as a deliberate automation contract. It is declared here and made explicit in
  `playwright.config.ts` (`use.testIdAttribute: 'data-testid'`), so R1 resolves it from the config.
  Elements without the attribute (login form inputs, comment cards) fall back to the semantic order
  and are reported as markup requests.
- Hub: sub-skill table, invocation reference, a compact "Locators and waits" ownership block,
  Mode 1 step after `pom-architect`, Mode 3 getter guidance, Mode 6 triggers and phases 3/5. The
  hub stays at **6 / 10** modes.
- Reinforcements: `pom-architect` (which-locator pointer), `lifecycle-architect` (state reads for
  polling, net 0 lines), `spec-data-standard` R13 (filter values), `spec-requirements-standard` Q6
  (asynchronous oracles), `README.md` / `USAGE.md` conventions.

## Consequences

- Locator and wait findings now have rule IDs, a maturity level per site, and an evidence mode (M6)
  that repeats the tests.
- Changing `testIdAttribute` or global timeouts in `playwright.config.ts` must be propagated to this
  skill (R1, R19) and to the `pom-architect` getter examples.
- Out of the M8-9 refactor scope (reported by M0, still pending): TC5/TC7 polling (R17, R19, R20),
  `ArticlesPage.reload()` (R5, R15), `NavBar` positions (R5), `tests/setup/auth.setup.ts` wait.
