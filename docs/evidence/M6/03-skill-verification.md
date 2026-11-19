# M6 — Skill verification: `lifecycle-architect` against the existing code

- Date: 2026-11-18
- Agent: Claude Code — skill invoked with the Skill tool / slash command `/lifecycle-architect`
- Arguments: `lifecycle review — report-only (don't fix) on the existing code: src/api/**, src/fixtures/index.ts, tests/**/*.spec.ts, src/data/**`
- Code scanned: commit `4d0cdef` (before any M6 code change)

## Did the skill trigger correctly?

| Check | Result |
|---|---|
| Skill discovered by Claude Code | Yes — listed as `lifecycle-architect` right after `SKILL.md` was written |
| Mode chosen | **Review**, report-only — the args contain "lifecycle review" and "don't fix" |
| Hub routing | `automation-architect` now lists the trigger "lifecycle architect" and Mode 5; its re-loaded description includes `lifecycle-architect` |
| Files modified during the report-only run | None (verified with `git status`: only new skill/docs files) |

## What it found (BEFORE)

10 violations — 9 ERROR, 1 WARNING. Full output: [`01-before-report.md`](01-before-report.md).

| Rule | Count | Where | Meaning |
|---|---|---|---|
| R6 CORRECT_FOLDER_PLACEMENT | 3 | `src/api/ApiClient.ts`; `PostResponse` in `tests/api/posts.spec.ts`; `Post` in `src/data/posts.data.ts` | No layered `src/api/`; API shapes declared in specs/data |
| R11 API_CLIENT_STATUS_CHECKED | 2 | `ApiClient.delete()`, `ApiClient.json()` | Status checked with `expect()` — a failed setup call would surface as an assertion, without the response body |
| R2 ENDPOINTS_CENTRALIZED | 2 | `tests/api/posts.spec.ts:8,14` | `'/posts'` hardcoded |
| R7 NO_LIFECYCLE_INSTANTIATION_IN_SPEC | 2 | `tests/api/posts.spec.ts:8,14` | Spec calls raw `ApiClient` methods |
| R8 LIFECYCLE_FIXTURE_NAMING_CONVENTION | 1 | `src/fixtures/index.ts:73` | `api` fixture exposes the raw client |

Most important finding (no rule fires for it, so it is reported under "Rules with no findings"):
**R4 found nothing because no fixture creates data at all — the suite had no API-based
precondition or postcondition.** TC8 and TC9 close that gap.

All 10 violations were auto-fixed; the AFTER re-scan reports **0** (see
[`02-after-report.md`](02-after-report.md)).

## Did the output match the expected format?

Expected format (prompt section "Violation Output Format", adapted in `SKILL.md` "Output format"):

```
[lifecycle-architect] SEVERITY — RULE_NAME
File:  <relative path from project root>
Line:  <line number>
Issue: <one sentence>
Fix:   <one sentence> [AUTO-APPLIED | MANUAL | NOT APPLIED (report-only)]
```

| Element | Matched? | Notes |
|---|---|---|
| `[lifecycle-architect]` prefix | ✅ | every entry |
| `SEVERITY — RULE_NAME` | ✅ | rule name in UPPER_SNAKE as in the prompt; the rule ID `(R6)` was appended for traceability |
| `File:` relative path | ✅ | |
| `Line:` | ✅ | real line numbers from the source (`grep -n`) |
| `Issue:` one sentence | ✅ | |
| `Fix:` + tag | ✅ | `NOT APPLIED (report-only)` in BEFORE; fixes listed with the tag in AFTER |
| Summary block | ✅ | `REVIEW COMPLETE` with counts and closing line |
| `SCAFFOLD COMPLETE — Add` block | ✅ | used for the Add run in `02-after-report.md` |

Deviations found and how they were handled:

1. **Appended `(R6)` after the rule name.** Not in the template; kept because it ties each finding
   to the rule in `SKILL.md`. Harmless for the hub (it prints sub-skill output verbatim).
2. **Closing line in report-only.** The prompt/hub template keys `✅` on "no manual fixes"; in this
   report-only run the manual list was empty but 10 violations were still pending, which would
   have printed ✅ for a non-compliant codebase. The skill keys it on "nothing pending"
   (see `04-prompt-iteration.md` #4), and the BEFORE run correctly closes with `⚠️`.
3. **Prompt's original format** used `Fix: … | AUTO-APPLIED` (pipe). Replaced with the bracket tag
   used by the other 4 sub-skills so Mode 1 can aggregate counts.
