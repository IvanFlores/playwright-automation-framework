# M7 — `spec-data-standard` M0 + M3 map + M5 — BEFORE (report-only)

- Date: 2026-11-23 · Agent: Claude Code (Opus 5.5)
- Invocation: Skill tool → `spec-data-standard`, args
  `assess test data — report-only (don't fix): M0 maturity + R1–R15 detection on src/data/**, src/config/**, src/fixtures/**, playwright.config.ts, tests/**/*.spec.ts. Input: M4 handoff of TC8/TC9 …`
- Code scanned: commit `5f3c83a` (no code change since M6 — only skills and docs were added).
- Files modified by the run: none.

## M5 baseline (run before the assessment)

```
npx playwright test TC8 TC9 --project=chromium --workers=4 --repeat-each=4 --retries=0
8 passed (21.9s)
```

```
[spec-data-standard] ROBUSTNESS VERIFICATION
─────────────────────────────────────────
Scope:     TC8 + TC9   Project: chromium
Parallel:  workers=4 repeat=4 → 8/8 passed · 0 flaky
Env local: 8/8 passed   (readiness map attached — 1 environment)
Orphans:   not measurable — generated data has no prefix (R3); manual query for
           "Lifecycle article/comment" found 0
Failures by cause: collision 0 · session 0 · missing-data 0 · order 0 · other 0
Verdict:   ❌ NOT HERMETIC (latent) → run M1 for R1, R2, R15
```

Green is not the same as hermetic: every worker creates its data as the **same** GAD account. No
test deletes "all articles of the user" today, so nothing collides yet; the first such cleanup (or a
system that keeps one session per user) breaks parallel runs. The verdict is based on the static
findings, not on a failure.

## Raw output

```
[spec-data-standard] MATURITY ASSESSMENT
─────────────────────────────────────────
Resolved: data=src/data · config=src/config/Env.ts · fixtures=src/fixtures/index.ts · api=src/api
Site: GAD (chromium/firefox/webkit)   Level: 2 — Per environment   (TC8/TC9 scope: 2)
  Data inventory:  7 reference · 2 environment · 2 transactional · 3 secret · 0 simulated
    reference:     seeded article list (TC5–TC7), noMatchSearchTerm, noResultsMessage, firstPage,
                   smallPageSize, invalidCredentials message, invalidUser (deliberately non-existent)
    environment:   BASE_URL, TEST_ENV
    transactional: article (createdArticle), comment (createdComment)
    secret:        TEST_USERNAME/TEST_PASSWORD (users.appUser), GAD bearer token
  Shared mutable identity: users.appUser — creates articles/comments in every worker
  Blockers to level 3:
    - createdArticle/createdComment write as users.appUser → M1 / R1
    - two logins for the same identity inside TC9 → M1 / R15
    - uniqueSuffix() without parallelIndex → M1 / R2
    - generated titles/bodies without the test-data prefix → M1 / R3
Site: JSONPlaceholder (api)   Level: 3 — Isolated (nothing persists: POST /posts is simulated)
  Blockers to level 4:
    - userId: 1 literal assumed to exist → M3 / R10
    - presence-only assertion on the post list → M4 / R13
Recommended next mode: M1

[spec-data-standard] ERROR — NO_SHARED_MUTABLE_IDENTITY (R1, M1)
File:  src/fixtures/index.ts
Line:  100
Issue: createdArticle creates and deletes articles with gadClient(), i.e. as users.appUser (one .env account) while the UI projects run fullyParallel with several workers.
Fix:   Add a worker-scoped workerUser (POST/DELETE /api/users) and create the data with its token. [NOT APPLIED (report-only)]

[spec-data-standard] ERROR — NO_SHARED_MUTABLE_IDENTITY (R1, M1)
File:  src/fixtures/index.ts
Line:  109
Issue: createdComment writes comments as the same shared users.appUser.
Fix:   Use the token of workerUser. [NOT APPLIED (report-only)]

[spec-data-standard] ERROR — SINGLE_SESSION_PER_IDENTITY (R15, M1)
File:  src/fixtures/index.ts
Line:  110
Issue: In TC9 createdArticle (line 101) and createdComment (line 110) each call gadClient(), which logs in again as the same account — two tokens per test for one identity.
Fix:   One fixture (workerUser) owns the token; created<Resource> fixtures reuse it. [NOT APPLIED (report-only)]

[spec-data-standard] ERROR — UNIQUE_CREATED_DATA (R2, M1)
File:  src/data/articles.data.ts
Line:  16
Issue: uniqueSuffix() is Date.now() + random without the worker's parallelIndex; it is also reused by comments.data.ts.
Fix:   uniqueSuffix(parallelIndex) = `${i}-${Date.now()}-${random}`; factories receive parallelIndex. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — TEST_DATA_PREFIXED (R3, M1)
File:  src/data/articles.data.ts
Line:  29
Issue: Article title/body start with "Lifecycle article" / "Created through the API", not with a test-data prefix; Env has no testDataPrefix.
Fix:   Add Env.testDataPrefix (TEST_DATA_PREFIX, default qa_) and prefix title and body. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — TEST_DATA_PREFIXED (R3, M1)
File:  src/data/comments.data.ts
Line:  10
Issue: Comment body "Lifecycle comment …" has no test-data prefix.
Fix:   Prefix with Env.testDataPrefix. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — PARALLELISM_NOT_SUPPRESSED (R4, M1)
File:  playwright.config.ts
Line:  23
Issue: workers: Env.isCI ? 1 : undefined serialises CI without a `// spec-data: serial — <reason>` justification.
Fix:   Justify it or remove the suppression once R1 is fixed. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — NO_GLOBAL_STATE_ASSERTION (R5, M1)
File:  tests/ui/regression/articles/TC7-articles-items-per-page.spec.ts
Line:  18
Issue: toHaveCount(3) on the shared article list assumes at least 3 seeded articles exist.
Fix:   Own the collection (create 3+ articles for a worker user and filter by it) or document the seed dependency. [MANUAL — out of M7 scope (TC7)]

