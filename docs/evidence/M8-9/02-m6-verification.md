# 02 — `ui-locator-wait-standard` M6 BEFORE / AFTER (TC8 + TC9, Chromium)

Command (both runs, skill default K=5, N=4):

```powershell
npx playwright test TC8 TC9 --project=chromium --repeat-each=5 --workers=4 --retries=0 --trace=retain-on-failure
```

## BEFORE — baseline, code as on `main` (`1813d85`)

```
[ui-locator-wait-standard] INTERACTION VERIFICATION
─────────────────────────────────────────
Scope:   TC8 + TC9   Project: chromium   repeat=5 workers=4
Result:  10/10 passed · 0 flaky   (10.7s)
Failures by cause: strict 0 · not-found 0 · actionability 0 · premature 0 · polling 0 · data 0
Verdict: ✅ DETERMINISTIC (runtime) — but M0 level 0, see 01-m0-before.md
```

## AFTER — M1→M5 applied (`playwright.config.ts`, `ArticlesPage`, `ArticlePage`, TC8)

```
[ui-locator-wait-standard] INTERACTION VERIFICATION
─────────────────────────────────────────
Scope:   TC8 + TC9   Project: chromium   repeat=5 workers=4
Result:  10/10 passed · 0 flaky   (10.4s)
Failures by cause: strict 0 · not-found 0 · actionability 0 · premature 0 · polling 0 · data 0
Verdict: ✅ DETERMINISTIC
```

`npx tsc --noEmit` and `npx eslint src tests playwright.config.ts`: clean.

## Reading the result honestly

Both runs are green. The two TCs were **not flaky** before the refactor — the M7 work had already
made them parallel-safe — so M6 does not show a red → green change, and this file does not claim
one. What changed is what M0 measures:

| | BEFORE | AFTER |
|---|---|---|
| M0 level (site GAD) | 0 — Time-driven | 2 — Semantic (TC8/TC9 slice: 4) — see 03 |
| TC8/TC9 locators by tier | 0 tier 1 · 5 tier 7 · 4 tier 8 (contract undeclared) | 6 tier 1 · 3 tier 8, all justified |
| Unjustified CSS/XPath in TC8/TC9 code | 4 | 0 |
| XPath index / id-prefix dependencies | 2 | 0 |
| Positions without a rule in TC8/TC9 | 1 | 0 |

The practical gain is **how they fail**: a missing comment now fails on "label `comment:` + span
inside the card of comment N" instead of on an XPath index, and an empty article list fails on
`not.toHaveCount(0)` with the real count instead of on "element `.first()` not visible".
