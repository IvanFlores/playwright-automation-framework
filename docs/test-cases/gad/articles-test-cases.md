# GAD — Articles test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".

### TC5: List articles starting on the first page

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-ART-LIST · AC1: the articles list opens on page 1, with the default page size and the number of pages that the article total needs |
| Objective | Prove that a visitor sees the first page of the real article list and a correct page count, so every article is reachable |
| Priority | High |
| Suite | smoke |
| Type | positive |
| Tags | `@smoke` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/smoke/articles/TC5-articles-list-pagination.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | At least `{defaultPageSize}` articles exist | Discovery — `GET /api/articles` (GAD seeds 59) | shared read-only |
| P2 | Anonymous visitor (no login) | fixture `articlesPage` (public page) | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| defaultPageSize | `6` | Reference (product default) | verified against GAD 2.9.0 (selected option) |
| firstPage | `1` | Reference | dataset `articlesData.firstPage` |
| articleCount | number of items returned by `GET /api/articles` | Reference | discovery, read in the same step as the check |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Open `/articles.html` | Exactly `{defaultPageSize}` article cards are rendered |
| 2 | Read the pagination control | Current page = `{firstPage}`; total pages = `ceil({articleCount} / {defaultPageSize})` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| No data was created | None needed | test |

**Risks / notes** — Q10: the article total is shared with TC8/TC9, which create and delete
`qa_` articles in parallel (59 → 61 changes the page count from 10 to 11). `{articleCount}` is
therefore read from the API in the same step, and the check **reloads the list and re-reads the
API** until both describe the same total. Re-reading only the API is not enough: the page does not
update by itself (iteration 2 below). A fixed number would be flaky.

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 — minimum article count and anonymous visitor stated as preconditions.
- Q4 — page size, first page and article count declared with class and source.
- Q5 / Q13 — two numbered steps.
- Q6 — "article list renders" → exactly 6 cards; total pages → computed from the API (the spec checked `/^\d+$/`, which accepts any number).
- Q10 — dependency on articles created by parallel TCs made explicit, with the mitigation.

**Change log (M2 iteration 2, 2026-11-25 — after the first automated run)**

- Q10 — the first mitigation re-read only the API. In a full parallel run GAD drew the page with 61
  articles (11 pages) and by the check TC8/TC9 had deleted theirs (59 → 10). The check now reloads the
  list and re-reads the API on every retry.

**Automation handoff (M4)**

```yaml
tc: TC5
title: List articles starting on the first page
spec: tests/ui/smoke/articles/TC5-articles-list-pagination.spec.ts
suite: smoke
tags: ['@smoke', '@read-only']
automation: automatable
fixtures:
  page: articlesPage
  discovery: articleController     # GET /api/articles (read-only)
data:
  - { name: defaultPageSize, class: reference, source: dataset }   # to add: articlesData.defaultPageSize = 6
  - { name: articleCount, class: reference, source: discovery }
steps:
  - action: open /articles.html
    oracle: articleTitles count = defaultPageSize
  - action: read pagination
    oracle: currentPage = "1"; totalPages = ceil(articleCount / defaultPageSize); reload list + re-read API until equal
postconditions:
  - none
```

### TC6: Show "No data" when the search matches no article

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-ART-SEARCH · AC2: a search with no match replaces the list with a "No data" message |
| Objective | Prove that an empty search result is shown as an explicit message, not as an empty or stale list |
| Priority | Medium |
| Suite | regression |
| Type | negative |
| Tags | `@regression` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/regression/articles/TC6-search-no-results.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | No article contains `{searchTerm}` | Discovery — `GET /api/articles?q={searchTerm}` returns `[]` | shared read-only |
| P2 | Anonymous visitor on `/articles.html` with the list loaded | fixture `articlesPage` | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| searchTerm | `zzqx-no-matching-article` | Reference | dataset `articlesData.noMatchSearchTerm` |
| noResultsText | `No data` | Reference (product text) | dataset `articlesData.noResultsMessage` |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Search `{searchTerm}` | Message text = `{noResultsText}`; 0 article cards; pagination shows current page `0` and total pages `0` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| No data was created | None needed | test |

**Risks / notes** — Generated test data starts with `qa_` and never contains `{searchTerm}`, so
parallel TCs cannot break P1.

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 / Q8 — "no match" made a verifiable precondition through the API search.
- Q4 — search term and message declared with their dataset source.
- Q5 / Q13 — one numbered step.
- Q6 — added the exact card count and the pagination values GAD shows (`0` / `0`).

**Automation handoff (M4)**

```yaml
tc: TC6
title: Show "No data" when the search matches no article
spec: tests/ui/regression/articles/TC6-search-no-results.spec.ts
suite: regression
tags: ['@regression', '@read-only']
automation: automatable
fixtures:
  page: articlesPage
  discovery: articleController     # GET /api/articles?q= (read-only)
data:
  - { name: searchTerm, class: reference, source: dataset }
  - { name: noResultsText, class: reference, source: dataset }
steps:
  - action: search searchTerm
    oracle: noResultsMessage = "No data"; articleTitles count = 0; currentPage = "0"; totalPages = "0"
postconditions:
  - none
```

### TC7: Limit the list to the selected number of items per page

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-ART-LIST · AC2: choosing a page size in "Items/Page" shows that many articles and recalculates the page count |
| Objective | Prove that the page-size control changes both the list and the pagination, so users can browse in smaller pages |
| Priority | Medium |
| Suite | regression |
| Type | positive |
| Tags | `@regression` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/regression/articles/TC7-articles-items-per-page.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | At least `{pageSize}` articles exist | Discovery — `GET /api/articles` | shared read-only |
| P2 | Anonymous visitor on `/articles.html` with the default page size | fixture `articlesPage` | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| pageSize | `3` (smallest of the options 3, 6, 9, 12, 24) | Reference | dataset `articlesData.smallPageSize` |
| firstPage | `1` | Reference | dataset `articlesData.firstPage` |
| articleCount | number of items returned by `GET /api/articles` | Reference | discovery, read in the same step as the check |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Select `{pageSize}` in "Items/Page" | Exactly `{pageSize}` article cards; current page = `{firstPage}`; total pages = `ceil({articleCount} / {pageSize})` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| No data was created; the page size is not persisted | None needed | test |

**Risks / notes** — Same Q10 risk and mitigation as TC5 for the total page count. After the reload
the page size goes back to 6, so the retry selects `{pageSize}` again before comparing.

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 / Q8 — minimum article count made a verifiable precondition (the spec silently relied on seeded data).
- Q4 — page size, first page and article count declared with class and source.
- Q5 / Q13 — one numbered step.
- Q6 — "limits the list size" → exact card count, current page and recalculated total pages.
- Q10 — shared article total made explicit (see TC5).

**Automation handoff (M4)**

```yaml
tc: TC7
title: Limit the list to the selected number of items per page
spec: tests/ui/regression/articles/TC7-articles-items-per-page.spec.ts
suite: regression
tags: ['@regression', '@read-only']
automation: automatable
fixtures:
  page: articlesPage
  discovery: articleController
data:
  - { name: pageSize, class: reference, source: dataset }
  - { name: articleCount, class: reference, source: discovery }
steps:
  - action: setItemsPerPage(pageSize)
    oracle: articleTitles count = pageSize; currentPage = "1"; totalPages = ceil(articleCount / pageSize); reload + reselect + re-read API until equal
postconditions:
  - none
```

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
| user | email `{prefix}user-{suffix}@example.test`, firstname `{prefix}w{parallelIndex}{random5}` (unique), lastname `worker`, random password | Transactional | factory `buildUser(parallelIndex)` |
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
