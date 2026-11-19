# M6 — lifecycle-architect: BEFORE report (existing code, report-only)

- Date: 2026-11-18
- Agent: Claude Code (desktop app), model Claude Opus 5.5
- Invocation: `/lifecycle-architect` with args
  `lifecycle review — report-only (don't fix) on the existing code: src/api/**, src/fixtures/index.ts, tests/**/*.spec.ts, src/data/**`
- Commit scanned: `4d0cdef` (before any M6 change to code)
- Mode selected by the skill: **Review**, report-only ("don't fix")

## Raw output

```
[lifecycle-architect] ERROR — CORRECT_FOLDER_PLACEMENT (R6)
File:  src/api/ApiClient.ts
Line:  1
Issue: The HTTP client sits at the root of src/api/ instead of src/api/client/.
Fix:   Move to src/api/client/ApiClient.ts and update imports in src/fixtures/index.ts and features/support/world.ts. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — API_CLIENT_STATUS_CHECKED (R11)
File:  src/api/ApiClient.ts
Line:  21
Issue: delete() checks the status with expect() instead of throwing an Error with method, URL, status and body.
Fix:   Route the response through a private ensureOk() that throws. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — API_CLIENT_STATUS_CHECKED (R11)
File:  src/api/ApiClient.ts
Line:  25
Issue: json() (used by get/post/put) checks the status with expect(), so a failed setup call surfaces as an assertion and the response body is lost.
Fix:   Replace with ensureOk() that throws "<METHOD> <url> failed — status <n>: <body>". [NOT APPLIED (report-only)]

[lifecycle-architect] WARNING — LIFECYCLE_FIXTURE_NAMING_CONVENTION (R8)
File:  src/fixtures/index.ts
Line:  73
Issue: Fixture 'api' exposes the raw ApiClient instead of a <resource>Controller / created<Resource> fixture.
Fix:   Replace with a 'postController' fixture and update tests/api/posts.spec.ts. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — CORRECT_FOLDER_PLACEMENT (R6)
File:  tests/api/posts.spec.ts
Line:  4
Issue: Response interface 'PostResponse' is declared in a spec instead of src/api/models/.
Fix:   Move it to src/api/models/post.model.ts as 'Post'. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — CORRECT_FOLDER_PLACEMENT (R6)
File:  src/data/posts.data.ts
Line:  4
Issue: Request payload type 'Post' is declared in a data file instead of src/api/models/.
Fix:   Move it to src/api/models/post.model.ts as 'CreatePostPayload' and import it in the factory. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — ENDPOINTS_CENTRALIZED (R2)
File:  tests/api/posts.spec.ts
Line:  8
Issue: Hardcoded API path '/posts'.
Fix:   Create src/api/endpoints/posts.endpoints.ts and use PostsEndpoints.base (via PostController). [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — ENDPOINTS_CENTRALIZED (R2)
File:  tests/api/posts.spec.ts
Line:  14
Issue: Hardcoded API path '/posts'.
Fix:   Same as above. [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — NO_LIFECYCLE_INSTANTIATION_IN_SPEC (R7)
File:  tests/api/posts.spec.ts
Line:  8
Issue: The spec calls ApiClient.get() directly through the 'api' fixture, bypassing controllers and endpoints.
Fix:   Inject 'postController' and call postController.getAll(). [NOT APPLIED (report-only)]

[lifecycle-architect] ERROR — NO_LIFECYCLE_INSTANTIATION_IN_SPEC (R7)
File:  tests/api/posts.spec.ts
Line:  14
Issue: The spec calls ApiClient.post() directly through the 'api' fixture, bypassing controllers and endpoints.
Fix:   Inject 'postController' and call postController.create(payload). [NOT APPLIED (report-only)]

[lifecycle-architect] REVIEW COMPLETE
─────────────────────────────────────────────
Files scanned:      13
Violations found:   10  (ERROR: 9 · WARNING: 1)
Auto-applied:       0
Manual fixes:       none (all 10 are auto-fixable)
[lifecycle-architect] ⚠️ Manual fixes pending.
```

> Note on the closing line: the skill prints `✅` only "when nothing is pending". In report-only
> every violation is still pending, so `⚠️` is correct even though the manual list is empty. The
> original prompt keyed this on "no manual fixes" — see `04-prompt-iteration.md` #4.

## Rules with no findings

| Rule | Why nothing was found |
|---|---|
| R1 | Only `ApiClient` calls `request.*`. `context.route` + `route.fetch()` in the WebKit CSP fixture is a browser route, which R1 excludes. |
| R3 | No controllers exist yet. |
| R4 | No fixture creates data — **there is no API precondition/postcondition anywhere in the suite**. This is the M6 gap the two new test cases close. |
| R5 | No mocks exist. |
| R10 | No fixture sets an auth token. |

## Files scanned (13)

`src/api/ApiClient.ts` · `src/fixtures/index.ts` · `src/data/articles.data.ts` ·
`src/data/auth.data.ts` · `src/data/posts.data.ts` · `tests/api/posts.spec.ts` · 7 UI specs
`tests/ui/**/TC1…TC7-*.spec.ts`.

`src/data/auth.data.ts` declares `User`, which is test-account data, not an API request/response
shape — not an R6 violation.
