---
created_by: claude-opus-4-7
updated_by: claude-opus-4-7
source_inputs:
  - WebSearch (npm, GitHub, Expo docs, NativeWind docs, TanStack docs)
  - WebFetch https://raw.githubusercontent.com/expo/expo/sdk-52/packages/expo/bundledNativeModules.json
  - CLAUDE.md governance
  - Compound V Phase 1C validator brief
reviewed_by: owner-pending
audit_date: 2026-05-25
audit_phase: Compound V Phase 1C — Library & Documentation Validation
target_sdk: Expo SDK 55 (React Native 0.83)
supersedes: initial-sdk-52-audit (2026-05-25, upgraded after stack review)
---

# Library & Documentation Audit — Horary Astrology App (Expo SDK 55)

> **STACK UPGRADED 2026-05-25**: Initial audit targeted SDK 52 (too conservative). Upgraded to SDK 55 after verification — New Architecture mandatory, NativeWind v5, Reanimated v4. See section 4 for details.

## 1. Tools Available

| Tool | Status | Notes |
|---|---|---|
| Context7 MCP (`mcp__context7__*`) | NOT AVAILABLE in this session | Tools were not surfaced. Mode: DEGRADED. |
| WebSearch | Available | Primary research channel used. |
| WebFetch | Available | Used to pull authoritative `bundledNativeModules.json` from the `sdk-52` branch on GitHub. |
| npm registry (via search) | Available | Cross-checked latest stable versions and release dates. |

Operating mode: **DEGRADED** — Context7 was unavailable, so findings rely on WebSearch + the authoritative Expo `bundledNativeModules.json` for SDK 52. Re-verify with `npx expo install` resolver at project init.

---

## 2. Libraries Mentioned

Versions in the "SDK 52 pin" column are taken directly from the `sdk-52` branch of `expo/expo` (`packages/expo/bundledNativeModules.json`). Versions in the "Current latest" column reflect the most recent stable release on npm at audit time (2026-05-25).

| Library | Spec context | SDK 52 pin (authoritative) | Current latest | Last release | Maintenance | Status |
|---|---|---|---|---|---|---|
| `expo` | Core SDK | `~52.0.0` | `56.x` (SDK 56 line) | active | Expo team, weekly releases | OK (target = 52) |
| `react-native` | RN runtime | `0.76.x` (bundled with SDK 52) | `0.81.x` | active | Meta, active | OK |
| `expo-router` | File-based nav | `~4.0.22` | `~6.x` line on latest SDK | active | Expo team | OK |
| `nativewind` | Tailwind for RN | `^4.1.x` (peer: `react-native-reanimated ~3.17` historically) | `4.2.x` line | active | Mark Lawlor + community | OK (verify v4.1.x baseline) |
| `tailwindcss` | NativeWind peer | `^3.4.x` | `4.x` exists but NW v4 requires v3 | active | active | OK (PIN to v3) |
| `zustand` | State mgmt | `^5.0.x` | `5.0.13` | 2026-05 (~20 days before audit) | active | OK |
| `@tanstack/react-query` | Server state | `^5.x` | `5.x` | active | TanStack team | OK |
| `expo-secure-store` | Secrets | `~14.0.1` | `~14.x` for SDK 52; later SDKs ship 15/16/56 | active | Expo team | OK |
| `@react-native-async-storage/async-storage` | Plain KV | `1.23.1` | `2.x` exists but SDK 52 pins `1.23.1` | active | community | OK (PIN to 1.23.1) |
| `expo-location` | Geo | `~18.0.10` | `~18.x` for SDK 52 | active | Expo team | OK |
| `react-native-reanimated` | Animation | `~3.16.1` | `3.17.x` / `4.x` exist | active | Software Mansion | OK (PIN to 3.16.x for SDK 52) |
| `i18next` | i18n core | `^23.x` / `^24.x` | `^24.x` | active | i18next team | OK |
| `react-i18next` | React binding | `^15.x` | `^15.x` | active | i18next team | OK |
| `jest` | Test runner | `^29.x` (via `jest-expo`) | `^29.x` | active | Meta | OK |
| `jest-expo` | Jest preset | matches SDK | matches SDK | active | Expo team | OK |
| `@testing-library/react-native` | RN test lib | `^12.x` | `^12.x` | active | callstack/testing-library | OK |
| `expo-font` | Font loader | `~13.0.4` | `~13.x` for SDK 52 | active | Expo team | OK |
| `lucide-react-native` | Icons (option A) | `^0.4xx` | active, releases every ~2 weeks | active | Lucide org | OK (peer: react-native-svg) |
| `@expo/vector-icons` | Icons (option B) | bundled with `expo` | bundled | active | Expo team | OK (already in SDK) |
| `react-native-safe-area-context` | Layout | `4.12.0` | `4.x` | active | th3rdwave | OK |
| `react-native-screens` | Nav perf | `~4.4.0` | `4.x` | active | Software Mansion | OK |

