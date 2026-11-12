# M5 — Skill execution BEFORE changes (report-only)

Date: 2026-11-11 · Agent: Claude Code (Claude Opus 5.5) · Branch: `test/gad-ui-tc1-tc7` (no commits yet, base `main` = baseline `194e1bc`)

Code under review = the M4 baseline: `tests/example.spec.ts`, `tests/e2e/home.spec.ts`, `tests/api/posts.spec.ts`,
`src/ui/pages/{BasePage,LoginPage,HomePage}.ts`, `src/ui/components/NavBar.ts`, `src/fixtures/index.ts`, `src/data/*`, `src/config/*`, `src/api/*`.

## 1. automation-architect — Mode 1, report-only ("full review, report only — don't fix")

```
[spec-standards] ERROR — FOLDER_STRUCTURE
File:  tests/example.spec.ts
Line:  —
Issue: Spec file is directly under tests/, not inside tests/ui/{suite}/{feature}/.
Fix:   Move to tests/ui/smoke/login/ (describe 'Login'). [NOT APPLIED (report-only)]

[spec-standards] ERROR — FILE_NAMING_CONVENTION
File:  tests/example.spec.ts
Line:  —
Issue: 'example.spec.ts' does not match TC{N}-{short-kebab-description}.spec.ts.
Fix:   Rename to TC1-valid-login.spec.ts (next free TC number). [NOT APPLIED (report-only)]

[spec-standards] ERROR — TC_ID_NAMING_CONVENTION
File:  tests/example.spec.ts
Line:  5
Issue: test() name does not start with 'TC1: '.
Fix:   Prepend 'TC1: ' to the test name. [NOT APPLIED (report-only)]

[spec-standards] ERROR — USE_TEST_STEP
File:  tests/example.spec.ts
Line:  6
Issue: Action and assertions (lines 6–10) are not wrapped in test.step() blocks.
Fix:   Group into 'Log in with the app user' and 'Verify the greeting and user menu' steps. [NOT APPLIED (report-only)]

[spec-standards] ERROR — FOLDER_STRUCTURE
File:  tests/e2e/home.spec.ts
Line:  —
Issue: Spec file is under tests/e2e/, not inside tests/ui/{suite}/{feature}/, and holds two different TCs.
Fix:   Split into one file per TC and move to tests/ui/smoke/home/. [NOT APPLIED (report-only)]

[spec-standards] ERROR — FILE_NAMING_CONVENTION
File:  tests/e2e/home.spec.ts
Line:  —
Issue: 'home.spec.ts' does not match TC{N}-{short-kebab-description}.spec.ts.
Fix:   Rename the split files to TC3-home-user-greeting.spec.ts and TC4-home-user-menu.spec.ts. [NOT APPLIED (report-only)]

[spec-standards] ERROR — DESCRIBE_MATCHES_FEATURE_FOLDER
File:  tests/e2e/home.spec.ts
Line:  4
Issue: describe name 'Home page (authenticated)' does not match feature folder 'home' (expected 'Home').
Fix:   Rename describe block to 'Home'. [NOT APPLIED (report-only)]

[spec-standards] ERROR — TC_ID_NAMING_CONVENTION
File:  tests/e2e/home.spec.ts
Line:  5
Issue: test() name does not start with 'TC{N}: '.
Fix:   Prepend 'TC3: '. [NOT APPLIED (report-only)]

[spec-standards] ERROR — USE_TEST_STEP
File:  tests/e2e/home.spec.ts
Line:  6
Issue: Assertion is not wrapped in a test.step() block.
Fix:   Wrap in test.step('Verify the greeting shows the user email'). [NOT APPLIED (report-only)]

[spec-standards] ERROR — TC_ID_NAMING_CONVENTION
File:  tests/e2e/home.spec.ts
Line:  9
Issue: test() name does not start with 'TC{N}: '.
Fix:   Prepend 'TC4: '. [NOT APPLIED (report-only)]

[spec-standards] ERROR — USE_TEST_STEP
File:  tests/e2e/home.spec.ts
Line:  10
Issue: Assertion is not wrapped in a test.step() block.
Fix:   Wrap in test.step('Verify the user menu button is visible'). [NOT APPLIED (report-only)]

[pom-architect]  0 violations found — 0 auto-applied, 0 manual
[test-standards] 0 violations found — 0 auto-applied, 0 manual
[spec-standards] 11 violations found — 0 auto-applied, 0 manual

[automation-architect] PIPELINE COMPLETE
─────────────────────────────────────────
pom-architect:    0 violations found — 0 auto-applied
test-standards:   0 violations found — 0 auto-applied
spec-standards:   11 violations found — 0 auto-applied
Remaining manual fixes: 11 (report-only)
[automation-architect] ⚠️ Manual fixes pending.
```

Notes: `tests/api/posts.spec.ts` and `tests/setup/auth.setup.ts` are out of `spec-standards` scope. `npx tsc --noEmit` passed.
Relative-import scan (`from '../'` / `'./'` in `src/` and `tests/`): 0 hits.

## 2. git-standards — Validate ("check git")

```
[git-standards] VALIDATE
──────────────────────────────────────
Branch name:      PASS (test/gad-ui-tc1-tc7)
Commit format:    0 valid / 0 invalid
Commit coverage:  VIOLATION — no feat or fix commit found on this branch
README sync:      IN SYNC
──────────────────────────────────────
[git-standards] ⚠️  1 issue(s) found — resolve before proceeding.
```

(Before the session the folder was not a git repository at all; it was initialised with `git init -b main` and a
`chore: add playwright framework baseline with m4 skills` baseline commit so the skill had something to validate.)
