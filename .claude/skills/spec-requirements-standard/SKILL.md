---
name: spec-requirements-standard
description: 'Write, assess, and refine high-quality test case specifications for Playwright + TypeScript projects. Governs docs/test-cases/**: traceability, provisioned preconditions, classified test data, one action with an exact and deterministic expected result per step, postconditions, independence, coverage variants, and automation readiness. Produces the handoff consumed by spec-data-standard and by automation-architect Mode 3 / lifecycle-architect Add. Modes: M0 Assess (default, read-only), M1 Write, M2 Refine, M3 Coverage, M4 Automation Readiness. Triggers: "assess test cases", "tc spec review", "spec requirements", "write test case", "new tc spec", "spec from requirement", "refine test case", "improve tc", "make tc robust", "tc coverage", "derive negative cases", "traceability matrix", "automation readiness", "handoff tc", "ready to automate". Load before automating a TC, when writing TCs from requirements, when reviewing TC documents, or through automation-architect Mode 6.'
---

# spec-requirements-standard

Owns the **test case specification**: the document that states *what* a TC verifies, *from which
state*, *with which data*, *with which exact expected results*, and *how it leaves the system*. It is
written and validated **before** code exists.

| Lifecycle phase | Skill | Output |
|---|---|---|
| **1. Specify** | **`spec-requirements-standard`** | **TC specification + automation handoff** |
| 2. Arrange | `spec-data-standard` M1–M3 · `lifecycle-architect` | Isolated, typed, portable data; setup + teardown |
| 3. Act | `pom-architect` · `test-standards` · `spec-standards` | POM structure, fixtures, steps |
| 4. Assert | `spec-data-standard` M4 | Exact, descriptive assertions |
| 5. Run | `spec-data-standard` M5 | Evidence in parallel and per environment |

Phases are routed by `automation-architect` **Mode 6 — TC quality review** (ADR-003).

**Gap this skill fills:** `docs/test-cases/**` had no content owner. TCs were described by one README
row and a spec header comment; nobody checked that a TC is complete, deterministic, independent and
automatable.

---

## Project Context

- TC specifications live in `docs/test-cases/gad/{feature}-test-cases.md` (one file per feature, one
  `###` section per TC). The README "Test cases" table is only the index.
- Current scope: **TC8** (`articles-test-cases.md`) and **TC9** (`comments-test-cases.md`). TC1–TC7
  have no specification document yet — report them as `not migrated`, never as violations.
- A specification is **ready** when another engineer (or an agent) can automate it without asking a
  single question.
- **Oracle**: the exact expected result a step is compared against. A step without an exact,
  deterministic, and verifiable oracle is not a test step.
- **Captured value**: a value read or created during the test and reused later. Name it with braces
  (`{articleTitle}`) instead of referring to "the value from step N".
- Steps use **relative paths** (`/articles.html`). The base URL comes from `BASE_URL` (`Env.baseUrl`).
- Data classes (shared with `spec-data-standard`): Reference · Environment · Transactional · Secret ·
  Simulated.
- When a TC exists only as an older description, M0 scores it **as-is** (marked
  `<!-- as-was: M6 -->`). Never rewrite before the baseline is recorded.

### Domain coordination

| Concern | Owner | Interaction |
|---|---|---|
| Phase routing | `automation-architect` Mode 6 | Invokes this skill as phase 1 |
| Test data implementation | `spec-data-standard` | Consumes the M4 handoff `data` and `fixtures` blocks |
| Code generation | `automation-architect` Mode 3 · `lifecycle-architect` Add | Consume the M4 handoff `steps` / `fixtures` |
| TC ID format in code | `spec-standards` R3 | Same `TC{N}` ID in doc and spec |
| Suite folder / tag | `spec-standards` R1 | `Suite` field = folder `tests/ui/{suite}/` |

---

## TC specification template

Every TC section follows this template. Fields marked * are mandatory.

````markdown
### TC{N}: <Imperative title> *

| Field | Value |
|-------|-------|
| Requirement / AC * | <REQ-ID> · <acceptance criterion it verifies> |
| Objective * | <one sentence: behaviour verified and why it matters> |
| Priority * | High · Medium · Low |
| Suite * | smoke · regression |
| Type * | positive · negative · boundary · data-driven |
| Tags | `@mutates-data` · `@read-only` · `@env:<name>` |
| Automation * | Automatable · Partial (<reason + workaround>) · Manual (<reason>) |
| Spec | `tests/ui/{suite}/{feature}/TC{N}-<name>.spec.ts` |

**Preconditions** *

| # | State | Provisioned by | Scope |
|---|-------|----------------|-------|
| P1 | <exact state> | API · fixture · mock · UI | test · worker · shared read-only |

**Test data** *

| Item | Value or generation rule | Class | Source |
|------|--------------------------|-------|--------|
| <name> | <exact value / `qa_` + unique suffix / first entry from API> | Reference · Transactional · … | dataset · factory · discovery · mock · env |

**Steps** *