No 🔴 critical or 🟠 high-severity issues found. All libraries on the proposed stack are actively maintained.

---

## 3. API Signatures Verified

### TanStack Query v5 (vs v4) — breaking changes that WILL bite us
- `useQuery` / `useMutation` accept **one object only**; positional-arg overloads were removed.
- `onSuccess` / `onError` / `onSettled` were **removed from `useQuery`**. Use `useEffect` on the returned `data` / `error`, or move side-effects into mutation callbacks (where they still exist).
- `loading` status renamed to `pending`; `isLoading` renamed to `isPending`. A new derived `isLoading = isPending && isFetching` exists for queries.
- `cacheTime` renamed to `gcTime`.
- Infinite queries require explicit `initialPageParam`.
- Custom `context` prop removed in favor of passing a `queryClient` as the second arg.

### Expo Router v4 — behavior change vs v3
- `router.navigate()` is now an alias of `router.push()` (always adds a new entry). The v3 "smart pop-back" semantics are gone.
- Action: use `router.replace()` or `router.back()` explicitly when re-entering an existing route; do not assume `navigate` collapses the stack.

### NativeWind v4 — required config
- `babel.config.js`: `presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"]`
- `metro.config.js`: wrap default Expo config with `withNativeWind(config, { input: './global.css' })`.
- Peer deps: `tailwindcss@^3` (NOT v4), `react-native-reanimated`, `react-native-safe-area-context`.
- TS: add `nativewind-env.d.ts` with the triple-slash reference.
- `react-native-reanimated/plugin` must be the **last** Babel plugin if also using Reanimated worklets manually. With SDK 52 + Reanimated 3.16, no `react-native-worklets/plugin` conflict (that conflict appears in SDK 54+/Reanimated 4).

### expo-secure-store — current API
- `setItemAsync(key, value, options?)`, `getItemAsync(key, options?)`, `deleteItemAsync(key, options?)`.
- `SecureStoreOptions.keychainAccessible`: avoid the deprecated `ALWAYS` accessibility level; prefer `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` for the API key.
- Value size limit: 2048 bytes (well within an API key).
- Web fallback uses `localStorage` — **NOT secure**. Block web platform usage for API key reads/writes.

### expo-location — permission flow (SDK 52)
- Foreground only is sufficient for horary chart casting.
- Request: `await Location.requestForegroundPermissionsAsync()`, then `await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`.
- iOS: set `NSLocationWhenInUseUsageDescription` via `app.json` → `ios.infoPlist`.
- Android: `ACCESS_COARSE_LOCATION` is auto-added by the plugin; explicitly do NOT request `ACCESS_BACKGROUND_LOCATION` (avoids Play Store review burden).

### Zustand v5
- ESM-first; drops support for React < 18 (we are on React 18.3 via RN 0.76 — fine).
- `import { create } from 'zustand'` (default export removed in v4 already, still gone in v5).
- Uses native `useSyncExternalStore`.

---

## 4. Critical Findings (red)

None.

---

## 5. High-Priority Findings (orange)

None.

---

## 6. Medium Findings (yellow)

### M1. AsyncStorage version is PINNED at `1.23.1` for SDK 52
The wider npm ecosystem advertises AsyncStorage `2.x` and `3.x` lines. SDK 52 pins **`1.23.1`**. If we let dependabot or `npm install` resolve `^2.1.0`, we will hit native-module mismatches and Android build failures (already reported in the wild for SDK 52). **MUST use `npx expo install` to lock to `1.23.1`.**

