# Feature: Test Suite

**Status:** Implemented (2026-05-28)
**Created by:** claude-opus
**Related:** [ask-flow.md](ask-flow.md), [force-update.md](force-update.md), [journal.md](journal.md), [location-override.md](location-override.md), [debug-mode.md](debug-mode.md)

Unit/integration test coverage for AstraSk's production-critical logic. Scope was chosen via a superpowers-v brainstorm (code-archaeology + domain-expert + library-audit): test the pure functions and async state machines that drive user-facing behaviour, and skip native bridges, navigation, and Reanimated worklets (low unit-test ROI).

**Baseline: 9 suites / 54 tests.** This count is a QA gate — see [Orchestration gate](#orchestration-gate).

---

## Runner & tooling

| Tool | Version | Role |
|---|---|---|
| `jest-expo` | ~55.0.18 | Jest preset for Expo SDK 55 (auto-mocks expo modules) |
| `jest` | ~29.7.0 | Test runner |
| `@testing-library/react-native` | ^13.3.3 | `renderHook` for hook tests |
| `react-test-renderer` | 19.2.0 | Peer of RNTL — matches React 19.2.0 |

No `jest.setup.ts` is needed: the suite covers services / stores / hooks / pure
functions only, none of which require the Reanimated test shim. `expo-haptics`,
`expo-application`, and `expo-secure-store` are auto-mocked by `jest-expo`;
`AsyncStorage` uses the bundled `.../jest/async-storage-mock`.

Jest config lives inline in [package.json](../../package.json):

```json
"jest": {
  "preset": "jest-expo",
  "moduleNameMapper": { "^@/(.*)$": "<rootDir>/src/$1" }
}
```

---

## Test files

| File | Target | Tests | Notes |
|---|---|---|---|
| [horaryApi.test.ts](../../src/services/__tests__/horaryApi.test.ts) | `normalizeError`, `getApiKey` | 11 | Pure error-mapping matrix + API-key priority chain |
| [horaryApi.retry.test.ts](../../src/services/__tests__/horaryApi.retry.test.ts) | `askWithRetry` | 4 | axios mocked, fake timers for backoff |
| [updateCheckService.test.ts](../../src/services/__tests__/updateCheckService.test.ts) | `checkForUpdate` | 7 | 3-tier fallback state machine |
| [journalService.test.ts](../../src/services/__tests__/journalService.test.ts) | journal CRUD | 6 | Round-trip + 500-entry prune + corrupt JSON |
| [geocodingService.test.ts](../../src/services/__tests__/geocodingService.test.ts) | `search` | 6 | Photon mapping + filter + AbortSignal |
| [questionsStore.test.ts](../../src/stores/__tests__/questionsStore.test.ts) | counter + hydrate | 9 | Monthly rollover + debug reset/clear |
| [parity.test.ts](../../src/i18n/__tests__/parity.test.ts) | en ↔ ru | 3 | Key set + placeholders + no-empty |
| [useDebugTrigger.test.ts](../../src/hooks/__tests__/useDebugTrigger.test.ts) | 7-tap gesture | 5 | `renderHook` + `Date.now` spy |
| [withMinDuration.test.ts](../../src/hooks/__tests__/withMinDuration.test.ts) | loading floor | 3 | Pre-existing timing helper |

---

## What each suite protects

### `horaryApi.test.ts` — error mapping & key resolution
`normalizeError` is the single highest-ROI pure function in the repo: a 6-branch
`AxiosError → HoraryAPIError` map that decides every error message and the
`retryable` flag. `getApiKey` covers the SecureStore → env var → empty priority chain.
Both functions are exported from [horaryApi.ts](../../src/services/horaryApi.ts) **for testability**.

### `horaryApi.retry.test.ts` — retry/backoff
axios is mocked so `apiInstance.post` is controllable. The response interceptor
(which normally normalizes errors) is a no-op in the mock, so `post` rejects with
already-shaped `HoraryAPIError` objects. Fake timers advance the 1s/2s exponential
backoff. Asserts: first-try success, retry-then-succeed, give-up after 3 attempts,
no-retry on non-retryable.

> **Gotcha:** the SUT `import` is hoisted above the mock-holder consts, so `post`
> is wrapped in an arrow (`(...args) => mockPost(...args)`) to defer the `mockPost`
> read to call time. Reading it at `create()` time would hit the TDZ and return `undefined`.

### `updateCheckService.test.ts` — force-update gate
Highest-consequence logic in the app: a bug can hard-lock every user out or silently
disable the gate. Covers all three tiers (fresh fetch → 30-min cache → fail-open null),
the `__DEV__` short-circuit, and the `semver.coerce` path for EAS-style versions
(`1.0.0.1`). `global.fetch`, `expo-application.nativeApplicationVersion`, and the
`UPDATE_CONFIG_URL` constant are mocked; `__DEV__` is toggled per-test.

### `journalService.test.ts` — data integrity
Add/delete/clear round-trips, newest-first ordering, the `MAX_JOURNAL_ENTRIES` (500)
prune boundary, and the corrupt-JSON fail-open path (returns `[]`).

### `geocodingService.test.ts` — coordinates to the API
The coordinates this service returns are sent straight to the horary API, so a
mapping bug corrupts the chart. Covers `<2`-char short-circuit, `!res.ok` throw,
display-name assembly, invalid-feature filtering, and AbortSignal pass-through.

### `questionsStore.test.ts` — quota & rollover
The monthly counter and its `hydrate` twin both implement month-rollover independently.
Covers increment, same-month no-reset, cross-month reset, `hydrate` for all three states
(same month / stale month / empty storage), and the debug-only `resetMonthlyCount` /
`clearAllEntries` actions.

### `parity.test.ts` — translation drift
Flattens `en.ts` and `ru.ts` to dot-paths and asserts identical key sets (both
directions), no empty values, and matching `{{placeholder}}` tokens. Cheap insurance
against a missing-translation key shipping after any future string edit.

### `useDebugTrigger.test.ts` — activation gesture
The hook measures its 3s window with `Date.now()` (not `setTimeout`), so time is driven
by a `Date.now` spy rather than fake timers. Uses `renderHook` from RNTL. Covers the
7-tap fire, streak reset after a >3s pause, the Light (6th) / Heavy (7th) haptics, and
re-arming after a fire.

---

## Running the tests

```bash
npm test                 # full suite
npm test -- --coverage   # with Istanbul coverage report
npm test horaryApi       # a single file/pattern
npm run typecheck        # tsc --noEmit (test files are type-checked too)
npm run lint             # eslint src/ — 0 errors required
```

---

## Conventions

- **Test location:** colocated in `__tests__/` next to the source (`src/services/__tests__/…`).
- **Mocks before use, imports first:** all `import` statements stay at the top of the
  file (satisfies `import/first`); `jest.mock(...)` calls go below them — Jest hoists
  the mock factories above the imports at runtime regardless.
- **No dynamic `process.env[var]`:** the `expo/no-dynamic-env-var` rule forbids it;
  access env vars by their static name.
- **`globalThis`, not `global`:** the TS config has no Node types, so use `globalThis`
  (cast through `unknown` when assigning to `__DEV__`).
- **Exported-for-test functions:** `normalizeError` and `getApiKey` are exported solely
  so the pure logic can be unit-tested without driving them through the axios interceptor.

---

## Orchestration gate

The jest suite is wired into **Stage 6 QA** as a must-pass P0 gate:

- [orchestrate-stage6.md](../../.claude/commands/orchestrate-stage6.md) instructs the QA
  agent to run the suite **with coverage** and treats `--passWithNoTests` as disallowed.
- [horary-qa-agent.md](../../.claude/agents/horary-qa-agent.md) Step 1 lists the focus
  areas that must stay green and flags any drop below the **9 suites / 54 tests** baseline
  as a P0 regression.

When adding tests, update the baseline count in both that agent file and this doc.

---

## Out of scope (deliberately untested)

Per the domain-expert audit, these have low unit-test ROI and are better served by
manual smoke tests or E2E:

- Reanimated worklets / animation components (AnimatedSplash, PlanetOrbit, VerdictStar, …)
- Expo Router navigation internals
- Native module behaviour (`expo-location`, `expo-haptics`, `expo-secure-store`) — only the
  JS boundary is mocked and asserted
- Pure presentational components (styled `View`/`Text` trees)

Audit sources:
- [superpowers/expert/2026-05-28-rn-expo-testing-strategy.md](../superpowers/expert/2026-05-28-rn-expo-testing-strategy.md)
- [superpowers/library-audit/2026-05-28-testing-libraries.md](../superpowers/library-audit/2026-05-28-testing-libraries.md)
