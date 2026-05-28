# Mobile Force-Update Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Seeded 2026-05-26 — Force-update on launch (Expo SDK 55, iOS + Android)

### Version-source matrix (which API tells you "what is current")

| Source | Pros | Cons | When to use |
|---|---|---|---|
| **Firebase Remote Config** | Free tier ample; product can set "minimum supported version" without a release; real-time updates SDK ≥ 10.7.0; conditional targeting by OS / locale / version. | Requires Firebase SDK (adds size); may be blocked in Russia (Roskomnadzor history since 2022); 12h default fetch interval needs override on cold start. | **Default choice for MVP.** Source of truth for `min_supported_version`. |
| **iTunes Lookup API** (`https://itunes.apple.com/lookup?bundleId=…`) | No SDK; public; free; works without backend. | Apple edge cache means 24–48h propagation delay after a new App Store release ([Apple Dev #725780](https://developer.apple.com/forums/thread/725780)); rate-limited ~20 req/min/IP, historically dropped to ~10 ([Apple Dev #66399](https://developer.apple.com/forums/thread/66399)); requires cache-bust param `&t=<ts>` to bypass edge cache ([Apple Dev #739542](https://developer.apple.com/forums/thread/739542)); needs correct `country` param; returns "latest" not "minimum required." | Fallback / secondary signal only. |
| **Google Play HTML scrape** | No SDK; gets latest Android version. | Google actively blocks: CAPTCHA, 503 throttling, IP bans for repeat requests ([ScrapeCreators 2025](https://scrapecreators.com/blog/how-to-bypass-google-s-new-anti-scraping-restrictions-2025-update)). | **Never. Banned by Google ToS in practice.** |
| **Google Play In-App Updates API** | First-party; native UX (immediate / flexible flows); no backend; ([Android Dev docs](https://developer.android.com/guide/playcore/in-app-updates)). | Android only; wrapper library `sp-react-native-in-app-updates` last published ~1 yr ago — re-verify against New Architecture. | Best Android-side mechanism when targeting Play Store; pair with custom screen for off-Play installs. |
| **Hosted JSON (Gist / S3 / CDN)** | Trivial; zero infra. | No targeting; no analytics; no SLA on Gist; redeployment to change anything; no real-time. | Avoid even for MVP — Firebase RC is barely more work and vastly more capable. |
| **EAS Update / `expo-updates`** | First-party Expo; ships JS bundles OTA. | OTA only — cannot replace native modules; not a force-update mechanism for binary changes. | Use **alongside** force-update, not instead of. |

### Library / package matrix (React Native + Expo)

| Library | Status (2026-05) | Notes |
|---|---|---|
| `react-native-version-check` ([npm](https://www.npmjs.com/package/react-native-version-check)) | Stale, last publish > 1 yr; maintainer no longer doing mobile dev. | Functional historically; **re-verify against SDK 55 New Architecture before adopting**. |
| `react-native-appstore-version-checker` ([GitHub](https://github.com/a7ul/react-native-appstore-version-checker)) | **Deprecated.** | Maintainer points to `react-native-version-check`. Do not use. |
| `react-native-store-version` ([npm](https://www.npmjs.com/package/react-native-store-version)) | Maintained occasionally. | Lightweight; checks both stores; verify SDK 55 compat. |
| `sp-react-native-in-app-updates` ([npm](https://www.npmjs.com/package/sp-react-native-in-app-updates)) | Last publish ~1 yr; wraps Google Play Core 2.x. | Android In-App Updates wrapper. **Re-verify New Architecture compat.** |
| `react-native-code-push` | **Dead.** App Center retired 2025-03-31. | Silently fails on Bridgeless mode (mandatory in SDK 55+). |
| `forceupdate-reactnative` ([GitHub](https://github.com/forceupdate-app/forceupdate-reactnative)) | Lightweight, zero-deps. | Unverified at scale; review code before adopting. |
| `semver` ([npm](https://www.npmjs.com/package/semver)) | Maintained by npm itself. | **Required for any version comparison.** Use `semver.lt()`, `semver.gt()`, `semver.coerce()`. |
| `expo-application` | Expo first-party. | **Canonical source for installed version** via `Application.nativeApplicationVersion`. Beats `Constants.expoConfig.version`. |
| `expo-updates` | Expo first-party. | OTA, NOT force-update. `checkForUpdateAsync()` returns `isAvailable: false` on network error — silent failure ([#3640](https://github.com/expo/expo/issues/3640)). |

### Store deep-link reference

| Platform | Preferred (in-app) | HTTPS fallback |
|---|---|---|
| iOS | `itms-apps://itunes.apple.com/app/id<NUMERIC_APP_ID>` | `https://apps.apple.com/app/id<NUMERIC_APP_ID>` |
| Android | `market://details?id=<PACKAGE_NAME>` | `https://play.google.com/store/apps/details?id=<PACKAGE_NAME>` |

Always probe with `Linking.canOpenURL()` first; iOS Simulator does NOT support `itms-apps://` ([Purus/launch_review #16](https://github.com/Purus/launch_review/issues/16)). Use NUMERIC App Store ID (e.g., `id544007664`), never the bundle ID.

### Timing matrix (propagation / latency)

| Event | Lag |
|---|---|
| App Store release → iTunes Lookup reflects new version | **24–48h** worst case ([Apple Dev #725780](https://developer.apple.com/forums/thread/725780)) |
| Firebase Remote Config publish → client fetch (default) | 12 hours default `minimumFetchIntervalInSeconds` |
| Firebase Remote Config real-time updates (SDK ≥ 10.7.0) | Seconds ([Firebase blog](https://firebase.blog/posts/2023/06/feature-flags-with-real-time-remote-config)) |
| Google Play release → Google Play In-App Updates reflects | Minutes (server-driven) |

### Fail-open vs fail-closed at launch

- **Force-update fetch SHOULD fail-OPEN.** A network outage in Firebase / iTunes / Google should never brick the app. ([Ova: fail-open vs fail-closed](https://ova.it.com/network-security-failure-modes/understanding-fail-open-vs-fail-closed/))
- **Hard timeout 3000ms recommended** for the cold-start check.
- **Cache last-known config** on-device with 30–60 min TTL so airplane-mode users still get blocked if they're on a known-bad version.

### Expo SDK 55 specific landmines

- New Architecture is mandatory (cannot disable). Native modules that haven't been updated WILL break silently or at runtime. ([Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55))
- `Constants.manifest` removed (SDK 49+); use `Constants.expoConfig` ([Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)).
- `SplashScreen.preventAutoHideAsync()` has documented flakiness on recent SDKs ([#31875](https://github.com/expo/expo/issues/31875), [#33762](https://github.com/expo/expo/issues/33762), [#32760](https://github.com/expo/expo/issues/32760)) — always render a guard UI in the root layout as belt-and-suspenders.

### Regulatory notes

- Apple App Review Guidelines: no explicit prohibition on force-update screens; must be functional and explanatory (Guideline 4.0 minimum functionality).
- Google Play: In-App Updates API is the policy-blessed mechanism; custom screens permitted if "Update" routes to Play Store (no sideload prompts).
- GDPR: Firebase Remote Config requires Privacy Policy disclosure; no PII needed for force-update use case.
- Russia: Firebase intermittently blocked since 2022 — plan resilient fallback if RU distribution is in scope.
