# In-App Review (iOS + Android) Knowledge Base

Maintained by Compound V Phase 1B advisor. Append at the bottom on each pass.

---

## Updated 2026-06-04 — SKStoreReviewController throttle, expo-store-review API, prompt timing

### iOS: SKStoreReviewController system throttle

**Hard limit:** 3 review prompt displays per app per device per 365-day rolling window.  
**Behavior after limit:** `requestReview()` is silently swallowed. No error, no callback, no indication.  
**No API to check remaining count.** You cannot query how many prompts remain.  
**Development builds:** Prompt always appears (no throttle). TestFlight: `isAvailableAsync()` returns `false` — prompt never shows.  

Source: [ASO Maniac App Store Review Popup guide](https://asomaniac.com/blog/app-store-review-popup), [Apple Dev Forum 115193](https://developer.apple.com/forums/thread/115193), [SwiftLee SKStoreReviewController](https://www.avanderlee.com/swift/skstorereviewcontroller-app-ratings/)

### expo-store-review API surface (v56.0.3, May 2026)

```ts
StoreReview.isAvailableAsync(): Promise<boolean>
// iOS: true on production, false on TestFlight
// Android: true on Android 5.0+
// Web: false

StoreReview.hasAction(): Promise<boolean>
// true if native modal is available (more specific than isAvailableAsync)
// use this to decide between native modal vs store URL redirect

StoreReview.requestReview(): Promise<void>
// Triggers the native system prompt. Returns Promise<void> — no success/failure signal.
// Android <5.0: falls back to Play Store URL

StoreReview.storeUrl(): string | null
// Returns Constants.expoConfig.ios.appStoreUrl or .android.playStoreUrl
// null on Web
```

**Error code:** `ERR_STORE_REVIEW_FAILED` on request failure.

Source: [expo-store-review docs](https://docs.expo.dev/versions/latest/sdk/storereview/)

### Required client-side tracking pattern

Because the system gives no signal about remaining prompts and silently drops excess calls, every app MUST maintain its own persistent counter:

```
storage key: "review_prompt_history"
structure: { count: number, lastPromptDate: ISO8601, userHasRated: boolean }
```

Strategy: use at most 2 of 3 annual slots for organic timing; hold the 3rd for a high-value moment (power user, positive streak). Track `userHasRated` via a persistent flag (set when user confirms they rated — you cannot verify this programmatically).

### Prohibited trigger patterns (Apple policy)

MUST NOT call `requestReview()` in response to a button tap. The "Rate us" button pattern must use `Linking.openURL(storeUrl)` instead — navigates to the App Store page. The in-app modal must be event-driven only.

Source: [expo-store-review docs — "Don't call from a button"](https://docs.expo.dev/versions/latest/sdk/storereview/)

### Optimal trigger timing — general

| Timing | Outcome | Source |
|---|---|---|
| First app open / onboarding | Bad — user has no value yet | [Appbot prompt timing](https://appbot.co/blog/prompting-for-ratings-prompt-early-or-wait/) |
| During/after error | Bad — negative emotional state | Same |
| After "aha moment" (value delivered) | Best | [CriticalMoments guide](https://criticalmoments.io/blog/improve_app_ratings) |
| After successful task completion | Good | Same |
| Low battery / no connection | Bad — user is distracted/constrained | [Appbot guide](https://appbot.co/blog/prompting-for-ratings-prompt-early-or-wait/) |

**Pre-prompt satisfaction gate pattern** (documented as raising average rating ~0.3–0.5 stars):
1. Show custom modal: "Are you enjoying the app?"
2. Yes → call `requestReview()`
3. No → route to in-app feedback form

Source: [CriticalMoments guide](https://criticalmoments.io/blog/improve_app_ratings)

### Optimal trigger timing — horary astrology app specifically

- Fire after: completed reading #2+ where verdict was delivered + user spent ≥ 15s on interpretation screen
- Fire after: positive verdict ("Yes, this will happen") — not after negative verdict
- Prefer power users (3+ return sessions) for the third annual slot
- Never prompt during: question entry, chart calculation, error/retry states, first session

### Android: ReviewManager differences

Android's `ReviewManager` API throttle is session-based (not year-based) and the exact limit is not publicly documented by Google. Throttle behavior may differ significantly from iOS. Treat Android prompt strategy as requiring a separate tuning pass after launch data is available.
