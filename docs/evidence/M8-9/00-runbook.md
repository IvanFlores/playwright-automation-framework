# M8 & M9 — Skill execution: runbook and evidence index

Homework: adapt the course prompt `ui-locator-wait-standard` to this framework, run it, trigger the
resulting skill on the existing code (the two test cases of the previous module, **TC8** and
**TC9**), and document what it found and what had to change.

- Agent: Claude Code desktop · model Claude Opus 5.5 · 2026-11-25
- Branch: `test/m8-9-ui-locator-wait` → PR into `main`
- Starting point: `main` at `1813d85` (M7 + TC1–TC7 migration)

## Evidence index

| Homework item | File |
|---|---|
| Prompt execution — course prompt (unchanged) | [`docs/prompts/M8-9/original/ui-locator-wait-standard-prompt.md`](../../prompts/M8-9/original/ui-locator-wait-standard-prompt.md) |
| Prompt execution — adapted prompt (overrides C1–C12) | [`docs/prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md`](../../prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md) |
| Prompt execution — generated skill + decision record | [`.claude/skills/ui-locator-wait-standard/SKILL.md`](../../../.claude/skills/ui-locator-wait-standard/SKILL.md) · [ADR-005](../../decisions/ADR-005-ui-locator-wait-standard.md) · hub (`automation-architect`) Mode 1 / 3 / 6 |
| Skill verification — M0 BEFORE (raw report) | [`01-m0-before.md`](01-m0-before.md) |
| Skill verification — M6 BEFORE / AFTER | [`02-m6-verification.md`](02-m6-verification.md) |
| Skill verification — findings, fixes, M0 AFTER, format check | [`03-skill-verification.md`](03-skill-verification.md) |
| Prompt iteration | [`04-prompt-iteration.md`](04-prompt-iteration.md) |
| Test execution — HTML report, Chromium | [`05-test-execution.md`](05-test-execution.md) · [`screenshots/`](screenshots/) |
| Raw run logs | [`logs/`](logs/) (M6 before / after, full Chromium run) |
| Spec files (TC specifications) | [`docs/test-cases/gad/articles-test-cases.md`](../../test-cases/gad/articles-test-cases.md) (TC8) · [`docs/test-cases/gad/comments-test-cases.md`](../../test-cases/gad/comments-test-cases.md) (TC9) |
| Generated / refactored code | `playwright.config.ts` · `src/ui/pages/ArticlesPage.ts` · `src/ui/pages/ArticlePage.ts` · `tests/ui/smoke/articles/TC8-search-api-created-article.spec.ts` |

## The process, phase by phase

| # | Phase | What the AI did | Human decision / check |
|---|---|---|---|
| 0 | Understand | Read the course prompt, the hub, 8 skills, TC8/TC9 code; dumped the GAD DOM (aria snapshot + HTML) for the articles list, an article with comments and the login form | Which two TCs; where the prompt is (pasted into chat) |
| 1 | Adapt | Pinned the prompt verbatim; wrote overrides C1–C8 (names, ADR number, hub sections, scope) | Every cited skill / ADR / mode must exist here |
| 2 | Execute prompt | Generated `SKILL.md` (434 → 380 lines to meet the budget), ADR-005, hub updates, reinforcements (lifecycle-architect net 0 lines) | All `SKILL.md` ≤ 400 lines; skill shows up in Claude Code |
| 3 | M6 baseline | 10/10 on unchanged code | Green ≠ well-built: wait for M0 |
| 4 | Trigger M0 (report-only) | Level 0, 28 findings across R1, R2, R3, R5, R17, R19, R20 | Review every finding against the DOM → 2 kinds of wrong advice |
| 5 | Iterate prompt | C9–C12 → skill v2 (387 lines) | Declare `data-testid` as GAD's contract (ADR-005) |
| 6 | Refactor (M1→M5) | config contract, `getByTestId(RegExp)`, comment field locator without XPath index / id prefix, TC8 presence check | Scope = TC8 + TC9 only |
| 7 | M6 after + M0 after | 10/10; site level 2, TC8/TC9 slice level 4, 0 findings in scope | Out-of-scope blockers listed in ADR-005 |
| 8 | Execute + document | Full Chromium run 9/9, HTML report screenshots, evidence files | — |

## Replaying the process from scratch

**Requirements:** GAD running at `BASE_URL`, `.env` filled (see `.env.example`), `npm ci`.

1. Branch from the starting point and bring in the prompt files only:

   ```powershell
   git switch -c test/m8-9-replay-<yyyymmdd> 1813d85
   ```

   ```powershell
   git checkout main -- docs/prompts/M8-9
   ```

2. Open Claude Code in the repo and send, one at a time:

   | Step | Prompt to send |
   |---|---|
   | Skill | `Read docs/prompts/M8-9/original/ui-locator-wait-standard-prompt.md and apply every override in docs/prompts/M8-9/ui-locator-wait-standard-prompt.adapted.md. Where they conflict, the override wins. Create the skill, the ADR, the hub updates and the reinforcements. Do not run the skill yet.` |
   | M6 baseline | `/ui-locator-wait-standard locator wait m6 on TC8 TC9 (chromium, repeat 5, workers 4)` |
   | M0 | `/ui-locator-wait-standard assess locators — M0 report-only (don't fix) on the whole project` |
   | Fix | `/ui-locator-wait-standard review locators, then locator uniqueness, then fix waits, then polling — TC8 and TC9 only` |
   | M6 after | `/ui-locator-wait-standard verify interactions on TC8 TC9 (chromium, repeat 5, workers 4)` |
   | Execution | `npx playwright test --project=chromium` then `npm run report` |

3. Compare: because C9–C12 are already in the overrides, the replay should skip the iterations and
   reach the AFTER state directly (contract declared, 0 findings on the TC8/TC9 slice, 10/10).
