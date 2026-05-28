# Library Audit — Testing Stack (horary-astrology-v1-app)

Date: 2026-05-28
Validator: Compound V Phase 1C (library currency + API signatures only)
Topic: Jest / React Native Testing Library / mocks for Expo SDK 55 + RN 0.83.6

## 1. Tools Available

- Context7 MCP: AVAILABLE. Used `/callstack/react-native-testing-library` (834 snippets, High reputation).
- WebSearch: AVAILABLE.
- WebFetch: DENIED in this environment (npm.com returned 403; swmansion docs blocked). Versions/dates confirmed via WebSearch result text, not direct registry JSON. Treat exact patch numbers as "verified to nearest WebSearch snapshot," not registry-canonical.
- Bash/curl: DENIED — could not hit registry.npmjs.org directly.
- Manifests found: `package.json` (jest config inline under `"jest"` key). No separate jest.config.js. No lockfile inspected.

## 2. Libraries Mentioned

| Library | Spec context | Current ver | Repo pinned | Last release | Maintenance | Status |
|---|---|---|---|---|---|---|
| @testing-library/react-native | Q1 (said "not installed") | 13.3.3 (latest, ~Aug 2025) | **^13.3.3 (ALREADY in devDeps)** | ~2025-08 | Active (Callstack) | 🟢 OK |
| jest | test runner | 30.x line exists | ~29.7.0 | — | Active | 🟡 MEDIUM |
| jest-expo | preset | 55.0.x (matches SDK 55) | ~55.0.18 | 2026 (SDK 55) | Active (Expo) | 🟢 OK |
| @react-native-async-storage/async-storage | Q3 mock | 2.x | 2.2.0 | — | Active (invertase) | 🟢 OK |
| expo-secure-store | Q4 mock | 55.0.x | ~55.0.14 | 2026 | Active (Expo) | 🟢 OK |
| expo-haptics | Q5 mock | 55.0.x | ~55.0.14 | 2026 | Active (Expo) | 🟢 OK |
| expo-location | Q5 mock | 55.1.x | ~55.1.10 | 2026 | Active (Expo) | 🟢 OK |
| react-native-reanimated | Q6 jest mock | 4.x | 4.2.1 | 2026 | Active (Software Mansion) | 🟢 OK |
| msw | Q7 fetch/axios mock | 2.14.6 (~May 2026) | not installed | 2026-05 (~16d ago) | Active | 🟡 MEDIUM (RN setup caveats) |

No 🔴/🟠 libraries. All proposed testing libs are actively maintained. The risk is API-signature drift and config, not abandonment.

## 3. API Signatures Verified (Context7 `/callstack/react-native-testing-library`)

| Item | Finding | Status |
|---|---|---|
| RNTL Jest preset | `preset: '@testing-library/react-native'` was REMOVED in v13. Migration doc says use `preset: 'react-native'`. **jest-expo already extends the react-native preset, so KEEP `preset: 'jest-expo'`** — do NOT add the RNTL preset. | drift |
| `react-test-renderer` peer | v13 install still documents `npm i -D react-test-renderer` as a peer dep. Recent notes indicate a move to bundled "Test Renderer," but the published 13.3.3 install line still lists it. Add `react-test-renderer@19.2.0` (must match `react@19.2.0`) to devDeps to avoid peer mismatch. | action |
| React 19 async APIs | v13.3+ on React 19: prefer `renderAsync`, `fireEventAsync`, `rerenderAsync`, `unmountAsync` (return Promises, must be `await`ed) for components using Suspense / `use()`. Sync `render`/`fireEvent` still exist for non-Suspense trees. | new API |
| `toBeOnTheScreen()` matcher | Built-in jest matcher in v13 (no separate jest-native import needed). | OK |

## 4. Critical Findings 🔴

None.

## 5. High-Priority Findings 🟠

None. (No abandoned/24mo-stale libraries in scope.)

## 6. Medium Findings 🟡

### M1 — RNTL v13 requires `react-test-renderer` pinned to React 19.2.0
The task brief said RNTL is "not installed," but `package.json` devDeps already pin `@testing-library/react-native: ^13.3.3`. It is installed. However `react-test-renderer` is NOT in the manifest. v13's install docs still list it as a required peer. Without it pinned to **19.2.0** (exact match to `react`), Jest can throw renderer/React version mismatch at runtime.
- Source: Context7 `/callstack/react-native-testing-library` install + v13 migration docs; WebSearch issue #671 (react-test-renderer version conflicts).

### M2 — jest 29.7.0 is a major behind jest 30
Repo pins `jest ~29.7.0` and `jest-expo ~55.0.18`. jest-expo 55 is built/tested against jest 29; do NOT independently bump to jest 30 unless jest-expo 55 declares jest 30 support, or the preset's babel-jest transform can desync. Stay on 29.7.0 to match the preset. Revisit only if jest-expo publishes a jest-30 peer.

### M3 — msw 2.14.6 works with jest-expo but needs RN-specific imports + polyfills
msw is NOT installed. If added for fetch/axios mocking in unit tests:
- Use the **`msw/native`** export, NOT `msw/node` (RN lacks the `http` module msw/node imports).
- Requires polyfills in the Jest setup: `react-native-url-polyfill`, `fast-text-encoding`, and `web-streams-polyfill` (msw v2 needs `URL`, `TextEncoder`, streams not present in the RN/Jest env).
- Compatible with fetch, axios, and TanStack Query (repo uses `axios ^1.16.1` + `@tanstack/react-query ^5.x`) — handlers are request-library agnostic.
- Source: mswjs.io React Native integration docs; WebSearch (msw v2 RN setup).
- Lighter alternative for pure unit tests where you only mock axios: `axios-mock-adapter` (no polyfills, no http interception). MSW is heavier but more realistic. This is a scoping choice (see Q1 below), not a blocker.

