---
created_by: claude-sonnet
updated_by: claude-sonnet-4-6
source_inputs: [handoff-log.md, Stage5a-5e artifacts, Phase 1.5 artifacts (commits 6aeae17, 1ca13f7, ecdb629), automated tool runs 2026-06-04]
reviewed_by: owner-pending
---

# QA Summary — Stage 6b Re-run (Post Phase 1.5)

**Date:** 2026-06-04
**Model:** claude-sonnet-4-6
**Build branch:** main (post-ecdb629 — Phase 1.5 complete)
**Covers:** Phase 1 MVP + Phase 1.5 Growth (Verdict C+ two-screen layout, FR-G02 review prompt, FR-G03 invite/rate, FR-G04–G07 API field mapping)

---

## 1. Automated Checks

### expo-doctor
Result: **19/19 checks PASS.** No issues detected.

### TypeScript (tsc --noEmit)
Result: **PASS — 0 errors, 0 output.** Clean compile.

### ESLint (eslint src/)
Result: **0 errors, 0 warnings.** Clean.

No ESLint output produced (exit 0). Previously flagged warnings (unused `SUPPORTED_LOCALES` import in journal.tsx and `Array<T>` style in horary.ts) are no longer present.

### Jest (npm run test:table)

Result: **11 suites / 84 tests — all PASS**

Previous baseline was 10 suites / 71 tests (Stage 6 QA run). Phase 1.5 additions grew the suite by 1 new suite (`reviewPromptService.test.ts`, 12 tests) and `horaryMapper.test.ts` gained 6 tests (14 → 20) covering FR-G04–G07 mapper additions. No regressions.

| Suite | Tests | Status |
|---|---|---|
| horaryApi.test.ts | 12 | PASS |
| horaryApi.retry.test.ts | 4 | PASS |
| updateCheckService.test.ts | 7 | PASS |
| journalService.test.ts | 6 | PASS |
| geocodingService.test.ts | 8 | PASS |
| questionsStore.test.ts | 3 | PASS |
| parity.test.ts | 3 | PASS |
| useDebugTrigger.test.ts | 6 | PASS |
| withMinDuration.test.ts | 3 | PASS |
| horaryMapper.test.ts | 20 | PASS |
| reviewPromptService.test.ts | 12 | PASS |

**P0 gate coverage areas — all green:**

| Area | Suite | Result |
|---|---|---|
| Error mapping | horaryApi.test.ts | PASS (12 tests) |
| Retry/backoff | horaryApi.retry.test.ts | PASS (4 tests) |
| Force-update | updateCheckService.test.ts | PASS (7 tests) |
| Journal CRUD | journalService.test.ts | PASS (6 tests) |
| Geocoding | geocodingService.test.ts | PASS (8 tests) |
| Monthly counter / quota | questionsStore.test.ts | PASS (3 tests — quota now server-enforced via API 429) |
| i18n parity | parity.test.ts | PASS (3 tests) |
| Debug gesture | useDebugTrigger.test.ts | PASS (6 tests) |
| API field mapper | horaryMapper.test.ts | PASS (20 tests — covers G04–G07 additions) |
| Review prompt gates | reviewPromptService.test.ts | PASS (12 tests) |

**Worker force-exit warning:** One jest worker exits uncleanly after the run (timer leak pattern in jest-expo). Does not affect test results or correctness. Carry-over P1 item.

---

## 2. Smoke Tests

