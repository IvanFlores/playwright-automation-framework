---
name: lifecycle-architect
description: 'Enforce and scaffold the API layer and the API-based setup/teardown (test lifecycle) infrastructure for Playwright + TypeScript projects. Governs src/api/ (client, endpoints, models, controllers, mocks), the lifecycle fixtures in src/fixtures/index.ts (setup before use(), teardown after use()), and how specs consume them (injected fixtures only). Three modes: Review (detect + auto-fix on existing code), New (scaffold the API layer for a first resource) and Add (extend an existing API layer with a new resource). Triggers: "lifecycle architect", "lifecycle review", "check api layer", "check lifecycle", "review setup teardown", "setup api layer", "scaffold api", "new api resource", "create controller", "lifecycle new", "add api support", "extend api", "new controller for", "lifecycle add", "api precondition", "api postcondition". Load when implementing API-based preconditions/postconditions, teardown or route mocking for any test case, or through automation-architect Mode 5.'
---

# lifecycle-architect

Owns the **API layer structure and the test lifecycle infrastructure** of the framework: how
preconditions (setup) and postconditions (teardown) are implemented through the API so tests are
deterministic, parallel-safe and leave no data behind.

| Skill | Domain |
|---|---|
| `pom-architect` | Page Object layer structure |
| `test-standards` | Test code quality — imports, fixtures, credentials, framework |
| `spec-standards` | Spec organisation — folder hierarchy, file naming, TC IDs, steps |
| `git-standards` | Git workflow conventions |
| `lifecycle-architect` | API layer structure · setup/teardown infrastructure · mocking |

**Gap this skill fills:** no other skill governs `src/api/`. The `@api/*` alias exists in
`tsconfig.json`, but how the client, endpoints, models, controllers and mocks are built and wired
was not enforceable. This skill also governs how specs consume the lifecycle layer: controllers
and created data are **always injected as fixture parameters**, never instantiated in a test body.

Growth path (not enforced yet): database-level setup/teardown · auth-token caching across fixtures ·
environment-scoped teardown policies (e.g. skip destructive teardown on staging).

---

## Project context

- App under test: **GAD** at `BASE_URL` (UI projects `chromium` / `firefox` / `webkit`). Its REST API
  lives on the same host under `/api/*`, so lifecycle fixtures use Playwright's `request` fixture,
  whose `baseURL` is already `BASE_URL` in those projects. Endpoint constants are therefore
  **paths**, never absolute URLs.
- The `api` project (`tests/api/**`) has its own `baseURL` (`API_BASE_URL`, JSONPlaceholder). Its
  resources follow the same layer rules.
- GAD auth: `POST /api/login` `{ email, password }` → `{ access_token }`; write operations send
  `Authorization: Bearer <token>`. Credentials come from `users.appUser` (`@data/auth.data`), never
  from literals.
- GAD validates `date` on create: format `YYYY-MM-DDTHH:mm:ssZ` (no milliseconds) and **not in the
  future** relative to the server clock — build it in the data factory, a few hours in the past.
- `ApiClient` is the only class that calls `request.*` methods. Controllers receive `ApiClient`,
  never `APIRequestContext`.
- `src/api/**` and `src/fixtures/**` never call `expect()` (assertions live in specs —
  `pom-architect` rule 6). Failed HTTP calls **throw** with method, URL, status and body (R11).
- Imports use path aliases only (`@api/*`, `@data/*`, `@config/*`, `@fixtures`) — `test-standards`
  rule 1.
- Specs read and assert on injected data; they never create or delete lifecycle data themselves.
  Exception: in `tests/api/**` the controller call **is** the behaviour under test, so an API spec may
  call an injected controller's operation and assert on its response (it still never instantiates
  the client or controller).

### API layer architecture (single source of truth)

```
src/api/
  client/
    ApiClient.ts                ← only HTTP entry point; wraps APIRequestContext
  endpoints/
    <resource>.endpoints.ts     ← path constants and builders per resource
  models/
    <resource>.model.ts         ← TypeScript interfaces for request/response payloads
  controllers/
    <Resource>Controller.ts     ← business-level operations per resource (class name = file name)
  mocks/
    <resource>.mock.ts          ← route stub factories using page.route()  (only when needed)
```

