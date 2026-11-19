# M6 — Prompt iteration: what had to change to get the expected result, and why

The adaptation table in [`notes.md`](notes.md) lists every difference between the Kiro prompt and
the Claude Code skill. This file covers the iterations: places where the prompt *as written* would
not have produced the expected result, what was observed, and the change.

## 1. No mode to review existing code

- **Observed:** The prompt defines only **New** and **Add** (scaffold). Its rules run only inside
  Add Step 7 or through the hub's Mode 1. The homework step "trigger the skill against your existing
  code" had no direct entry point — asking for a review would have started a scaffold and asked for
  `resourceName` / `baseUrl`.
- **Change:** Added **Review** as the default mode, with report-only when the user says
  "check / review only / don't fix", a fixed auto-fix order (R6 → R1 → R11 → R3 → R2/R5 → R7 → R8),
  a `tsc` step and one re-scan.
- **Result:** `/lifecycle-architect lifecycle review — report-only …` produced the BEFORE report
  with no file changes.

## 2. The prompt's examples contradict its own rules

- **Observed:** The canonical `ApiClient.get()` has no status check (violates R11). Step 4 names
  controllers `<resource>.controller.ts`, the example is `BookController.ts`. The scan scope table
  repeats three rows, and the registry says "R1–R8" while R10/R11 exist and R9 is missing.
- **Why it matters:** An agent copies examples literally; a scaffold run would have generated a
  non-compliant client and the next Review run would have flagged the skill's own output.
- **Change:** Examples rewritten to satisfy every rule (one `ensureOk()`), one naming convention
  (`<Resource>Controller.ts`), de-duplicated scope table, "R1–R8, R10, R11 — R9 reserved".

## 3. R11 did not catch the real problem in this repo

- **Observed:** The existing `ApiClient` *did* call `response.ok()` — but inside `expect()`. Under
  the prompt's wording ("does not call `response.ok()` and throw") that passes, so the first
  detection pass would have reported R11 clean.
- **Why it matters:** `expect()` in `src/` breaks `pom-architect` rule 6, and when a precondition
  fails (e.g. GAD's `422` for a bad `date`) the error shows as a failed assertion without the
  response body.
- **Change:** R11 now explicitly flags status checks done with `expect()`. Found 2 violations.

## 4. ✅ printed for a non-compliant codebase in report-only

- **Observed:** The prompt's summary (and the hub's Mode 1 template it copies) prints `✅` "only
  when Remaining manual fixes is none". In report-only all 10 violations were auto-fixable, so the
  manual list was empty and that wording would close with ✅ while 10 violations remained.
- **Change:** The skill's summary says ✅ only "when nothing is pending"; in report-only, any
  violation → ⚠️. (The hub already had a separate report-only note; the sub-skill now states it
  itself.)

## 5. The API spec could not be fixed without an exception

- **Observed:** The prompt says specs "must not perform create/delete operations directly". The
  existing `tests/api/posts.spec.ts` tests `POST /posts` itself — moving the create into a fixture
  would leave nothing to test.
- **Change:** Project context exception: in `tests/api/**` the spec may call an injected
  controller's operation (never instantiate it). R7 auto-fix for API specs = inject
  `<resource>Controller`.

## 6. GAD-specific facts the prompt could not know

- **Observed (probing the API before writing fixtures):**
  - `POST /api/articles` with `new Date().toISOString()` → `422 "date" has date in future` (the
    server compares against its local clock).
  - Same with a local-time string without `Z` → `422 "date" has invalid format`.
  - Seeded data uses `2021-07-13T16:35:00Z` → no milliseconds, `Z` suffix.
- **Change:** Project context documents the format and "not in the future"; Mode New Step 6 makes
  the data factory responsible (`gadPastDate()` = 24 h ago, `YYYY-MM-DDTHH:mm:ssZ`).
- **Result:** creates return `201`; TC8/TC9 pass 30/30 across three browsers.

## 7. Fixture conflict with `test-standards` rule 4

- **Observed:** The first `ArticlePage` design had an `open(id)` action and a fixture that did not
  navigate. `test-standards` rule 4 flags a page fixture that does not navigate.
- **Change:** `articlePage` depends on `createdArticle` and navigates to `/article.html?id=<id>`.
  In TC9 `createdComment` is declared before `articlePage` so Playwright sets the comment up before
  the page loads (Playwright resolves test parameters in order). Documented in the spec header.

## 8. Moving `ApiClient` breaks files outside the scan scope

- **Observed:** `features/support/world.ts` (Cucumber) imports `ApiClient`; the prompt's R6 fix
  only says "update all imports" without a scope.
- **Change:** R6 fix explicitly covers `src/`, `tests/` and `features/`; scan scope lists
  `features/**/*.ts` for imports only.
- **Result:** `cucumber-js --profile api` still passes (2 scenarios, 5 steps).

## Not changed (deliberately)

- **R10 token refresh** kept as a manual WARNING. GAD's behaviour with a UI login was not
  verified, and TC8/TC9 do not log in through the UI, so the rule does not apply to them.
- **Mocks (R5)** kept although unused — the M6 tests run against the real API.
