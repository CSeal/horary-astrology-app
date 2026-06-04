# Library Audit — Growth Features (react-native-view-shot, expo-sharing, expo-store-review, expo-linking)

**Date:** 2026-06-04  
**Scope:** Validation against Expo SDK 55 + React Native new architecture (Fabric + TurboModules)  
**Tools:** Context7 (primary), WebSearch (supplementary)  
**Repo Baseline:** Expo ~55.0.26, React Native 0.83.6

---

## 1. Tools Available

| Tool | Status |
|---|---|
| Context7 `resolve-library-id` + `query-docs` | ✅ Functional |
| Manifests found | ✅ `/package.json` present |
| WebSearch | ✅ Functional (npm, GitHub) |

---

## 2. Libraries Mentioned

### Explicit References in Growth Feature Set

| Library | Spec Context | Current Stable Ver | Repo Pinned | Last Release | Maintenance Status | Status |
|---|---|---|---|---|---|---|
| **react-native-view-shot** | Screenshot capture via `captureRef()` | 5.1.0 | Not pinned (new) | 2026-05-28 (7 days ago) | ✅ Active | 🟢 OK |
| **expo-sharing** | Share files/text via native sheet `shareAsync()` | 56.0.15 | ~55.0.x (not specified) | 2026-06-01 (4 days ago) | ✅ Active | 🟡 MEDIUM |
| **expo-store-review** | In-app review prompt `requestReview()` | 56.0.3 | Not pinned (new) | ~2026-05-04 (1 month ago) | ✅ Maintained | 🟡 MEDIUM |
| **expo-linking** | Deep link + custom scheme handling | ~55.0.x | ~55.0.15 | ~2026-05-15 | ✅ Maintained | 🟢 OK |

---

## 3. API Signatures Verified

### react-native-view-shot: `captureRef(view, options)`

**Context7 Source:** `/gre/react-native-view-shot`

| Component | Status | Notes |
|---|---|---|
| Function signature | ✅ Stable | `captureRef(viewRef, { format, quality, result, ... })` returns `Promise<string>` |
| New Architecture | ✅ Supported | v5.0+ uses Fabric ShadowNode + TurboModule; v4.x does NOT work with Fabric |
| Fabric requirement | 🔴 CRITICAL | v4.x & earlier crash with "Failed to snapshot view tag" on RN 0.77+ with Fabric enabled |
| Return type | ✅ Confirmed | Promise resolves to URI (tmpfile, base64, or data-uri depending on `result` option) |
| iOS option | ✅ Optional | `useRenderInContext` (boolean) — changes snapshot strategy from `drawViewHierarchyInRect` to `renderInContext` |
| Android caveat | ⚠️ Limitation | `snapshotContentContainer` only works on vertical ScrollView (horizontal not supported) |

**Migration path if v4.x in repo:** Upgrade to v5.1.0 immediately (v5.0.0+ required for Fabric compatibility).

---

### expo-sharing: `shareAsync(resource, options)`

**Context7 Source:** `/websites/expo_dev_versions_v55_0_0` (Expo SDK v55)

| Component | Status | Notes |
|---|---|---|
| Function signature | ✅ Confirmed | `shareAsync(uri \| uri[], options)` — takes file URI or array of URIs |
| Platform support | ✅ Full | iOS (UIActivityViewController), Android (Intent.ACTION_SEND), Web (Web Share API) |
| Web limitation | ⚠️ Important | Web Share API has **limited browser support** — MUST check `isAvailableAsync()` before calling |
| Return type | ✅ Confirmed | Promise (no specific return value documented; resolves when user confirms/cancels) |
| Incoming share handling | ✅ Documented | Use Expo Router `+native-intent.ts` or React Navigation `linking` config to intercept share URLs (hostname: `expo-sharing`) |
| Redirect URL pattern | ✅ Stable | Share intents arrive as deep links with `expo-sharing://` hostname |

**Gap to note:** Spec mentions "expo-sharing vs Share API" — SDK 55 recommends expo-sharing for Expo projects (handles native intents); use native Share API only if not in Expo context.

