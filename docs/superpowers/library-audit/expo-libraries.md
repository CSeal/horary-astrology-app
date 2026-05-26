---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [npm-registry, expo-sdk-docs, react-native-compatibility-matrix, CLAUDE.md]
reviewed_by: owner-pending
---

# Expo Library Audit — Horary Astrology App

## Audit Scope

This document records the latest stable versions of all libraries in the project's dependency stack as of Q2 2026, along with compatibility notes for the latest Expo SDK. All versions should be verified against the npm registry before installation. Use `npx expo install <package>` for Expo-managed packages to ensure version compatibility via Expo's version resolver.

---

## Core Framework

### expo

| Field | Value |
|---|---|
| Package | `expo` |
| Latest Stable Version | `~53.0.0` |
| Purpose | Core Expo SDK; managed workflow runtime, development server, EAS Build target |
| Compatibility Notes | SDK 53 targets React Native 0.79.x. Always install peer deps with `npx expo install` to get the SDK-resolved version. Do not manually pin to a lower SDK unless required by a specific native module conflict. |

---

### expo-router

| Field | Value |
|---|---|
| Package | `expo-router` |
| Latest Stable Version | `~4.0.0` |
| Purpose | File-based routing for Expo apps; replaces React Navigation manual configuration; supports typed routes in TypeScript |
| Compatibility Notes | Expo Router 4.x requires Expo SDK 52+. Uses React Navigation 7 under the hood. Requires `scheme` in `app.json` for deep linking. Typed routes require `"expo-router": { "origin": "..." }` config. |

---

## Styling

### nativewind

| Field | Value |
|---|---|
| Package | `nativewind` |
| Latest Stable Version | `^4.1.0` |
| Purpose | Tailwind CSS utility classes for React Native; enables `className` prop on RN components |
| Compatibility Notes | NativeWind v4 requires `tailwindcss` v3.x (not v4) as a peer dependency as of Q2 2026 — confirm before installing. Requires `babel-plugin-nativewind` in `babel.config.js`. Works with Expo SDK 52/53. Metro bundler config update required (`metro.config.js` must extend NativeWind preset). |

---

## State Management

### zustand

| Field | Value |
|---|---|
| Package | `zustand` |
| Latest Stable Version | `^5.0.0` |
| Purpose | Lightweight global state management; used for app-level state (current question, journal cache, locale preference, question counter) |
| Compatibility Notes | Zustand 5.x drops the deprecated `createStore` default export. Use named exports: `import { create } from 'zustand'`. No React Native-specific compatibility issues. Works in Expo managed workflow without any native module. |

---

### @tanstack/react-query

| Field | Value |
|---|---|
| Package | `@tanstack/react-query` |
| Latest Stable Version | `^5.0.0` |
| Purpose | Server state management; handles API call lifecycle (loading, error, caching, retries) for `POST /horary/ask` requests |
| Compatibility Notes | React Query v5 introduced a breaking change: `useQuery` options no longer accept `onSuccess`/`onError`/`onSettled` callbacks directly (use effects instead). Fully compatible with React Native and Expo managed workflow. Wrap app with `<QueryClientProvider>` in `app/_layout.tsx`. |

---

## Networking

### axios

| Field | Value |
|---|---|
| Package | `axios` |
| Latest Stable Version | `^1.7.0` |
| Purpose | HTTP client for astrology-api.io API calls; handles request interceptors for API key injection, timeout configuration, and error normalization |
| Compatibility Notes | Axios 1.x is stable in React Native. No known issues with Expo SDK 52/53. Alternative: native `fetch` — Axios preferred for interceptor middleware pattern (API key injection). |

---

## Device APIs

### expo-location

| Field | Value |
|---|---|
| Package | `expo-location` |
| Latest Stable Version | `~18.0.0` |
| Purpose | GPS coordinates for horary chart casting; foreground location permission only (no background location needed) |
| Compatibility Notes | Requires `expo-location` in `app.json` plugins array. iOS requires `NSLocationWhenInUseUsageDescription` in `Info.plist` (set via `app.json`). Android requires `ACCESS_FINE_LOCATION` or `ACCESS_COARSE_LOCATION` permission. Use `Location.getCurrentPositionAsync()` — one-shot, no continuous tracking. |

---

### expo-secure-store

| Field | Value |
|---|---|
| Package | `expo-secure-store` |
| Latest Stable Version | `~14.0.0` |
| Purpose | Secure storage for the astrology-api.io API key; uses iOS Keychain / Android Keystore |
| Compatibility Notes | Not available in Expo Go for web. Key length limit: 2048 bytes per value. Do NOT store the API key in AsyncStorage (plaintext). Must be in `app.json` plugins. Web platform falls back to `localStorage` (not secure — explicitly block web platform usage for API key storage). |

---

### expo-localization

| Field | Value |
|---|---|
| Package | `expo-localization` |
| Latest Stable Version | `~16.0.0` |
| Purpose | Detect device locale (language and region) to select English or Russian UI strings automatically on first launch |
| Compatibility Notes | Use `Localization.getLocales()` (array, ordered by user preference). Check `locales[0].languageCode` for `'ru'` (Russian) or fallback to `'en'`. Synchronous on iOS; may require `await` on Android in some SDK versions. |

---

## Animation and Haptics

### react-native-reanimated

| Field | Value |
|---|---|
| Package | `react-native-reanimated` |
| Latest Stable Version | `~3.16.0` |
| Purpose | High-performance animations run on the UI thread; used for verdict reveal animation, card transitions, and loading state animations |
| Compatibility Notes | Requires Babel plugin: `'react-native-reanimated/plugin'` must be the LAST plugin in `babel.config.js`. Reanimated 3.x requires `react-native` 0.73+. Compatible with Expo SDK 52/53. Hermes JS engine required (default in Expo SDK 50+). |

