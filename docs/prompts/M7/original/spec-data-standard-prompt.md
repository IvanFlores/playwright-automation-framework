# Meta-prompt: Create new skill spec-data-standard

Use this prompt with the AI agent to create a new skill:
- Claude: `.claude/skills/spec-data-standard/SKILL.md`
- Kiro: `.kiro/skills/spec-data-standard/SKILL.md`

The skill is **project-agnostic**: rules and examples use generic resources (`<resource>`,
`user`, `order`). Site-specific values are resolved from the project's own `src/data/` and
`src/config/` at runtime, never written into the skill.

**Decision record:** `docs/decisions/ADR-002-spec-data-standard.md`. Do not register the skill
before that ADR exists (Hub Growth Policy Rule 2).

**Orchestration:** this skill does NOT get its own hub mode. It is the **Data** phase (M1–M4)
and the **Verify** phase (M5) of the TC lifecycle orchestrated by
`spec-quality-lifecycle-standard`. Hub Mode 7 routes to that orchestrator.

This is a NEW skill. Do NOT move rules out of existing skills. After creating it, apply the
**Hub updates** and **Reinforcements** sections at the end of this prompt.

**Size budget:** the generated `SKILL.md` must stay under 400 lines. Keep rule text short and use
one example per rule.

---

## Skill overview

`spec-data-standard` owns **test data robustness**: how test data is classified, sourced,
isolated, made portable across environments, and used as the source of expected values.

**Objective — the hermetic test:** a test that depends on nothing it does not control. Not on
other tests, not on execution order, not on the environment, and not on data that "should be there".

| Skill | Domain |
|-------|--------|
| `ui-pom-standard` | Page Object layer structure |
| `spec-code-standard` | Spec code quality: imports, fixtures, credentials |
| `spec-organisation-standard` | Spec organisation: folders, naming, TC IDs, steps, tag syntax |
| `api-setup-teardown-standard` | API layer · setup/teardown infrastructure · mocks |
| `spec-quality-lifecycle-standard` | TC body quality: preconditions, assertions, waits |
| `git-workflow-docs-standard` | Git workflow conventions |
| **`spec-data-standard`** | **Test data: classification · isolation · sourcing · environments · expected values** |

**Gap this skill fills:** Existing skills guarantee that setup and teardown **exist**. None
guarantees that the data is **isolated** between parallel workers, **portable** between
environments, or **known** well enough to assert exact values.

---

## Prompt

Create the skill `SKILL.md` with the following content.

---

### Frontmatter

```yaml
---
name: spec-data-standard
description: >
  Enforce and auto-apply test data robustness standards for Playwright + TypeScript
  projects. Classifies test data, assesses data maturity (levels 0-4), and enforces
  parallel isolation, typed data sourcing and data-driven datasets, environment
  portability, and deterministic expected values. Includes a verification mode that
  runs the suite in parallel and per environment to produce evidence. Load when
  writing tests that create or read data, enabling parallel execution, adding an
  environment, or diagnosing failures that only appear in parallel or in one environment.
---
```

---

### Project Context section