| Layer | Responsibility | May depend on |
|---|---|---|
| `client/ApiClient.ts` | Wrap `APIRequestContext`: auth header, status check, JSON parsing | Nothing inside `src/api/` |
| `endpoints/<r>.endpoints.ts` | Path constants and builder functions | Nothing |
| `models/<r>.model.ts` | Interfaces for request/response shapes | Nothing (other models only) |
| `controllers/<R>Controller.ts` | Business operations (login, create, get, delete…) | `ApiClient` · endpoints · models |
| `mocks/<r>.mock.ts` | Route stub factories registered via `page.route()` | endpoints · models |

### Fixture injection decision table

| Need | Fixture type | Parameter name pattern | Provides |
|---|---|---|---|
| Read/verify existing data, or exercise the API itself | Controller fixture | `<resource>Controller` | The controller instance |
| Create data (precondition), assert, then clean up (postcondition) | Data fixture with teardown | `created<Resource>` | The created resource object |
| Verify a clean initial state + clean up after the test | Setup + teardown fixture | `clean<Resource>` | The controller instance |
| Mock a route for this test | Mock fixture (mock factory) | `mock<Resource>` | Registered route stub |

### Canonical patterns

```typescript
// src/api/client/ApiClient.ts
import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiClient {
  private authToken?: string;

  constructor(private readonly request: APIRequestContext) {}

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    return this.parse<T>('GET', url, await this.request.get(url, { params, headers: this.headers() }));
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    return this.parse<T>('POST', url, await this.request.post(url, { data, headers: this.headers() }));
  }

  async delete(url: string): Promise<void> {
    await this.ensureOk('DELETE', url, await this.request.delete(url, { headers: this.headers() }));
  }

  private headers(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private async ensureOk(method: string, url: string, response: APIResponse): Promise<void> {
    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`${method} ${url} failed — status ${response.status()}: ${body}`);
    }
  }

  private async parse<T>(method: string, url: string, response: APIResponse): Promise<T> {
    await this.ensureOk(method, url, response);
    return (await response.json()) as T;
  }
}
```

```typescript
// src/api/endpoints/articles.endpoints.ts
export const ArticlesEndpoints = {
  base: '/api/articles',
  byId: (id: number) => `/api/articles/${id}`,
} as const;
```

```typescript
// src/api/controllers/ArticleController.ts
import { ApiClient } from '@api/client/ApiClient';
import { ArticlesEndpoints } from '@api/endpoints/articles.endpoints';
import { Article, CreateArticlePayload } from '@api/models/article.model';

export class ArticleController {
  constructor(private readonly client: ApiClient) {}

  async create(payload: CreateArticlePayload): Promise<Article> {
    return this.client.post<Article>(ArticlesEndpoints.base, payload);
  }

  async delete(id: number): Promise<void> {
    return this.client.delete(ArticlesEndpoints.byId(id));
  }
}
```

```typescript
// src/fixtures/index.ts — precondition before use(), postcondition after use()
createdArticle: async ({ request }, use) => {
  const client = new ApiClient(request);
  client.setAuthToken(await new AuthController(client).login(users.appUser));
  const controller = new ArticleController(client);
  const article = await controller.create(buildArticle()); // ← precondition (API)
  await use(article);                                       // ← test runs here
  await controller.delete(article.id);                      // ← postcondition (API), always runs
},
```

Dependent data fixtures declare the parent fixture as a parameter (`createdComment: async ({ request,
createdArticle }, use)`). Playwright tears fixtures down in reverse dependency order, so the child
(comment) is deleted before the parent (article).

**Token refresh (R10):** if the provider enforces a single active token and the test body performs a
**UI login**, the setup token is invalidated during the test — teardown must log in again before its
API calls. Fixtures whose specs never log in through the UI do not need it.

---

## Run modes

| Mode | Triggers | What it does |
|---|---|---|
| **Review** (default) | "lifecycle architect", "lifecycle review", "check api layer", "check lifecycle", "review setup teardown" | Scan the scope below with R1–R11, auto-fix fixable violations, list manual ones. Says "check / review only / don't fix" → report-only. |
| **New** | "setup api layer", "scaffold api", "new api resource", "create controller", "lifecycle new" | `src/api/` does not exist (or has no client): scaffold the full layer for a resource. |
| **Add** | "add api support", "extend api", "new controller for", "lifecycle add" | `src/api/` exists: add endpoints/models/controller/fixture for a new resource. |

If the wording asks for API preconditions/postconditions for a test case without naming a mode, pick
New or Add automatically from whether `src/api/client/ApiClient.ts` exists.

### Mode: Review

1. Collect files in the Scan scope table (or only the files the user named, plus the fixtures and API
   files they depend on).
