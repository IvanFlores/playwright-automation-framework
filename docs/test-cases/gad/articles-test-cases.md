# GAD — Articles test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".
Not migrated yet: TC5, TC6, TC7.

### TC8: search finds an article created through the API (pre/postcondition via API)

<!-- as-was: M6 — README row + spec header, copied verbatim as the M0 baseline -->

Suite: smoke · Feature: articles

Precondition (API):  `createdArticle` — logs in via POST /api/login and creates a uniquely titled
article via POST /api/articles.
Postcondition (API): the same fixture deletes it via DELETE /api/articles/:id after the test.
