# Expo / React Native Library Knowledge Base
Maintained by Compound V Phase 1C validator. Append at the bottom.
---

## 2026-05-25 — Expo SDK 52 baseline (horary-astrology-v1-app)

Source: WebFetch of `https://raw.githubusercontent.com/expo/expo/sdk-52/packages/expo/bundledNativeModules.json` plus WebSearch on Expo docs / npm / TanStack docs / NativeWind docs.

### SDK 52 facts
- Released **2024-11-12**. Targets **React Native 0.76**.
- **New Architecture enabled by default** for new projects (`newArchEnabled: true` in `app.json`).
- Expo Go on SDK 52 **only** supports the New Architecture.

### SDK 52 authoritative version pins (from `bundledNativeModules.json` on `sdk-52`)
```
expo-router                                  ~4.0.22
react-native-reanimated                      ~3.16.1
expo-secure-store                            ~14.0.1
expo-location                                ~18.0.10
expo-font                                    ~13.0.4
@react-native-async-storage/async-storage    1.23.1
react-native-safe-area-context               4.12.0
react-native-screens                         ~4.4.0
```
Always install with `npx expo install <pkg>` so these pins are respected.

### TanStack Query v5 — breaking changes vs v4
- Single-object signature only; positional overloads removed.
- `useQuery` lost `onSuccess` / `onError` / `onSettled`. Use `useEffect`. Mutation callbacks still exist.
- `loading` status → `pending`; `isLoading` → `isPending` (mutations and queries). New derived `isLoading = isPending && isFetching` on queries.
- `cacheTime` → `gcTime`.
- Infinite queries require explicit `initialPageParam`.
- Custom `context` prop removed; pass `queryClient` as the second arg.

### Expo Router v4 — behavior change vs v3
- `router.navigate()` is now an alias of `router.push()`. The v3 "collapse stack to existing route" behavior is gone. Use `router.replace()` or `router.back()` for re-entry flows.

### NativeWind v4 — config requirements
- `babel.config.js`: `presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"]`
- `metro.config.js`: `withNativeWind(getDefaultConfig(__dirname), { input: './global.css' })`
- Peer deps: **tailwindcss v3 (NOT v4)**, `react-native-reanimated`, `react-native-safe-area-context`.
- TS: `nativewind-env.d.ts` with triple-slash directive.
- On SDK 52 + Reanimated 3.16.x do NOT add `react-native-worklets/plugin` — that conflict only appears at SDK 54+ / Reanimated 4.

### Reanimated version map
- SDK 52 → Reanimated `~3.16.1`
- SDK 53 → Reanimated `~3.17.x`
- SDK 54+ → Reanimated `~4.1.x` (Reanimated 4)
Mixing across major versions causes Babel plugin conflicts (`react-native-worklets/plugin` is auto-bundled by Reanimated 4).

### expo-secure-store API and policy
- Methods: `setItemAsync`, `getItemAsync`, `deleteItemAsync`.
- Prefer `keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`. The `ALWAYS` accessibility level is deprecated.
- Value limit: 2048 bytes.
- Web platform falls back to `localStorage` — NOT secure. Block web for secret storage.

### expo-location (foreground-only flow)
- `Location.requestForegroundPermissionsAsync()` then `Location.getCurrentPositionAsync(...)`.
- iOS: set `NSLocationWhenInUseUsageDescription` via `app.json`.
- Android: `ACCESS_COARSE_LOCATION` auto-added by plugin; do NOT request `ACCESS_BACKGROUND_LOCATION` unless background features are scoped.

### Zustand v5
- Drops React < 18. Uses native `useSyncExternalStore`. Named export only: `import { create } from 'zustand'`.

### Testing
- Use `jest-expo` preset (`"jest": { "preset": "jest-expo" }`). Install: `npx expo install jest-expo jest`.
- React Native Testing Library: `@testing-library/react-native` (v12.x).
- `jest-expo/universal` runs iOS + Android + web + Node tests in one pass.

### Icons
- `@expo/vector-icons` is bundled with `expo` (zero install). Includes Ionicons, MaterialIcons, Feather, FontAwesome.
- `lucide-react-native` requires `react-native-svg` peer. Tree-shake via named import: `import { Star } from 'lucide-react-native'`.
- Pick ONE icon system; do not ship both.

