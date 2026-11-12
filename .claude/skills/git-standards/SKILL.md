---
name: git-standards
description: 'Enforce and execute git workflow conventions for Playwright + TypeScript projects. Two capabilities: Validate (read-only check of branch name, commit format, feat/fix coverage, README sync) and Execute (create branch, commit, push, open PR following conventions). Triggers: "check git", "verify commits", "git conventions", "pre-PR check", "create branch", "commit", "push", "create PR", "git workflow", "submit work". Load independently for any git task or through automation-architect Mode 4.'
---

# git-standards

Owns the **git workflow conventions** of this project. It is independent of `pom-architect`,
`test-standards` and `spec-standards` (code rules) — this skill only looks at branches, commits,
pushes and pull requests.

---

## Project context

- Branch naming pattern: `(test|fix)/<kebab-case-scope>`
  - `test/` — new test case additions
  - `fix/` — defect corrections
- Commit subjects follow Conventional Commits: `type(scope): description`
  - Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`
  - Scope is optional; when present it must be kebab-case
  - Description starts with lowercase, no period at the end
  - Only the **subject line** is validated; the body and trailers (e.g. `Co-Authored-By:`) are free.
- Every branch must contain at least one `feat` or `fix` commit before merging.
- PR target branch is always `main`; never push work directly to `main`.
  (The one-time baseline commit that creates `main` in a brand-new repository is the only exception.)
- Use the `gh` CLI for PR creation.
- Stage specific files only — never `git add .` or `git add -A`.
- Never force-push, never skip hooks (`--no-verify`).
- Base ref for comparisons: `origin/main` when the remote exists, otherwise local `main`.

---

## Capability 1 — Validate (read-only)

**Triggers:** "check git" · "verify commits" · "git conventions" · "pre-PR check"

Reads the current git state and reports violations. Never modifies commits, branches or files.

### C1 — COMMIT_FORMAT (ERROR)

Condition: a commit subject on the branch does not match

```
^(feat|fix|refactor|chore|docs)(\([a-z0-9][a-z0-9-]*\))?: [a-z].+[^.]$
```

How to get the commits:

```bash
git log origin/main..HEAD --format="%s"
# fallback when there is no remote yet:
git log main..HEAD --format="%s"
```

```
feat(tc8): add products page verification          ✅
fix(login): correct redirect after logout          ✅
chore: update playwright version                   ✅
docs(readme): add setup instructions               ✅
refactor(products): extract search method to po    ✅

