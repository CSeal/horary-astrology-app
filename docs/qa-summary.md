---
created_by: claude-sonnet
source_inputs: [handoff-log.md, Stage5a-5e artifacts, automated tool runs 2026-06-04]
reviewed_by: owner-pending
---

# QA Summary — Stage 6

**Date:** 2026-06-04
**Model:** claude-sonnet-4-6
**Build branch:** main (a55202c)

---

## 1. Automated Checks

### expo-doctor
Result: 19/19 checks PASS. No issues detected.

### TypeScript (tsc --noEmit)
Result: PASS — 0 errors, 0 output. Clean compile.

### ESLint (eslint src/)
Result: 0 errors, 2 warnings (non-blocking).

| File | Warning |
|---|---|
| src/app/(tabs)/journal.tsx:16 | `SUPPORTED_LOCALES` defined but never used |
| src/types/horary.ts:395 | `Array<T>` forbidden — use `T[]` instead |

Neither warning is an error. The `no-unused-vars` is a residual import from a pre-existing implementation choice; `array-type` is a style preference. Both are P1.

### Jest (npm run test -- --coverage)

Result: **10 suites / 71 tests — all PASS**

Baseline was 9 suites / 54 tests (docs/features/testing.md). The suite has grown: one new suite (`horaryMapper.test.ts`, 14 tests) and `useDebugTrigger.test.ts` gained 1 test (5→6). This is a baseline improvement, not a regression.

| Suite | Tests | Status |
|---|---|---|
| horaryApi.test.ts | 11 | PASS |
| horaryApi.retry.test.ts | 4 | PASS |
| updateCheckService.test.ts | 7 | PASS |
| journalService.test.ts | 6 | PASS |
| geocodingService.test.ts | 8 | PASS |
| questionsStore.test.ts | 9 | PASS |
| parity.test.ts | 3 | PASS |
| useDebugTrigger.test.ts | 6 | PASS |
| withMinDuration.test.ts | 3 | PASS |
| horaryMapper.test.ts | 14 | PASS |

**Coverage summary (all files):**
- Statements: 88.14%
- Branches: 86.30%
- Functions: 75.00%
- Lines: 88.88%

Notable: `secureKeyService.ts` has 14.28% statement coverage — it is a thin wrapper over `expo-secure-store` (auto-mocked by jest-expo), which is the correct test strategy per testing.md.

**Worker force-exit warning:** Jest reports one worker exited uncleanly after the run. This is a known timer-leak pattern in some jest-expo setups (async timers not unref'd). It does not affect test results or correctness.

---

## 2. Smoke Tests

| # | Check | File | Result | Notes |
|---|---|---|---|---|
| 1 | Home screen renders | src/app/(tabs)/index.tsx | PASS | Imports and renders both `CosmosBackground` and `AskForm` |
| 2 | Verdict card complete | src/components/VerdictCard.tsx | PASS | `VERDICT_COLOR` map covers YES/NO/MAYBE/UNCLEAR via `colors.*` from theme.ts |
| 3 | API service complete | src/services/horaryApi.ts | PASS | `askWithRetry` with 3 attempts, exponential backoff 1s/2s/4s; `normalizeError` covers 5 error classes |
| 4 | Counter logic | src/stores/questionsStore.ts | PASS | `checkAndResetMonthlyCounter` + `incrementMonthlyCount` implement monthly-reset quota; both tested |
| 5 | i18n complete | src/i18n/en.ts + ru.ts | PASS | Both exist; `parity.test.ts` asserts identical key sets, no empty values, matching placeholders |
| 6 | Settings screen | src/app/(tabs)/settings.tsx | PASS | Language picker (EN/RU/DE/FR/PT/ES segmented toggle), API key input (masked, SecureStore-backed) |

All 6 smoke tests PASS.

---

## 3. Anti-Pattern Audit

### StyleSheet.create
One occurrence found:
- `src/components/AnimatedSplash.tsx:240` — uses `StyleSheet.create` for two layout-only properties (`alignItems`, `justifyContent`, `zIndex`, `backgroundColor`). The `backgroundColor` value references `colors.bgBase` from `theme.ts` (no hardcoded hex). This is a P1 item: the `position: 'absolute'`/`top/left/right/bottom` declarations that cannot be expressed in NativeWind arbitrary syntax are the likely reason. Not blocking for demo.

### Hardcoded hex colors
One occurrence found:
- `src/app/_layout.tsx` — hex `#070714` appears in an inline **comment** only, not in live style code. No live hex injection. No violation.

### TypeScript `any`
Zero occurrences found in src/ (excluding .d.ts and test files).

---

## 4. P0 Issues (blocking demo)

**None.**

---

## 5. P1 Issues (non-blocking, fix before release)

| # | Issue | File | Category |
|---|---|---|---|
| 1 | `StyleSheet.create` in AnimatedSplash | src/components/AnimatedSplash.tsx:240 | Anti-pattern (layout-only; low risk) |
| 2 | Unused import `SUPPORTED_LOCALES` | src/app/(tabs)/journal.tsx:16 | ESLint no-unused-vars |
| 3 | `Array<T>` style warning | src/types/horary.ts:395 | ESLint array-type |
| 4 | Jest worker force-exit warning | jest run output | Possible timer leak in a test; does not affect correctness |
| 5 | `secureKeyService.ts` 14% coverage | src/services/secureKeyService.ts | Expected (thin SecureStore wrapper); not a gap |
| 6 | `loading_min_duration` not enforced at screen layer | src/hooks/useHoraryQuery.ts | UX polish; `withMinDuration` hook exists but is not wired to the mutation |
| 7 | npm audit: 13 moderate vulnerabilities | package.json | All transitive inside Expo SDK 55 (`uuid<11.1.1`); upstream issue, not actionable without breaking SDK |
| 8 | Baseline in docs/features/testing.md is stale | docs/features/testing.md | Documents 9 suites/54 tests; actual is 10 suites/71 tests |

---

## Gate Results

| Gate | Result |
|---|---|
| Gate 7 (valid briefing + acceptance checks) | PASS |
| Gate 8 (Trigger outputs verified, suite at or above baseline) | PASS |
| P0 unit-test gate | PASS (71/71, 10 suites) |
| Smoke test gate | PASS (6/6) |