```markdown
## Project Context

- **Hermetic test**: depends on nothing it does not control. Parallel safety and
  environment portability are consequences of hermeticity, not separate goals.
- Playwright runs each worker in a **separate process**. Module-level variables are NOT
  shared between workers. Use `testInfo.parallelIndex` (stable, 0..workers-1) for
  per-worker partitioning, never `workerIndex` (increments when a worker restarts).
- Fixtures support `{ scope: 'worker' }` for resources created once per worker.
- Specs never read `process.env` directly; they use the project's config module.
- Credentials stay owned by `spec-code-standard` R7. This skill governs **which identity**
  a test uses (shared / per worker / per test), not where the secret is stored.

### Project conventions (agnostic — resolve before applying rules)

*Added in iteration 3 (2026-11-18): the skill must work for any Playwright + TypeScript
framework, with demoqa only as the reference scenario.*

Resolve each placeholder from the project (CLAUDE.md / AGENTS.md, `tsconfig.json` paths,
folder tree); use the default only when the project defines nothing. Report the resolved
values in the M0 header.

| Placeholder | Meaning | Default |
|-------------|---------|---------|
| `<data-dir>` | Test data folder (per site/app if the project is multi-site) | `src/data` |
| `<config-module>` | Environment config module (`ENV`) | `src/config/env.ts` |
| `<fixtures-module>` | Playwright fixtures (`test.extend`) | `src/fixtures/index.ts` |
| `<api-layer>` | API client + controllers used for provisioning | `src/api` |
| `<runner-config>` | Playwright config | `playwright.config.ts` |
| `<tc-docs-dir>` | TC specification documents | `docs/test-cases` |

### Data classification (always classify before applying rules)

| Class | Example | Mutable? | Strategy |
|-------|---------|----------|----------|
| Reference | Catalog, products, countries | No | Share; discover via API |
| Environment | Base URL, seed IDs, feature flags | Per environment | Typed config per environment |
| Transactional | New user, order, cart item | Yes (test creates or changes it) | Create per test or worker; isolate; clean |
| Secret | Passwords, tokens | Per environment | Outside the repo (CI secrets) |
| Simulated | Mocked API responses | Controlled by the test | `mock<Resource>` fixture |

Most robustness bugs come from treating **Transactional** data as **Reference** data.

### Data lifecycle

DEFINE (typed shape) → PROVISION (create · discover · mock) → USE (test · worker · pool scope) → CLEAN (scoped teardown)

### Maturity levels

| Level | State | Exit criteria (to reach the next level) |
|-------|-------|-----------------------------------------|
| 0 — Hardcoded | Data inside the spec | All inputs and expected values moved to `src/data/` |
| 1 — Externalised | `src/data/` + data-driven datasets | Config per environment, validated, secrets outside the repo |
| 2 — Per environment | Typed `TEST_ENV` config | No shared mutable identity; unique generated data |
| 3 — Isolated | Per-worker or per-test data | Data self-provisioned via API, env literals replaced by discovery |
| 4 — Self-provisioned | Hermetic | Maintain: run M5 on every new TC |

### Domain coordination

| Concern | Owner | How this skill interacts |
|---------|-------|--------------------------|
| TC lifecycle orchestration | `spec-quality-lifecycle-standard` | Invokes this skill in phase 2 Arrange (M1–M3), phase 4 Assert (M4) and phase 5 Run (M5) |
| TC specification (test data section) | `spec-requirements-standard` M4 | Input: classified data items and their source per TC |
| Teardown exists after `use()` | `api-setup-teardown-standard` R4 | This skill checks teardown **scope** (R12) |
| Controllers for provisioning | `api-setup-teardown-standard` (Add mode) | Request `create<Identity>` / `delete<Identity>` when missing |
| Credential source | `spec-code-standard` R7 | Not re-checked |
| Test independence / module state | `spec-quality-lifecycle-standard` R7 | Not re-checked |
| Assertion specificity | `spec-quality-lifecycle-standard` R10 | R13 provides the expected-value source |
| Tag syntax | `spec-organisation-standard` | R11 defines tag **meaning** only |
```

---

### Modes

Each mode targets one domain question. **M0 is the default** when no mode is specified.

---

#### M0 — Maturity Assessment (read-only)

**Triggers:** `"assess test data"` · `"data maturity"` · `"spec data"` · `"data robustness"`

**Steps:**
1. Discover `src/data/**`, `src/config/**`, `src/fixtures/**`, `playwright.config.ts`, `tests/**/*.spec.ts`
2. Inventory every data item that a test consumes and classify it (Reference / Environment /
   Transactional / Secret / Simulated)
3. Detect shared mutable identities: fixtures that mutate state of an identity loaded from a
   single static source
4. Score the maturity level **per site** (the highest level whose exit criteria are fully met)
5. List the blockers for the next level, each mapped to the mode and rule that fixes it
6. Do NOT modify files

