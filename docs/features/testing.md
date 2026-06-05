# Feature: Test Suite

**Status:** Implemented (2026-05-28)
**Created by:** claude-opus
**Related:** [ask-flow.md](ask-flow.md), [force-update.md](force-update.md), [journal.md](journal.md), [location-override.md](location-override.md), [debug-mode.md](debug-mode.md)

Unit/integration test coverage for Hora's production-critical logic. Scope was chosen via a superpowers-v brainstorm (code-archaeology + domain-expert + library-audit): test the pure functions and async state machines that drive user-facing behaviour, and skip native bridges, navigation, and Reanimated worklets (low unit-test ROI).

**Baseline: 16 suites / 209 tests, 100% coverage across all 4 metrics (Statements / Branches / Functions / Lines).** This count is a QA gate — see [Orchestration gate](#orchestration-gate).

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
| [horaryApi.test.ts](../../src/services/__tests__/horaryApi.test.ts) | `normalizeError`, `getApiKey` | 15 | Pure error-mapping matrix + API-key priority chain |
| [horaryApi.retry.test.ts](../../src/services/__tests__/horaryApi.retry.test.ts) | `askWithRetry` | 4 | axios mocked, fake timers for backoff |
| [updateCheckService.test.ts](../../src/services/__tests__/updateCheckService.test.ts) | `checkForUpdate` | 12 | 3-tier fallback state machine; extended for cache staleness + platform-key |
| [journalService.test.ts](../../src/services/__tests__/journalService.test.ts) | journal CRUD | 6 | Round-trip + 500-entry prune + corrupt JSON |
| [geocodingService.test.ts](../../src/services/__tests__/geocodingService.test.ts) | `search` | 10 | Photon mapping + filter + language fallback + AbortSignal |
| [questionsStore.test.ts](../../src/stores/__tests__/questionsStore.test.ts) | hydrate + CRUD | 8 | hydrate / addEntry / deleteEntry / updateOutcome / clearAllEntries + error path |
| [parity.test.ts](../../src/i18n/__tests__/parity.test.ts) | en ↔ ru key parity | 3 | Key set + placeholders + no-empty (covers all 8 locale files via en as source of truth) |
| [useDebugTrigger.test.ts](../../src/hooks/__tests__/useDebugTrigger.test.ts) | 20-tap gesture | 9 | `renderHook` + `Date.now` spy; includes unmount cleanup cases |
| [withMinDuration.test.ts](../../src/hooks/__tests__/withMinDuration.test.ts) | loading floor | 3 | Pre-existing timing helper |
| [horaryMapper.test.ts](../../src/services/__tests__/horaryMapper.test.ts) | wire → `JournalEntry` | 53 | Full API field mapping incl. radicality flags, reception, perfection path, timing, testimony |
| [reviewPromptService.test.ts](../../src/services/__tests__/reviewPromptService.test.ts) | FR-G02 review gates | 12 | Verdict tone + entry count + install age + cooldown |
| [notificationService.test.ts](../../src/services/__tests__/notificationService.test.ts) | outcome-reminder scheduling | 11 | schedule / cancel / pruneExpired / permission grant+deny |
| [secureKeyService.test.ts](../../src/services/__tests__/secureKeyService.test.ts) | SecureStore wrapper | 5 | get / set / delete + error path |
| [zodiac.test.ts](../../src/constants/__tests__/zodiac.test.ts) | zodiac constants + pure functions | 33 | expandSign / nextSign / aspectSymbol / formatDegrees / timingWeight |
| [useStreak.test.ts](../../src/hooks/__tests__/useStreak.test.ts) | streak calculation | 7 | Consecutive-day logic, milestone detection, gap reset |
| [onThisDayService.test.ts](../../src/services/__tests__/onThisDayService.test.ts) | same-date past readings | 8 | ±3-day window, year exclusion, dismiss state |

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

### `questionsStore.test.ts` — hydrate & CRUD
The monthly quota is now enforced server-side (API `429 → LIMIT_EXCEEDED`), so the store's
responsibilities are journal-entry state: `hydrate` from AsyncStorage, `addEntry`, `deleteEntry`,
`updateOutcome` (including clearing to `null`), the debug-only `clearAllEntries` action, and
the error path that leaves entries unchanged when journalService throws.

### `parity.test.ts` — translation drift
Flattens `en.ts` and `ru.ts` to dot-paths and asserts identical key sets (both
directions), no empty values, and matching `{{placeholder}}` tokens. Cheap insurance
against a missing-translation key shipping after any future string edit. The suite uses
`en.ts` as the source of truth; the remaining 6 locales (UK, DE, ES, FR, PT, and the index)
are not diffed in this suite — they are expected to be validated manually or by a separate
parity extension when editing those files.

### `useDebugTrigger.test.ts` — activation gesture
The hook measures its 4s rolling window with `Date.now()`, so time is driven by a
`Date.now` spy rather than fake timers. Uses `renderHook` from RNTL. Covers the 20-tap
fire, streak reset after a >4s pause, the Medium (15th) / Light (19th) / Heavy (20th)
haptics, and re-arming after a fire. The hook clears its pending reset timer on unmount,
so no timer handle leaks into the runner.

### `notificationService.test.ts` — outcome-reminder scheduling
Tests the 50-item queue cap (oldest evicted at capacity), schedule idempotency, cancellation
by `entryId`, `pruneExpired` (drops past items, no-op when all future), and the
permission-request paths (granted / denied / already-granted). `expo-notifications` and
`AsyncStorage` are mocked by `jest-expo`.

### `secureKeyService.test.ts` — SecureStore wrapper
Thin wrapper over `expo-secure-store`. Tests the get (value present / null / throws-with-warn),
set, and delete happy paths. Ensures the `keychainAccessible` option is forwarded correctly.

### `zodiac.test.ts` — zodiac constants + pure functions
Covers all pure utility functions exported from `src/constants/zodiac.ts`: `expandSign`,
`nextSign`, `aspectSymbol`, `aspectPolarity`, `formatDegrees`, and `timingWeight`. Also
asserts the `ZODIAC_SIGNS` array order and completeness, and the `ASPECT_SYMBOLS` glyph map.
At 33 tests this is the largest single suite.

### `useStreak.test.ts` — streak calculation
Tests the hook's consecutive-day logic (today counts, yesterday counts, a 2-day gap resets),
milestone badge detection thresholds, and edge cases (empty journal, single entry, all entries
on same day).

### `onThisDayService.test.ts` — same-date past readings
Tests the ±3-day calendar window that matches past readings to the current date, the rule that
entries from the current year are excluded, newest-first sorting, the empty-array path, and
the AsyncStorage-backed dismiss state (`dismissToday` / `isDismissed`).

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
  areas that must stay green and flags any drop below the **16 suites / 209 tests** baseline
  as a P0 regression. Coverage must remain 100% across all 4 metrics.

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