2. Apply every rule to its files. Read each file fully; do not infer from file names.
3. Auto-fix in this order (later fixes depend on earlier ones): R6 (placement + imports) → R1 → R11 →
   R3 → R2 / R5 → R7 → R8. Never auto-fix R4 or R10.
4. After fixing, run `npx tsc --noEmit`; a type error introduced by a fix is fixed before reporting.
5. Re-scan once (detection only). Do not loop more than once.
6. Print violations, then the summary block.

### Mode: New — scaffold API layer

Step 0 — collect parameters (infer from context; ask only for what is missing):
`resourceName` (PascalCase singular, e.g. `Article`) · `basePath` (e.g. `/api/articles`) ·
`operations` (`login`, `get`, `create`, `update`, `delete`) · `needsAuth` · `needsMock`.

1. Create `src/api/client/ApiClient.ts` if missing — only the HTTP methods the operations need,
   status-checked (R11), `setAuthToken()` if `needsAuth`.
2. Create `src/api/endpoints/<resource>.endpoints.ts` — `export const <Resource>sEndpoints` with
   `base` and `byId` when delete/update/get-by-id are needed.
3. Create `src/api/models/<resource>.model.ts` — response interface `<Resource>`, payload interfaces
   `<Action><Resource>Payload`.
4. Create `src/api/controllers/<Resource>Controller.ts` — constructor takes `ApiClient` only, one
   method per operation.
5. Create `src/api/mocks/<resource>.mock.ts` only if `needsMock`.
6. Add a data factory in `src/data/<resource>s.data.ts` (`build<Resource>(overrides)`) with unique
   values per call (parallel-safe) and any server constraints (e.g. GAD past `date`).
7. Wire fixtures in `src/fixtures/index.ts` using the decision table; every `created*` fixture has
   its teardown after `use()`.
8. Run `test-standards` (report-only) on `src/fixtures/index.ts` — expect zero violations — and
   `npx tsc --noEmit`.

Output:

```
[lifecycle-architect] SCAFFOLD COMPLETE — New
─────────────────────────────────────────────
Created:  src/api/client/ApiClient.ts            (if new)
Created:  src/api/endpoints/<resource>.endpoints.ts
Created:  src/api/models/<resource>.model.ts
Created:  src/api/controllers/<Resource>Controller.ts
Created:  src/api/mocks/<resource>.mock.ts       (if needsMock)
Created:  src/data/<resource>s.data.ts           (if new)
Updated:  src/fixtures/index.ts
```

### Mode: Add — extend API layer

0. Confirm `src/api/client/ApiClient.ts` exists and satisfies R1 / R11; fix first if not.
1. Collect parameters (as New, Step 0).
2. Steps 2–8 of New (skip the client).
3. Run Mode Review on all of `src/api/` and `src/fixtures/index.ts`.

Output: same block as New with the header `SCAFFOLD COMPLETE — Add` and no client line.

---

## Rules

Rule IDs are stable across course modules. **R9 is reserved** (removed upstream) and intentionally
unused.

### R1 — API_CLIENT_IS_ONLY_HTTP_ENTRY_POINT (ERROR, auto-fix)

Condition: any file other than `src/api/client/ApiClient.ts` calls `request.get/post/put/patch/delete`
or `request.fetch` on an `APIRequestContext`. (`route.fetch()` inside a `page.route` / `context.route`
handler is a browser route, not an API call, and is out of scope.)

Fix: replace with the equivalent `ApiClient` method; add the method to `ApiClient` if missing.

### R2 — ENDPOINTS_CENTRALIZED (ERROR, auto-fix)

Condition: a string literal or template that is an API path (`'/api/…'`, `'/posts'`, or a full URL)
appears in a controller, fixture, mock or spec instead of an endpoint constant.

Fix: use the constant from `src/api/endpoints/<resource>.endpoints.ts`; create the file if missing.

### R3 — CONTROLLER_DEPENDENCY_CONTRACT (ERROR, auto-fix)

Condition: a controller constructor parameter is typed `APIRequestContext` instead of `ApiClient`.

Fix: change the type to `ApiClient` and route every call through it.

### R4 — TEARDOWN_MIRRORS_SETUP (ERROR, manual)

Condition: a fixture calls a create/post controller method before `use()` and has no matching
delete/cleanup after `use()`.

Why manual: teardown needs the right identifier from the create response; guessing risks deleting
the wrong data.

```typescript
// violation
createdArticle: async ({ request }, use) => {
  const article = await new ArticleController(new ApiClient(request)).create(buildArticle());
  await use(article); // ← no postcondition
},
```