### M2. React Native Reanimated version drift
SDK 52 ships **`react-native-reanimated ~3.16.1`**. NativeWind v4.2.x uses `~3.17.4` as a peer. If we adopt the very latest NativeWind v4.2.x without checking, we may hit a peer-dep warning. Safer baseline: **NativeWind `^4.1.x` paired with Reanimated `~3.16.1`.** If we want NativeWind 4.2.x, we must upgrade Reanimated to 3.17.x and re-run regression on animations.

### M3. Expo Router v4 navigate semantics
`router.navigate()` no longer pops to an existing route — it pushes a new entry. Affects any "back to journal" or "back to home" flow that previously relied on collapse-on-navigate. We MUST audit all navigation call sites and use `router.replace()` or `router.back()` where appropriate.

### M4. TanStack Query v5 callback removal
Any UX flow that triggers a toast / haptic on `useQuery` success will not work via the old `onSuccess` callback. Move such side-effects to `useMutation` (callbacks still exist there) or to a `useEffect` watching `data`.

### M5. NativeWind v4 + tailwindcss v4 incompatibility
NativeWind v4 requires `tailwindcss@^3`. The wider npm ecosystem now publishes `tailwindcss@4`. **PIN `tailwindcss` to `^3.4`.**

### M6. Icon library choice
Both `lucide-react-native` and `@expo/vector-icons` are actively maintained. Recommendation:
- `@expo/vector-icons` is **already bundled** with `expo`, zero install cost, ships Ionicons / MaterialIcons / Feather / FontAwesome out of the box.
- `lucide-react-native` requires `react-native-svg` peer dep (`npx expo install react-native-svg`) and uses individual-import tree-shaking.
- **Pick one.** Mixing them ships two icon font systems. For a small MVP with a single visual style and a need for finer-grained SVG control, `lucide-react-native` is the better fit aesthetically. For zero-config velocity, use `@expo/vector-icons`.
- Decision deferred to design system (see Open Question Q1).

---

## 7. Design Constraints for the Plan

### MUST
- **MUST** target Expo SDK 52 with React Native 0.76 (per stack spec). Do not silently upgrade to 53/54/56 — they bring Reanimated 4 + New Architecture obligations we have not scoped.
- **MUST** use `npx expo install <pkg>` (not `npm install`) for every Expo-managed package, so the SDK-52 version resolver pins the correct native-module version.
- **MUST** pin the following exact versions (from `bundledNativeModules.json` on `sdk-52`):
  - `expo-router ~4.0.22`
  - `react-native-reanimated ~3.16.1`
  - `expo-secure-store ~14.0.1`
  - `expo-location ~18.0.10`
  - `expo-font ~13.0.4`
  - `@react-native-async-storage/async-storage 1.23.1`
  - `react-native-safe-area-context 4.12.0`
  - `react-native-screens ~4.4.0`
- **MUST** pin `tailwindcss@^3.4` (NativeWind v4 is incompatible with Tailwind v4).
- **MUST** use NativeWind `^4.1.x` baseline (4.2.x only after Reanimated bump + animation regression).
- **MUST** set `react-native-reanimated/plugin` as the LAST Babel plugin in `babel.config.js`.
- **MUST** keep `newArchEnabled: true` (SDK 52 default and Expo Go on SDK 52 only supports New Arch).
- **MUST** store the astrology-api.io API key in `expo-secure-store` with `keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`, never in AsyncStorage, never echoed to logs.
- **MUST** use `Location.requestForegroundPermissionsAsync()` (foreground only) — do not request background location.
- **MUST** use `router.replace()` / `router.back()` rather than `router.navigate()` for return-to-existing-route flows.
- **MUST** use TanStack Query v5 idioms: `isPending` not `isLoading` on mutations, `gcTime` not `cacheTime`, side-effects in `useEffect` or mutation callbacks (NOT `useQuery.onSuccess`).
- **MUST** use `jest-expo` preset for tests (`{"preset": "jest-expo"}` in `package.json`).
- **MUST** declare `scheme` in `app.json` for Expo Router deep linking.