Added products test                                ❌  no type
feat: Added products test                          ❌  uppercase in description
fix: correct redirect after logout.                ❌  ends with period
Feature(tc8): add products page                    ❌  type not lowercase
```

### C2 — BRANCH_NAME (ERROR)

Condition: `git branch --show-current` does not match `^(test|fix)/[a-z0-9][a-z0-9-]*$`.

```
test/tc8-verify-products        ✅
fix/tc3-incorrect-credentials   ✅
feature/products                ❌  prefix not allowed
test/TC8_VerifyProducts         ❌  uppercase and underscore
main                            ❌  no prefix (work must happen on a branch)
fix/                            ❌  empty scope
```

### C3 — SUBSTANTIVE_COMMIT (ERROR)

Condition: the branch has no commit of type `feat` or `fix`. A branch with only `chore`, `docs` or
`refactor` commits cannot be merged until it contains at least one `feat` or `fix`.

### C4 — README_SYNC (WARNING)

Condition: the branch modified architectural files but `README.md` was **not** modified.

Architectural files:

```
.claude/skills/**
playwright.config.ts
package.json
tsconfig.json
src/ui/pages/BasePage.ts
src/fixtures/index.ts
```

How to check:

```bash
git diff origin/main...HEAD --name-only   # fallback: git diff main...HEAD --name-only
```

Fix guidance: update the README sections that describe structure, skills, scripts or conventions
(this project has no README-sync mode yet; adding one requires an ADR — see the hub's growth policy).
This is a WARNING: the developer decides whether the change is significant enough to document.

### Validate output format

```
[git-standards] VALIDATE
──────────────────────────────────────
Branch name:      PASS | VIOLATION — <detail>
Commit format:    <N> valid / <N> invalid
  VIOLATION: "<raw subject>"
             — expected: type(scope): description
             — allowed types: feat, fix, refactor, chore, docs
Commit coverage:  PASS | VIOLATION — no feat or fix commit found on this branch
README sync:      IN SYNC | WARNING — architectural files changed but README.md was not modified
──────────────────────────────────────
[git-standards] ✅ Conventions valid — ready to push / open PR.
             OR
[git-standards] ⚠️  <N> issue(s) found — resolve before proceeding.
```

Fix guidance (printed when violations exist):

| Violation | Command |
|---|---|
| Bad branch name | `git branch -m <new-name>` |
| Bad last commit subject (not pushed) | `git commit --amend -m "type(scope): description"` |
| Bad older commit subject | interactive rebase (`reword`) — **MANUAL**: the agent cannot run interactive git commands; the user runs it in their own terminal |
| No feat or fix commit | Add a `feat` or `fix` commit before pushing |

If the folder is not a git repository at all, print `Branch name: VIOLATION — not a git repository`
and stop; suggest `git init -b main` plus a baseline commit.

---

## Capability 2 — Execute (write operations)

Always run Validate first; stop and report if it fails (C4 warnings do not block).

Safety rules (non-negotiable):

- Never push to `main` / `master` directly (except the baseline commit of a brand-new repo,
  and only after the user confirms).
- Never use `--force` / `--force-with-lease` without explicit user confirmation.
- Never use `--no-verify`.
- Never amend a commit that is already on the remote.
- Always stage specific files — never `git add .` / `git add -A`.
- Pushing and opening a PR are outward-facing: confirm with the user before the first push of a
  session unless they already asked for it in the same request.

### E1 — Create branch

Triggers: "create branch" · "new branch" · "start branch"

1. Infer or ask: type (`test` / `fix`) and kebab-case scope.
2. Build `{type}/{scope}`, validate against C2.
3. `git checkout -b {type}/{scope}`

Output: `[git-standards] BRANCH CREATED` / `Branch: <name>`

### E2 — Commit

Triggers: "commit" · "git commit" · "create commit"

1. Validate C2 — stop if it fails.
2. `git status` to list changes.
3. Infer or ask: files to stage (explicit list), type, scope, description.
4. Build `{type}({scope}): {description}` and validate against C1.
5. `git add <file1> <file2> …` then `git commit -m "<subject>"` (add a body / trailers with extra `-m`).

Output: `[git-standards] COMMIT CREATED` / `Message:` / `Files staged:`

### E3 — Push

Triggers: "push" · "git push" · "push branch"

1. Full Validate — stop on any ERROR.
2. `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
3. No upstream → `git push -u origin <branch>`; upstream exists → `git push`.

Output: `[git-standards] PUSHED` / `Branch: <branch> → origin/<branch>`

### E4 — Create PR

Triggers: "create PR" · "open PR" · "pull request" · "new PR"

1. Full Validate — stop on any ERROR.
2. Title: the last `feat`/`fix` subject. TC list: `test()` names in changed spec files.
   Changed files: `git diff origin/main...HEAD --name-only`.
3. `gh pr create --base main --title "<title>" --body-file <tmp file>` with this body:

```markdown
## Summary
<derived from feat/fix commits>

## Test Cases
<TC{N}: names from changed spec files>

## Changes
<new or modified files>

## Checklist
- [ ] All tests pass locally
- [ ] No hardcoded credentials
- [ ] Spec files follow TC folder/naming conventions
- [ ] Page Objects follow POM rules
```

Output: `[git-standards] PR CREATED` / `Title:` / `URL:`

### E5 — Full workflow

Triggers: "git workflow" · "commit push PR" · "full git" · "submit work"

Validate → E2 → E3 → E4, then:

```
[git-standards] WORKFLOW COMPLETE
──────────────────────────────────────
Committed:  <subject>
Pushed:     <branch> → origin
PR:         <url>
──────────────────────────────────────
[git-standards] ✅ Work submitted — ready for review.
```
