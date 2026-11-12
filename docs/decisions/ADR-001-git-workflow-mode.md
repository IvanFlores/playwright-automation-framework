# ADR-001 — Add Mode 4 (Git workflow) to automation-architect

- Status: Accepted
- Date: 2026-11-11
- Module: M5 — Dev Lifecycle & Team Practices

## Context (the gap)

The hub had three modes, all about code:

| Mode | Looks at | Covers git? |
|---|---|---|
| 1 — Full pipeline | Page Objects, fixtures, specs | No — reads source files only |
| 2 — Structure only | Folder placement, import style | No |
| 3 — Scaffold | Generates PO + fixture + spec | No |

None of them reads git state (branch name, commit subjects, which files a branch changed), so
nothing could detect a badly named branch, a non-conventional commit, a branch with no `feat`/`fix`
commit, or an architectural change without a README update.

## Options considered

1. **Extend Mode 1** with git checks — rejected: Mode 1 is "detect + auto-fix code"; git checks are
   read-only on a different domain (Growth Policy Rule 3, one domain per mode) and auto-fixing
   commits (rewriting history) is unsafe.
2. **Extend Mode 2** — rejected for the same reason; Mode 2 is folder/import structure.
3. **New independent skill `git-standards` + thin Mode 4 in the hub** — accepted. The rules live in one
   place (`.claude/skills/git-standards/SKILL.md`); the hub only routes to it, so the hub does not grow
   with git details.

## Decision

Create `git-standards` (Validate C1–C4, Execute E1–E5) and add Mode 4 as a wrapper that loads it and
forwards its output verbatim. Mode total becomes 4 / 10.

`spec-standards` was added in the same module as a **sub-skill of Mode 1** (not a new mode): it
detects spec organisation problems in the same files Mode 1 already scans, so no new mode was needed.

## Consequences

- `git-standards` can be used alone ("check git") or through the hub.
- C4 (README sync) refers to manual README updates; a README-sync mode would need its own ADR.
