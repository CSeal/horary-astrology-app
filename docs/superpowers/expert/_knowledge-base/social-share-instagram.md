# Instagram Stories Share Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-04 — iOS URL scheme + pasteboard protocol, Android Intent, Expo implementation

### iOS: URL scheme + pasteboard (no Facebook App ID required)

**Mechanism:** Write content to `UIPasteboard` using specific key names, then open `instagram-stories://share`. Instagram reads the pasteboard on launch via the URL scheme.

**Canonical pasteboard keys:**

| Key | Type | Required | Notes |
|---|---|---|---|
| `com.instagram.sharedSticker.backgroundImage` | `NSData` (PNG/JPEG) | One of background* required | Full-bleed background; ≤ 2.5 MB |
| `com.instagram.sharedSticker.backgroundVideo` | `NSData` (MP4) | One of background* required | Alternative to image |
| `com.instagram.sharedSticker.stickerImage` | `NSData` (PNG with alpha) | Optional | Overlay the user can reposition |
| `com.instagram.sharedSticker.backgroundTopColor` | `String` (hex `#RRGGBB`) | Optional | Gradient top (replaces backgroundImage) |
| `com.instagram.sharedSticker.backgroundBottomColor` | `String` (hex `#RRGGBB`) | Optional | Gradient bottom (replaces backgroundImage) |
| `com.instagram.sharedSticker.contentURL` | `String` (URL) | Optional | Link sticker — see caveat below |

**Info.plist requirement:** `LSApplicationQueriesSchemes` must include `instagram-stories`. Without this, `canOpenURL("instagram-stories://share")` always returns `false` on iOS 9+. Expo config plugin handles this.

**Facebook App ID:** NOT required for the URL scheme + pasteboard method. Required only when using the official Facebook iOS SDK (different integration path).

**Image size constraint:** Background images > 2.5 MB cause silent failure. Compress before writing to pasteboard.

**Recommended canvas:** 9:16 portrait (1080×1920px). Off-ratio images are letterboxed by Instagram.

**contentURL caveat:** The link sticker feature (`contentURL`) is gated by Meta's "Link in Stories" feature availability for the sharing account. Even when the link appears, tapping it from inside Instagram's in-app browser (WKWebView) does NOT trigger OS-level deep-link interception — the URL opens as a web page, not in the target app. Do not design viral attribution loops that depend on this link being functional. Source: [Linkrunner: Universal Links in in-app browsers (2025)](https://linkrunner.io/blog/universal-links-app-links-break-in-app-browsers).

**No Instagram installed fallback:** Always gate with `canOpenURL("instagram-stories://share")`. If false, fall back to `Share.shareAsync()` (system share sheet). System share sheet catches WhatsApp, Telegram, iMessage — important for Russian-speaking audiences.

Source: [DEV.to Expo RN Instagram Stories guide](https://dev.to/bhatvikrant/a-step-by-step-guide-to-share-images-from-your-expo-react-native-app-to-instagram-stories-1feb), [Medium: Story sharing iOS apps](https://medium.com/@burakekmen/story-sharing-on-facebook-instagram-in-ios-apps-2df2a82ebf96), [GitHub: react-native-share issue 1388](https://github.com/react-native-share/react-native-share/issues/1388)

### Android: Intent-based sharing (separate implementation)

**Mechanism:** `Intent.ACTION_SEND` with `setPackage("com.instagram.android")`. Uses `Uri` for the asset, not pasteboard. Extra key: `"interactive_asset_uri"` for the sticker.

**This is a completely separate code path from iOS.** Any Expo native module must handle platform-branching explicitly.

**Known limitation:** Cannot test in Expo Go — requires a development build or custom dev client.

### Expo ecosystem options (as of 2026-06-04)

| Package | Status | Notes |
|---|---|---|
| `react-native-share` | Active | `shareSingle({ social: 'InstagramStories', ... })` — cross-platform |
| `@princecarter/expo-instagram-stories` | Community; last seen active | Expo-specific config plugin; handles Info.plist automatically |
| `JuanseMastrangelo/Expo-Instagram-Stories` | Community | GitHub-only, verify maintenance before adopting |
| Custom native module | Always valid | Full control; requires Swift + Kotlin implementation |

**Recommendation:** Use `react-native-share` (actively maintained, battle-tested in production) unless a specific Expo config plugin integration need dictates otherwise.

### Simulator / testing constraint

The URL scheme + pasteboard pattern does NOT work in iOS simulators. Physical device with Instagram installed is required for any end-to-end testing.

### Meta platform policy

The URL scheme + pasteboard method is a documented, approved integration path. It does NOT require Meta app review. However, Meta has changed pasteboard key names in the past without advance notice. Design the integration with a graceful fallback (system share sheet) so a key-name change does not break the feature entirely.