### Anti-patterns to avoid on SDK 52
- `npm install` for Expo-managed packages (use `npx expo install`).
- `tailwindcss@^4` with NativeWind v4 — incompatible.
- `AsyncStorage@^2.x` — SDK 52 pins `1.23.1`.
- `useQuery({ onSuccess, onError })` — those callbacks no longer exist in v5.
- `router.navigate('/route')` expecting v3 collapse behavior — use `router.replace` / `router.back`.
- Adding `react-native-worklets/plugin` to babel on Reanimated 3.x.

---

## 2026-05-25 — SDK 55 upgrade decision (horary-astrology-v1-app)

**Source**: WebSearch via Compound V Phase 1C follow-up after stack review.

### Why SDK 55 instead of SDK 52
Initial audit targeted SDK 52 (conservative). After review, SDK 55 is the correct choice for a new greenfield project:
- SDK 54 was the LAST version allowing Legacy Architecture opt-out. SDK 55+ = New Architecture always on.
- Hermes v1 (SDK 55): **29% faster startup, 38% lower memory** vs previous.
- NativeWind v4 was a transition release; **NativeWind v5** is the stable New-Arch-only version.
- Reanimated v4 is standard on SDK 54+. v3 is legacy.

### SDK 55 canonical stack (horary-astrology-v1-app)
```
expo                       ~55.x
react-native               0.83.x (bundled)
expo-router                ~5.x (file-based routing)
nativewind                 ^5.x  ← NOT v4
react-native-reanimated    ^4.x  ← NOT v3
zustand                    ^5.x
@tanstack/react-query       ^5.x
expo-secure-store           latest (npx expo install)
expo-location               latest (npx expo install)
expo-font                   latest (npx expo install)
@react-native-async-storage/async-storage  latest (npx expo install)
i18next + react-i18next     latest
jest-expo                   latest (npx expo install)
@testing-library/react-native  latest
```

### NativeWind v5 vs v4 differences
- v5 is New Architecture only (Fabric renderer required).
- No longer requires `nativewind/babel` preset separately — simplified config.
- `tailwindcss@^4` now supported in NativeWind v5 (v4 needed tailwindcss@^3).
- See: https://www.nativewind.dev/v5/guides/migrate-from-v4

### Reanimated v4 notes
- Ships `react-native-worklets` as a required peer (auto-managed by Expo).
- Babel plugin: `react-native-reanimated/plugin` (same name, updated behavior).
- Do NOT use Reanimated v3 patterns — worklet syntax has changes.

### New Architecture in SDK 55
- Cannot be disabled. All third-party libraries must support New Arch.
- All major libs in this stack (Reanimated 4, NativeWind 5, React Navigation, AsyncStorage) are New Arch compatible.
- `react-native-screens`, `react-native-safe-area-context` bundled via Expo — no manual compat check needed.

### Install rule (unchanged)
Always use `npx expo install <pkg>` — never `npm install` for Expo-managed packages.

## 2026-05-26 — Force-update / version-gate primitives (SDK 55)

Source: Context7 `/websites/expo_dev_versions_v55_0_0` (expo-application, expo-updates, expo-constants pages); GitHub `kimxogus/react-native-version-check` README; npm registry pages for `semver` and `compare-versions`.

### Verified SDK 55 APIs

- `Application.nativeApplicationVersion: string | null` — iOS `CFBundleShortVersionString`, Android `versionName`. Set at native build time, survives OTA. `null` on web.
- `Application.nativeBuildVersion: string | null` — iOS `CFBundleVersion`, Android `versionCode`. Set at native build time. `null` on web.
- `Updates.runtimeVersion: string | null` — OTA-compatibility id only. **Not** the user-facing app version.
- `Updates.currentlyRunning.{updateId, isEmbeddedLaunch, runtimeVersion}` — OTA bundle metadata, **not** native binary version.
- `Constants.expoConfig: ExpoConfig & { hostUri } | null` — reflects the `app.json` manifest, **not** the installed native binary; can be `null` and can drift from binary after OTA. Do not use as the source of truth for a version gate.

### Library status

