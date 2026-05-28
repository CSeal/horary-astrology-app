# Domain Audit — Force Update on Launch (Expo SDK 55, iOS + Android)

- **Date:** 2026-05-26
- **Topic:** Force-update / kill-switch screen blocking access until user installs newer "critical" version
- **Author:** Compound V Phase 1B (domain advisor)
- **Stack constraints (from spec):** React Native + Expo SDK 55, iOS + Android, no backend yet, MVP

---

## 1. Domain(s) Identified

1. `mobile-force-update` — version-gating UX, store APIs, Expo runtime constraints
2. `mobile-remote-config` — Firebase Remote Config vs hosted JSON vs store-API polling
3. `app-store-review-policy` — Apple/Google policy on blocking screens and update prompts

---

## 2. Sources Consulted

**KB files reused:** None. No prior `_knowledge-base/*.md` existed for any of these domains — this audit creates the seed entries.

**Web searches executed (parallel, Layers 1–3):**

Layer 1 (official / authoritative):
- "expo react native force update implementation 2025 2026 best practices"
- "react-native-version-check expo SDK 55 force update library 2026"
- "iTunes lookup API app store version check rate limit reliability 2025"
- "Firebase Remote Config vs hosted JSON force update mobile MVP tradeoffs"
- "expo-updates OTA vs native binary force update app store version mismatch"
- "Firebase Remote Config minimum fetch interval throttle force update launch"
- "'In-App Updates' Google Play immediate flexible force update API 2025"
- "react-native-version-check getStoreVersion latest 2025 maintained alternative"
- "CodePush AppCenter deprecated 2024 2025 alternative force update React Native"

Layer 2 (practitioner channels):
- "site:github.com expo-updates checkForUpdateAsync force restart vs native version"
- "expo Constants.expoConfig.version Application.nativeApplicationVersion deprecated SDK 50 51 52"
- "'splash screen' expo SplashScreen.preventAutoHideAsync force update check before"
- "'itunes.apple.com/lookup' bundleId stale cache outdated version not updated"
- "'iTunes lookup' CDN propagation delay new app version release hours"
- "Linking.openURL itms-apps fails iOS 17 18 simulator real device 2025"
- "semver coerce version comparison '1.2.3.4' four-part build numbers expo"
- "Google Play scraping detection blocked unofficial API force update 2025"

Layer 3 (audience / community signal):
- "site:reddit.com/r/reactnative force update version check Firebase remote config" → no hits
- "site:reddit.com/r/expo force update version blocking screen" → no hits
- "site:stackoverflow.com react native force update version comparison semver" → no hits
- "'fail open' vs 'fail closed' force update mobile app launch network timeout"
- "App Store review reject force update screen blocking 4.0 guideline rejection"
- "Apple guideline 4.0 forced update screen App Store Review rejection 2024 2025"
- "app store country localization itunes lookup country parameter version different region"

**Layer-3 honesty note:** Direct Reddit/SO searches for this exact topic returned no results. I do NOT claim community consensus on r/reactnative or r/expo from search-engine indexing alone — treat audience-signal sections below as "inferred from practitioner blog posts + GitHub issues + Apple Developer Forums," not as community-survey data.

