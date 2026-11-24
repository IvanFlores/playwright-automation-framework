# M7 — `spec-data-standard` M1 → M4 fixes + M5 — AFTER

- Date: 2026-11-23 · Agent: Claude Code (Opus 5.5)
- Input: the 15 findings of [`03-data-before.md`](03-data-before.md) and the TC8/TC9 handoff.
- Scope of fixes: everything that touches **TC8 / TC9** (the two M6 TCs). Findings in TC5, TC7 and
  the JSONPlaceholder `api` project stay as MANUAL items, out of M7 scope.

## Order of execution (Mode 6 routing)

| # | Phase / mode | Skill invoked | Result |
|---|---|---|---|
| 1 | Arrange · M1 isolation strategy for `users.appUser` | `spec-data-standard` | Decision table → **one identity per worker** (`workerUser`) — tests mutate the identity's data and GAD can create users through the API |
| 2 | Arrange · missing controller | `lifecycle-architect` **Add** (`/lifecycle-architect lifecycle add — new api resource "users"…`) | `users.endpoints.ts`, `user.model.ts` (`User`, `CreateUserPayload`, `WorkerUser`), `UserController` (`getAll`, `create`, `delete`), `users.data.ts` (`buildUser`) |
| 3 | Arrange · M1 fixes | `spec-data-standard` | `workerUser` fixture (worker scope), `createdArticle` / `createdComment` reuse its token, factories with `parallelIndex` + prefix |
| 4 | Arrange · M3 fixes | `spec-data-standard` | `playwright.config.ts` no longer reads `process.env`; R4 justified; `@mutates-data` tags |
| 5 | Assert · M4 fixes | `spec-data-standard` | TC9 asserts comment text and author on their own locators with exact values |
| 6 | Run · M5 | `spec-data-standard` | stress run + orphan check (below) |

```
[lifecycle-architect] SCAFFOLD COMPLETE — Add
─────────────────────────────────────────────
Created:  src/api/endpoints/users.endpoints.ts
Created:  src/api/models/user.model.ts
Created:  src/api/controllers/UserController.ts
Created:  src/data/users.data.ts
Updated:  src/fixtures/index.ts            (workerUser — written by spec-data-standard M1)

[lifecycle-architect] REVIEW COMPLETE
─────────────────────────────────────────────
Files scanned:      27  (src/api/** 16 · src/fixtures/index.ts 1 · tests/**/*.spec.ts 10)
Violations found:   0  (ERROR: 0 · WARNING: 0)
Auto-applied:       0
Manual fixes:       none
[lifecycle-architect] ✅ Lifecycle layer compliant.
```

(R1: the worker fixture and `scripts/orphan-check.ts` create an `APIRequestContext` with
`request.newContext`, but every HTTP call still goes through `ApiClient`. R4: `workerUser` creates a
user before `use()` and deletes it after. R8: `worker<Resource>` is in the naming table. R10: TC8/TC9
never log in through the UI.)

## Fixes applied

```
[spec-data-standard] ERROR — NO_SHARED_MUTABLE_IDENTITY (R1, M1)
File:  src/fixtures/index.ts
Line:  100
Issue: createdArticle creates and deletes articles as users.appUser while several workers run.
Fix:   workerUser (scope: 'worker') creates a GAD user per worker via POST /api/users; createdArticle uses its token. [MANUAL — applied in M1]

[spec-data-standard] ERROR — NO_SHARED_MUTABLE_IDENTITY (R1, M1)
File:  src/fixtures/index.ts
Line:  109
Issue: createdComment writes comments as users.appUser.
Fix:   Uses workerUser's token. [MANUAL — applied in M1]

[spec-data-standard] ERROR — SINGLE_SESSION_PER_IDENTITY (R15, M1)
File:  src/fixtures/index.ts
Line:  110
Issue: Two logins for the same identity inside TC9.
Fix:   workerUser logs in once per worker; created<Resource> fixtures reuse the token (clientWithToken). [MANUAL — applied in M1]

[spec-data-standard] ERROR — UNIQUE_CREATED_DATA (R2, M1)
File:  src/data/articles.data.ts
Line:  16
Issue: uniqueSuffix() had no parallelIndex.
Fix:   Moved to src/data/factory.data.ts as uniqueSuffix(parallelIndex); buildArticle/buildComment/buildUser receive testInfo/workerInfo.parallelIndex. [AUTO-APPLIED]

[spec-data-standard] WARNING — TEST_DATA_PREFIXED (R3, M1)
File:  src/data/articles.data.ts
Line:  29
Issue: Title/body without prefix.
Fix:   Env.testDataPrefix (TEST_DATA_PREFIX, default qa_) added; titles/bodies start with it. [AUTO-APPLIED]

[spec-data-standard] WARNING — TEST_DATA_PREFIXED (R3, M1)
File:  src/data/comments.data.ts
Line:  10
Issue: Comment body without prefix.
Fix:   `${Env.testDataPrefix}comment …`. [AUTO-APPLIED]

[spec-data-standard] WARNING — PARALLELISM_NOT_SUPPRESSED (R4, M1)
File:  playwright.config.ts
Line:  23
Issue: CI serialisation without justification.
Fix:   `// spec-data: serial — <reason>` added (one GAD container on a 2-vCPU runner; isolation proven by M5 locally). [MANUAL — applied]

[spec-data-standard] ERROR — ENV_RESOLVED_FROM_CONFIG (R9, M3)
File:  playwright.config.ts
Line:  10
Issue: process.env + second dotenv load outside src/config.
Fix:   Block removed; Env.ts is the only entry point. [AUTO-APPLIED]