- **`react-native-version-check` 3.5.0** (2025-05-02) — 🟠 maintainer publicly stepping away (README: "I am no longer working on mobile app development"), 42 open issues, ships native code (manual iOS/Android setup), Expo wrapper exists but not tested on RN 0.83 + New Arch. Avoid.
- **`expo-application`** (tracks SDK 55) — official, correct primitive for native-binary version reads.
- **`expo-updates`** (tracks SDK 55) — actively maintained; OTA-only; Expo team confirms "no first-class support for critical/mandatory updates". Not suitable as the force-store-update mechanism.
- **`expo-constants` ~55.0.16** — already pinned in repo; `expoConfig` is a manifest mirror, not a runtime binary version source.
- **`semver` 7.8.1** — 643M weekly downloads, zero deps, no Node built-ins required for the comparator API. Safe in React Native.
- **`compare-versions` 6.1.1** — last publish ~2024; pure JS, zero deps, ~2 KB. Works, but `semver` is preferred for new code unless bundle size dominates.

### Pattern: force-store-update gate (recommended stack)

```
expo-application   // read installed binary version
fetch + AbortController + AsyncStorage  // pull JSON config, cache, fail-open
semver             // compare installed vs minimumRequired
Linking.openURL    // App Store / Play Store URL on hard-block
```

Properties:
- No new native modules; no `expo prebuild` required.
- Works under New Architecture (default in SDK 55).
- Fail-open on network error — config-host outage does not brick installs.
- OTA-orthogonal — pairs cleanly with `expo-updates` if added later.

### Anti-patterns

- Reading `Constants.expoConfig.version` for the gate decision (can be null / stale after OTA).
- Scraping App Store / Play Store HTML for "latest version" (what `react-native-version-check` does — fragile).
- Blocking app launch synchronously on the config fetch.
- Using `expo-updates` (OTA) to satisfy an App-Store-required native update.

---

## 2026-05-26 — Manual location search (geocoding + bottom sheet + debounce)

Sources: Context7 `/gorhom/react-native-bottom-sheet`, Context7 `/expo/expo` (`llms-sdk-v55.0.0.txt`), npm registry, GitHub issues #2528 / #2546 / #2600 / expo#42886, GitHub release `v5.1.8`, Nominatim 5.3.2 manual, OSMF Nominatim Usage Policy.

### @gorhom/bottom-sheet
- Latest: **v5.2.6** on npm. v5 line is actively maintained.
- **Reanimated 4 support landed in v5.1.8** (migrated away from removed `useWorkletCallback`; declares `react-native-worklets` as a required peer; Babel plugin moves from `react-native-reanimated/plugin` → `react-native-worklets/plugin`).
- Peer deps: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets` (the last is implicit via Reanimated 4 in SDK 55).
- Open SDK-55-specific defect: expo/expo#42886 — "[SDK 55] @gorhom/bottom-sheet crashes on iOS unless expo-router installed." Mitigation: this app already has `expo-router ~55.0.16`, so the defect does not apply.
- Issues #2528 / #2546 (Reanimated 4 breakage) were filed against v5.1.7 and earlier; they are resolved by upgrading to ≥5.1.8. Issue #2600 (opened 2026-01-21) is a forward-looking feature ask for a v6 rewrite, not a blocker.
- Status: **OK on v5.1.8+**. Pin `^5.2.6`.

### react-native-modal
- Status: legacy alternative; still receives sporadic patches but not New-Architecture-first. No reason to introduce here when `@gorhom/bottom-sheet@5.2.6` is the modern, gesture-native option already targeting RN 0.83 + New Arch.
- Not installed in this project. Do NOT add it.

### use-debounce
- Latest: **v10.1.1** (npm, published 2026-Q1). ~1,435 dependents.
- Pure JS, no native code → OTA-safe.
- Works with React 19. Two exported hooks: `useDebounce(value, delay)` and `useDebouncedCallback(fn, delay, options?)`.
- Trivially replaceable by an inline `useEffect` + `setTimeout` debounce (~15 lines). Adding the dep is acceptable but not required.

### expo-location forward geocoding (`Location.geocodeAsync`)
- Confirmed present in **SDK 55** (`llms-sdk-v55.0.0.txt`).
- Signature: `geocodeAsync(address: string): Promise<LocationGeocodedLocation[]>`.
- Implementation: **native only on mobile** as of the 2020 refactor (PR #9444 / SDK 39). iOS → `CLGeocoder`; Android → `android.location.Geocoder`. Google Maps fallback removed; only an opt-in `useGoogleMaps` flag remains (web-targeted).
- **Critical permission caveat**: on **Android**, foreground location permission MUST be granted before `geocodeAsync` works (call `requestForegroundPermissionsAsync` first). On iOS, no permission required. This contradicts the spec's "without GPS permission" assumption on Android.
- **Resource-constrained**: docs explicitly warn "Creating too many requests at a time can result in an error." Apple CLGeocoder rate-limits aggressively (~1 req/sec, throttles a misbehaving app for minutes).
- International / Russian city names: native geocoders honor device locale. Cyrillic queries work but quality varies by region; Apple's coverage of Russian cities is reasonable, Android's depends on Play Services.
- Cannot return a list of disambiguating candidates reliably — returns "in most cases its size is 1." Bad for a "type Moscow, pick from 5 matches" UX.

### Nominatim (`nominatim.openstreetmap.org`)
- Endpoint: `https://nominatim.openstreetmap.org/search` (HTTPS, official).
- Format: `?q=Moscow&format=json&limit=5&accept-language=ru` returns JSON array of `{ lat, lon, display_name, class, type, importance, place_id, osm_type, osm_id, boundingbox, ... }`. `addressdetails=1` adds an `address` sub-dict.
- Russian names: pass `accept-language=ru` (header or query param). Works.
- **HARD POLICY LIMITS (OSMF, current as of 2026-05):**
  1. **Max 1 request per second.** Bursting is throttled / banned.
  2. **Valid User-Agent identifying the app is REQUIRED.** Stock HTTP-library UAs (e.g. `okhttp/4.x`, `CFNetwork`) are rejected with 403. Must send `User-Agent: HoraryAstrology/1.0 (contact-email)`.
  3. **Client-side autocomplete is EXPLICITLY PROHIBITED.** Quote from policy: "No heavy uses (an absolute maximum of 1 request per second). … No autocomplete search. This service is not designed to support autocomplete search."
  4. Attribution to OpenStreetMap contributors required in the UI.
