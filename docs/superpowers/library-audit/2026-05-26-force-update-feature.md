# Library Audit — Force-Update Feature (Expo SDK 55)

**Date:** 2026-05-26
**Topic:** Force store-update / minimum-version enforcement on app launch
**Validator:** Compound V Phase 1C
**Repo:** horary-astrology-v1-app (Expo ~55.0.26, React Native 0.83.6, React 19.2.0)

---

## 1. Tools Available

- Context7 MCP: AVAILABLE (`/websites/expo_dev_versions_v55_0_0` resolved with 7,351 snippets, benchmark 66).
- WebSearch: AVAILABLE.
- WebFetch: PARTIAL — npmjs.com returned 403 to direct fetches; used WebSearch result excerpts and Context7 instead. Not degraded enough to block the audit.
- Manifest sources: `package.json` read; no `react-native-version-check`, `semver`, `compare-versions`, `expo-updates`, or `expo-application` currently pinned. `expo-constants ~55.0.16` is already a dependency.

---

## 2. Libraries Mentioned

| Library | Spec context | Current stable | Repo pinned | Last release | Maintenance | Status |
|---|---|---|---|---|---|---|
| `react-native-version-check` | Option for store-version compare | **3.5.0** | not installed | **2025-05-02** (≈12 months) | Maintainer publicly stepping away; "I am no longer working on mobile app development"; seeking maintainers; 42 open issues | 🟠 HIGH |
| `expo-updates` | OTA + version inspection | **55.x** (matches SDK) | not installed | Tracks SDK 55 | Official Expo, actively maintained | 🟢 OK — **but wrong tool** for store-update enforcement |
| `expo-constants` | Read `version` / `buildNumber` / `versionCode` | **~55.0.16** | **~55.0.16** | Tracks SDK 55 | Official, active | 🟢 OK — but `expoConfig` does **not** reliably contain native version fields at runtime |
| `expo-application` | Read native version + build number at runtime | **~55.x** (SDK pin) | not installed | Tracks SDK 55 | Official, active | 🟢 OK — **the correct primitive** for this feature |
| `semver` | Version comparison | **7.8.1** | not installed | Active (npm tracking 7.x) | Maintained by npm/Isaac, 643M weekly downloads, zero deps | 🟢 OK |
| `compare-versions` | Version comparison alt. | **6.1.1** | not installed | **≈2 years ago** (last publish) | Single-maintainer (omichelsen), pure JS, zero deps, "browser + Node + React Native" claim | 🟡 MEDIUM (works but stale) |

---

## 3. API Signatures Verified

| Symbol | Verified shape (SDK 55) | Source |
|---|---|---|
| `Constants.expoConfig` | `ExpoConfig & { hostUri: string } | null`. Type is the `app.json` shape — **can be null** in production and on some launch paths; populated from manifest. Not guaranteed to reflect the installed native binary version. | Context7 `/websites/expo_dev_versions_v55_0_0` → `NativeConstants` table |
| `Application.nativeApplicationVersion` | `string | null` — iOS `CFBundleShortVersionString`, Android `versionName`. **Set at native build time**, reliable in standalone. `null` on web. | Context7 expo-application docs |
| `Application.nativeBuildVersion` | `string | null` — iOS `CFBundleVersion`, Android `versionCode`. Reliable in standalone. `null` on web. | Context7 expo-application docs |
| `Updates.runtimeVersion` | `string | null` — runtime compatibility id, **not the user-facing app version**. | Context7 expo-updates docs |
| `Updates.currentlyRunning` / `updateId` / `isEmbeddedLaunch` | OTA-bundle metadata only. **Does not expose native version or buildNumber.** | Context7 expo-updates docs |
| `semver.gte(a, b)`, `semver.satisfies(v, range)`, `semver.valid(v)` | Stable v7 API (current 7.8.1). No Node built-ins required for these comparators. | npm registry |
| `compareVersions(a, b)` returns `-1|0|1`; `compare(a, b, '>=')` | Stable v6 API. UMD + ESM, zero deps. | GitHub omichelsen/compare-versions |

---

## 4. Critical Findings 🔴

None.

---

## 5. High-Priority Findings 🟠

