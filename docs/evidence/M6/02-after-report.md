# M6 — lifecycle-architect: fixes applied + AFTER report

- Date: 2026-11-18
- Agent: Claude Code (desktop app), model Claude Opus 5.5
- Run 1 — **Review with fixes** on the same scope as the BEFORE run (`01-before-report.md`).
- Run 2 — **Add** (via hub Mode 5 routing rules: `src/api/client/ApiClient.ts` exists, resources
  have no controller → Add) for `Auth`, `Article`, `Comment`, to give TC8 / TC9 their API
  preconditions and postconditions.
- Run 3 — **Review, detection only** after the fixes (re-scan step of the skill).

## Run 1 — Review with fixes (applied in the skill's fix order R6 → R11 → R2 → R7 → R8)

| # | Rule | File | Fix applied |
|---|---|---|---|
| 1 | R6 | `src/api/ApiClient.ts` | `git mv` → `src/api/client/ApiClient.ts`; imports updated in `src/fixtures/index.ts` and `features/support/world.ts` |
| 2–3 | R11 | `src/api/client/ApiClient.ts` | `expect()` removed; every method goes through `ensureOk()` that throws `<METHOD> <url> failed — status <n>: <body>`; `setAuthToken()` added for GAD |
| 4–5 | R6 | `tests/api/posts.spec.ts:4`, `src/data/posts.data.ts:4` | Interfaces moved to `src/api/models/post.model.ts` (`Post`, `CreatePostPayload`) |
| 6–7 | R2 | `tests/api/posts.spec.ts:8,14` | `src/api/endpoints/posts.endpoints.ts` (`PostsEndpoints.base`) |
| 8–9 | R7 | `tests/api/posts.spec.ts:8,14` | `src/api/controllers/PostController.ts`; spec injects `postController` |
| 10 | R8 | `src/fixtures/index.ts:73` | `api` fixture replaced by `postController` |

`npx tsc --noEmit` after the fixes reported one error the fix introduced
(`toMatchObject(payload)` — an interface has no index signature); fixed with
`toMatchObject({ ...payload })` as the skill's step 4 requires.

## Run 2 — Add (scaffold for the M6 test cases)

```
[lifecycle-architect] SCAFFOLD COMPLETE — Add
─────────────────────────────────────────────
Created:  src/api/endpoints/auth.endpoints.ts
Created:  src/api/models/auth.model.ts
Created:  src/api/controllers/AuthController.ts
Created:  src/api/endpoints/articles.endpoints.ts
Created:  src/api/models/article.model.ts
Created:  src/api/controllers/ArticleController.ts
Created:  src/api/endpoints/comments.endpoints.ts
Created:  src/api/models/comment.model.ts
Created:  src/api/controllers/CommentController.ts
Created:  src/data/comments.data.ts
Updated:  src/data/articles.data.ts          (buildArticle, gadPastDate, uniqueSuffix)
Updated:  src/fixtures/index.ts             (createdArticle, createdComment, articlePage)
```

No `mocks/` were created (`needsMock = false`: both test cases run against the real GAD API).
`src/ui/pages/ArticlePage.ts` and the `articlePage` fixture were added following `pom-architect` /
`test-standards` rule 4 (the fixture navigates to the article created by the precondition).

## Run 3 — Review, detection only (AFTER)

```
[lifecycle-architect] REVIEW COMPLETE
─────────────────────────────────────────────
Files scanned:      28
Violations found:   0  (ERROR: 0 · WARNING: 0)
Auto-applied:       0
Manual fixes:       none
[lifecycle-architect] ✅ Lifecycle layer compliant.
```

Evidence behind each rule:

| Rule | Check | Result |
|---|---|---|
| R1 | `request.get/post/put/patch/delete/fetch(` outside `src/api/client/` | none |
| R2 | `'/api/…'`, `'/posts'` literals outside `src/api/endpoints/` | none |
| R3 | Controller constructors | all 4 take `ApiClient` |
| R4 | `create()` before `use()` without `delete()` after | `createdArticle` → `delete(article.id)`; `createdComment` → `delete(comment.id)` |
| R5 | Mocks | none exist |
| R6 | Files per folder; interfaces in specs / data | all in place; only `User` (test account, not an API shape) in `src/data/auth.data.ts` |
| R7 | `new ApiClient` / `new *Controller` / `request` in specs | none |
| R8 | Lifecycle fixture names | `postController`, `createdArticle`, `createdComment` |
| R10 | Token set before `use()` + spec does a UI login | `createdArticle` / `createdComment` set a token, but TC8 / TC9 never log in through the UI — not applicable |
| R11 | `ApiClient` status handling | single `ensureOk()` throws on non-2xx |

## Proof the postconditions run

After the Chromium run and after `npx playwright test TC8 TC9 --repeat-each=5` (30 runs across
chromium, firefox and webkit — all passed), GAD was queried:

```
GET /api/articles  → 0 articles titled "Lifecycle article …"
GET /api/comments  → 0 comments with body "Lifecycle comment …"
```

Every article and comment created as a precondition was deleted by its fixture's teardown.