### R5 — MOCKS_USE_CENTRALIZED_ENDPOINTS (ERROR, auto-fix)

Condition: a mock file passes a hardcoded URL to `page.route()`.

Fix: ``page.route(`**${ArticlesEndpoints.base}`, …)``.

### R6 — CORRECT_FOLDER_PLACEMENT (ERROR, auto-fix)

Condition: an API layer file is not in its folder (`client/`, `endpoints/`, `models/`,
`controllers/`, `mocks/`), e.g. `src/api/ApiClient.ts` at the root of `src/api/`; or a
request/response interface is declared outside `src/api/models/` (in a spec or data file).

Fix: move the file / interface, then update **every** import in the repo (`src/`, `tests/`,
`features/`).

### R7 — NO_LIFECYCLE_INSTANTIATION_IN_SPEC (ERROR, auto-fix)

Condition: a spec (`tests/**/*.spec.ts`) instantiates `ApiClient` or a controller, receives the raw
`request` fixture to call the API, or performs lifecycle create/delete in a `test()` /
`beforeEach()` body. A spec that receives the `ApiClient` instance itself through a fixture and calls
its HTTP methods is also a violation (it bypasses controllers and endpoints).

Fix: move the instantiation/setup into a fixture (decision table), inject it, remove the inline
code. For `tests/api/**`, inject `<resource>Controller` and call its operation (see Project context
exception).

### R8 — LIFECYCLE_FIXTURE_NAMING_CONVENTION (WARNING, auto-fix)

Condition: a lifecycle fixture name does not follow the decision table (`<resource>Controller`,
`created<Resource>`, `clean<Resource>`, `mock<Resource>`). A fixture that exposes the raw `ApiClient`
(e.g. `api`) is a violation.

Fix: rename/replace the fixture and update every spec that injects it.

### R10 — TOKEN_REFRESH_IN_TEARDOWN (WARNING, manual)

Condition: a fixture sets an auth token before `use()`, is injected by specs that perform a UI login
(`login()` PO call or a login fixture such as `authenticatedPage`), and does not obtain a new token
before its teardown calls.

Why manual: only applies when the identity provider enforces a single active token; confirm the
behaviour before adding a second login.

### R11 — API_CLIENT_STATUS_CHECKED (ERROR, auto-fix)

Condition: an `ApiClient` method does not check `response.ok()` and **throw** an `Error` (method,
URL, status, body) on non-2xx — including methods that use `expect()` for this (assertions belong in
specs, and an `expect` failure inside a fixture is reported as a failed assertion, not an API error).

Fix: route every response through one private `ensureOk()` that throws.

---

## Output format

Same format as the other sub-skills, so the hub can aggregate it:

```
[lifecycle-architect] SEVERITY — RULE_NAME
File:  <path relative to project root>
Line:  <number>
Issue: <one sentence>
Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

Summary (Review mode):

```
[lifecycle-architect] REVIEW COMPLETE
─────────────────────────────────────────────
Files scanned:      N
Violations found:   X  (ERROR: a · WARNING: b)
Auto-applied:       Y
Manual fixes:       <list, or "none">
[lifecycle-architect] ✅ Lifecycle layer compliant.     ← only when nothing is pending
[lifecycle-architect] ⚠️ Manual fixes pending.          ← otherwise
```

In report-only, `Auto-applied` is `0`.

---

## Scan scope

| File glob | Rules |
|---|---|
| `src/api/**/*.ts` (any file) | R6 |
| `src/api/client/**/*.ts` | R1, R11 |
| `src/api/controllers/**/*.ts` | R1, R2, R3 |
| `src/api/mocks/**/*.ts` | R2, R5 |
| `src/fixtures/index.ts` | R1, R2, R4, R8, R10 |
| `tests/**/*.spec.ts` | R2, R6 (interfaces), R7 |
| `src/data/**/*.ts` | R6 (interfaces only) |
| `features/**/*.ts` | R6 (imports only, when files move) |

`src/fixtures/index.ts` is also scanned by `test-standards` (fixture completeness, imports); this
skill looks only at lifecycle concerns there, so there is no overlap.

---

## Quick checklist

- [ ] `ApiClient` is the only `request.*` caller and throws on non-2xx
- [ ] Every API path is an endpoint constant
- [ ] Interfaces live in `src/api/models/`
- [ ] Controllers take `ApiClient`
- [ ] Every `created*` fixture deletes what it created after `use()`
- [ ] Specs inject lifecycle fixtures; they never build clients/controllers or create/delete data
- [ ] Fixture names follow the decision table
