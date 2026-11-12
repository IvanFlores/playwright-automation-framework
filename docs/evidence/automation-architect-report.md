# automation-architect — Mode 1 (full review, report-only)

Date: 2026-11-06
Scope: tests/**/*.spec.ts, src/ui/**, src/fixtures/**, src/data/**, src/config/**, src/api/**

```
[pom-architect] 0 violations found — 0 auto-applied, 0 manual
[test-standards] 0 violations found — 0 auto-applied, 0 manual

[automation-architect] PIPELINE COMPLETE
─────────────────────────────────────────
pom-architect:    0 violations found — 0 auto-applied
test-standards:   0 violations found — 0 auto-applied
Remaining manual fixes: none
[automation-architect] ✅ All rules satisfied.
```

## pom-architect checklist
- [x] `src/ui/pages/BasePage.ts` exists with `navigate(path = '/')`
- [x] Every PO (`LoginPage`, `HomePage`) `extends BasePage`, no constructor, no `navigate()`
- [x] All locators are `get` properties (incl. `NavBar` component)
- [x] All interactions live in `async` PO methods (`openLoginForm()`, `login()`)
- [x] No `page.*` in spec bodies
- [x] No full URLs in `goto` / `navigate`
- [x] No `expect()` in POs or components
- [x] Files in the right folder
- [x] No hardcoded credentials or data in POs

## test-standards checklist
- [x] No relative imports in `src/` or `tests/`
- [x] Specs import `test` / `expect` from `@fixtures`
- [x] No `beforeEach` that creates or navigates Page Objects
- [x] Every PO has a fixture; `homePage` depends on `authenticatedPage`
- [x] `authenticatedPage` exists in `src/fixtures/index.ts`
- [x] Every `test()` inside `test.describe()` with behaviour-based names
- [x] No spec imports another spec
- [x] No hardcoded credentials in specs (`users.appUser` from `@data/auth.data`)
- [x] Only `@playwright/test` is used