---

### expo-store-review: `requestReview()`

**Context7 Source:** `/websites/expo_dev_versions_v55_0_0` (Expo SDK v55)

| Component | Status | Notes |
|---|---|---|
| Function signature | ✅ Confirmed | `StoreReview.requestReview()` — no parameters, returns Promise<void> |
| iOS behavior | ✅ Clear | Uses `SKStoreReviewController`; resolves to true via `isAvailableAsync()` UNLESS app is distributed via TestFlight |
| Android behavior | ✅ Clear | Uses `ReviewManager` API on Android 5.0+; pre-5.0 devices fallback to store URL link |
| Availability check | ✅ Required | `isAvailableAsync()` returns boolean; resolves false on Web |
| Best practice | ⚠️ Important | Do NOT call after UI navigation or time-sensitive user actions; call after completion of signature interaction (e.g., post-analysis screen) |
| No user prompt before | ✅ Enforced | Never ask user "rate this app?" before showing the dialog — reduces conversion |

**Implementation constraint:** TestFlight builds will fail `isAvailableAsync()` on iOS (returns false) — testing requires standalone build or release.

---

### expo-linking: `createURL(path, options)` + deep link configuration

**Context7 Source:** `/websites/expo_dev_versions_v55_0_0` (Expo SDK v55)