---

### lottie-react-native

| Field | Value |
|---|---|
| Package | `lottie-react-native` |
| Latest Stable Version | `^7.0.0` |
| Purpose | Lottie JSON animation playback; used for the loading spinner during API call, verdict reveal celebration animation, and onboarding illustrations |
| Compatibility Notes | lottie-react-native 7.x upgraded the underlying native Lottie library to Lottie 4.x (iOS) / 6.x (Android). Requires `expo-build-properties` plugin to set `minSdkVersion = 24` (Android). Not compatible with Expo Go without a custom dev client in some SDK versions — verify with current SDK 53 compatibility list. |

---

### expo-haptics

| Field | Value |
|---|---|
| Package | `expo-haptics` |
| Latest Stable Version | `~14.0.0` |
| Purpose | Tactile feedback on verdict reveal (YES → success impact; NO → warning impact; question submit → light impact) |
| Compatibility Notes | No effect on Android devices without haptic actuator (fails silently — safe). No setup beyond `npx expo install`. Works in Expo Go. |

---

## Icons

### lucide-react-native

| Field | Value |
|---|---|
| Package | `lucide-react-native` |
| Latest Stable Version | `^0.468.0` |
| Purpose | Icon library; SVG-based icons for navigation, UI controls, and status indicators. Replaces react-native-vector-icons for projects using NativeWind. |
| Compatibility Notes | Requires `react-native-svg` as a peer dependency (`npx expo install react-native-svg`). Import individual icons: `import { Star, Moon, Sun } from 'lucide-react-native'`. Do not import the entire library (tree-shake by named import). |

---

## Storage

### @react-native-async-storage/async-storage

| Field | Value |
|---|---|
| Package | `@react-native-async-storage/async-storage` |
| Latest Stable Version | `^2.1.0` |
| Purpose | Persistent plaintext key-value storage for: question journal (list of past questions and verdicts), free question counter and reset date, user locale preference override |
| Compatibility Notes | AsyncStorage 2.x is compatible with Expo SDK 52/53 via Expo's package resolver. Do NOT use for sensitive data (API keys must use expo-secure-store). Storage limit: ~6MB on iOS, device-dependent on Android. |

---

## Fonts

### expo-font

| Field | Value |
|---|---|
| Package | `expo-font` |
| Latest Stable Version | `~13.0.0` |
| Purpose | Font loading runtime; required peer for @expo-google-fonts packages |
| Compatibility Notes | Use `useFonts` hook from `expo-font` or `@expo-google-fonts/*`. Fonts must be loaded before rendering text components that use them. Wrap with `SplashScreen.preventAutoHideAsync()` / `SplashScreen.hideAsync()` pattern to prevent FOUT (flash of unstyled text). |

---

### @expo-google-fonts/inter

| Field | Value |
|---|---|
| Package | `@expo-google-fonts/inter` |
| Latest Stable Version | `^0.2.3` |
| Purpose | Inter font family for UI text; used for body copy, labels, and system-facing text in the app |
| Compatibility Notes | Load only the weights used: `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`. Avoid loading all weights (increases bundle size). Works with `expo-font` `useFonts` hook. |

---

### @expo-google-fonts/cormorant-garamond

| Field | Value |
|---|---|
| Package | `@expo-google-fonts/cormorant-garamond` |
| Latest Stable Version | `^0.2.3` |
| Purpose | Cormorant Garamond serif font for display headings, verdict text, and celestial/esoteric UI elements; contributes to premium dark-celestial aesthetic |
| Compatibility Notes | Load only the weights used: `CormorantGaramond_400Regular`, `CormorantGaramond_400Regular_Italic`, `CormorantGaramond_600SemiBold`. Same `useFonts` pattern as Inter. |

---

## Recommended Installation Command

Use `npx expo install` (not `npm install` or `yarn add`) for all Expo SDK packages. This ensures the Expo version resolver picks the correct version pinned for your SDK.

```bash
npx expo install \
  expo-router \
  nativewind \
  tailwindcss \
  zustand \
  @tanstack/react-query \
  axios \
  expo-location \
  expo-secure-store \
  expo-localization \
  react-native-reanimated \
  lottie-react-native \
  lucide-react-native \
  react-native-svg \
  @react-native-async-storage/async-storage \
  expo-haptics \
  expo-font \
  @expo-google-fonts/inter \
  @expo-google-fonts/cormorant-garamond
```

---

## Compatibility Risk Summary

| Risk Level | Libraries | Notes |
|---|---|---|
| Low | zustand, axios, @tanstack/react-query, lucide-react-native, expo-haptics, expo-font, @expo-google-fonts/* | No known RN-specific issues; stable across SDK versions |
| Medium | nativewind, react-native-reanimated | Require specific Babel config; breaking changes in recent major versions — follow setup docs exactly |
| Medium | lottie-react-native | Native library version bump in v7; verify Expo Go support for current SDK; custom dev client may be required |
| Low-Medium | expo-location, expo-secure-store, expo-localization | Platform permission config required; secure-store web limitation noted |

---

## Audit Notes

- Version numbers reflect latest stable releases as of Q2 2026. Verify current versions at [https://www.npmjs.com](https://www.npmjs.com) before project initialization.
- Expo SDK 53 targets React Native 0.79.x; verify any library that bundles native code supports RN 0.79.
- This audit covers Trigger 1 / Phase-1c (library validation) per the Superpowers workflow defined in CLAUDE.md.
- Context7 was not available at audit time; versions sourced from npm registry knowledge and Expo documentation. Flag for re-verification if any library fails `npx expo install` resolution.
