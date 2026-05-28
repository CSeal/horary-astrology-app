# RN / Expo Testing Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-05-28 — Test tiering, jest-expo, store/query/timer patterns

### Test-tier ROI matrix (RN + Expo + jest-expo)
| Tier | Tool | What goes here | ROI |
|---|---|---|---|
| Unit | Jest / jest-expo | Pure logic: mappers, request builders, validators, i18n parity, store reducers, date/coord math | Highest — ms, no flake, no bridge |
| Integration | RNTL + real QueryClient + AsyncStorage mock | Hooks, Zustand stores, mutation success/error/abort | High |
| E2E | Maestro (default 2026) / Detox (max-flake-reduction only) | ≤5 critical user flows | Lowest — slow, fragile, keep minimal |

- Detox: <2% flake, gray-box, needs testIDs + native build config, JS tests.
- Maestro: <1% flake, YAML, no testIDs, no native config, 8-12min CI. Default first choice for new RN apps in 2026. Sources: [PkgPulse 2026](https://www.pkgpulse.com/blog/detox-vs-maestro-vs-appium-react-native-e2e-testing-2026), [Maestro flakiness](https://maestro.dev/insights/detox-vs-maestro-reducing-flakiness-react-native).

### Do NOT unit-test in RN
Reanimated worklets/animations (UI thread, jsdom blind); navigation/router internals (test nav side-effects in integration); native modules (expo-haptics/location/secure-store — mock boundary, test your wrapper); pure presentational components; styled-view snapshots (brittle).

### Zustand + AsyncStorage
- Mock: `@react-native-async-storage/async-storage/jest/async-storage-mock`.
- Test actions via `store.getState()`, no render needed.
- Reset: `store.setState(store.getInitialState(), true)` ([reset docs](https://zustand.docs.pmnd.rs/guides/how-to-reset-state)).
- Async hydration (microtask): `await store.persist.rehydrate()` before asserting; `store.persist.clearStorage()` in afterEach.
- WARNING: Zustand 4.5.5 changed default persist behaviour — pin/verify version ([#2763](https://github.com/pmndrs/zustand/discussions/2763)).

### React Query (TanStack) testing
- Fresh `QueryClient` per test: `defaultOptions:{queries:{retry:false},mutations:{retry:false}}` — kills 3x exponential-backoff timeout.
- Wrap `renderHook` in `QueryClientProvider`; mock the API-client module seam, NOT global `fetch`.
- `await waitFor(() => result.current.isSuccess/isError)`; `queryClient.clear()` in cleanup. Source: [tkdodo](https://tkdodo.eu/blog/testing-react-query).

### Fake timers / async / AbortController
- `jest.useFakeTimers()` + `await jest.advanceTimersByTimeAsync(ms)` (async flushes microtasks → no debounce deadlock).
- `jest.clearAllTimers()` BEFORE `jest.useRealTimers()` in afterEach → prevents cross-suite fake-timer leakage ([Mergify](https://mergify.com/blog/fake-timer-leakage-in-jest/)).
- AbortController: assert promise rejects AbortError / RQ marks cancelled not errored.
- Time-based counters: inject a clock provider; never assert real wall clock.

### i18n parity (high ROI, ~15 LOC)
Flatten en + locale objects to dot-paths; assert key-set equality both directions (list diff on fail); assert no empty value / value===key. Run in CI. Source: [i18next #1848](https://github.com/i18next/i18next/discussions/1848).

### jest-expo / Jest version caveat
2026 community guides target Jest 30; verify config against the project's pinned Jest 29 API before copying (`advanceTimersByTimeAsync` present in Jest 29.5+). Source: [jest-expo](https://www.npmjs.com/package/jest-expo).

### Domain-data-integrity checklist (chart/coordinate apps)
Generalizable beyond horary — any app sending geo+time to a compute API:
- Coordinate builder: lat/lng order, precision truncation, 0,0 / missing-GPS fallback, negative-longitude boundary.
- Timestamp: capture on submit not on input start; ISO-8601 UTC; DST boundary.
- Timezone: IANA string (`Intl.DateTimeFormat().resolvedOptions().timeZone`), not raw offset.
- Result enum rendering: every enum branch has a distinct UI state + safe default for unknown values (never fall through to a default badge or crash).
- Usage/quota counter: month-boundary rollover, double-decrement on retry/abort, conditional-not-counted rules — all with injected clock.
- Permission path (expo-location): requested only at/after first need; tested denied-permission fallback (store-review requirement).
