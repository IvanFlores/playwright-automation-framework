# GAD — Login test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".

### TC1: Greet the user by email after a valid login

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-AUTH-LOGIN · AC1: a registered user who submits valid credentials is signed in and greeted by email |
| Objective | Prove that the main entry point to every authenticated feature works and identifies the signed-in user |
| Priority | High |
| Suite | smoke |
| Type | positive |
| Tags | `@smoke` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/smoke/login/TC1-valid-login.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | A GAD account `{email}` / `{password}` exists | Environment: `.env` locally; CI creates a throwaway account per run (`POST /api/users`) | shared read-only (login creates no data) |
| P2 | The browser has no session | fixture `loginPage` (new context per test) | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| email | `TEST_USERNAME` | Secret | env → `users.appUser.username` |
| password | `TEST_PASSWORD` | Secret | env → `users.appUser.password` |
| greeting | `Hi {email}!` | Reference (product text) | verified against GAD 2.9.0 |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Open `/login/` | Email and password inputs are empty; the "LogIn" button is visible |
| 2 | Submit `{email}` and `{password}` | URL path = `/welcome`; greeting text = `Hi {email}!` |
| 3 | Look at the page header | The user menu button is rendered as a button |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| A session exists only in this test's browser context | None needed: Playwright discards the context | test |

**Risks / notes** — The account is shared by every worker, but logging in creates no data and GAD
keeps older tokens valid, so parallel logins do not interfere.

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 — account and empty session stated as preconditions, with provisioning and scope.
- Q4 — credentials declared as Secret from the environment; greeting format as product text.
- Q5 / Q13 — three numbered steps, one action each.
- Q6 — "greets the user by email" → exact text `Hi {email}!` and URL `/welcome` (read in GAD).

**Automation handoff (M4)**

```yaml
tc: TC1
title: Greet the user by email after a valid login
spec: tests/ui/smoke/login/TC1-valid-login.spec.ts
suite: smoke
tags: ['@smoke', '@read-only']
automation: automatable
fixtures:
  identity: users.appUser          # shared read-only account from Env
  page: loginPage
data:
  - { name: email, class: secret, source: env }
  - { name: password, class: secret, source: env }
steps:
  - action: open /login/
    oracle: emailInput and passwordInput empty; submitButton visible
  - action: login(email, password)
    oracle: URL path = /welcome; greeting text = "Hi {email}!"
  - action: read header
    oracle: userMenuButton is a button
postconditions:
  - none (browser context discarded)
```

### TC2: Reject an unknown account and keep the user signed out

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-AUTH-LOGIN · AC2: invalid credentials show an error and do not create a session |
| Objective | Prove that a failed login is reported to the user and does not let them into authenticated pages |
| Priority | High |
| Suite | regression |
| Type | negative |
| Tags | `@regression` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/regression/login/TC2-login-invalid-credentials.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | No GAD account uses `{invalidEmail}` | Dataset: the `.test` domain is reserved and test-generated users use the `qa_` prefix | shared read-only |
| P2 | The browser has no session | fixture `loginPage` | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| invalidEmail | `unknown.user@example.test` | Reference | dataset `users.invalidUser` |
| invalidPassword | `not-a-valid-password` | Reference (not a real credential) | dataset `users.invalidUser` |
| errorText | `Invalid username or password` | Reference (product text) | dataset `loginMessages.invalidCredentials` |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Submit `{invalidEmail}` and `{invalidPassword}` on `/login/` | Error text = `{errorText}` |
| 2 | Look at the page | URL path is still `/login/`; the "LogIn" button is visible; no greeting is rendered |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| No session and no data were created | None needed | test |

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q4 — invalid credentials and error text declared in the data table with their dataset source.
- Q5 / Q13 — two numbered steps.
- Q6 — "show an error" → exact error text; "stays signed out" → URL, button and greeting checks.

**Automation handoff (M4)**

```yaml
tc: TC2
title: Reject an unknown account and keep the user signed out
spec: tests/ui/regression/login/TC2-login-invalid-credentials.spec.ts
suite: regression
tags: ['@regression', '@read-only']
automation: automatable
fixtures:
  page: loginPage
data:
  - { name: invalidEmail, class: reference, source: dataset }   # users.invalidUser
  - { name: errorText, class: reference, source: dataset }      # loginMessages.invalidCredentials
steps:
  - action: login(invalidEmail, invalidPassword)
    oracle: errorMessage text = errorText
  - action: read page
    oracle: URL path = /login/; submitButton visible; greeting count = 0
postconditions:
  - none
```
