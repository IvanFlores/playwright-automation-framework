---
name: spec-data-standard
description: 'Enforce and auto-apply test data robustness standards for Playwright + TypeScript projects. Classifies test data, assesses data maturity (levels 0-4), and enforces parallel isolation, typed data sourcing and data-driven datasets, environment portability, and deterministic expected values. Includes a verification mode that runs the suite in parallel and per environment to produce evidence. Modes: M0 Maturity Assessment (default, read-only), M1 Parallel Isolation, M2 Data Sourcing, M3 Environment Portability, M4 Deterministic Values, M5 Robustness Verification. Triggers: "assess test data", "data maturity", "spec data", "data robustness", "parallel safe", "isolate data", "fix parallel failures", "data driven", "externalise data", "load test data", "multi environment", "run on staging", "env config", "assert values", "deterministic data", "mock data", "verify robustness", "stress parallel", "run data verification", "spec data m1".."spec data m5". Load when writing tests that create or read data, enabling parallel execution, adding an environment, diagnosing failures that only appear in parallel or in one environment, or through automation-architect Mode 6.'
---

# spec-data-standard

Owns **test data robustness**: how test data is classified, sourced, isolated, made portable across
environments, and used as the source of expected values.

**Objective — the hermetic test:** a test that depends on nothing it does not control. Not on other
tests, not on execution order, not on the environment, and not on data that "should be there".

| Skill | Domain |
|---|---|
| `pom-architect` | Page Object layer structure |
| `test-standards` | Spec code quality: imports, fixtures, credentials |
| `spec-standards` | Spec organisation: folders, naming, TC IDs, steps |
| `lifecycle-architect` | API layer · setup/teardown infrastructure · mocks |
| `spec-requirements-standard` | TC specification (phase 1) — its M4 handoff is this skill's input |
| `git-standards` | Git workflow conventions |
| **`spec-data-standard`** | **Test data: classification · isolation · sourcing · environments · expected values** |

**Gap this skill fills:** `lifecycle-architect` guarantees that setup and teardown **exist**. Nothing
guaranteed that the data is **isolated** between parallel workers, **portable** between
environments, or **known** well enough to assert exact values.

---

## Project Context

- **Hermetic test**: parallel safety and environment portability are consequences of hermeticity.
- Playwright runs each worker in a **separate process**; module-level variables are not shared. Use
  `workerInfo.parallelIndex` / `testInfo.parallelIndex` (stable, `0..workers-1`) for partitioning,
  never `workerIndex` (increments when a worker restarts).
- Fixtures support `{ scope: 'worker' }`. A worker fixture cannot use the test-scoped `request`; it
  creates its own context with `playwright.request.newContext({ baseURL: Env.baseUrl })`.
- Specs never read `process.env`; they use `Env` from `@config/Env`.
- Credentials stay owned by `test-standards` rule 7. This skill governs **which identity** a test uses
  (shared / per worker / per test), not where the secret is stored.

### Resolved project conventions

| Placeholder | Value |
|---|---|
| `<data-dir>` | `src/data` (flat, single site) |
| `<config-module>` | `src/config/Env.ts` → `Env` |
| `<fixtures-module>` | `src/fixtures/index.ts` |
| `<api-layer>` | `src/api` (`client/` · `endpoints/` · `models/` · `controllers/`) |
| `<runner-config>` | `playwright.config.ts` |
| `<tc-docs-dir>` | `docs/test-cases/gad` |
| Sites | **GAD** (`chromium` / `firefox` / `webkit`, `BASE_URL`) · **JSONPlaceholder** (`api`, `API_BASE_URL`) |

Print these values in the M0 header.

### GAD facts (verified against GAD 2.9.0)

- `POST /api/users` is public (`201`, returns `id`; `avatar` required). `DELETE /api/users/:id`
  needs the user's own bearer token.