### 5.1 `react-native-version-check` — maintainer stepping away

- **Evidence**: README of `github.com/kimxogus/react-native-version-check` states the author has "almost zero experience in iOS development" and is "no longer working on mobile app development", explicitly seeking new maintainers. Latest release `v3.5.0` on 2025-05-02 — no release in 12+ months. 42 open issues.
- **Native-code requirement**: README documents **manual iOS CocoaPods + Xcode and Android setup** — i.e., it ships a native module. The Expo-managed-workflow companion `react-native-version-check-expo` exists but inherits the same maintenance risk and adds an extra prebuild step against an Expo 55 / RN 0.83 / New Architecture target it was never tested on.
- **Compatibility with this repo**: untested against RN 0.83 + New Architecture (enabled by default in SDK 55). Adding a native module forces `expo prebuild` (Expo Go incompatible) and risks autolinking / Codegen breakage on RN 0.83.
- **Recommendation**: **AVOID.** Replace with `expo-application` (already part of the SDK, no prebuild, returns the same `nativeApplicationVersion` + `nativeBuildVersion` it would have given you) plus a remote JSON config fetch + `semver` for comparison. The "fetch latest store version" piece of `react-native-version-check` is brittle anyway (scrapes App Store / Play Store HTML, breaks when Apple/Google change markup).

### 5.2 `expo-updates` is the wrong primitive for "force store update"

- **Evidence**: Context7 SDK 55 docs confirm `Updates.runtimeVersion` and `Updates.currentlyRunning.updateId` are OTA-bundle identifiers, **not** the native app version. The library "enables your app to manage remote updates to your application **code**" (JS/asset bundle), not the native binary. The Expo team explicitly notes "there is no first-class support for critical/mandatory updates in the expo-updates library."
- **Recommendation**: Do not use `expo-updates` to drive a force-store-update gate. Use it only if/when you also ship OTA bundles. The two flows are orthogonal: `expo-updates` = swap JS bundle; force-update = block app, link to App Store / Play Store.

---

## 6. Medium Findings 🟡

### 6.1 `Constants.expoConfig` is not a reliable source of installed native version

- Context7 confirms `expoConfig` type is `ExpoConfig | null`. It reflects the **app.config / manifest**, not the native binary baked at build time. In a development build it may reflect Expo Go's manifest; in production it can be `null` on cold launch before manifest hydration; with EAS Update it may reflect a newer manifest version than the actually-installed binary.
- **Recommendation**: For the force-update check, read native version from `expo-application`. Reserve `Constants.expoConfig.version` only for non-critical display (e.g., "About" screen) and treat as best-effort.

### 6.2 `compare-versions` last publish ~2 years ago

- Still works (pure JS, zero deps, ESM + UMD). 1,631 dependents. Bundle is ~2 KB vs `semver`'s ~50 KB.
- **Decision**: prefer `semver` if you want range syntax (`^1.2.0`, `>=2.0.0 <3.0.0`) or pre-release awareness — needed if you ever ship beta tracks. Choose `compare-versions` if bundle size matters and you only need scalar `>=` comparisons. For this feature `semver` is the safer choice.

### 6.3 Manual remote JSON fetch — risks

