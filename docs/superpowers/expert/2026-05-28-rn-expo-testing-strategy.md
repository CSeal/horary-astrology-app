---
created_by: claude-opus (Compound V Phase 1B advisor)
updated_by: claude-opus
source_inputs: [CLAUDE.md, horary-domain-brief.md, web-search-2026-05-28, jest-expo-docs, tanstack-query-testing, zustand-persist-docs]
reviewed_by: owner-pending
---

# Domain Audit — RN/Expo Testing Strategy for AstraSk v1

Phase 1B domain audit. Scope: what to test before shipping a horary astrology app to App Store + Play Store on Expo SDK 55 / RN 0.83.6 / jest-expo (Jest 29). This audit answers the 8-part testing question and feeds non-negotiable design constraints to the test-plan author.

## 1. Domain(s) Identified

1. `rn-expo-testing` — Jest/jest-expo unit + integration, Detox/Maestro e2e for a production RN app.
2. `horary-domain` (cross-cut) — domain-specific data-integrity gaps unique to a chart-casting app (coordinates, timestamp, timezone, month/quota counters, verdict enum).

## 2. Sources Consulted

KB files present (none on testing — created this pass): `mobile-debug-mode.md`, `mobile-force-update.md`, `mobile-remote-config.md`. Domain brief reused: `horary-domain-brief.md`.