- Deleting a user does **not** delete their articles/comments, and user ids are reused → delete the
  identity **after** everything it created (worker teardown runs after test teardown).
- A `DELETE` sent in the same instant as the matching `POST` can return `404`; cleanup after a test
  body is safe.
- A new login returns a new token and older tokens stay valid. R15 still applies (portability).

### Data classification (classify before applying rules)

| Class | Example | Mutable? | Strategy |
|---|---|---|---|
| Reference | Seeded articles, page sizes | No | Share; discover via API |
| Environment | Base URL, feature flags | Per environment | `Env`, validated |
| Transactional | New user, article, comment | Yes | Create per test or worker; isolate; clean |
| Secret | Passwords, tokens | Per environment | Outside the repo (`.env`, CI) |
| Simulated | Mocked API responses | Controlled by the test | `mock<Resource>` fixture |

Most robustness bugs come from treating **Transactional** data as **Reference** data.

Lifecycle: DEFINE (typed shape) → PROVISION (create · discover · mock) → USE (test · worker scope) →
CLEAN (scoped teardown).

### Maturity levels

| Level | State | Exit criteria (to reach the next level) |
|---|---|---|
| 0 — Hardcoded | Data inside the spec | All inputs and expected values moved to `src/data/` |
| 1 — Externalised | `src/data/` + datasets | Config per environment, validated, secrets outside the repo |
| 2 — Per environment | `TEST_ENV` config | No shared mutable identity; unique, prefixed generated data |
| 3 — Isolated | Per-worker / per-test data | Data self-provisioned via API; env literals replaced by discovery |
| 4 — Self-provisioned | Hermetic | Maintain: run M5 on every new TC |

A level can be scored **per scope** (whole site, or the TCs in scope) — say which.

---

## Modes

**M0 is the default.** "check / review only / don't fix" → report-only in every mode.

### M0 — Maturity Assessment (read-only)

Triggers: "assess test data" · "data maturity" · "spec data" · "data robustness"

1. Discover `src/data/**`, `src/config/**`, `src/fixtures/**`, `playwright.config.ts`,
   `tests/**/*.spec.ts`.
2. Inventory every data item a test consumes and classify it.
3. Detect shared mutable identities (fixtures that create or mutate data with an identity loaded from
   one static source).
4. Score the maturity level per site (highest level whose exit criteria are fully met).
5. Run R1–R15 detection and print one block per violation.
6. List blockers for the next level, each mapped to mode and rule. Do NOT modify files.

```
[spec-data-standard] MATURITY ASSESSMENT
─────────────────────────────────────────
Resolved: data=src/data · config=src/config/Env.ts · fixtures=src/fixtures/index.ts · api=src/api
Site: <site>            Level: <0-4> — <name>
  Data inventory:  <N> reference · <N> environment · <N> transactional · <N> secret · <N> simulated
  Blockers to level <N+1>:
    - <issue> → M<n> / R<n>
Recommended next mode: M<n>
```

### M1 — Parallel Isolation

Triggers: "parallel safe" · "isolate data" · "fix parallel failures" · "spec data m1"

1. Run R1–R5, R12, R15. 2. Choose the isolation strategy per shared mutable identity. 3. If
provisioning needs missing controller methods, invoke `lifecycle-architect` **Add** for that
resource. 4. Auto-fix AUTO-FIX violations, list MANUAL-FIX items.

| Situation | Strategy | Fixture pattern |
|---|---|---|
| Test creates or mutates data; API available | Create per test + scoped teardown | `created<Resource>` |
| Identity whose data the tests mutate | One identity per worker | `worker<Resource>` (`scope: 'worker'`) |
| Identities cannot be created (fixed accounts) | Account pool indexed by `parallelIndex` | `worker<Resource>` from pool |
| Read-only reference data | Share it | `<resource>Controller` |
| UI behaviour independent of backend state | Mock | `mock<Resource>` |
| Truly global state, unavoidable | Serialise, with justification | `mode: 'serial'` + comment |

