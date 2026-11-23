# GAD — Articles test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".
Not migrated yet: TC5, TC6, TC7.

### TC8: Find an article created through the API by searching its exact title

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-ART-SEARCH · AC1: searching the articles list by a title returns the article with that title |
| Objective | Prove that an article that exists only in the backend is reachable from the UI search, so search is not limited to seeded content |
| Priority | High |
| Suite | smoke |
| Type | positive |
| Tags | `@smoke` · `@mutates-data` |
| Automation | Automatable |
| Spec | `tests/ui/smoke/articles/TC8-search-api-created-article.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | A GAD user `{user}` exists that no other worker uses, with a valid API token | API — `POST /api/users`, `POST /api/login` (fixture `workerUser`) | worker |
| P2 | An article `{articleId}` owned by `{user}` exists with title `{articleTitle}` | API — `POST /api/articles` with `{user}`'s token (fixture `createdArticle`) | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| user | email `{prefix}user-{suffix}@example.test`, firstname `{prefix}worker`, lastname `w{parallelIndex}`, random password | Transactional | factory `buildUser(parallelIndex)` |
| articleTitle | `{prefix}article {suffix}` | Transactional | factory `buildArticle(parallelIndex)` |
| articleBody | `{prefix}body {suffix}` | Transactional | factory `buildArticle(parallelIndex)` |
| articleDate | 24 h before now, `YYYY-MM-DDTHH:mm:ssZ` (GAD rejects future dates) | Transactional | factory `gadPastDate()` |
| prefix | `qa_` | Environment | `Env.testDataPrefix` (`TEST_DATA_PREFIX`) |
| suffix | `{parallelIndex}-{timestamp}-{random}` | Transactional | factory `uniqueSuffix(parallelIndex)` |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Open `/articles.html` | Search input is visible and empty |
| 2 | Search `{articleTitle}` (type it in the search input, press the Search button) | Exactly 1 article card is rendered and its title text = `{articleTitle}` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| `{articleId}` no longer exists | `DELETE /api/articles/{articleId}` (fixture `createdArticle` teardown) | only the article created by this TC |
| `{user}` no longer exists (after the worker's last test) | `DELETE /api/users/{userId}` with its own token (fixture `workerUser` teardown) | only the identity of this worker |

**Risks / notes** — The search matches substrings; the unique suffix guarantees that only
`{articleTitle}` matches, also with parallel workers. GAD can answer `404` to a `DELETE` sent in the
same instant as the `POST`; cleanup runs after the test body, so this does not apply.

**Change log (M2, 2026-11-23)**

- Q1 — metadata table added; requirement written as GAD-ART-SEARCH AC1 (behaviour of the M6 TC, no scope change).
- Q2 — objective states why: backend-only data must be reachable from search.
- Q3 — preconditions table with provisioning and scope; identity made explicit (P1).
- Q4 — data table with generation rules, classes and sources; prefix from `Env`.
- Q5 / Q13 — two numbered steps, one action each.
- Q6 — oracle: exact count (1) and exact title instead of "finds an article".
- Q10 — per-worker identity replaces the shared `users.appUser`.
- Q12 — Automation: Automatable.

**Automation handoff (M4)**

```yaml
tc: TC8
title: Find an article created through the API by searching its exact title
spec: tests/ui/smoke/articles/TC8-search-api-created-article.spec.ts
suite: smoke
tags: ['@smoke', '@mutates-data']
automation: automatable
fixtures:
  identity: workerUser              # spec-data-standard M1 — one identity per worker
  state: createdArticle             # lifecycle-architect R4 — create before use(), delete after
  page: articlesPage
data:
  - { name: user, class: transactional, source: factory }        # buildUser(parallelIndex)
  - { name: articleTitle, class: transactional, source: factory } # buildArticle(parallelIndex)
  - { name: prefix, class: environment, source: env }             # Env.testDataPrefix
captured: [articleTitle]
steps:
  - action: open /articles.html
    oracle: searchInput visible and empty
  - action: search {articleTitle}
    oracle: articleTitles count = 1; articleTitles text = createdArticle.title
postconditions:
  - createdArticle deleted by id (test teardown)
  - workerUser deleted by id with its own token (worker teardown)
```