- Implication: a debounced type-ahead in a shipping consumer app calling `nominatim.openstreetmap.org` directly **violates the usage policy** even at 1 req/sec, because the *pattern* is forbidden, not just the rate. The right answers are:
  - Self-host Nominatim, or
  - Use a paid Nominatim mirror (LocationIQ, MapTilerGeocoding, Geoapify, Stadia Maps — all offer free tiers with autocomplete permission), or
  - Use a different free-tier provider (Photon by Komoot is built for autocomplete and uses OSM data).

### Decision matrix for this feature
| Need | Recommendation |
|---|---|
| Modal UI | `@gorhom/bottom-sheet@^5.2.6` (already-installed gesture-handler 2.30.0 ✓; reanimated 4.2.1 ✓; worklets 0.7.4 ✓) |
| Debounce | `use-debounce@^10.1.1` OR inline `setTimeout`; both fine, OTA-safe |
| Geocoding for typed city search with a candidate list | **NOT** `Location.geocodeAsync` (Android permission required, single-result, throttled). **NOT** raw `nominatim.openstreetmap.org` (autocomplete forbidden by policy). Use Photon (`photon.komoot.io`) for free autocomplete, or LocationIQ/Geoapify with API key. |
| Geocoding for "convert one canonical address to coords" (no autocomplete) | Nominatim is acceptable IF rate-limited to ≤1/sec AND User-Agent set AND attribution shown |

### Native rebuild requirements
- Adding `@gorhom/bottom-sheet`: **NO native rebuild** (pure JS on top of already-linked gesture-handler + reanimated + worklets). OTA-safe.
- Adding `use-debounce`: **NO native rebuild**. OTA-safe.
- Calling Nominatim / Photon / LocationIQ HTTP APIs: **NO native rebuild**. OTA-safe.
- Using `expo-location.geocodeAsync`: already linked in SDK 55, **NO native rebuild**.
- `@react-native-community/geolocation`: would require native rebuild (autolinked native module). Not needed — `expo-location` already covers GPS.

### Anti-patterns specific to this feature
- Wiring a Nominatim autocomplete directly from the client. Violates OSMF policy → IP ban.
- Using `Location.geocodeAsync` for type-ahead UX — single-result return + Android permission gate + Apple CLGeocoder throttling all break this UX.
- Setting `User-Agent` to a default like `axios/1.x` against Nominatim — 403.
- Skipping `accept-language` for non-Latin queries → `display_name` returns transliterated/English form.