```typescript
workerUser: [async ({ playwright }, use, workerInfo) => {
  const request = await playwright.request.newContext({ baseURL: Env.baseUrl });
  const client = new ApiClient(request);
  const users = new UserController(client);
  const user = buildUser(workerInfo.parallelIndex);         // unique, prefixed
  const created = await users.create(user);
  try {                                    // the user exists now: always delete it (GAD: own token only)
    client.setAuthToken(await new AuthController(client).login(credentialsOf(user)));
    await use({ ...created, password: user.password, token: /* the one token of this identity */ });
  } finally {
    client.setAuthToken(await new AuthController(client).login(credentialsOf(user)));
    await users.delete(created.id);                          // scoped teardown, own token
    await request.dispose();
  }
}, { scope: 'worker' }],
```

### M2 — Data Sourcing & Data-Driven

Triggers: "data driven" · "externalise data" · "load test data" · "spec data m2"

| Need | Source | Location |
|---|---|---|
| Small, typed datasets | TypeScript module | `src/data/{feature}.data.ts` |
| Large / business-maintained | JSON / CSV + typed loader | `src/data/{feature}.json` + loader |
| Unique values per run | Factory / builder | `src/data/{feature}.data.ts` (`build<Resource>()`) |
| Values that differ per environment | Environment data map | `src/data/env.data.ts` (M3) |

Run R6–R8: move inline datasets and expected values out of specs, wrap JSON/CSV in typed loaders,
convert copy-paste tests into `for (const row of rows)` loops with `${row.id}` in the title. Rows that
need a different flow are a different TC, not a different row.

### M3 — Environment Portability

Triggers: "multi environment" · "run on staging" · "env config" · "spec data m3"

Run R9–R12. Ensure `Env` selects `.env.<TEST_ENV>` (default `local`) and validates required
variables; replace environment literals by discovery or `src/data/env.data.ts`; tag tests by data
impact; guard destructive cleanup; `.env.*` git-ignored and documented in `.env.example`.

| Tag | Meaning | Typical use |
|---|---|---|
| `@mutates-data` | Creates, updates or deletes persistent data | Excluded from production-like runs |
| `@read-only` | Reads only; safe in any environment | Smoke in every environment |
| `@env:<name>` | Valid only in that environment | Env-only data / flags |

`TEST_ENV=staging npx playwright test --grep-invert @mutates-data`

**Environment Readiness Map** — always produced by M3; with fewer than two environments it replaces
the per-environment run as M3/M5 evidence. Status: ✅ done · 🔧 would change (file) · ➖ n/a.

| # | Reinforcement point | Where | Problem if missing | Rule |
|---|---|---|---|---|
| E1 | Environment selector + per-env files | `src/config/Env.ts` | One hardcoded target | R9 |
| E2 | Fail-fast validation of required variables | `src/config/Env.ts` | Late, cryptic failures | R9 |
| E3 | Base URL from config; relative paths | `playwright.config.ts`, specs, TC docs | Tied to one host | R10 · Q11 |
| E4 | Secrets per environment outside the repo | `.env.*`, CI secrets | Leaks; manual setup | — |
| E5 | Self-provisioned identities | fixtures, `src/api` | Seed users must exist everywhere | R1 · R10 |
| E6 | Reference data discovered at runtime | fixtures, specs | IDs differ per env | R10 |
| E7 | Oracles from controlled sources | specs, TC docs | Expected values differ per env | R13 · Q6 |
| E8 | Cleanup scoped and guarded | fixtures | Destructive cleanup in shared envs | R12 |
| E9 | Data-impact tags | specs | Mutating tests run where they must not | R11 |
| E10 | CI matrix: one job per env | `.github/workflows/` | Portability never exercised | — |

```
[spec-data-standard] ENVIRONMENT READINESS — <site>
Environments available: <n> (<names>)   Mode: run | readiness map
E1 ✅|🔧|➖ <evidence or file to change>
Ready: <n>/10   Next: <first 🔧 item>
```