**Output:**
```
[spec-data-standard] MATURITY ASSESSMENT
─────────────────────────────────────────
Site: <site>            Level: <0-4> — <name>
  Data inventory:  <N> reference · <N> environment · <N> transactional · <N> secret · <N> simulated
  Blockers to level <N+1>:
    - <issue> → M<n> / R<n>
Recommended next mode: M<n>
```

---

#### M1 — Parallel Isolation

**Triggers:** `"parallel safe"` · `"isolate data"` · `"fix parallel failures"` · `"spec data m1"`

**Question:** Can N workers run at the same time without touching each other's data?

**Steps:**
1. Run R1–R5 on fixtures, specs, data factories, and `playwright.config.ts`
2. For each shared mutable identity, choose the isolation strategy (decision table)
3. If provisioning requires missing controller methods, invoke `api-setup-teardown-standard`
   (Add mode) to create them
4. Auto-fix AUTO-FIX violations, list MANUAL-FIX items

**Isolation strategy decision table:**

| Situation | Strategy | Fixture pattern |
|-----------|----------|-----------------|
| Test creates or mutates data; API available | Create per test + scoped teardown | `created<Resource>` |
| Costly identity (login, profile) with mutable state | One identity per worker | `worker<Resource>` (`scope: 'worker'`) |
| Identities cannot be created (fixed accounts) | Account pool indexed by `parallelIndex` | `worker<Resource>` from pool |
| Read-only reference data | Share it | `<resource>Controller` |
| UI behaviour independent of backend state | Mock | `mock<Resource>` |
| Truly global state, unavoidable | Serialise, with justification | `mode: 'serial'` + comment |

**Canonical worker-scoped identity:**
```typescript
workerUser: [async ({ playwright }, use, workerInfo) => {
  const request = await playwright.request.newContext({ baseURL: ENV.baseUrl });
  const accounts = new AccountController(new ApiClient(request));
  const user = buildUser(workerInfo.parallelIndex);        // unique, prefixed
  const created = await accounts.createUser(user);
  await use({ ...user, id: created.id });
  await accounts.deleteUser(created.id, user);             // scoped teardown
  await request.dispose();
}, { scope: 'worker' }],
```

---

#### M2 — Data Sourcing & Data-Driven

**Triggers:** `"data driven"` · `"externalise data"` · `"load test data"` · `"spec data m2"`

**Question:** Where does each test get its data, and is that data typed and reusable?

**Source decision table:**

| Need | Source | Location |
|------|--------|----------|
| Small, typed, code-reviewed datasets | TypeScript module | `<data-dir>/{feature}.data.ts` |
| Large or business-maintained datasets | JSON / CSV + typed loader | `<data-dir>/{feature}.json` + loader in `.data.ts` |
| Unique values per run | Factory / builder | `<data-dir>/factories/<resource>.factory.ts` |
| Values that differ per environment | Environment data map | `<data-dir>/env.data.ts` (M3) |

**Steps:**
1. Run R6–R8
2. Move inline datasets and expected values out of specs (R7)
3. Wrap every JSON / CSV source in a typed loader that validates required fields and fails fast (R6)
4. Convert copy-pasted tests that differ only in data into a data-driven loop (R8)

**Canonical data-driven pattern:**
```typescript
import { test, expect } from '@fixtures';
import { invalidLoginCases } from '@data/sites/<site>/login.data';

test.describe('Login', () => {
  for (const row of invalidLoginCases) {
    test(`${row.id}: Reject login for ${row.description}`, async ({ loginPage }) => {
      await test.step('Verify login page is loaded', async () => {
        await expect(loginPage.submitButton).toBeVisible();
      });
      await test.step('Submit credentials and verify error', async () => {
        await loginPage.login(row.username, row.password);
        await expect(loginPage.errorMessage).toHaveText(row.expectedError);
      });
    });
  }
});
```

Rows that need a different flow are a different TC, not a different row. Split the
dataset instead of branching (`spec-quality-lifecycle-standard` R8).

---

#### M3 — Environment Portability