**Primary URLs (load-bearing for constraints below):**
- [Apple Dev Forum — iTunes lookup endpoint caching](https://developer.apple.com/forums/thread/739542)
- [Apple Dev Forum — iTunes Lookup returning old version](https://developer.apple.com/forums/thread/725780)
- [Apple Dev Forum — iTunes Search API rate limited (403)](https://developer.apple.com/forums/thread/66399)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play In-App Updates](https://developer.android.com/guide/playcore/in-app-updates)
- [Firebase Remote Config — loading strategies](https://firebase.google.com/docs/remote-config/loading)
- [Expo Updates docs](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55)
- [Expo App version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo Constants docs](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Expo SplashScreen docs](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- [GitHub issue: preventAutoHideAsync no effect (#31875)](https://github.com/expo/expo/issues/31875)
- [GitHub issue: preventAutoHideAsync auto-hides (#33762)](https://github.com/expo/expo/issues/33762)
- [GitHub issue: checkForUpdateAsync isAvailable:false on network error (#3640)](https://github.com/expo/expo/issues/3640)
- [npm: react-native-version-check](https://www.npmjs.com/package/react-native-version-check)
- [npm: react-native-store-version](https://www.npmjs.com/package/react-native-store-version)
- [GitHub: react-native-appstore-version-checker (DEPRECATED)](https://github.com/a7ul/react-native-appstore-version-checker)
- [npm: sp-react-native-in-app-updates](https://www.npmjs.com/package/sp-react-native-in-app-updates)
- [npm: semver](https://www.npmjs.com/package/semver)

---

## 3. Domain Constraints the Brainstorm Probably Missed

### MUST

1. **MUST handle iTunes Lookup CDN propagation delay (24–48h)** after a new App Store release. The iTunes lookup API caches at Apple's edge; freshly-released versions may not appear for hours. ([Apple Dev Forum #725780](https://developer.apple.com/forums/thread/725780)). This means: if you push v1.2.0 to the App Store at 10:00, calling lookup at 10:30 may still report v1.1.0. Force-update logic that triggers on `latestStoreVersion > installedVersion` will silently fail to nudge anyone for the first ~24h.

2. **MUST bust Apple's server-side cache** when polling iTunes lookup by appending a cache-busting query param (`&t=<unix_timestamp>`). Standard HTTP cache headers (`Cache-Control: no-cache`, `URLRequest.reloadIgnoringLocalAndRemoteCacheData`) do NOT invalidate Apple's edge cache. ([Apple Dev Forum #739542](https://developer.apple.com/forums/thread/739542)).

3. **MUST pass the correct `country` parameter** to iTunes lookup. The default is `US`. If your app is not available in the US store (or has different version availability per region), lookup will either 404 or return wrong data. ISO-2 codes: `?bundleId=com.x.y&country=GB`. ([Apple iTunes Search docs via Grokipedia](https://grokipedia.com/page/iTunes_Search_API)).

4. **MUST use `expo-application` (`Application.nativeApplicationVersion`) — NOT `Constants.expoConfig.version` — for the installed version.** `Constants.expoConfig.version` reads from `app.json` at build time and is unreliable when EAS auto-bumps versions or for OTA-updated bundles. `Application.nativeApplicationVersion` reads the actual `CFBundleShortVersionString` (iOS) / `versionName` (Android) from the binary. ([Expo App version management](https://docs.expo.dev/build-reference/app-versions/), [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)).

5. **MUST distinguish between `version` (semver, user-visible) and `buildNumber`/`versionCode` (integer, store-internal)** for comparison logic. Compare `version` for force-update gating; never compare `buildNumber` across platforms (iOS uses string, Android uses integer).

6. **MUST handle the case where `Updates.checkForUpdateAsync()` returns `isAvailable: false` on network error** — it does not throw, it lies. ([Expo issue #3640](https://github.com/expo/expo/issues/3640)). Wrap in explicit network-failure detection.

7. **MUST place the version check AFTER `SplashScreen.preventAutoHideAsync()` and BEFORE `SplashScreen.hideAsync()`** if you want to gate the user before they see UI. Run the check during the splash window, with a hard timeout, then hide splash and either route to main or to the force-update screen. ([Expo SplashScreen](https://docs.expo.dev/versions/latest/sdk/splash-screen/)).

8. **MUST use a hard timeout (recommend 3–4s) on the remote check** and fail-OPEN (let user in) on timeout. Fail-closed at launch on every cold start is a launch-blocker bug if your config source has any outage. ([Ova — fail-open vs fail-closed](https://ova.it.com/network-security-failure-modes/understanding-fail-open-vs-fail-closed/)).

9. **MUST set `runtimeVersion` correctly in `app.json` if EAS Update is in scope.** Mismatched runtime versions cause `expo-updates` to silently refuse updates. ([Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)).

10. **MUST send users to the correct store-link scheme:**
    - iOS (real device): `itms-apps://itunes.apple.com/app/id<NUMERIC_APP_ID>` (numeric Apple ID, NOT bundle ID)
    - iOS (web fallback): `https://apps.apple.com/app/id<NUMERIC_APP_ID>`
    - Android: `market://details?id=<PACKAGE_NAME>`
    - Android web fallback: `https://play.google.com/store/apps/details?id=<PACKAGE_NAME>`
    
    Use `Linking.canOpenURL` to detect whether `itms-apps://` / `market://` resolves; if not (simulator, no Play Store), fall back to https. ([Branch.io link FAQ](https://help.branch.io/faq/docs/how-do-branch-links-handle-redirecting-users-into-the-app-store-or-google-play-store)).

### MUST NOT

11. **MUST NOT use the deprecated `react-native-appstore-version-checker` library.** Officially deprecated; maintainer redirects to `react-native-version-check`. ([GitHub: a7ul/react-native-appstore-version-checker](https://github.com/a7ul/react-native-appstore-version-checker)).

12. **MUST NOT rely on `react-native-version-check` for new SDK 55 work without sandbox testing.** Last published over a year ago; maintainer publicly states limited iOS experience and inactive maintenance. Works for many cases but has not been verified against Expo SDK 55 / New Architecture (always-on in SDK 55). ([npm: react-native-version-check](https://www.npmjs.com/package/react-native-version-check), [Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55)).

13. **MUST NOT scrape Google Play HTML to fetch the latest Android version from the client.** Google actively blocks scraping with CAPTCHA / 503 throttling, especially from datacenter or mobile carrier IPs. ([ScrapeCreators 2025 anti-scraping update](https://scrapecreators.com/blog/how-to-bypass-google-s-new-anti-scraping-restrictions-2025-update)). The only safe Android approach without a backend is **Google Play In-App Updates API** (see below) — not HTML scraping.

14. **MUST NOT call iTunes lookup more than ~20 times/minute** from a single IP. Apple has historically dropped the limit dramatically without notice (from ~1200/min to ~10/min in mid-2020). ([Apple Dev Forum #66399](https://developer.apple.com/forums/thread/66399)). Cache aggressively on-device (recommend in-memory + AsyncStorage with 30–60min TTL).

15. **MUST NOT rely on Microsoft CodePush.** App Center was fully retired 2025-03-31; CodePush silently fails on Bridgeless / New Architecture mode (which is mandatory in SDK 55). ([Stallion blog](https://learn.stalliontech.io/blogs/codepush-alternative)).

16. **MUST NOT use `Constants.manifest`** — removed in SDK 49+. Use `Constants.expoConfig` only as a fallback to `Application.nativeApplicationVersion`. ([Expo Constants docs](https://docs.expo.dev/versions/latest/sdk/constants/)).

17. **MUST NOT block users for OTA updates from a force-update screen.** Force-update logic targets *native-binary* version mismatch (requires store install). OTA updates via `expo-updates` happen automatically — if you conflate the two, users will see the blocker even when EAS could have hot-patched them. ([Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)).

### SHOULD

18. **SHOULD distinguish three tiers**, not two:
    - **Hard block (force):** native binary too old, breaking API change shipped — block UI, link to store.
    - **Soft nudge (recommend):** newer version exists but current still works — dismissible banner.
    - **OTA refresh (silent):** `expo-updates` hot-patches in background, prompts reload on next launch.

19. **SHOULD use Google Play In-App Updates API on Android** (`com.google.android.play:app-update:2.1.0+`). Native, no scraping, no backend required, supports immediate (force) and flexible (background) flows. Wrapped by `sp-react-native-in-app-updates` for React Native. ([Google In-App Updates](https://developer.android.com/guide/playcore/in-app-updates), [npm: sp-react-native-in-app-updates](https://www.npmjs.com/package/sp-react-native-in-app-updates)). Caveat: `sp-react-native-in-app-updates` last published ~1 year ago — re-verify against SDK 55 New Architecture.

20. **SHOULD use Firebase Remote Config (NOT iTunes lookup) as the source of truth for "what is the minimum-required version"** even for an MVP. iTunes lookup tells you the *latest* shipped version — not which versions you've decided are blocking. Firebase Remote Config lets product/engineering decide "minimum supported = 1.4.0" without a binary release. Free tier easily covers MVP usage. ([Firebase Remote Config](https://firebase.google.com/docs/remote-config)).

21. **SHOULD set `minimumFetchIntervalInSeconds: 0` for the cold-start force-update fetch** in Firebase Remote Config — default is 12 hours and will return stale values on launch. Throttle protection still applies on server side, so this is safe in production. ([Firebase Remote Config loading](https://firebase.google.com/docs/remote-config/loading)).

22. **SHOULD use `semver` (npm) library, not hand-rolled string compare.** Handles edge cases: `1.10.0 > 1.9.0` (string-compare gets this wrong), pre-release tags (`1.2.0-beta.1`), invalid input. For Expo's typical `MAJOR.MINOR.PATCH` versions (no four-part), `semver.gt(latest, current)` is the canonical check. For four-part versions, use `semver.coerce()` first — note coercion truncates to three parts (`1.2.3.4` → `1.2.3`). ([npm: semver](https://www.npmjs.com/package/semver)).

---

## 4. Common Traps in This Domain

| Trap | Why it bites |
|---|---|
| **Releasing v1.2.0 to App Store, then immediately publishing Firebase config saying "minimum = 1.2.0"** | iTunes lookup hasn't propagated; users on auto-update still on 1.1.0 get blocked with no available update for hours. |
| **Comparing `Constants.expoConfig.version` to remote version** | Reads `app.json` at build time; for EAS auto-bumped builds or OTA-patched apps, this is wrong. Use `expo-application`. |
| **Hand-rolled "1.10.0" string compare** | Lexicographic compare says `1.10.0 < 1.9.0`. Classic bug. Use `semver`. |
| **Forgetting numeric App ID vs bundle ID for `itms-apps://`** | The iOS deep link needs the numeric ID (e.g., `id544007664`), not `com.company.app`. |
| **Testing on iOS Simulator** | `itms-apps://` does NOT work on simulator — no App Store. ([launch_review issue](https://github.com/Purus/launch_review/issues/16)). You'll get a no-op or error. Must test on real device. |
| **Blocking on first launch with no offline-friendly cache** | User in airplane mode, or behind captive WiFi → app is permanently bricked. Always have a "last-known-good" cached config with sane TTL. |
| **Fetching every cold start with no jitter/caching** | A million users × 1 fetch/launch × 5 launches/day = trivially throttle-able. Cache config 30–60 min on-device. |
| **`preventAutoHideAsync()` flakiness** | Documented issues on Expo SDK 52+ where the splash auto-hides anyway, especially on Android. Don't rely on it as the sole gating mechanism — always render a guard UI inside `_layout.tsx`/root component. ([#31875](https://github.com/expo/expo/issues/31875), [#33762](https://github.com/expo/expo/issues/33762), [#32760](https://github.com/expo/expo/issues/32760)). |
| **Confusing OTA "force restart" with binary force-update** | `expo-updates`'s `reloadAsync()` swaps JS bundle, not native code. Force-update screens are for the *opposite* case: when JS+native need to ship together via store. |
| **Storing the version comparison logic only on client** | Client says "we're 1.4.0, server config says minimum is 1.5.0, block!" — fine. But product team wanting to *unblock* a hotfix mid-rollout has no escape hatch. Make Firebase Remote Config the dial. |
| **iTunes Lookup returning a different country's version** | App ships in EU two weeks before US. Lookup with default `country=US` 404s or returns stale data. Detect device locale or hard-code the launch country. |

---

## 5. Regulatory / Compliance Notes

### Apple App Store Review Guidelines

- **No explicit guideline prohibits force-update screens.** Force-update screens are widely used and accepted by Apple Review. Search of the [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) found no specific prohibition; community evidence in [RevenueCat's rejection guide](https://www.revenuecat.com/blog/growth/the-ultimate-guide-to-app-store-rejections/) does not list "force update screen" as a rejection reason.
- **However:** Apple's Guideline 4.0 (Design) requires apps to provide functionality and not be deceptive. A force-update screen MUST clearly explain *why* the user must update, and the "Update now" button MUST functionally route to the App Store. A non-functional, non-explanatory blocker risks rejection under "minimum functionality."
- **No special review-notes disclosure required.** Force-update is a standard pattern; no need to call it out specifically in App Store Connect notes.

### Google Play

- **In-App Updates API is the Google-blessed mechanism.** Using it instead of a custom screen aligns with Play policy and provides a native UI that won't be flagged.
- **A custom force-update screen is also permitted**, but the "Update" CTA must use the Play Store deep link (`market://`) and not a third-party APK source — sideloading prompts are prohibited under the Device and Network Abuse policy.

### Privacy (GDPR / CCPA)

- **Firebase Remote Config is GDPR-compliant** when configured correctly (Google is the data processor; users do not consent to "Firebase" individually). However, an MVP collecting *any* user identifier via Firebase requires a Privacy Policy disclosure that Firebase is in use. Since force-update fetches need no PII, document this as "Firebase Remote Config: app configuration only, no PII collected."
- **iTunes Lookup is anonymous** (public endpoint, no identifiers required) — no GDPR exposure.

### Russia (Roskomnadzor) — relevant given target locales (ru+en) per project context

- **Firebase services have been intermittently blocked in Russia** since 2022. If you ship to Russian users, Firebase Remote Config may fail entirely for some users. Hosted-JSON on a CDN with a Russia-accessible edge (Cloudflare, BunnyCDN) is more resilient. Plan for fail-open behavior.

---

## 6. Recent Breaking Changes (last 12 months)

1. **Microsoft App Center / CodePush retired 2025-03-31.** Any plan referencing CodePush is dead-on-arrival. Use EAS Update (Expo's first-party OTA) or `expo-updates` library. ([Stallion blog](https://learn.stalliontech.io/blogs/codepush-alternative)).

2. **Expo SDK 55 is New Architecture-only.** RN 0.83 (in SDK 55) cannot disable Bridgeless mode. CodePush, older native modules, and some legacy version-check libraries broke. ([Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55)).

3. **Google SafetyNet → Play Integrity migration completed Jan 2025.** Force-update logic that piggybacks on attestation needs updating. Not directly relevant to a simple version check, but flagged if the plan tries to "verify the user is on a real device" before fetching config.

4. **Apple iTunes Search API rate limits have been informally tightened.** Community reports of 20 req/min limits per IP since 2020; no public Apple announcement of changes. Treat ~10 req/min/IP as a safe ceiling. ([Apple Dev Forum #66399](https://developer.apple.com/forums/thread/66399)).

5. **`Constants.manifest` removed in SDK 49+.** Replaced with `Constants.expoConfig`. ([Expo Constants docs](https://docs.expo.dev/versions/latest/sdk/constants/)). Plan must reference the new API only.

6. **Firebase Remote Config real-time updates GA on Apple platforms (SDK ≥ 10.7.0, mid-2023).** Force-update config can propagate within seconds instead of 12h fetch interval. ([Firebase blog](https://firebase.blog/posts/2023/06/feature-flags-with-real-time-remote-config)).

---

## 7. Design Constraints for the Plan (non-negotiable)

The plan author MUST treat the following as binding:

1. **Use Firebase Remote Config as the config source** for "minimum supported version" — not iTunes Lookup, not Play scraping, not a static GitHub Gist (Gist has no SLA, no edge cache, no analytics). For zero-cost MVP, Remote Config free tier is the right call.

2. **Use `expo-application`'s `Application.nativeApplicationVersion` for the local version read.** Never `Constants.expoConfig.version`.

3. **Use `semver` (npm package) for version comparison.** Specifically `semver.lt(currentVersion, minimumVersion)` to gate. Coerce inputs first.

4. **Hard timeout 3000ms on the Remote Config fetch.** On timeout OR error, fail-OPEN (allow app launch). Surface failure via a debug log, not user-facing.

5. **Cache the Remote Config result on-device** (`AsyncStorage` or `expo-secure-store` — not critical which). TTL 30 min. On subsequent launches within TTL, use cached value; refresh in background after UI is shown.

6. **Run the check inside `_layout.tsx` (Expo Router root)** while splash is held via `SplashScreen.preventAutoHideAsync()`. If check completes in <3s → route appropriately and hide splash. If timeout → hide splash and allow main app (fail-open).

7. **The force-update screen MUST be non-dismissible** (no back gesture, no system-back on Android — use `BackHandler` listener returning `true`). MUST display:
   - Localized title + reason ("Update required to continue")
   - "Update now" button → deep-link to store
   - Current installed version + required version (for debug/support)

8. **Store deep links:**
   - iOS: `itms-apps://itunes.apple.com/app/id<numeric_app_id>`
   - Android: `market://details?id=<package_name>`
   - Try `itms-apps://`/`market://` first; on `canOpenURL` false, fall back to `https://`.

9. **Differentiate three states in the remote config schema:**
   ```json
   {
     "min_supported_version": "1.4.0",
     "latest_version": "1.6.0",
     "force_update_message_ru": "Обновите приложение...",
     "force_update_message_en": "An update is required...",
     "soft_update_enabled": false
   }
   ```
   Force-block only when `currentVersion < min_supported_version`. Soft-prompt is a phase-2 nicety, not MVP.

10. **iOS testing strategy:** verify on a real iOS device, not simulator. Simulator does not handle `itms-apps://`.

11. **No CodePush. No `react-native-appstore-version-checker`. No HTML scraping of Play Store.**

12. **Re-evaluate `sp-react-native-in-app-updates` against SDK 55 New Architecture** before adopting. Phase 1C (library audit) should verify compatibility. If broken, fall back to a custom Android screen with `market://` deep-link — feature parity is fine for MVP.

---

## 8. Open Questions for the Human

1. **Russia distribution:** Will the MVP be available in Russian app stores (RuStore? Sideload? App Store RU?)? If yes, Firebase reachability is at risk — needs fallback. The CLAUDE.md mentions ru+en locales but doesn't specify distribution markets.

2. **Who owns the Remote Config dial?** Product? Eng? Both? Force-update is a kill switch; lock-down who can flip it. Recommend Firebase IAM with two-person approval for production.

3. **What is the trigger for forcing an update?** Critical bug? Backend API breaking change? Astrology-API.io schema migration? Without a documented trigger, the feature gets used recklessly. Recommend a one-page playbook: "Force update when, and only when, X."

4. **OTA vs binary policy:** Will you use EAS Update? If yes, the relationship between "OTA refresh" and "force update" must be documented. Specifically: do you bump `runtimeVersion` on every native release? If yes, OTA channels become per-binary, simplifying logic. If no, OTAs span multiple binaries and force-update gating gets tricky.

5. **Astrology-specific consideration:** Horary readings are time-sensitive (the moment of the question is the chart). If a user is mid-question and a force-update lands, do they lose the question? Recommend gating only at cold start, never on resume — let in-progress flows complete.

6. **Soft-update UX:** Will MVP include a dismissible "newer version available" banner? If yes, where in the IA? If not, defer to phase 2 explicitly to avoid scope creep.

7. **Localization:** Force-update message must exist in ru and en. Where does Firebase Remote Config sit relative to your `i18next` setup? Recommend the message keys live in Remote Config (so they can be edited without a release), but fall back to bundled i18n strings on fetch failure.

8. **What is your numeric iOS App ID?** Required for the `itms-apps://` URL. Not knowable until first App Store Connect submission. Plan must include a config slot for it.

---

## 9. Knowledge Base Updates

Created two new KB seed files:

- `_knowledge-base/mobile-force-update.md` — version-gating patterns, store APIs, library matrix, deep-link reference, propagation timing.
- `_knowledge-base/mobile-remote-config.md` — Firebase RC vs alternatives, fetch interval / throttling rules, Russia reachability note.

Both files cite primary sources for every claim and are dated 2026-05-26.

---

## Summary for the plan author

- **Recommended stack:** Firebase Remote Config (source of truth) + `expo-application` (local version) + `semver` (comparison) + `expo-router` `_layout` gating + `Linking` to store deep-links + `BackHandler` to block dismissal on Android.
- **Skip:** iTunes Lookup as primary source (propagation lag, rate limits, cache busting), Play scraping (blocked), CodePush (dead), `react-native-appstore-version-checker` (deprecated).
- **Re-verify in Phase 1C:** `sp-react-native-in-app-updates` and `react-native-version-check` compatibility with SDK 55 / RN 0.83 New Architecture.
- **Eight open questions for the human** before plan can be finalized.