## Answers to the 7 questions (YES/NO + version + one-line setup)

1. **@testing-library/react-native** — YES compatible. Latest **13.3.3**; requires React 19.0+ and RN 0.78+ (repo is React 19.2.0 / RN 0.83.6 → in range). Already pinned `^13.3.3`. Setup: keep `preset: 'jest-expo'`, add `react-test-renderer@19.2.0` to devDeps, use async APIs (`renderAsync`) for Suspense components. Known issue: RNTL's own jest preset was removed in v13 — must not add it.

2. **jest-expo coverage** — YES. No extra package. Add to the `jest` block: `"collectCoverage": true`, `"collectCoverageFrom": ["**/*.{ts,tsx,js,jsx}", "!**/coverage/**", "!**/node_modules/**", "!**/babel.config.js", "!**/expo-env.d.ts", "!**/.expo/**"]`, optional `"coverageReporters": ["text", "html", "lcov"]`. jest-expo uses the babel/Istanbul coverage provider by default. Gitignore `/coverage`.

3. **AsyncStorage mock** — YES, still correct for v2.x. Pattern unchanged: in setup file `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`. The bundled mock path is still shipped in v2 (repo has 2.2.0). Source: invertase async-storage Jest-integration docs.

4. **expo-secure-store mock** — NO dedicated standalone official mock package; YES it is covered by jest-expo. The `jest-expo` preset auto-mocks the native side of Expo modules including expo-secure-store. For deterministic store behavior, `jest.mock('expo-secure-store')` manually with `getItemAsync`/`setItemAsync`/`deleteItemAsync` jest.fn()s. Source: Expo "Mocking native calls" + unit-testing docs.

5. **expo-haptics / expo-location mocks** — YES, both auto-mocked by jest-expo (native side stubbed). For assertions, `jest.mock('expo-haptics')` / `jest.mock('expo-location')` and override specific fns (e.g. `getCurrentPositionAsync`, `requestForegroundPermissionsAsync`, `impactAsync`). No separate mock package needed.

6. **Reanimated 4 in Jest** — YES works with 4.2.x. Setup file: `require('react-native-reanimated').setUpTests();` (the v4 path). The legacy `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))` with `.call = () => {}` is the older v1/v2 pattern and the `.call` override is obsolete in v4 — prefer `setUpTests()`. Note repo also uses `react-native-worklets@0.7.4` (Reanimated 4's worklet runtime) — ensure it is transformed by jest-expo's transformIgnorePatterns (jest-expo handles this). Register the setup via `setupFilesAfterEnv`. Source: swmansion Reanimated testing guide (WebSearch).

7. **msw** — YES compatible (see M3). Latest **2.14.6** (~May 2026). Setup: install msw + `react-native-url-polyfill` + `fast-text-encoding` + `web-streams-polyfill`; import polyfills + create server via `setupServer` from **`msw/native`** in `setupFilesAfterEnv`. Works with axios + TanStack Query already in the repo.

## 7. Design Constraints for the Plan (non-negotiable)

- MUST keep `preset: 'jest-expo'`. MUST NOT add `preset: '@testing-library/react-native'` (removed in v13).
- MUST add `react-test-renderer` pinned to **19.2.0** (exact match to `react`) when enabling RNTL.
- MUST NOT bump `jest` to 30.x while on `jest-expo ~55.0.18` — keep jest 29.7.0 to match the preset's transform.
- MUST mock AsyncStorage via the bundled `.../jest/async-storage-mock` path, not a third-party mock.
- MUST rely on jest-expo's auto-mocks for expo-secure-store / expo-haptics / expo-location; only hand-mock where you need to assert call args.
- MUST use Reanimated 4's `setUpTests()` in a setup file; MUST NOT use the obsolete `.call = () => {}` override.
- For React 19 Suspense components, MUST use the async RNTL variants (`renderAsync`, `fireEventAsync`) and `await` them.
- IF msw is adopted, MUST import from `msw/native` (not `msw/node`) and MUST add the RN polyfills (`react-native-url-polyfill`, `fast-text-encoding`, `web-streams-polyfill`).

## 8. Open Questions for the Human (escalate)

- **Q1 (scoping):** For API mocking in unit tests, adopt full **msw 2.14.6** (realistic, network-level, +4 polyfill deps) OR lighter **axios-mock-adapter** (the repo's HTTP client is axios; no polyfills)? msw is heavier setup for an internal MVP. Decision affects devDep footprint and setup-file complexity.
- **Q2:** Coverage thresholds — should the plan enforce a `coverageThreshold` gate in CI, or report-only for the MVP? CLAUDE.md says "critical QA only (smoke + critical path)" under core-MVP cutline, which suggests report-only.

## 9. Knowledge Base Updates

Appended a `## Updated 2026-05-28 — Testing stack (Jest/RNTL/mocks for SDK 55)` section to
`docs/superpowers/library-audit/_knowledge-base/expo-react-native.md` covering: RNTL 13.3.3 React-19 async APIs + removed preset, jest-expo coverage config, AsyncStorage/SecureStore/Haptics/Location mock patterns, Reanimated 4 `setUpTests()`, and msw 2.14.6 RN integration.