**Triggers:** `"multi environment"` · `"run on staging"` · `"env config"` · `"spec data m3"`

**Question:** Does the suite run against another environment with zero code changes?

**Steps:**
1. Run R9–R12
2. Ensure `src/config/env.ts` selects `.env.<TEST_ENV>` (default `local`) and validates required variables
3. Replace environment literals with the environment data map or runtime discovery (R10)
4. Tag tests by data impact (R11) so environments can include or exclude them
5. Guard destructive cleanup per environment (R12)
6. Ensure `.env.*` is git-ignored and `.env.example` documents every variable

**Canonical config:**
```typescript
const TEST_ENV = process.env.TEST_ENV ?? 'local';
dotenv.config({ path: path.resolve(__dirname, `../../.env.${TEST_ENV}`) });
const REQUIRED = ['BASE_URL'] as const;
for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`[${TEST_ENV}] Missing env var "${key}"`);
}
export const ENV = {
  name: TEST_ENV,
  baseUrl: process.env.BASE_URL as string,
  allowDestructiveCleanup: process.env.ALLOW_DESTRUCTIVE_CLEANUP === 'true',
} as const;
```

**Data-impact tag vocabulary:**

| Tag | Meaning | Typical use |
|-----|---------|-------------|
| `@mutates-data` | Creates, updates or deletes persistent data | Excluded from production-like runs |
| `@read-only` | Reads only; safe in any environment | Smoke in every environment |
| `@env:<name>` | Valid only in that environment | Feature flags, env-only data |

```bash
TEST_ENV=staging npx playwright test --grep-invert @mutates-data
```

**Environment Readiness Map** *(added in iteration 3, 2026-11-18 — in the reference
scenario only one environment existed, so M3/M5 could not prove portability by running;
the skill must still show the problem and where the framework is or would be reinforced)*

Always produced by M3. When fewer than two environments are available, it replaces the
per-environment run as the M3/M5 evidence. One row per reinforcement point; status per
project: ✅ done · 🔧 would change (with file) · ➖ n/a.

| # | Reinforcement point | Where | Problem if missing | Rule |
|---|---------------------|-------|--------------------|------|
| E1 | Environment selector + per-env files | `<config-module>` | One hardcoded target | R9 |
| E2 | Fail-fast validation of required variables | `<config-module>` | Late, cryptic failures | R9 |
| E3 | Base URL from config; relative paths in steps | `<runner-config>`, specs, TC docs | Tests tied to one host | R10 · Q11 |
| E4 | Secrets per environment outside the repo | `.env.*`, CI secrets | Leaks; manual setup per env | — |
| E5 | Self-provisioned identities (no seeded users/IDs) | `<fixtures-module>`, `<api-layer>` | Seed data must exist in every env | R1 · R10 |
| E6 | Reference data discovered at runtime | `<fixtures-module>`, specs | IDs/SKUs differ per env | R10 |
| E7 | Oracles from controlled sources | specs, TC docs | Expected values differ per env | R13 · Q6 |
| E8 | Cleanup scoped and guarded per env | `<fixtures-module>` | Destructive cleanup in shared envs | R12 |
| E9 | Data-impact tags for test selection | specs | Mutating tests run where they must not | R11 |
| E10 | CI matrix: one job per env with its secrets | CI pipeline | Portability never exercised | — |

**Output:**
```
[spec-data-standard] ENVIRONMENT READINESS — <site>
Environments available: <n> (<names>)   Mode: run | readiness map
E1 ✅|🔧|➖ <evidence or file to change>
...
Ready: <n>/10   Next: <first 🔧 item>
```

---

#### M4 — Deterministic Data & Value Assertions

**Triggers:** `"assert values"` · `"deterministic data"` · `"mock data"` · `"spec data m4"`

**Question:** Does the test know the **exact** values it expects, and does it assert them?

Presence is not correctness. A test that only checks `toBeVisible()` on a list passes even
when every value in that list is wrong.

**Expected-value sources (in order of preference):**