| # | Action | Expected result (oracle) |
|---|--------|--------------------------|
| 1 | <one user action> | <exact, deterministic, verifiable result> |

**Postconditions** *

| State after the test | Cleanup | Scope |
|----------------------|---------|-------|
| <final state> | <what is removed and how> | only data created by this TC |

**Risks / notes** — parallel, environment, or product constraints (optional)
````

---

## Modes

**M0 is the default** when no mode is specified. "check / review only / don't fix" → report-only in
every mode: no file is modified and every fix is tagged `NOT APPLIED (report-only)`.

### M0 — Assess (read-only)

Triggers: "assess test cases" · "tc spec review" · "spec requirements"

1. Discover `docs/test-cases/**/*.md` and split into TC sections (`### TC{N}`).
2. Apply Q1–Q13 to each TC. A rule that cannot apply (e.g. Q9 on a TC that changes no data, declared
   `@read-only`) is **N/A** and is removed from the total weight; say which rules were N/A.
3. Score each TC: `score = 100 × passed weight / total weight` (ERROR = 3, WARNING = 1).
4. Grade: **Ready** ≥ 90 and no ERROR failed · **Needs refinement** 60–89 (or ≥ 90 with an ERROR
   failed) · **Incomplete** < 60.
5. Print one violation block per failed rule, then the summary. Do NOT modify files.

```
[spec-requirements-standard] ASSESSMENT
─────────────────────────────────────────
File: docs/test-cases/gad/<feature>-test-cases.md
TC8   <score>%  <grade>   top gaps: Q4, Q6, Q12
TC9   <score>%  <grade>   top gaps: Q3, Q9, Q13
Not migrated: TC1–TC7
Average: <score>%   Ready: <n>/<total>
Most frequent gaps: Q6 (<n>) · Q9 (<n>) · Q3 (<n>)
Recommended next mode: M2 on <lowest-score TC>
```

### M1 — Write

Triggers: "write test case" · "new tc spec" · "spec from requirement"

Step 0 — Collect (infer from context; ask only for missing items): requirement or user story,
acceptance criteria, feature, and known business rules.

1. One TC per acceptance criterion (more if M3 derives variants).
2. Fill the template; mark every unknown value as `TBD: <question>` (never invent an oracle).
3. Run Q1–Q13 on the result; a TC with `TBD` cannot be graded **Ready**.
4. Append to `docs/test-cases/gad/{feature}-test-cases.md` with the next free `TC{N}` and add the
   README index row.

### M2 — Refine

Triggers: "refine test case" · "improve tc" · "make tc robust"

1. Run M0 on the target TC to get the baseline score (keep the M0 output for the evidence).
2. Rewrite it in the template, fixing each failed rule. Values that only the product can confirm
   (exact texts, ids) are verified against the running app or its API before they become an oracle;
   if they cannot be verified → `TBD:`.
3. Keep the TC ID; preserve the original intent. If the intent itself is untestable, propose a split
   and flag it, never silently change scope.
4. Add a **Change log** under the TC: `Qn — <what changed and why>`.
5. Re-run M0 and report `before → after`.

```
[spec-requirements-standard] REFINED — TC{N}
Score: <before>% → <after>%   Grade: <before> → <after>
Changes: Q3 provisioning added · Q6 exact oracle · Q9 postcondition · Q13 step refs fixed
Open questions: <TBD list or "none">
```

### M3 — Coverage

Triggers: "tc coverage" · "derive negative cases" · "traceability matrix"

Techniques: equivalence partitioning · boundary values · state transitions (create → read → update →
delete) · role/auth variants (anonymous, owner, other user) · error guessing · data-driven rows.

1. Build the traceability matrix: requirement/AC × TC.
2. For each AC, list the missing variants by technique.
3. Variants that differ only in data become **one data-driven TC** with a dataset table.
4. Write new TCs through M1 (only when asked; by default M3 proposes).

```
[spec-requirements-standard] COVERAGE
REQ / AC          positive  negative  boundary  auth   data-driven
<REQ-1 · AC1>     TC8       —         —         —      —
Missing: <n> variants → proposed TC<N>…TC<M>
```

### M4 — Automation Readiness

Triggers: "automation readiness" · "handoff tc" · "ready to automate"

Precondition: the TC is graded **Ready** (M0 ≥ 90, no ERROR failed, no `TBD`).

1. Confirm the automation decision (Q12). For `Partial`, describe the workaround.
2. Map each precondition to a fixture type: `worker<Resource>` · `created<Resource>` ·
   `clean<Resource>` · `mock<Resource>` · `<resource>Controller` · page fixture.
3. Map each data item to a `spec-data-standard` strategy (M1 isolation table, M4 source table).
4. Emit the handoff block and append it under the TC (`**Automation handoff**`).

