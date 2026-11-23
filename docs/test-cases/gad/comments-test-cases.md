# GAD — Comments test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".

### TC9: article page shows a comment created through the API (pre/postconditions via API)

<!-- as-was: M6 — README row + spec header, copied verbatim as the M0 baseline -->

Suite: regression · Feature: comments

Preconditions (API):  `createdArticle` (POST /api/articles) and `createdComment` on it
(POST /api/comments), both authenticated with a token from POST /api/login.
Postconditions (API): DELETE /api/comments/:id, then DELETE /api/articles/:id
(Playwright tears the dependent fixture down first).
`createdComment` is listed before `articlePage` so the comment exists before the page loads.