| Source | When | Assertion |
|--------|------|-----------|
| Data the test created (`created<Resource>`) | Transactional data | Each field `toHaveText(created.field)` |
| Mock payload (`mock<Resource>`) | Rendering, formatting, edge cases | Every rendered field vs. the payload |
| Dataset row (M2) | Data-driven inputs and outputs | `toHaveText(row.expected)` |
| API discovery (`<resource>Controller`) | Reference data owned by the system | UI value vs. API value for the same entity |

**Steps:**
1. Run R13–R14
2. For every assertion on data-bearing elements, identify the expected-value source
3. Replace presence-only assertions with value assertions from a controlled source
4. Where live data is not owned, introduce a `mock<Resource>` fixture with a typed payload
   from `src/data/` (coordinate with `api-setup-teardown-standard` for the mock factory)

**Canonical mock + value assertion:**
```typescript
test('TC<N>: Show product details from catalog', async ({ mockProducts, catalogPage }) => {
  const [expected] = mockProducts;                       // typed payload from src/data
  await test.step('Verify catalog shows the mocked product values', async () => {
    await expect(catalogPage.titleOf(expected.id)).toHaveText(expected.title);
    await expect(catalogPage.priceOf(expected.id)).toHaveText(formatPrice(expected.price));
  });
});
```

---

#### M5 — Robustness Verification (evidence)

**Triggers:** `"verify robustness"` · `"stress parallel"` · `"run data verification"` · `"spec data m5"`

**Question:** Does it actually stay green in parallel, repeatedly, and per environment?

This mode **executes** tests and produces evidence. It never modifies code.

**Steps:**
1. Select the scope (single TC, feature, or site) and one browser project
2. **Parallel stress run:**
   `npx playwright test <scope> --project=<browser> --workers=<N> --repeat-each=<K> --retries=0`
   (default N=4, K=4)
3. **Environment run:** repeat for each configured `TEST_ENV` (at least two). With fewer than
   two environments, attach the M3 Environment Readiness Map instead and say so in the verdict
4. **Orphan check:** query for leftover data with the test prefix (R3). The expected count is 0
5. Classify every failure by root cause:

| Category | Signal |
|----------|--------|
| Collision | Data changed or deleted by another test |
| Session invalidation | 401/403 after another worker logged in |
| Missing data | Record/ID not found in this environment |
| Order dependency | Passes alone, fails in suite |
| Non-data flakiness | Timing or selector → hand off to `spec-quality-lifecycle-standard` |

6. Compare with the previous run (before/after) when available

**Output:**
```
[spec-data-standard] ROBUSTNESS VERIFICATION
─────────────────────────────────────────
Scope:     <scope>   Project: <browser>
Parallel:  workers=<N> repeat=<K> → <passed>/<total> passed · <flaky> flaky
Env <a>:   <passed>/<total> passed
Env <b>:   <passed>/<total> passed
Orphans:   <N> records with prefix '<prefix>'
Failures by cause: collision <n> · session <n> · missing-data <n> · order <n> · other <n>
Verdict:   ✅ HERMETIC  |  ❌ NOT HERMETIC → run M<n> for <rule>
```

---

### Rules

---

#### R1 — NO_SHARED_MUTABLE_IDENTITY (ERROR, MANUAL-FIX) · M1

**Condition:** A test-scoped fixture creates, mutates, or bulk-deletes state that belongs to an
identity loaded from a single static source (one env var, one data constant), while the
project runs with more than one worker.

**Why:** Every worker acts on the same account. One worker's cleanup erases another's data,
and a login in one worker can invalidate another's session token.

**Fix:** Apply the M1 isolation decision table: per-test identity, `worker<Resource>`, or pool.

---

#### R2 — UNIQUE_CREATED_DATA (ERROR, AUTO-FIX) · M1

**Condition:** Data created by a test or fixture uses a static literal for a field that must be
unique (username, email, name, title, code).

**Auto-fix:** Replace it with a factory value built from the prefix, `parallelIndex`, a timestamp,
and a random suffix. `Date.now()` alone is not unique across workers.

