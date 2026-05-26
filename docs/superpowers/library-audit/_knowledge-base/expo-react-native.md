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