### M4 — Deterministic Data & Value Assertions

Triggers: "assert values" · "deterministic data" · "mock data" · "spec data m4"

Presence is not correctness: `toBeVisible()` on a list passes when every value is wrong. Run
R13–R14. Expected-value sources, in order of preference:

| Source | When | Assertion |
|---|---|---|
| Data the test created (`created<Resource>`, `worker<Resource>`) | Transactional | `toHaveText(created.field)` per field |
| Mock payload (`mock<Resource>`) | Rendering, formatting, edge cases | Every rendered field vs. payload |
| Dataset row (M2) | Data-driven | `toHaveText(row.expected)` |
| API discovery (`<resource>Controller`) | Reference data owned by the system | UI value vs. API value |

A wait step (`first()` visible before acting) is not an oracle and is not flagged.

### M5 — Robustness Verification (evidence)

Triggers: "verify robustness" · "stress parallel" · "run data verification" · "spec data m5"

Executes tests and produces evidence; never modifies code.

1. Scope (TC, feature or site) and one browser project.
2. Parallel stress run:
   `npx playwright test <scope> --project=chromium --workers=4 --repeat-each=4 --retries=0`
3. Environment run per `TEST_ENV` (≥ 2). With fewer, attach the M3 Readiness Map and say so.
4. Orphan check: `npm run data:orphans` (records starting with `Env.testDataPrefix`). Expected 0.
5. Classify failures: collision · session invalidation · missing data · order dependency ·
   non-data flakiness (timing/selector → `pom-architect` / `test-standards`).
6. Compare with the previous run (before/after).

The verdict is ❌ when any R1, R2 or R15 finding is open, **even if every run passes**: those
collisions are latent (they appear with a new cleanup, more workers, or a single-session backend).

```
[spec-data-standard] ROBUSTNESS VERIFICATION
─────────────────────────────────────────
Scope:     <scope>   Project: <browser>
Parallel:  workers=<N> repeat=<K> → <passed>/<total> passed · <flaky> flaky
Env <a>:   <passed>/<total> passed   (or: readiness map attached — 1 environment)
Orphans:   <N> records with prefix '<prefix>'
Failures by cause: collision <n> · session <n> · missing-data <n> · order <n> · other <n>
Verdict:   ✅ HERMETIC  |  ❌ NOT HERMETIC → run M<n> for <rule>
```

---

## Rules