```typescript
export const uniqueSuffix = (i: number) =>
  `${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
```

---

#### R3 — TEST_DATA_PREFIXED (WARNING, AUTO-FIX) · M1

**Condition:** Generated transactional data does not start with the test-data prefix
(`ENV.testDataPrefix`, default `qa_`).

**Why:** The prefix makes orphans detectable (M5) and enables a sweep job after failed runs.

---

#### R4 — PARALLELISM_NOT_SUPPRESSED (WARNING, MANUAL-FIX) · M1

**Condition:** `workers: 1`, `fullyParallel: false`, or `test.describe.configure({ mode: 'serial' })`
appears without a `// spec-data: serial — <reason>` justification comment.

**Why:** Suppressing parallelism hides isolation bugs instead of fixing them.

---

#### R5 — NO_GLOBAL_STATE_ASSERTION (WARNING, MANUAL-FIX) · M1

**Condition:** An assertion checks a total count or full-collection equality on data the test
does not own (`toHaveCount(N)` on a shared list, "cart has 3 items" on a shared identity).

**Fix:** Assert on the specific records the test created, or own the whole collection
(`worker<Resource>` / `created<Resource>`).

---

#### R6 — TYPED_DATA_SOURCE (ERROR, AUTO-FIX) · M2

**Condition:** A JSON or CSV data file is imported or parsed directly in a spec, or loaded without
a TypeScript interface and required-field validation.

**Auto-fix:** Create a typed loader in `<data-dir>/{feature}.data.ts` that validates
required fields and throws a descriptive error. Update the spec to import from the loader.

---

#### R7 — DATA_OUTSIDE_SPEC (ERROR, AUTO-FIX) · M2

**Condition:** A spec declares inline datasets (arrays or objects of inputs) or literal expected
values that represent test data (not UI labels). Credentials are excluded because
`spec-code-standard` R7 owns them.

**Auto-fix:** Move them to `<data-dir>/{feature}.data.ts` with an exported interface
and import them through `@data/*`.

---

#### R8 — DATA_DRIVEN_TITLES_UNIQUE (ERROR, AUTO-FIX) · M2

**Condition:** A loop generates `test()` calls whose title does not include a unique row identifier,
or two or more tests differ only in literal data (copy-paste candidates).

**Auto-fix:** Add `${row.id}` to the title. Merge copy-paste tests into one dataset plus a loop.

---

#### R9 — ENV_RESOLVED_FROM_CONFIG (ERROR, AUTO-FIX) · M3

**Condition:** Any of the following:
1. `process.env` is read outside `src/config/`
2. `src/config/env.ts` loads one fixed `.env` with no environment selector
3. A variable used by tests is not validated at startup

**Auto-fix:** Route all reads through `ENV`, add the `TEST_ENV` selector, and add the variable
to the required or optional lists and to `.env.example`.

---

#### R10 — NO_ENV_SPECIFIC_LITERALS (ERROR, MANUAL-FIX) · M3

**Condition:** A spec, fixture, or data file contains an environment-dependent literal that is
assumed to exist: absolute host URL, record ID, UUID, SKU/ISBN, or seeded username.

**Fix:** Prefer runtime discovery through a `<resource>Controller`. Otherwise use the environment
data map `<data-dir>/env.data.ts` keyed by `ENV.name`.

---

#### R11 — DATA_IMPACT_TAGGED (WARNING, AUTO-FIX) · M3

**Condition:** A test that uses a `created<Resource>`, `clean<Resource>`, or `worker<Resource>`
fixture, or calls a persistence action, has no `@mutates-data` tag. A test restricted to one
environment has no `@env:<name>` tag.

**Auto-fix:** Add the tag through the native `{ tag: [...] }` option (syntax per `spec-organisation-standard`).

---

#### R12 — SCOPED_AND_GUARDED_CLEANUP (ERROR, MANUAL-FIX) · M1 · M3

**Condition:** A teardown performs bulk deletion (`deleteAll`, sweep by query) on data the test
or worker does not exclusively own, or runs bulk deletion without checking
`ENV.allowDestructiveCleanup`.

**Fix:** Delete only the identifiers created by this fixture. Allow bulk cleanup only for an
identity owned by the test or worker, and only when the environment allows it.

---

#### R13 — EXPECTED_VALUE_FROM_CONTROLLED_SOURCE (WARNING, MANUAL-FIX) · M4

**Condition:** An assertion on a data-bearing element (title, price, name, status, row) either:
1. Checks presence only (`toBeVisible`, `toHaveCount(>0)`) when the TC intent is a value, or
2. Compares against a literal whose source is not a created fixture, mock payload, dataset row, or API discovery

**Fix:** Assert the exact value from the controlled source (M4 source table). This rule feeds
`spec-quality-lifecycle-standard` R10.

---

#### R14 — MOCK_FOR_UNOWNED_CONTENT (WARNING, MANUAL-FIX) · M4

**Condition:** A test validates rendering, formatting, or edge cases of content it does not own
(live catalog, third-party data) and cannot predict the exact values.

**Fix:** Inject a `mock<Resource>` fixture whose payload comes from `src/data/`, and assert each
rendered field. Keep one non-mocked test per feature as an integration check.

---

#### R15 — SINGLE_SESSION_PER_IDENTITY (ERROR, MANUAL-FIX) · M1

*Added in iteration 2 (2026-11-18) — found by M5: 1/6 intermittent 401 with workers reusing
their identity; no existing rule matched the failure.*

**Condition:** Within one test, more than one fixture generates an auth token or session for
the same identity.

**Why:** Systems with a single active token per user invalidate the earlier token. The failure
is intermittent because it depends on which fixture authenticates last.

**Fix:** One fixture owns the identity's token per test. Other fixtures reuse it or perform
unauthenticated reads (public catalogs, discovery).

---

### Violation Output Format

```
[spec-data-standard] SEVERITY — RULE_NAME (M<n>)
File:  <relative path from project root>
Line:  <line number>
Issue: <one sentence describing the problem>
Fix:   <one sentence describing the fix> | AUTO-APPLIED | MANUAL-FIX
```

---

### Scan Scope

| File glob | Rules |
|-----------|-------|
| `src/fixtures/**/*.ts` | R1, R2, R3, R12, R15 |
| `src/data/**` | R2, R3, R6, R10 |
| `src/config/**/*.ts` | R9 |
| `playwright.config.ts` | R4 |
| `tests/**/*.spec.ts` | R4, R5, R6, R7, R8, R9, R10, R11, R13, R14 |

---

## Hub updates (automation-architect/SKILL.md)

1. **Sub-Skill Registry**: add a row:

   | Skill | Domain | File Scope | Rules / Checks | Added | Status |
   |-------|--------|-----------|----------------|-------|--------|
   | `spec-data-standard` | Test data: classification · isolation · sourcing · environments · expected values | `src/data/**` · `src/config/**` · `src/fixtures/**` · `playwright.config.ts` · `tests/**/*.spec.ts` | R1–R14 · M0–M5 | M6 | Active |

2. **Scan Scope Ownership**: add rows:

   | File / Scope | Owner skill | Concern |
   |--------------|-------------|---------|
   | `src/data/**` — shape, typing, uniqueness | `spec-data-standard` | R2, R3, R6 |
   | `src/config/**` — environment selection and validation | `spec-data-standard` | R9 |
   | `src/fixtures/**` — fixture scope and data identity | `spec-data-standard` | R1, R12 |
   | `playwright.config.ts` — parallelism suppression | `spec-data-standard` | R4 |
   | `tests/**/*.spec.ts` — data sourcing, env literals, data tags, expected-value source | `spec-data-standard` | R5, R7, R8, R10, R11, R13, R14 |

3. **Mode 1 — Full Pipeline**: insert a step after `api-setup-teardown-standard` and before
   `spec-quality-lifecycle-standard`:
   ```markdown
   7. Run `spec-data-standard` (M1–M4 rules) on fixtures, data, config, and specs:
      - Auto-fix R2, R3, R6–R9, R11
      - Collect R1, R4, R5, R10, R12–R14 as manual fixes
   ```
   Renumber the following steps and add `spec-data-standard:` to the pipeline output.

4. **Mode 7 — TC Quality Review** (no new mode, slot count unchanged): add triggers
   `"data robustness"` · `"parallel safe"` · `"multi environment"` · `"assess test data"` ·
   `"verify robustness"`, and add this note to its Steps:
   ```markdown
   Data robustness requests are forwarded by `spec-quality-lifecycle-standard` to
   `spec-data-standard` (phase 2 Arrange: M0–M3 · phase 4 Assert: M4 · phase 5 Run: M5).
   ```

5. **Inter-skill execution order**: insert `spec-data-standard` between
   `api-setup-teardown-standard` and `spec-quality-lifecycle-standard`.

6. **Sub-Skill Invocation Reference**: add rows:

   | Goal | Skill to load | Trigger phrase example |
   |------|---------------|------------------------|
   | Assess test data maturity | `spec-data-standard` | `"assess test data"` |
   | Make tests safe in parallel | `spec-data-standard` | `"parallel safe"` |
   | Verify robustness with evidence | `spec-data-standard` | `"verify robustness"` |

7. **Breaking change propagation**: add the row
   `src/config/env.ts (TEST_ENV / new variable)` → `spec-data-standard`, `spec-code-standard` → R9, credential examples.

8. **Project folder structure**: annotate `data/` and `config/` with `(spec-data-standard)`.

---

## Reinforcements to existing skills

| Skill | Change | Rule / section |
|-------|--------|----------------|
| `spec-quality-lifecycle-standard` | Lifecycle orchestration (5 phases + cross-cutting debugging) — see `spec-quality-lifecycle-standard-prompt.md` Revision 3 | Domain orchestration |
| `spec-quality-lifecycle-standard` | R10 requires an exact value assertion with its source per `spec-data-standard` R13. Add the R13 cross-check to Enforce step 4 | R10, Enforce mode |
| `spec-quality-lifecycle-standard` | Create mode Step 0 collects `dataSource` (created / mock / dataset / discovery) and `expectedValues`, and Step 3 asserts them with value matchers | Create mode |
| `api-setup-teardown-standard` | Add mode supports identity provisioning (`create<Identity>` / `delete<Identity>`) for worker-scoped fixtures | Mode Add |
| `api-setup-teardown-standard` | R4 applies to `{ scope: 'worker' }` fixtures. R8 naming table adds `worker<Resource>` | R4, R8 |
| `spec-code-standard` | R7 examples obtain credentials from `worker<Resource>` or a pool, not a single static user | R7 |
| `spec-organisation-standard` | Future tag rules register the data-impact vocabulary (`@mutates-data`, `@read-only`, `@env:<name>`) | Tagging |
| `CLAUDE.md` / `AGENTS.md` | Fixture naming table adds `worker<Resource>` → `workerUser` | Fixture naming |

After applying the reinforcements, run `wc -l` on each modified `SKILL.md`. If
`spec-quality-lifecycle-standard` exceeds 400 lines, report it as a split candidate
(`spec-authoring-standard`, see ADR-002) instead of trimming its rules.

---

## Validation loop (course workflow)

1. **Objective:** test data robustness (hermetic tests)
2. **Prompt:** this file (input: the M4 handoff of `spec-requirements-standard` for the scenario TC)
3. **Skill:** generate `SKILL.md` and apply the hub updates and reinforcements
4. **Execute:** run M0 on the project, then M5 on one scenario to get the **baseline** evidence
5. **Analyse:** map every failure to a mode and rule
6. **Refactor:** apply M1 → M2 → M3 → M4 to the scenario. If a failure has no matching rule, refine this prompt
7. **Re-verify:** run M5 again. The before/after evidence is the proof that the skill works