Web searches (2026-05-28, parallel batch):
- [Expo Unit Testing docs](https://docs.expo.dev/develop/unit-testing/), [jest-expo npm](https://www.npmjs.com/package/jest-expo)
- [RN Testing Guide 2026 (Maestro)](https://reactnativerelay.com/article/complete-guide-testing-react-native-apps-2026-unit-tests-e2e-maestro)
- [Detox vs Maestro vs Appium 2026 (PkgPulse)](https://www.pkgpulse.com/blog/detox-vs-maestro-vs-appium-react-native-e2e-testing-2026), [Maestro: detox-vs-maestro flakiness](https://maestro.dev/insights/detox-vs-maestro-reducing-flakiness-react-native)
- [Zustand persisting store data](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data), [Zustand how-to-reset-state](https://zustand.docs.pmnd.rs/guides/how-to-reset-state)
- [TanStack Query testing](https://tkdodo.eu/blog/testing-react-query), [TanStack testing guide](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks), [Testing Library fake timers](https://testing-library.com/docs/using-fake-timers/), [Fake-timer leakage (Mergify)](https://mergify.com/blog/fake-timer-leakage-in-jest/)
- [react-i18next testing](https://react.i18next.com/misc/testing), [i18next full-coverage test discussion #1848](https://github.com/i18next/i18next/discussions/1848)

## 3. Answers to the 8 Questions

### 1 — Highest-ROI test categories for this stack
Pure-logic **unit tests in Jest** are the top ROI: significator/verdict mapping, coordinate/timestamp/timezone builders, i18n parity, store reducers. They run in ms, no native bridge, no flake. Second: **integration tests** of hooks (`useHoraryQuery`, Zustand stores) via React Native Testing Library + a real (non-mocked) QueryClient with `retry:false`. Bottom tier: **e2e** — keep to 3-5 critical-path Maestro flows (ask -> verdict -> save journal). Maestro over Detox for v1: <1% flake, no testID instrumentation, no native build config, 8-12 min CI ([PkgPulse 2026](https://www.pkgpulse.com/blog/detox-vs-maestro-vs-appium-react-native-e2e-testing-2026)).

### 2 — Must-test before v1
API request builders (lat/lng precision, ISO-8601 UTC timestamp, IANA tz string); the `judgment`→VerdictBadge and `confidence_band`→ConfidencePill mappers including UNCLEAR/MAYBE branches; VOC-note logic; Zustand journal + quota stores (persist/rehydrate/reset); `useHoraryQuery` success+error+abort; i18n en/ru key parity; question length validation (240 warn / 500 cap); secure-store token read/write wrappers.

### 3 — NOT worth unit-testing in RN
Reanimated 4 worklets/animations (UI-thread, jsdom can't observe — cover visually or in e2e); navigation wiring (Expo Router file routes — assert nav side-effects in integration, don't test the router); native modules (expo-haptics, expo-location, expo-secure-store internals — mock the boundary, test YOUR wrapper not theirs); pure presentational components with no branching; snapshot tests of styled views (brittle, low signal).

### 4 — i18n parity test — yes, write it
High ROI, ~15 lines. Import `en` and `ru` objects, recursively flatten to dot-paths, assert `Set(enKeys) === Set(ruKeys)` (fail listing the diff both directions). Catches missing/orphaned keys at commit time — the #1 silent ru-locale shipping bug. Also assert no value is empty/equal-to-key (untranslated placeholder). Run in CI, not just locally ([i18next #1848](https://github.com/i18next/i18next/discussions/1848)).

### 5 — Zustand + AsyncStorage testing pattern
Mock AsyncStorage via `@react-native-async-storage/async-storage/jest/async-storage-mock`. Test the store factory's actions directly through `store.getState()` — no React render needed. Reset between tests with `store.setState(store.getInitialState(), true)` ([Zustand reset](https://zustand.docs.pmnd.rs/guides/how-to-reset-state)). For persist: hydration is async (microtask), so `await store.persist.rehydrate()` before asserting; use `store.persist.clearStorage()` in `afterEach`. Do not assert on AsyncStorage internals — assert on rehydrated state.

### 6 — React Query mutation testing without native network
Per-test `new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})` to kill the 3x exponential-backoff timeout ([tkdodo](https://tkdodo.eu/blog/testing-react-query)). Wrap `renderHook` in a `QueryClientProvider`. Mock the fetch layer (the API client module), NOT global fetch — keeps the test at your seam. Assert `result.current.isSuccess/isError` via `await waitFor`. Fresh QueryClient per test prevents cache bleed; `queryClient.clear()` in cleanup.

### 7 — Timing/async patterns
Use `jest.useFakeTimers()` + `await jest.advanceTimersByTimeAsync(ms)` (async variant flushes microtasks — prevents promise/timer deadlock that hangs debounce tests). Always `jest.clearAllTimers()` before `jest.useRealTimers()` in `afterEach` to stop fake-timer leakage between tests ([Mergify](https://mergify.com/blog/fake-timer-leakage-in-jest/)). For AbortController: trigger abort, assert the promise rejects with an `AbortError`/the request never resolves; assert React Query marks it cancelled, not errored. Rolling-window/quota counters: inject a clock (`Date.now` provider) — never assert against the real wall clock.

### 8 — Most dangerous horary-specific gaps
- **Coordinate corruption**: lat/lng swapped, truncated precision, or 0,0 fallback silently sent → wrong chart, wrong verdict. Test the request builder with boundary coords (negative lng, high-precision, missing GPS fallback path).
- **Timezone/timestamp drift**: device offset vs IANA string mismatch; casting on "began typing" not "submit" timestamp; DST boundary. Regiomontanus houses are tz/coord-sensitive — a 1° Ascendant shift flips radicality (3°-27° window) and the verdict.
- **Month/quota counter overflow**: free-question counter rollover at month boundary, double-decrement on retry/abort, UNCLEAR-not-counted rule (per brief §7). Test with injected clock across month edges.
- **Verdict rendering enum gaps**: UNCLEAR and MAYBE are NOT YES/NO — assert each renders its distinct UI state and never falls through to a YES/NO badge. Test an unknown/new enum value defaults safely, never crashes.

## 4. Common Traps in This Domain
- Fake-timer leakage across tests → mysterious flake in unrelated suites.
- Mocking global `fetch` instead of the API-client seam → tests pass while real client is broken.
- Sharing one QueryClient across tests → cache bleed, retry timeouts.
- Snapshot-testing animated/styled components → constant churn, zero bug-catching.
- Testing expo-location/haptics native internals instead of your wrapper → testing Expo, not your app.
- Asserting Zustand persist before async rehydration completes → false negatives.

## 5. Regulatory / Compliance Notes
No data-protection regulation forces a specific test suite, but two store-review risks are testable: (a) **expo-location** — App Store + Play Store reject if location is requested without a clear purpose string; assert the permission-request path fires only at/after first question submit (per brief §2), and that a denied-permission fallback to manual city exists and is tested. (b) Verdict copy is non-medical/non-financial fortune content — ensure no test fixture asserts deterministic real-world outcomes (liability framing is product copy, not a test concern, but flag for the human).

## 6. Recent Breaking Changes (last 12 months)
- **Reanimated 4**: `runOnJS` deprecated, single-owner SharedValue rule, no SharedValues in deps (per CLAUDE.md) — reinforces "don't unit-test worklets."
- **jest-expo / Jest**: project is pinned to Jest 29; the 2026 community guides target Jest 30 ([RN Testing Guide 2026](https://reactnativerelay.com/article/complete-guide-testing-react-native-apps-2026-unit-tests-e2e-maestro)). Verify any copied config against Jest 29 API (e.g., `advanceTimersByTimeAsync` exists in 29.5+ — confirm before relying on it).
- **Zustand 4.5.5** changed default persist behaviour ([discussion #2763](https://github.com/pmndrs/zustand/discussions/2763)) — pin/verify Zustand version before writing rehydration tests.
- **Detox/Maestro 2026**: Maestro now the default-recommended first e2e choice for new RN apps; Detox reserved for max-flakiness-reduction needs.

## 7. Design Constraints for the Plan (non-negotiable)
1. MUST split tests into three tiers: Jest unit (logic), RNTL integration (hooks/stores), Maestro e2e (≤5 critical flows). Do NOT use Detox for v1.
2. MUST unit-test the API request builder against boundary coordinates, ISO-8601 UTC timestamp, and IANA timezone string.
3. MUST cover all four `judgment` enum branches (YES/NO/MAYBE/UNCLEAR) plus an unknown-value safe default in the VerdictBadge mapper test.
4. MUST write an automated en/ru i18n key-parity test that fails CI on any key diff or empty value.
5. MUST test Zustand stores via `getState()` + `getInitialState()` reset, and `await persist.rehydrate()` before asserting persisted state.
6. MUST create a fresh `QueryClient` with `retry:false` per React Query test; mock the API-client module, not global `fetch`.
7. MUST use `jest.useFakeTimers()` + `advanceTimersByTimeAsync` for debounce/abort, and clear timers before `useRealTimers()` in `afterEach`.
8. MUST inject a clock provider for month/quota counter tests; cover month-boundary rollover, double-decrement-on-abort, and UNCLEAR-not-counted.
9. MUST NOT unit-test Reanimated worklets, Expo Router navigation internals, or native modules — mock the boundary, test the wrapper.
10. MUST verify the expo-location permission path fires only at/after first question submit and has a tested denied-permission fallback.

## 8. Open Questions for the Human
1. **Quota rule for UNCLEAR**: brief §7 says "Phase 2 — for MVP all questions count equally." Confirm: does the v1 quota test assert UNCLEAR DOES decrement? (affects constraint 8.)
2. **CI budget**: is a device-farm/emulator step available for Maestro e2e in CI, or are e2e flows manual-only for v1?
3. **Coordinate fallback policy**: when GPS denied AND no city entered, does the app block submission or send a default? The test must encode the chosen behaviour.
4. **Zustand version pin**: confirm installed Zustand version (4.5.5 changed persist defaults) before rehydration tests are written.

## 9. Knowledge Base Updates
Created `_knowledge-base/rn-expo-testing.md` with a generalized RN/Expo test-tiering matrix, jest-expo gotchas, Zustand/React Query/fake-timer patterns, and a domain-data-integrity checklist. Appended a horary-specific test-gap section to align with `horary-domain-brief.md`.
