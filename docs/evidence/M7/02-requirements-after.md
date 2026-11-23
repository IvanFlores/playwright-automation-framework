# M7 — `spec-requirements-standard` M2 → M4 → M0 — AFTER

- Date: 2026-11-23 · Agent: Claude Code (Opus 5.5)
- Invocations (same skill session as `01-requirements-before.md`):
  1. `refine test case TC8` and `refine test case TC9` (M2)
  2. `automation readiness TC8, TC9` (M4)
  3. `assess test cases` (M0 re-run)
- Values used as oracles were verified against the running GAD before writing them (M2 step 2):
  `data-testid` `article-title`, `article-body`, `user-name`, search input/button, and the comment
  card template (`label "comment:"` + `span`, author link `gotoUser{commentId}-{userId}`).

## M2 output

```
[spec-requirements-standard] REFINED — TC8
Score: 32% → 100%   Grade: Incomplete → Ready
Changes: Q1 metadata · Q2 objective · Q3 provisioning + scope · Q4 data table · Q5/Q13 numbered steps · Q6 exact oracle (count 1 + title) · Q10 per-worker identity · Q12 automatable
Open questions: none

[spec-requirements-standard] REFINED — TC9
Score: 23% → 100%   Grade: Incomplete → Ready
Changes: Q1 metadata · Q2 objective · Q3 provisioning + scope + token owner · Q4 data table · Q5/Q13 numbered steps · Q6 exact oracles (title, body, author, comment) · Q8 comment id + unique body · Q10 per-worker identity · Q12 automatable
Open questions: none
```

Scope kept: both TCs verify the same behaviour as in M6. Two oracles were **added** (TC9 author
name of the article and of the comment). They are only possible because the identity is now owned by
the test (P1) — with the shared account the expected author was whatever `.env` contained.

## M4 output

Handoff blocks appended under each TC:
[`articles-test-cases.md`](../../test-cases/gad/articles-test-cases.md) ·
[`comments-test-cases.md`](../../test-cases/gad/comments-test-cases.md).

| Handoff item | Consumer |
|---|---|
| `fixtures.identity: workerUser` (new) | `spec-data-standard` M1 (R1, R15) → `lifecycle-architect` Add (users resource) |
| `data[*].source: factory` with prefix | `spec-data-standard` R2, R3 |
| `tags: [..., '@mutates-data']` | `spec-data-standard` R11 |
| Exact oracles (title, count, author, comment text) | `spec-data-standard` M4 / R13 |

## M0 re-run

```
[spec-requirements-standard] ASSESSMENT
─────────────────────────────────────────
File: docs/test-cases/gad/articles-test-cases.md
TC8   100%  Ready   top gaps: none
File: docs/test-cases/gad/comments-test-cases.md
TC9   100%  Ready   top gaps: none
Not migrated: TC1–TC7
Average: 100%   Ready: 2/2
Most frequent gaps: none
Recommended next mode: M4 done → hand off to spec-data-standard (automation-architect Mode 6, phase 2)
```

| | TC8 | TC9 |
|---|---|---|
| Before | 32 % Incomplete | 23 % Incomplete |
| After | 100 % Ready | 100 % Ready |

## Spec cross-check notes (not scored)

The handoff now differs from the code (no `workerUser`, no `@mutates-data`, TC9 asserts with
`toContainText`, no author oracle). That gap is the input of `spec-data-standard`
(`03-data-before.md`).
