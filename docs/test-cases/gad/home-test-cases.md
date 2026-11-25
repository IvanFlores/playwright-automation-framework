# GAD — Home test cases

Specifications owned by `spec-requirements-standard`. Index: README "Test cases".

### TC3: Show the signed-in user's greeting on the landing page

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-HOME · AC1: the landing page after login greets the signed-in user by email |
| Objective | Prove that the landing page shows who is signed in, so the user can confirm the right account |
| Priority | Medium |
| Suite | smoke |
| Type | positive |
| Tags | `@smoke` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/smoke/home/TC3-home-user-greeting.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | A GAD account `{email}` / `{password}` exists | Environment (as TC1) | shared read-only |
| P2 | The user is signed in and on the landing page `/welcome` | UI — fixture `authenticatedPage` (logs in through `/login/`) → `homePage` | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| email | `TEST_USERNAME` | Secret | env → `users.appUser.username` |
| greeting | `Hi {email}!` | Reference (product text) | verified against GAD 2.9.0 |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Read the greeting on `/welcome` | Greeting text = `Hi {email}!` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| A session exists only in this test's browser context | None needed | test |

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 — "signed-in" made a precondition provisioned by the `authenticatedPage` fixture.
- Q4 — email from the environment; greeting format as product text.
- Q5 / Q13 — one numbered step.
- Q6 — "signed-in greeting" → exact text `Hi {email}!`.

**Automation handoff (M4)**

```yaml
tc: TC3
title: Show the signed-in user's greeting on the landing page
spec: tests/ui/smoke/home/TC3-home-user-greeting.spec.ts
suite: smoke
tags: ['@smoke', '@read-only']
automation: automatable
fixtures:
  identity: users.appUser          # shared read-only account from Env
  page: homePage                   # depends on authenticatedPage
data:
  - { name: email, class: secret, source: env }
steps:
  - action: read greeting
    oracle: greeting text = "Hi {email}!"
postconditions:
  - none (browser context discarded)
```

### TC4: Show the user menu button to a signed-in user

| Field | Value |
|-------|-------|
| Requirement / AC | GAD-HOME · AC2: a signed-in user has a user menu in the header |
| Objective | Prove that the signed-in header offers the menu that leads to profile and logout |
| Priority | Medium |
| Suite | smoke |
| Type | positive |
| Tags | `@smoke` · `@read-only` |
| Automation | Automatable |
| Spec | `tests/ui/smoke/home/TC4-home-user-menu.spec.ts` |

**Preconditions**

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | A GAD account exists | Environment (as TC1) | shared read-only |
| P2 | The user is signed in and on `/welcome` | UI — fixture `authenticatedPage` → `homePage` | test |

**Test data**

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| — | No input data: the button is icon-only (no text label), verified against GAD 2.9.0 | — | — |

**Steps**

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | Look at the header on `/welcome` | Exactly 1 user menu button (`btn-dropdown`) is visible, with role `button` |

**Postconditions**

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| A session exists only in this test's browser context | None needed | test |

**Risks / notes** — The button has no text, so "visible, one element, role button" is the exact
observable result; a presence check is correct here (Q6 applies only when a value is knowable).

**Change log (M2, 2026-11-25)**

- Q1 / Q2 / Q12 — metadata, objective and automation decision added.
- Q3 — "signed-in" made a precondition provisioned by the fixture.
- Q4 — data table states there is no input data and why.
- Q5 / Q13 — one numbered step.
- Q6 — oracle made exact: one element, visible, role `button` (it has no text to compare).

**Automation handoff (M4)**

```yaml
tc: TC4
title: Show the user menu button to a signed-in user
spec: tests/ui/smoke/home/TC4-home-user-menu.spec.ts
suite: smoke
tags: ['@smoke', '@read-only']
automation: automatable
fixtures:
  identity: users.appUser
  page: homePage
steps:
  - action: read header
    oracle: userMenuButton count = 1, visible, role button
postconditions:
  - none (browser context discarded)
```