```yaml
tc: TC{N}
title: <title>
spec: tests/ui/<suite>/<feature>/TC{N}-<name>.spec.ts
suite: smoke
tags: ['@smoke', '@mutates-data']
automation: automatable
fixtures:
  identity: worker<Resource>        # isolation strategy (spec-data-standard M1)
  state: created<Resource>          # setup + postcondition owner (lifecycle-architect R4)
  page: <pageFixture>
data:
  - name: articleTitle
    class: transactional
    source: factory                 # buildArticle() — prefix + unique suffix
captured: [articleTitle]
steps:
  - action: open /articles.html
    oracle: <exact result>
postconditions:
  - only data created by this TC is removed
```

---

## Rules

Severity: **ERROR** (weight 3) blocks *Ready*; **WARNING** (weight 1) lowers the score.

| ID | Rule | Sev. | Condition (violation) | Fix |
|----|------|------|-----------------------|-----|
| Q1 | `TC_METADATA_COMPLETE` | ERROR | Missing requirement/AC, priority, suite, type, or automation field | Fill the field; unknown → `TBD:` |
| Q2 | `OBJECTIVE_STATED` | WARNING | No one-sentence objective, or the objective repeats the title | State behaviour and value |
| Q3 | `PRECONDITIONS_PROVISIONED` | ERROR | A precondition has no "provisioned by" or no scope ("user is logged in") | Add method (API/fixture/mock/UI) and scope |
| Q4 | `TEST_DATA_DECLARED` | ERROR | Values inline in steps, marked "e.g.", static values for unique fields, or secrets written in clear | Move to the data table with class and source; unique → generation rule; secrets → env reference |
| Q5 | `ONE_ACTION_PER_STEP` | WARNING | A step has several actions, or an action has no expected result | Split; one action, one oracle |
| Q6 | `EXACT_ORACLE` | ERROR | Oracle checks presence only ("visible", "non-empty", "at least one", "contains") when a value is knowable | State the exact value or the data item it equals |
| Q7 | `DETERMINISTIC_ORACLE` | ERROR | Oracle contains "or", "e.g.", "should", "some", "any", or another alternative outcome | Choose the single correct outcome; if unknown → `TBD:` |
| Q8 | `VERIFIABLE_ORACLE` | ERROR | Oracle needs a reference that does not exist ("only that article" without a unique, known title) | Add the reference: dataset, mock, created data, or API discovery |
| Q9 | `POSTCONDITIONS_DEFINED` | ERROR | TC creates, changes, or deletes data and no postcondition or cleanup scope is stated | Add the final state and scoped cleanup |
| Q10 | `INDEPENDENT_TC` | ERROR | TC relies on data or state produced by another TC, or on an identity/data shared with TCs running in parallel | Provision via precondition; isolate mutating TCs (own identity) |
| Q11 | `ENV_AGNOSTIC_STEPS` | WARNING | Absolute URLs, hosts, or environment IDs in steps | Relative paths; env values in the data table (class Environment) |
| Q12 | `AUTOMATION_DECISION` | WARNING | No automation decision, or "manually or via workaround" without a defined workaround | Automatable / Partial (workaround) / Manual (reason) |
| Q13 | `STEP_REFERENCES_VALID` | ERROR | Gaps in step numbering, broken formatting, no numbered steps at all, or "value from step N" pointing to the wrong step | Renumber; use captured values `{name}` |

**Example — before (fails Q4, Q6, Q7, Q11):**

```markdown
3. Enter a unique title (e.g., `Article 01`).
9. Assert the article is visible or the list is not empty on http://localhost:3001/articles.html.
```

**Example — after:**

```markdown
| Item | Value or generation rule | Class | Source |
| articleTitle | `qa_` + `article ` + unique suffix | Transactional | factory |

| 3 | Search `{articleTitle}` | Exactly 1 title rendered, text = `{articleTitle}` |
```

---

## Violation Output Format

```
[spec-requirements-standard] SEVERITY — RULE_NAME (Qn)
File:  docs/test-cases/gad/<feature>-test-cases.md
TC:    TC{N} · step <n> (if applicable)
Issue: <one sentence describing the problem>
Fix:   <one sentence describing the fix> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

Q13 numbering and formatting fixes are AUTO-APPLIED. All other rules are applied by M2 with a change
log, because they change the TC meaning (`MANUAL` in M0).

---

## Scan Scope

| File glob | Rules |
|---|---|
| `docs/test-cases/**/*.md` | Q1–Q13 |
| `tests/ui/**/TC{N}-*.spec.ts` | read only, to check that the doc and the spec agree on TC ID, suite and tags (reported as notes, not scored) |

---

## Quick checklist

- [ ] Every TC has requirement/AC, objective, priority, suite, type, automation (Q1, Q2, Q12)
- [ ] Every precondition says how it is provisioned and its scope (Q3)
- [ ] Every value lives in the data table with class and source; unique values have a rule (Q4)
- [ ] Each step: one action, one exact, single-outcome, verifiable oracle (Q5–Q8)
- [ ] Data-changing TCs state postconditions and scoped cleanup (Q9)
- [ ] No dependence on other TCs or on a shared mutable identity (Q10)
- [ ] Relative paths only; numbered steps with `{captured}` references (Q11, Q13)