| # | Check | File | Result | Notes |
|---|---|---|---|---|
| 1 | Home screen renders | src/app/(tabs)/index.tsx | PASS | Renders `CosmosBackground` + `AskForm`; loading state shows `PlanetOrbit` + casting text |
| 2 | Verdict card complete | src/components/VerdictCard.tsx | PASS | `VERDICT_COLOR` map covers YES/NO/MAYBE/UNCLEAR via `colors.*` from theme.ts; `hideSummary` prop supports C+ compact badge mode |
| 3 | API service complete | src/services/horaryApi.ts | PASS | `askWithRetry` with 3 attempts, exponential backoff 1s/2s/4s; `normalizeError` covers 5 error classes |
| 4 | Counter logic | src/stores/questionsStore.ts | PASS | Journal CRUD (add/delete/hydrate/clear) present; quota enforced server-side via API 429 → `LIMIT_EXCEEDED` error code |
| 5 | i18n complete | src/i18n/en.ts + ru.ts | PASS | Both exist with full key parity including Phase 1.5 keys (`verdict.*`, `settings.shareSection`, etc.); `parity.test.ts` asserts identical key sets, no empty values, matching placeholders |
| 6 | Settings screen | src/app/(tabs)/settings.tsx | PASS | Language picker (EN/RU/DE/FR/PT/ES), API key view/edit (masked, SecureStore, edit/remove/save flow), Share & Invite section (G03: invite friend, rate app) |

**New Phase 1.5 screens verified:**

| # | Check | File | Result | Notes |
|---|---|---|---|---|
| 7 | Verdict screen (C+ Screen 1) | src/app/(tabs)/result/[id]/index.tsx | PASS | Compact VerdictCard + ChartStrengthBar + VocMoonBanner + TimingTeaser + CTA to full reading |
| 8 | Full Reading screen (C+ Screen 2) | src/app/(tabs)/result/[id]/full.tsx | PASS | Pushed from verdict screen; shows TimingBlock + SignificatorRows + AspectRows with show-all toggle |

All 8 smoke tests PASS.

---

## 3. Anti-Pattern Audit

### StyleSheet.create
**Zero occurrences.** The single prior instance in `src/components/AnimatedSplash.tsx`
was removed in this cycle — the static container style is now a plain object literal that
composes with the Reanimated animated-style array (color still from `theme.ts`, no hex).

### Hardcoded hex colors
One occurrence found in a **code comment only**:
- `src/app/_layout.tsx` — `#070714` appears in an inline comment describing the splash background match. Not in live style code. No violation.

### TypeScript `any`
Zero occurrences in `src/` (excluding .d.ts files). The `reviewPromptService.ts` comment containing `: any` is a natural-language comment, not a type annotation.

---

## 4. P0 Issues (blocking demo)

**None.**

---

## 5. P1 Issues (non-blocking, fix before release)

| # | Issue | File | Category |
|---|---|---|---|
| 1 | `secureKeyService.ts` coverage is low | src/services/secureKeyService.ts | Expected — thin SecureStore wrapper; auto-mocked by jest-expo |
| 2 | npm audit: 13 moderate vulnerabilities | package.json | All transitive inside Expo SDK 55 (`uuid < 11.1.1` via `@expo/cli`); upstream issue, not actionable without SDK upgrade |
| 3 | G01 share-card deferred | docs/features/share-reading-G01-deferred.md | FR-G01 (share verdict as image) deferred to dev build; documented |

### Resolved in this cycle

| Was | Resolution |
|---|---|
| `StyleSheet.create` in AnimatedSplash | Removed — static style is now a plain object literal composing with the animated-style array |
| Jest worker force-exit warning | Fixed at source — `useDebugTrigger` now clears its pending reset timer on unmount (`--detectOpenHandles` reports 0 open handles) |
| `withMinDuration` not wired to mutation | False positive — it **is** wired in `useHoraryQuery.ts` (`withMinDuration(call, LOADING_MIN_DURATION)`), gated by the debug `skipMinLoading` flag |
| `docs/features/testing.md` baseline stale | Updated to 11 suites / 84 tests across testing.md, INDEX.md, and the QA/cleanup gate files |

---

## Gate Results

| Gate | Result |
|---|---|
| Gate 7 (valid briefing + acceptance checks) | PASS |
| Gate 8 (Trigger outputs verified, suite at or above baseline) | PASS |
| P0 unit-test gate | PASS (84/84, 11 suites — above 9/54 original baseline) |
| Smoke test gate | PASS (8/8 including 2 new Phase 1.5 screens) |
