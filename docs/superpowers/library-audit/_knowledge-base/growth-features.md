# Growth Features Library Knowledge Base

Maintained by Compound V Phase 1C validator. Append at the bottom.

Tracks dependencies for growth feature implementation: screenshot capture, file sharing, app store reviews, and deep linking.

---

## Updated 2026-06-04 — Growth Feature Dependencies Audit

### react-native-view-shot@5.1.0

**Current Status:** ✅ COMPATIBLE with Expo SDK 55 + RN new architecture (Fabric)

**API:** `captureRef(viewRef, options)` → `Promise<string>`

**New Architecture Support:**
- v5.0.0+: Full Fabric + TurboModule support (iOS, Android, Web, Windows)
- v4.x and earlier: **INCOMPATIBLE** — throws "Failed to snapshot view tag" when Fabric is enabled
- Minimum React Native: 0.76.0
- Tested up to: RN 0.84.1 (current: 0.83.6 in repo ✅)

**Key Options:**
- `format` (string): 'png', 'jpg', 'webm' (Android only) — default 'png'
- `quality` (0.0–1.0): lossy compression for jpg — default 1.0
- `result` (string): 'tmpfile' (default), 'base64', 'data-uri'
- `snapshotContentContainer` (boolean): iOS/Android, capture full ScrollView content
- `useRenderInContext` (boolean): iOS only, alternative snapshot strategy

**Android Caveat:** `snapshotContentContainer` only supports vertical ScrollView, not horizontal.

**Source:** Context7 `/gre/react-native-view-shot`, GitHub releases; WebSearch result on Fabric compatibility (2026-06-04).

**Action:** If repo has pinned version < 5.0.0, upgrade to ^5.1.0 before Stage 5 (Implementation).

---

### expo-sharing@56.0.15

**Current Status:** ✅ COMPATIBLE; version drift signal

**API:** `shareAsync(uri | uri[], options)` → `Promise<void>`

**Platform Support:**
- iOS: UIActivityViewController (native share sheet)
- Android: Intent.ACTION_SEND (native share intent)
- Web: Web Share API (limited browser support — **MUST check `isAvailableAsync()` first**)

**Incoming Share Handling:**
- Shares arrive as deep links with `expo-sharing://` hostname
- Expo Router: Use `+native-intent.ts` to intercept and redirect
- React Navigation: Use `linking.subscribe()` to listen for share URLs

**Version Timing:**
- Repo: Expo SDK ~55.0.26 (targets expo-sharing ~55.x)
- Current stable: expo-sharing@56.0.15 (Expo SDK 56)
- SDK 55 end-of-life: ~4–6 months (typical Expo cadence)

**API Stability:** Signatures stable across SDK 55 and 56; no breaking changes expected.

**Source:** Context7 `/websites/expo_dev_versions_v55_0_0`, WebSearch 2026-06-04.

**Action:** No immediate upgrade required; plan SDK 55→56 migration in roadmap (Stage 5d or Stage 6).

---

### expo-store-review@56.0.3

**Current Status:** ✅ COMPATIBLE; new dependency (not in current package.json)

**API:** `StoreReview.requestReview()` → `Promise<void>`  
**Availability Check:** `StoreReview.isAvailableAsync()` → `Promise<boolean>`

**Platform Behavior:**
- iOS: Uses `SKStoreReviewController`
  - Returns `true` unless app distributed via TestFlight
  - **TestFlight builds: `isAvailableAsync()` returns `false`** (testing limitation)
  - Requires: Standalone build, EAS ad-hoc profile, or release build to test
- Android: Uses ReviewManager API (Android 5.0+)
  - Pre-5.0: Fallback to Play Store URL link
  - Returns `true` on Android 5.0+
- Web: Returns `false`

**Best Practices:**
- Call after signature interaction completion (e.g., post-analysis screen)
- Do NOT call from navigation transitions or time-sensitive flows
- Do NOT prompt user "rate this app?" before showing dialog (reduces conversion)
- Do NOT spam — respect native OS rate-limiting

**QA Implication:** Cannot validate iOS review dialog in TestFlight preview; requires manual testing on standalone/release build.

**Source:** Context7 `/websites/expo_dev_versions_v55_0_0`, WebSearch 2026-06-04.

**Action:** Add to QA plan: test on standalone build (iOS) before TestFlight submission.

---

### expo-linking (Scheme Configuration)

**Current Status:** ✅ COMPATIBLE; limitation documented

**Configuration:** `app.json`
```json
{
  "expo": {
    "scheme": "horary",
    "ios": { "scheme": "horary-ios" },
    "android": { "scheme": "horary-android" }
  }
}
```

**API:** `Linking.createURL(path, { queryParams })` → `string`  
**Listeners:** `Linking.addEventListener('url', ({ url }) => ...)` (foreground)  
**Cold start:** `Linking.getInitialURL()` → `Promise<string | null>`

**Critical Limitation: Custom Scheme No App-Store Fallback**
- Custom schemes (horary://) only work if app is **already installed**
- If app not installed: Link fails silently (no redirect to App Store/Play Store)
- This creates **funnel leak** for growth: share link → user taps → nothing happens → no install

**Modern Alternative: Universal Links + App Links**
- Uses https:// URLs (standard web links)
- Auto-redirects to App Store/Play Store if app not installed
- Setup: AASA file, Apple domain verification, EAS Hosting integration
- Complexity: Higher upfront cost; ROI: removed funnel leak

**Recommendation:**
- MVP (short term): Use custom scheme for in-app authenticated deep links
- If growth metrics show "share → install" is critical path: Plan Universal Links + App Links post-launch

**Source:** Context7 `/websites/expo_dev_versions_v55_0_0`, WebSearch "Deep Linking Guide 2026" (React Native Relay article), Expo documentation.

**Action:** Document limitation in growth feature spec; decide post-launch roadmap if link → install funnel is key metric.

---

## Summary Table — Growth Features Libraries

| Library | Version | API | Status | Constraint |
|---|---|---|---|---|
| react-native-view-shot | 5.1.0 | captureRef() | 🟢 OK | v4.x incompatible with Fabric |
| expo-sharing | 56.0.15 | shareAsync() | 🟡 MEDIUM | SDK 55→56 transition; Web requires isAvailableAsync() |
| expo-store-review | 56.0.3 | requestReview() | 🟡 MEDIUM | TestFlight unavailable (iOS); requires standalone build test |
| expo-linking | 55.0.15 | createURL() + scheme config | 🟢 OK | Custom scheme no App Store fallback; plan Universal Links |

---