| ID | Rule | Sev. / fix | Mode | Condition (violation) | Fix |
|---|---|---|---|---|---|
| R1 | NO_SHARED_MUTABLE_IDENTITY | ERROR · MANUAL | M1 | A test-scoped fixture creates, mutates or deletes data owned by an identity loaded from one static source (`users.appUser`, one env var) while more than one worker runs | M1 table: `worker<Resource>` or per-test identity |
| R2 | UNIQUE_CREATED_DATA | ERROR · AUTO | M1 | Created data uses a static literal for a unique field, or a suffix without `parallelIndex` (`Date.now()` alone is not unique across workers) | Factory value: prefix + `parallelIndex` + timestamp + random |
| R3 | TEST_DATA_PREFIXED | WARNING · AUTO | M1 | Generated transactional data does not start with `Env.testDataPrefix` (default `qa_`) | Prefix it — makes orphans detectable (M5) |
| R4 | PARALLELISM_NOT_SUPPRESSED | WARNING · MANUAL | M1 | `workers: 1` (also conditional), `fullyParallel: false` or `mode: 'serial'` without `// spec-data: serial — <reason>` | Remove the suppression or justify it |
| R5 | NO_GLOBAL_STATE_ASSERTION | WARNING · MANUAL | M1 | Count / full-collection assertion on data the test does not own | Assert the test's own records, or own the collection |
| R6 | TYPED_DATA_SOURCE | ERROR · AUTO | M2 | JSON/CSV parsed in a spec, or loaded without an interface and required-field validation | Typed loader in `src/data/{feature}.data.ts` |
| R7 | DATA_OUTSIDE_SPEC | ERROR · AUTO | M2 | Inline datasets or literal expected values in a spec (UI labels and credentials excluded) | Move to `src/data/{feature}.data.ts`, import via `@data/*` |
| R8 | DATA_DRIVEN_TITLES_UNIQUE | ERROR · AUTO | M2 | Loop titles without a row id, or tests that differ only in literal data | `${row.id}` in title; merge into dataset + loop |
| R9 | ENV_RESOLVED_FROM_CONFIG | ERROR · AUTO | M3 | `process.env` read outside `src/config/` (incl. `playwright.config.ts`), no `TEST_ENV` selector, or a variable used by tests not validated | Route through `Env`; selector; `.env.example` |
| R10 | NO_ENV_SPECIFIC_LITERALS | ERROR · MANUAL | M3 | Absolute host, record id, UUID or seeded username assumed to exist, in a spec, fixture or data file | Discovery via `<resource>Controller`, else `src/data/env.data.ts` |
| R11 | DATA_IMPACT_TAGGED | WARNING · AUTO | M3 | Test uses `created<Resource>` / `clean<Resource>` / `worker<Resource>` or a persistence action without `@mutates-data`; env-only test without `@env:<name>` | Add via `{ tag: [...] }` |
| R12 | SCOPED_AND_GUARDED_CLEANUP | ERROR · MANUAL | M1·M3 | Teardown bulk-deletes data the test/worker does not exclusively own, or bulk-deletes without an environment guard | Delete only ids created by this fixture |
| R13 | EXPECTED_VALUE_FROM_CONTROLLED_SOURCE | WARNING · MANUAL | M4 | Data-bearing assertion that is presence-only, partial (`toContainText` on a container when the field is addressable), or compares with a literal of unknown source | Exact value from the M4 source table, on the field's own locator |
| R14 | MOCK_FOR_UNOWNED_CONTENT | WARNING · MANUAL | M4 | Rendering/edge-case checks on content the test does not own and cannot predict | `mock<Resource>` with payload from `src/data/`; keep one live test per feature |
| R15 | SINGLE_SESSION_PER_IDENTITY | ERROR · MANUAL | M1 | Within one test, more than one fixture logs in / creates a token for the same identity | One fixture owns the token; others reuse it |

Examples (one per family):

```typescript
// R2/R3 — factory
export const uniqueSuffix = (i: number) =>
  `${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const buildArticle = (i: number) => ({ title: `${Env.testDataPrefix}article ${uniqueSuffix(i)}`, ... });

// R13 — exact value on the field, from the created fixture
await expect(articlePage.commentBody(createdComment.id)).toHaveText(createdComment.body);
```

---

## Violation Output Format

```
[spec-data-standard] SEVERITY — RULE_NAME (R<n>, M<n>)
File:  <relative path from project root>
Line:  <line number>
Issue: <one sentence describing the problem>
Fix:   <one sentence describing the fix> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

Summary after the blocks:

```
[spec-data-standard] REVIEW COMPLETE
Violations: <n> (<e> ERROR · <w> WARNING) — auto-applied <a> · manual <m> · pending <p>
[spec-data-standard] ✅ Nothing pending.   |   ⚠️ <p> pending.
```

---

## Scan Scope

| File glob | Rules |
|---|---|
| `src/fixtures/**/*.ts` | R1, R2, R3, R12, R15 |
| `src/data/**` | R2, R3, R6, R10 |
| `src/config/**/*.ts` | R9 |
| `playwright.config.ts` | R4, R9 |
| `tests/**/*.spec.ts` | R4, R5, R6, R7, R8, R9, R10, R11, R13, R14 |
| `.github/workflows/*.yml` | E10 only (readiness map) |