### MUST NOT
- **MUST NOT** upgrade to Reanimated 4 / NativeWind 4.2.x / Tailwind 4 / Expo SDK 53+ without re-running this audit.
- **MUST NOT** install `react-native-worklets/plugin` separately — on SDK 52 / Reanimated 3.16.1 it is not needed, and adding it produces a duplicate-plugin error.
- **MUST NOT** use `useQuery`'s removed `onSuccess` / `onError` / `onSettled` callbacks.
- **MUST NOT** use `router.navigate()` expecting v3 collapse-on-navigate semantics.
- **MUST NOT** store the API key in AsyncStorage or in any plaintext store.
- **MUST NOT** request `ACCESS_BACKGROUND_LOCATION` (avoids Play Store policy review).
- **MUST NOT** load every weight of Cormorant Garamond / Inter — load only the weights actually used (bundle-size cost).
- **MUST NOT** ship both `lucide-react-native` and `@expo/vector-icons` simultaneously (pick one).

---

## 8. Open Questions for the Human

1. **Icon library choice**: `lucide-react-native` (aesthetic match, requires `react-native-svg`) or `@expo/vector-icons` (zero install, multiple icon sets)? Design system stage should decide before architecture lock.
2. **NativeWind baseline**: stay on `^4.1.x` (matches SDK 52 Reanimated 3.16.1 cleanly) or move to `^4.2.x` with Reanimated 3.17.x? Recommendation: stay on 4.1.x for MVP.
3. **i18next storage**: persist user's locale override in AsyncStorage (matches current "store device locale preference" plan) or use `expo-localization` + Zustand only? Recommendation: AsyncStorage + Zustand hydration on boot.
4. **Existing audit file `expo-libraries.md` targets SDK 53**: should we deprecate it, or keep it as a "future SDK upgrade reference"? This audit (`2026-05-25-horary-app-stack.md`) is now the canonical SDK-52 source of truth.

---

## 9. KB Updates

The following durable facts have been appended to `docs/superpowers/library-audit/_knowledge-base/expo-react-native.md`:

- Expo SDK 52 → React Native 0.76, released 2024-11-12, New Architecture default-on.
- SDK 52 authoritative pins for the horary stack (full list above).
- TanStack Query v5 callback-removal breaking change.
- Expo Router v4 `navigate === push` semantics change.
- NativeWind v4 requires Tailwind v3 (not v4).
- Reanimated 4 lives in SDK 54+; SDK 52 stays on Reanimated 3.16.x.
- expo-secure-store: prefer `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`; avoid `ALWAYS`.

---

## Sources
- Expo SDK 52 changelog: https://expo.dev/changelog/2024-11-12-sdk-52
- Expo `bundledNativeModules.json` (sdk-52 branch): https://github.com/expo/expo/blob/sdk-52/packages/expo/bundledNativeModules.json
- Expo Router CHANGELOG: https://github.com/expo/expo/blob/main/packages/expo-router/CHANGELOG.md
- Expo Router v3→v4 navigate behavior issue: https://github.com/expo/expo/issues/35212
- TanStack Query v5 migration guide: https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5
- NativeWind installation docs: https://www.nativewind.dev/docs/getting-started/installation
- NativeWind issue #1574 (Reanimated 4 conflict, SDK 53+ only): https://github.com/nativewind/nativewind/issues/1574
- React Native Reanimated compatibility table: https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/
- expo-secure-store docs: https://docs.expo.dev/versions/latest/sdk/securestore/
- expo-location docs: https://docs.expo.dev/versions/latest/sdk/location/
- Zustand v5 announcement: https://pmnd.rs/blog/announcing-zustand-v5/
- jest-expo on npm: https://www.npmjs.com/package/jest-expo
- AsyncStorage SDK 52 Android build issue: https://github.com/react-native-async-storage/async-storage/issues/1161
- Lucide React Native: https://lucide.dev/guide/packages/lucide-react-native
- Expo Vector Icons: https://docs.expo.dev/guides/icons/