- **CORS**: irrelevant on native (only matters in `react-native-web` builds; if remote-config endpoint sets `Access-Control-Allow-Origin: *` you're fine).
- **Timeout**: `fetch` has no built-in timeout. Must use `AbortController` (universally supported in RN 0.83) or wrap in `Promise.race`.
- **No-network**: must fail OPEN (allow app to start) — otherwise an outage on your config CDN bricks every install.
- **Caching / stampede**: pin the JSON behind a CDN with long-ish cache and a versioned key. Avoid hitting on every cold launch (debounce in storage).
- **Tampering**: payload defines a kill-switch; serve from HTTPS with integrity headers, never from a user-controllable bucket.

---

## 7. Design Constraints for the Plan

**MUST**

- MUST use `expo-application` (`Application.nativeApplicationVersion`, `Application.nativeBuildVersion`) as the source of truth for the installed app version. These are populated at native build time and survive OTA updates.
- MUST install `expo-application` via `npx expo install expo-application` so SDK 55 picks the bundled-modules pin.
- MUST use `semver` (v7.8.1, currently 7.x) for version comparison. Zero Node-builtin usage in the comparator API (`gte`, `lt`, `satisfies`, `valid`). Safe in React Native.
- MUST implement remote config fetch with `AbortController` timeout (e.g., 3 s) and **fail-open** on network error.
- MUST cache the last successful config in `AsyncStorage` and consult cache when network fails, but never block app launch on a failed fetch.
- MUST serve the remote config over HTTPS from an infrastructure surface the team controls (not a public bucket).

**MUST NOT**

- MUST NOT install `react-native-version-check` or its Expo wrapper — maintenance-orphan, requires native code, breaks Expo Go, untested on RN 0.83 + New Arch.
- MUST NOT rely on `Constants.expoConfig.version` / `ios.buildNumber` / `android.versionCode` at runtime for the gate decision — the value can be null, stale (post-OTA), or reflect the manifest rather than the binary.
- MUST NOT use `expo-updates` as the force-update mechanism. It updates the JS bundle, not the native binary; an OTA can never satisfy an App-Store-required update.
- MUST NOT scrape App Store / Play Store HTML for the "latest version" — fragile and TOS-grey. Source the minimum-required version from your own remote config.
- MUST NOT block app launch synchronously on the config fetch; perform it async and gate UI after.

---

## 8. Open Questions for the Human

1. **Two-tier vs single-tier gate?** Do you need both "soft nudge" (dismissible "update available") and "hard block" (no path forward until updated), or only the hard block? Determines the remote-config schema (`minimumRequired` vs `minimumRequired + latestAvailable`).
2. **iOS + Android version parity?** Single `minimumVersion` for both, or per-platform (Apple review delays often desync stores)? Recommend per-platform `{ ios: { min, latest }, android: { min, latest } }`.
3. **Remote config host?** EAS Hosting (Expo API route), Cloudflare Workers / KV, S3 + CloudFront, or piggyback on the existing `astrology-api.io` backend? Affects rotation policy + secret handling (CLAUDE.md §Secrets).
4. **Build-number granularity needed?** Comparing only `version` (e.g., `1.4.2`) is enough for the App Store flow. If you ever distribute internal TestFlight builds you may need to compare `nativeBuildVersion` too — confirm scope.
5. **Behavior in development build / Expo Go?** Force-update should be no-op in dev (or controlled by an `__DEV__` short-circuit). Confirm.

---

## 9. Knowledge Base Updates

Appended to `docs/superpowers/library-audit/_knowledge-base/expo-react-native.md` (existing file): a new dated section "2026-05-26 — Force-update / version-gate primitives" with the verified SDK-55 facts for `expo-application`, `expo-updates`, `expo-constants`, plus the maintenance status of `react-native-version-check`, `semver`, and `compare-versions`.

---

## Recommended Minimal Tech Stack

For a force-store-update feature on this repo:

```
expo-application  — read installed native version (nativeApplicationVersion, nativeBuildVersion)
semver            — compare installed version vs minimumRequired
fetch + AbortController + AsyncStorage — pull remote JSON config, cache, fail-open
Linking           — open App Store / Play Store URL on hard-block
```

Zero new native modules. Zero prebuild required. Works in Expo Go for dev, in standalone for prod. No abandoned dependencies introduced.

---

**Per-library verdict (one line each)**

- `react-native-version-check` — **AVOID.** Maintainer stepping away, native code required, breaks Expo Go.
- `expo-updates` — **CAUTION.** Healthy library, but wrong primitive — it ships JS bundles, not store binaries.
- `expo-constants` — **CAUTION.** Keep for `app.json` metadata; do not trust `expoConfig.version` for the gate decision.
- `expo-application` — **RECOMMENDED.** Official SDK 55 module exposing `nativeApplicationVersion` + `nativeBuildVersion`.
- `semver` — **RECOMMENDED.** 643M weekly DLs, zero deps, RN-safe.
- `compare-versions` — **CAUTION.** Smaller bundle but ~2 years since last publish; prefer `semver` unless bundle size is a hard constraint.