[spec-data-standard] WARNING — DATA_IMPACT_TAGGED (R11, M3)
File:  tests/ui/smoke/articles/TC8-search-api-created-article.spec.ts
Line:  11
Issue: Missing @mutates-data.
Fix:   { tag: ['@smoke', '@mutates-data'] }. [AUTO-APPLIED]

[spec-data-standard] WARNING — DATA_IMPACT_TAGGED (R11, M3)
File:  tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts
Line:  12
Issue: Missing @mutates-data.
Fix:   { tag: ['@regression', '@mutates-data'] }. [AUTO-APPLIED]

[spec-data-standard] WARNING — EXPECTED_VALUE_FROM_CONTROLLED_SOURCE (R13, M4)
File:  tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts
Line:  22
Issue: toBeVisible + toContainText on the whole comment card.
Fix:   ArticlePage.commentBody(id) / commentAuthor(id) / author + toHaveText(createdComment.body / publicName(workerUser)). [MANUAL — applied in M4]
```

### One iteration during M4 (the first run failed)

The first run of the new TC9 failed on the author oracle:

```
Expected: "qa_worker w0"
Received: "qa_worker ****"
```

GAD masks the last name for visitors who are not logged in. The oracle (written in M2 from the
`data-testid` alone, without reading a rendered value) was wrong, and `qa_worker` was the same for
every worker, so even the right format would not have proved *which* user wrote the comment. Fix:
`firstname` = `qa_w{parallelIndex}{random5}` (unique), oracle `publicName()` = `<firstname> ****`,
TC9 spec doc updated with a second change log entry. See `06-prompt-iteration.md` #6.

## Re-scan (detection only)

```
[spec-data-standard] MATURITY ASSESSMENT
─────────────────────────────────────────
Resolved: data=src/data · config=src/config/Env.ts · fixtures=src/fixtures/index.ts · api=src/api
Site: GAD   Level: 2 — Per environment   (TC8/TC9 scope: 3 — Isolated)
  Data inventory:  7 reference · 3 environment · 3 transactional · 3 secret · 0 simulated
    transactional: worker user (workerUser), article (createdArticle), comment (createdComment)
    environment:   BASE_URL, TEST_ENV, TEST_DATA_PREFIX
  Blockers to level 3 (whole site, out of M7 scope):
    - TC7 count on the shared seeded list → M1 / R5
  Blockers to level 4 (TC8/TC9 scope):
    - a second environment to prove portability by running (readiness map only) → M3 / E10
Site: JSONPlaceholder   Level: 3 — Isolated (unchanged)
Recommended next mode: M3 when a second environment exists

[spec-data-standard] REVIEW COMPLETE
Violations: 15 (7 ERROR · 8 WARNING) — auto-applied 7 · manual 4 (applied) · pending 4
Pending (MANUAL, out of M7 scope): R5 TC7:18 · R10 posts.data.ts:9 · R13 TC5:15 · R13 posts.spec.ts:7
[spec-data-standard] ⚠️ 4 pending.
```

`users.appUser` is still used by `authenticatedPage` (TC1–TC4). That is a UI login that creates no
data, so R1 does not apply.

## M3 — Environment Readiness Map (after)

```
[spec-data-standard] ENVIRONMENT READINESS — GAD
Environments available: 1 (local)   Mode: readiness map
E1 ✅ Env.ts selects .env.<TEST_ENV> then .env
E2 ✅ fail-fast validation; TEST_DATA_PREFIX documented in .env.example
E3 ✅ playwright.config.ts uses Env only; TC docs use relative paths
E4 ✅ .env git-ignored; CI throwaway account; worker passwords generated per run
E5 ✅ TC8/TC9 create their own identity (workerUser) — no seeded account needed
E6 🔧 TC5–TC7 still rely on seeded articles (out of M7 scope)
E7 ✅ TC8/TC9 oracles come from created data (createdArticle, createdComment, workerUser)
E8 ✅ teardown deletes by id; orphan check proves it (npm run data:orphans)
E9 ✅ @mutates-data on TC8/TC9 → `--grep-invert @mutates-data` excludes them
E10 🔧 CI has one job, one environment
Ready: 8/10   Next: E6
```

## M5 — after

```
npx playwright test TC8 TC9 --project=chromium --workers=4 --repeat-each=4 --retries=0
8 passed (5.8s)
npm run data:orphans
[orphans] http://localhost:3001 prefix 'qa_' — users 0 · articles 0 · comments 0   (exit 0)
```

Orphan check self-test: a manually planted `qa_planted` user → `users 1` and exit `1`; after
deleting it → `0` and exit `0`.

```
[spec-data-standard] ROBUSTNESS VERIFICATION
─────────────────────────────────────────
Scope:     TC8 + TC9   Project: chromium
Parallel:  workers=4 repeat=4 → 8/8 passed · 0 flaky
Env local: 8/8 passed   (readiness map attached — 1 environment)
Orphans:   0 records with prefix 'qa_'
Failures by cause: collision 0 · session 0 · missing-data 0 · order 0 · other 0
Verdict:   ✅ HERMETIC (TC8/TC9 scope)
```

| | Before | After |
|---|---|---|
| Stress run (4 workers × 4) | 8/8 · 21.9 s | 8/8 · 5.8 s |
| Logins per TC9 run | 2 (one per data fixture) | 0 (one per worker) |
| Identity used to create data | `users.appUser` (shared by all workers) | `workerUser` (one per worker, deleted after) |
| Orphans measurable | No (no prefix) | Yes — 0 |
| Findings (TC8/TC9 scope) | 11 | 0 |
| Readiness map | 4/10 | 8/10 |
| Maturity (TC8/TC9 scope) | 2 — Per environment | 3 — Isolated |

The time drop comes from removing two `POST /api/login` per test; it is a side effect, not a goal.