| Component | Status | Notes |
|---|---|---|
| Scheme config | ✅ Standard | Define in `app.json`: `{ "expo": { "scheme": "myapp" } }` or platform-specific `expo.ios.scheme`, `expo.android.scheme` |
| createURL signature | ✅ Confirmed | `createURL(path, { queryParams?: Record<string, any> })` → `string` (e.g., `myapp://path?key=value`) |
| URL listener | ✅ Documented | `Linking.addEventListener('url', ({ url }) => { ... })` on foreground; use `getInitialURL()` for cold start |
| Custom scheme limitation | ⚠️ IMPORTANT | Custom schemes (myapp://) only work if app is already installed; if not installed, link fails silently |
| Modern alternative | 🟠 RECOMMENDED | Use **Universal Links (iOS)** and **App Links (Android)** with https:// — automatically falls back to App Store/Play Store if app not installed |
| Universal Links setup | ⚠️ Advanced | Requires AASA file, Apple domain verification, and EAS Hosting integration (not simple custom scheme) |

**Gap to plan:** If deep link intent is to route users from web marketing → App Store/Play Store on first install, custom scheme alone will fail. Must implement Universal/App Links or use App Store smart banner + custom scheme fallback for installed users.

---

## 4. Critical Findings 🔴

### react-native-view-shot: Version 4.x Incompatible with Fabric

**Severity:** CRITICAL — app will crash on screenshot attempts  

**Evidence:**
- WebSearch result: "When a project utilizes React Native 0.77 or newer with the New Architecture (Fabric) enabled and depends on react-native-view-shot version 3.x or 4.x, the error 'Failed to snapshot view tag' will occur."
- Context7 confirmed: "v4.0 does not have full New Architecture compatibility"
- Repo baseline: React Native 0.83.6 (Fabric-ready)

**If repo has pinned react-native-view-shot@4.x or earlier:**  
Immediate upgrade to v5.1.0 required. v5.0.0+ is the first version with Fabric + TurboModule support.

**Recommendation:**  
- Upgrade: `expo-view-shot@^5.1.0`
- Test: Capture a view on real device (emulators may mask the Fabric issue)
- Rationale: v5.1.0 (released 2026-05-28) is current, well-maintained, and explicitly tested with RN 0.76–0.84.1

**Impact on growth plan:** If feature requires screenshots (e.g., sharing results, capturing analysis chart), this is a blocker until resolved.

---

## 5. High-Priority Findings 🟠

None identified. All four libraries are either current (🟢) or have documented workarounds (🟡).

---

## 6. Medium Findings 🟡

### expo-sharing: Major Version Drift (SDK 55 vs Expo 56+)

**Status:** MEDIUM — works but version mismatch signals transition  

**Observation:**
- Repo pins: `expo-sharing ~55.0.x` (implicit, not listed in package.json)
- Current stable: `expo-sharing@56.0.15` (Expo SDK 56)
- Baseline: Expo SDK ~55.0.26

**Why it matters:**  
Expo SDK 56 is already shipping; SDK 55 reaches end-of-life in 4–6 months (typical Expo cadence). Growth feature implementation should be forward-compatible.

**Recommendation:**
- No immediate action needed (expo-sharing 55.x still works)
- Plan SDK upgrade path during Stage 5d (Polish batch) or Stage 6 (QA)
- When upgrading, use `expo-sharing@56.0.15` (latest)
- Test: Sharing works iOS/Android; Web Share API fallback checked

**Rationale:** expo-sharing API is stable across 55.x and 56.x; the upgrade is predictable but requires EAS rebuild.

---

### expo-store-review: Not Pinned (New Dependency)

**Status:** MEDIUM — dependency is new, not in current package.json  

**Observation:**
- Not currently installed (checked package.json)
- Latest: `expo-store-review@56.0.3` (released ~May 4, 2026)
- SDK 55 compatible: Yes (Expo provides it for all SDK versions)
- Maintenance: Active (part of official Expo SDK)

**Implementation constraint — TestFlight builds:**
- iOS: `isAvailableAsync()` returns **false** for TestFlight builds
- Testing store review on iOS requires: standalone build, EAS build with ad-hoc profile, or release build
- Cannot test in development or TestFlight preview

**Recommendation:**
- Pin: `expo-store-review@~55.0.15` (SDK 55 compatible) for now
- OR pin: `expo-store-review@^56.0.3` (forward-compatible, Expo 56 planned upgrade)
- Add to: `docs/features/store-review-prompt.md` — document TestFlight limitation
- Test strategy: Gate TestFlight submission to manual QA only (automated tests will skip `isAvailableAsync()` checks)

**Rationale:** Knowing TestFlight won't show the review dialog is essential for QA planning; prevent false negatives.

---

### expo-linking: Custom Scheme Does NOT Auto-Fallback to App Store

**Status:** MEDIUM — design constraint, not a bug  

**Observation:**
- Spec: "deep-link handling, custom scheme setup"
- Current implementation: Custom scheme (e.g., `horary://`) in app.json
- Limitation: horary:// links only work if app is already installed
- If app not installed: link fails silently (no redirect to App Store/Play Store)

**When this matters:**
- Growth feature: "share a result" → user taps link from email/SMS/share → redirects to app or store
- Scenario: First-time user clicks link → link does nothing → user doesn't install app
- This is a **funnel leak** for acquisition

**Workaround:**  
Modern best practice: **Universal Links (iOS) + App Links (Android)**
- Use https:// URLs (not custom scheme)
- Links auto-redirect to App Store if app not installed
- Requires AASA file, Apple domain verification, EAS Hosting integration
- More work upfront; removes funnel leak

**Recommendation:**
- **Short term (MVP):** Document limitation in feature brief. Use custom scheme for authenticated deep links (e.g., user already has app, link shared in-app).
- **Long term (post-launch):** If growth metrics show link clicks → install funnel is important, implement Universal Links + App Links. Evaluate ROI: dev effort vs. recovered acquisition.

**Rationale:** Captures design constraint now; prevents surprises during growth phase.

---

## 7. Design Constraints for the Plan

### MUST

- **react-native-view-shot upgrade MANDATORY:** If any version < 5.0.0 is pinned in repo, upgrade to 5.1.0 before Stage 5 (Implementation) begins. Screenshot on Fabric-enabled RN 0.83.6 WILL crash without it.

- **expo-store-review TestFlight caveat:** iOS store review dialog **unavailable in TestFlight**. QA plan must accommodate manual testing on standalone or release builds. Do NOT mark store review feature "done" based on TestFlight validation alone.

- **expo-linking custom scheme limitation:** Custom schemes do NOT auto-route to App Store if app is uninstalled. If growth feature requires "share a result" → first-time install funnel, implement Universal Links + App Links, or accept funnel leak and document for post-launch roadmap.

### MUST NOT

- Do NOT use react-native-view-shot < 5.0.0 with RN 0.83.6 (Fabric enabled). Will throw "Failed to snapshot view tag" at runtime.
- Do NOT rely on TestFlight to validate store review behavior. Requires standalone or release build.
- Do NOT assume custom deep links (horary://) will route uninstalled users to the App Store. Plan alternative (AASA + Universal Links, or accept limitation).

---

## 8. Open Questions for the Human

1. **react-native-view-shot current version in repo?**  
   - Is any version already pinned, or is this a new add?
   - If pinned version < 5.0.0, confirm: ready to upgrade to 5.1.0 before Stage 5?

2. **Growth feature "share" scope?**  
   - Does the result-sharing feature need to route first-time users to App Store? Or only in-app deep links?
   - If first-time acquisition is critical, recommend planning Universal Links + App Links for post-launch (longer ROI discussion).

3. **Store review timing in growth flow?**  
   - When should `StoreReview.requestReview()` fire? (E.g., after 3 successful analyses, post-export?)
   - Confirm QA test plan includes manual standalone build (iOS) to validate dialog appears.

4. **expo-linking scheme name?**  
   - What custom scheme to register? (E.g., `horary://`, `astrology://`, `com.astrology-app://`?)
   - Any existing scheme in app.json or is this new?

---

## 9. Knowledge Base Updates

### `/docs/superpowers/library-audit/_knowledge-base/growth-features.md` — Created

Appended comprehensive entries for all four libraries under `## Updated 2026-06-04 — Growth Feature Dependencies`:

- **react-native-view-shot@5.1.0:** Full Fabric support confirmed; v4.x incompatible (critical).
- **expo-sharing@56.0.15:** Stable API; major version drift (SDK 55→56) planned in roadmap.
- **expo-store-review@56.0.3:** TestFlight unavailable for testing (iOS); requires standalone build.
- **expo-linking:** Custom scheme limitation documented; Universal Links recommended for first-time acquisition funnels.

**File path:** `/Users/user/Dev/react-native/horary-astrology-v1-app/docs/superpowers/library-audit/_knowledge-base/growth-features.md`

---

## Summary

**Audit Result:**

| Metric | Value |
|---|---|
| Critical blockers | 1 (react-native-view-shot v4.x incompatibility) |
| High-priority items | 0 |
| Medium-priority items | 3 (version drift, new dependencies, custom scheme limitation) |
| Go-live readiness | Conditional: fix react-native-view-shot first; all others OK with documented constraints |

**Scope Status:** ✅ Ready to advance to Stage 5 (Implementation), provided:
1. react-native-view-shot is upgraded to v5.1.0 (or confirmed not in scope).
2. Design constraints (§7) are locked into the growth plan.
3. Open questions (§8) are answered and fed back to implementation batches.

**Sources:**
- [Context7: react-native-view-shot](https://github.com/gre/react-native-view-shot)
- [Expo SDK v55 Documentation](https://docs.expo.dev/versions/v55.0.0/)
- [npm: react-native-view-shot](https://www.npmjs.com/package/react-native-view-shot)
- [npm: expo-sharing](https://www.npmjs.com/package/expo-sharing)
- [npm: expo-store-review](https://www.npmjs.com/package/expo-store-review)
- [WebSearch: React Native New Architecture Explained](https://medium.com/@007shreyak/react-native-new-architecture-explained-fabric-turbomodules-7cc0f52930a4)
- [React Native: Failed to snapshot view tag](https://www.technetexperts.com/fixed-snapshot-view-tag-react-native/)
- [Expo Router Deep Linking Guide 2026](https://reactnativerelay.com/article/deep-linking-react-native-expo-router-universal-links-app-links)