[spec-data-standard] ERROR — ENV_RESOLVED_FROM_CONFIG (R9, M3)
File:  playwright.config.ts
Line:  10
Issue: The runner config reads process.env.TEST_ENV and loads dotenv a second time (lines 7–13), outside src/config/Env.ts.
Fix:   Remove the duplicate block; Env.ts already selects .env.<TEST_ENV> and validates on import. [NOT APPLIED (report-only)]

[spec-data-standard] ERROR — NO_ENV_SPECIFIC_LITERALS (R10, M3)
File:  src/data/posts.data.ts
Line:  9
Issue: userId: 1 assumes a JSONPlaceholder record exists.
Fix:   Discover a user id through the API or move it to an environment data map. [MANUAL — out of M7 scope (api site); JSONPlaceholder's fixed dataset is part of its public contract]

[spec-data-standard] WARNING — DATA_IMPACT_TAGGED (R11, M3)
File:  tests/ui/smoke/articles/TC8-search-api-created-article.spec.ts
Line:  11
Issue: TC8 uses createdArticle (persistence) but is tagged only @smoke.
Fix:   { tag: ['@smoke', '@mutates-data'] }. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — DATA_IMPACT_TAGGED (R11, M3)
File:  tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts
Line:  12
Issue: TC9 uses createdArticle and createdComment but is tagged only @regression.
Fix:   { tag: ['@regression', '@mutates-data'] }. [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — EXPECTED_VALUE_FROM_CONTROLLED_SOURCE (R13, M4)
File:  tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts
Line:  22
Issue: The comment is checked with toBeVisible() and toContainText(body) on the whole card (id, author, date, text), although the comment text is addressable; the author oracle of the handoff is not asserted.
Fix:   ArticlePage.commentBody(id) / commentAuthor(id) + toHaveText(createdComment.body / workerUser full name). [NOT APPLIED (report-only)]

[spec-data-standard] WARNING — EXPECTED_VALUE_FROM_CONTROLLED_SOURCE (R13, M4)
File:  tests/ui/smoke/articles/TC5-articles-list-pagination.spec.ts
Line:  15
Issue: totalPages is checked with /^\d+$/ — any number passes; the expected value is knowable from GET /api/articles.
Fix:   Compare with ceil(total / pageSize) discovered through an article controller. [MANUAL — out of M7 scope (TC5)]

[spec-data-standard] WARNING — EXPECTED_VALUE_FROM_CONTROLLED_SOURCE (R13, M4)
File:  tests/api/posts.spec.ts
Line:  7
Issue: posts.length > 0 is presence-only.
Fix:   Assert the known size or a known record of the fixed dataset. [MANUAL — out of M7 scope (api site)]

[spec-data-standard] REVIEW COMPLETE
Violations: 15 (7 ERROR · 8 WARNING) — auto-applied 0 · manual 0 · pending 15
[spec-data-standard] ⚠️ 15 pending.
```

Rules with no findings: R6, R7, R8 (no JSON/CSV, no inline datasets, no loops), R12 (every teardown
deletes by id), R14 (covered by R13 for TC5).

Not flagged, with reason:
- TC8 line 22 `toHaveCount(1)` — count of a search for the test's **own** unique title (owned data).
- TC6 line 19 `toHaveCount(0)` — no test creates an article containing the no-match term.
- TC1/TC3 `toContainText(username)` on the greeting — the greeting is one element (`Hi <email>!`);
  the value is not separately addressable.
- `features/support/world.ts` reads `process.env` — Cucumber is outside the scan scope.
- `src/data/posts.data.ts` uniqueness/prefix — JSONPlaceholder does not persist (`Simulated`).

## M3 — Environment Readiness Map (baseline)

```
[spec-data-standard] ENVIRONMENT READINESS — GAD
Environments available: 1 (local; CI uses a GAD service container with the same config)   Mode: readiness map
E1 ✅ Env.ts selects .env.<TEST_ENV> then .env
E2 ✅ Env.ts fails fast on BASE_URL / TEST_USERNAME / TEST_PASSWORD
E3 🔧 playwright.config.ts reads process.env.TEST_ENV and reloads dotenv (R9)
E4 ✅ .env git-ignored; CI creates a throwaway account per run
E5 🔧 TC8/TC9 need the .env account to exist in every environment (R1)
E6 🔧 TC5–TC7 rely on seeded articles (R5, R13) — out of M7 scope
E7 🔧 TC9 comment oracle partial (R13)
E8 ✅ teardown deletes by id only; no bulk cleanup
E9 🔧 no @mutates-data tags (R11)
E10 🔧 CI has one job, one environment
Ready: 4/10   Next: E3
```

## Mapping to the TC handoff

| Handoff item (02-requirements-after) | Finding |
|---|---|
| `fixtures.identity: workerUser` | R1 ×2, R15 |
| `data.source: factory` with prefix | R2, R3 ×2 |
| `tags: [..., '@mutates-data']` | R11 ×2 |
| exact oracles (comment text, author) | R13 (TC9) |
