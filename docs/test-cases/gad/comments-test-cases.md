# GAD — Comments test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".

### TC9: Show a comment created through the API on its article page

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-COM-VIEW · AC1: the article page lists every comment of the article with its author and text |
| Objective | Prove that the article page renders backend comment data exactly (text and author), not just that a comment block exists |
| Priority | Medium |
| Suite | regression |
| Type | positive |
| Tags | `@regression` · `@mutates-data` |
| Automation | Automatable |
| Spec | `tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | A GAD user `{user}` exists that no other worker uses, with a valid API token | API — `POST /api/users`, `POST /api/login` (fixture `workerUser`) | worker |
| P2 | An article `{articleId}` owned by `{user}` exists with `{articleTitle}` / `{articleBody}` | API — `POST /api/articles` with `{user}`'s token (fixture `createdArticle`) | test |
| P3 | A comment `{commentId}` by `{user}` on `{articleId}` exists with `{commentBody}` | API — `POST /api/comments` with the same token (fixture `createdComment`) | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| user | as TC8 (`buildUser(parallelIndex)`); full name `{userFullName}` = `{firstname} {lastname}` | Transactional | factory |
| articleTitle / articleBody | `{prefix}article {suffix}` / `{prefix}body {suffix}` | Transactional | factory `buildArticle(parallelIndex)` |
| commentBody | `{prefix}comment {suffix}` | Transactional | factory `buildComment(articleId, parallelIndex)` |
| prefix | `qa_` | Environment | `Env.testDataPrefix` |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Open `/article.html?id={articleId}` | Title text = `{articleTitle}`; body text = `{articleBody}`; author text = `{userFullName}` |
| 2 | Read the comment card of `{commentId}` | Comment text = `{commentBody}`; comment author text = `{userFullName}` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| `{commentId}` no longer exists | `DELETE /api/comments/{commentId}` (fixture `createdComment`, torn down first) | only the comment created by this TC |
| `{articleId}` no longer exists | `DELETE /api/articles/{articleId}` (fixture `createdArticle`) | only the article created by this TC |
| `{user}` no longer exists (after the worker's last test) | `DELETE /api/users/{userId}` (fixture `workerUser`) | only the identity of this worker |

**Risks / notes** — `createdComment` must be set up before the page is opened (the page renders
comments on load). Deleting a user does not cascade in GAD, so the user is deleted last.

**Change log (M2, 2026-11-23)**

- Q1 / Q2 / Q12 — metadata table, objective and automation decision added.
- Q3 — preconditions table; the token owner is now the worker identity (P1), shared by P2 and P3.
- Q4 — every value declared with rule, class and source.
- Q5 / Q13 — two numbered steps; the fixture-order sentence moved to Risks / notes.
- Q6 — exact oracles for title, body, author and comment text ("shows a comment" was presence only).
- Q8 — the comment is identified by `{commentId}` and a unique `{commentBody}`.
- Q10 — per-worker identity replaces the shared account.

**Automation handoff (M4)**

```yaml
tc: TC9
title: Show a comment created through the API on its article page
spec: tests/ui/regression/comments/TC9-article-shows-api-created-comment.spec.ts
suite: regression
tags: ['@regression', '@mutates-data']
automation: automatable
fixtures:
  identity: workerUser              # spec-data-standard M1
  state: [createdArticle, createdComment]   # comment torn down before article
  page: articlePage                 # declared after createdComment
data:
  - { name: user, class: transactional, source: factory }
  - { name: articleTitle, class: transactional, source: factory }
  - { name: articleBody, class: transactional, source: factory }
  - { name: commentBody, class: transactional, source: factory }
captured: [articleTitle, articleBody, commentBody, userFullName]
steps:
  - action: open /article.html?id={articleId}
    oracle: title = createdArticle.title; body = createdArticle.body; author = workerUser full name
  - action: read comment card {commentId}
    oracle: comment text = createdComment.body; comment author = workerUser full name
postconditions:
  - createdComment, then createdArticle deleted by id (test teardown)
  - workerUser deleted by id with its own token (worker teardown)
```
