---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/aso-brief.md, docs/competitor-research.md, docs/prd-v1.md, docs/design-system-brief.md, docs/superpowers/expert/aso-virality-brief.md, src/app/(tabs)/result/[id].tsx, src/hooks/useHoraryQuery.ts, src/stores/questionsStore.ts, src/constants/config.ts, WebSearch: react-native-view-shot new architecture 2025, WebSearch: instagram stories deep link schema 2025, WebSearch: SKStoreReviewRequest 3 per year limit iOS 2026]
reviewed_by: owner-pending
---

# Viral Features Spec — AstraSk
**Stage**: StageM2-GrowthSpec
**Date**: 2026-06-04

---

## Feature 1 — Share Verdict Card

### Overview

Allow users to share their horary verdict as a styled image card to Instagram Stories or the native system share sheet. This is the primary viral mechanic: every shared card carries the AstraSk brand and the call-to-action "Ask yours: astrask.app".

### Research Findings

**react-native-view-shot (captureRef)**
- Version 4.0+ fully supports the New Architecture (Fabric + TurboModules). Peer dependency: React Native >=0.76. Tested up to 0.84.1 (RN 0.83 ships with Expo SDK 55). JSI-compatible. No bridge required.
- Expo documentation lists it under `captureRef` in the SDK reference. Install: `npx expo install react-native-view-shot`.
- `captureRef(ref, { format: 'png', quality: 1 })` returns a file URI on device. Use `result: 'base64'` option for pasteboard delivery.
- Source: https://github.com/gre/react-native-view-shot, https://docs.expo.dev/versions/latest/sdk/captureRef/

**Instagram Stories URL scheme**
- iOS mechanism: write image data to `UIPasteboard` THEN open `instagram-stories://share`. The URL scheme itself carries no payload — content travels via pasteboard keys.
- Canonical pasteboard keys (confirmed from aso-virality-brief.md domain expert research):
  - `com.instagram.sharedSticker.backgroundImage` — PNG NSData for full-bleed background
  - `com.instagram.sharedSticker.stickerImage` — PNG NSData with transparency (user-repositionable overlay)
  - `com.instagram.sharedSticker.backgroundTopColor` — hex string e.g. `#070714`
  - `com.instagram.sharedSticker.backgroundBottomColor` — hex string e.g. `#12102A`
  - `com.instagram.sharedSticker.contentURL` — optional attribution URL (unreliable per domain expert: gated behind Meta's Link in Stories)
- `instagram-stories` MUST be added to `LSApplicationQueriesSchemes` in app.json `infoPlist` section. Without this, `canOpenURL` always returns `false` on iOS 9+.
- A Facebook App ID is NOT required for the URL scheme + pasteboard method.
- Android path is entirely different: `Intent.ACTION_SEND` with `setPackage("com.instagram.android")` — separate implementation branch, Phase 2.
- Silent failure conditions: image above 2.5 MB, Instagram not installed, scheme not whitelisted.

**expo-sharing fallback**
- `expo-sharing` (`shareAsync(fileUri)`) invokes the iOS native share sheet (UIActivityViewController). Handles WhatsApp, Telegram, iMessage, Files — all high-value for the Russian-speaking target audience.
- Install: `npx expo install expo-sharing`.

### Share Card — Visual Layout

The share card is a fixed-size off-screen component rendered via `react-native-view-shot`. It is never visible to the user in the main UI.

**Canvas size**: 1080 × 1920px (9:16 portrait — Instagram Stories native resolution).
**Background**: linear gradient from `#070714` (top) to `#12102A` (bottom) — matches app bg-base and bg-surface tokens.

Layout (top to bottom, centered):

```
┌────────────────────────────────────┐  ← padding 80px all sides
│                                    │
│   ✦ AstraSk                        │  ← app wordmark, Cormorant 500 48px, #F5C842
│   Horary Astrology                 │  ← Inter 400 28px, #9B93B8
│                                    │
│   ────────────────────────────     │  ← 1px divider, rgba(240,238,255,0.12)
│                                    │
│   "Will I get the job offer…"      │  ← question, Cormorant italic 500 36px, #F0EEFF
│                                    │    max 40 chars — truncated with ellipsis
│                                    │
│   ┌────────────────────────────┐   │
│   │                            │   │  ← verdict card region
│   │         YES ✦              │   │  ← Cormorant 700 96px, verdict color
│   │                            │   │
│   │    ● ● ● ● ●  HIGH         │   │  ← confidence dots + label, Inter 500 24px
│   │                            │   │
│   └────────────────────────────┘   │  ← rounded 32px, verdict glow border + shadow
│                                    │
│   ────────────────────────────     │  ← divider
│                                    │
│   Ask yours:                       │  ← Inter 400 28px, #9B93B8
│   astrask.app                      │  ← Inter 600 32px, #F5C842
│                                    │
└────────────────────────────────────┘
```

**Verdict badge colors** (same tokens as in-app):
- YES: `#22D3A4` with background glow `rgba(34,211,164,0.15)`
- NO: `#F87171` with background glow `rgba(248,113,113,0.15)`
- MAYBE: `#FBBF24` with background glow `rgba(251,191,36,0.15)`
- UNCLEAR: `#9B93B8` with background glow `rgba(155,147,184,0.15)`

**Question truncation rule**: truncate `entry.question` to 40 characters maximum, append `…`. Do not expose personal question content beyond what the user explicitly chooses to share (consent model: user taps "Share" button → consent is given at that moment).

### New Component: `ShareVerdictCard`

**Path**: `src/components/ShareVerdictCard.tsx`

Purpose: renders the off-screen share card. Wraps a `View` with `ref` passed in from the caller, sized explicitly to a non-displayed layout. Must NOT be mounted in the main screen tree — it is mounted only when the share action is triggered and unmounted after capture.

```ts
interface ShareVerdictCardProps {
  viewRef: React.RefObject<View>;
  question: string;    // truncated by caller to 40 chars
  verdict: VerdictType;
  confidence: ConfidenceBand;
}
```

**Implementation notes**:
- Use `StyleSheet.create` is forbidden per CLAUDE.md — use inline `style` prop with explicit numeric pixel values (not NativeWind `className`) since this component renders at fixed pixel dimensions outside the normal layout tree.
- Colors must be imported from `src/constants/theme.ts` — no inline hex strings in component JSX.
- The component must use `View` from `react-native` (not `@/tw`) because it is rendered off-screen at fixed pixel dimensions — NativeWind's CSS variable resolution requires a mounted CSS context that off-screen renders may not have. Import from `react-native` directly in this file only.
- Star field decoration: use 12 deterministic star `View` circles (white, 2–4px, various opacities). No Reanimated animations in this component — the view must be static at capture time.

### New Service: `shareVerdictService.ts`

**Path**: `src/services/shareVerdictService.ts`

Responsibilities:
1. Capture the off-screen `ShareVerdictCard` via `captureRef` (react-native-view-shot).
2. Compress to ≤ 2.5 MB (use `quality: 0.85` with PNG format — react-native-view-shot PNG is lossless, so use `format: 'jpg'` with `quality: 0.9` for the background; sticker can remain PNG).
3. Check Instagram availability via `canOpenURL('instagram-stories://share')`.
4. If Instagram available: write to `UIPasteboard` and open scheme.
5. If Instagram unavailable: fall back to `expo-sharing`.

```ts
// src/services/shareVerdictService.ts

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
// UIPasteboard access requires a thin native bridge on iOS.
// Use react-native-view-shot's built-in base64 output + Clipboard API
// OR the @react-native-clipboard/clipboard package (already a common dep).
// Preferred: use expo-clipboard (installable, no native config required).
import * as Clipboard from 'expo-clipboard'; // for content URL only — not for image data

// Instagram Stories share is iOS only; Android path deferred to Phase 2.
export async function shareVerdict(
  ref: React.RefObject<View>,
  question: string,
  verdict: VerdictType,
): Promise<{ success: boolean; channel: 'instagram' | 'system' | 'none' }>;
```

**Instagram share implementation detail** — iOS UIPasteboard:

`UIPasteboard` is not directly accessible from JS without a native module. Two viable approaches:

**Option A (recommended)**: Use `react-native-share` library (`react-native-share` v10+, New Architecture compatible). It provides `Share.shareSingle({ social: Social.InstagramStories, backgroundImage: base64Uri, stickerImage: base64Uri, backgroundTopColor: '#070714', backgroundBottomColor: '#12102A' })`. This wraps the pasteboard write + URL scheme open in a single call.
- Install: `npx expo install react-native-share`
- Requires `instagram-stories` in `LSApplicationQueriesSchemes` (handled via Expo config plugin or direct app.json entry).

**Option B (manual)**: Write a minimal Expo config plugin that exposes `UIPasteboard.general().setItems([{ 'com.instagram.sharedSticker.backgroundImage': imageData }])` via a Swift native module. More code, same result. Not recommended for Phase 1.5.

**Recommendation**: Use Option A (`react-native-share`). It is the most widely adopted pattern for this use case and is well-tested.

### Expo app.json config changes required

Add to `expo.ios.infoPlist`:
```json
{
  "LSApplicationQueriesSchemes": ["instagram-stories"]
}
```

This enables `canOpenURL('instagram-stories://share')` to return the correct boolean.

### Integration Point: `result/[id].tsx`

The result screen currently has a `Share2` icon in the design system brief listed as "Verdict (Phase 2, disabled in MVP)". The `result/[id].tsx` file does not yet render a share button — the PRD marks it as a Phase 2 placeholder.

**To activate in Phase 1.5**: add a share button in `result/[id].tsx` as follows:
- Mount `<ShareVerdictCard>` as a sibling of the scroll content (position absolute, off-screen: `{ position: 'absolute', left: -9999, top: -9999, width: 1080, height: 1920 }`).
- Add a `Share2` icon button in the nav bar row (top right, next to the back arrow).
- On press: call `shareVerdictService.shareVerdict(shareCardRef, entry.question, entry.verdict)`.
- Show an `ActivityIndicator` while capture is in progress (typical capture time: 200–500ms).
- Handle error gracefully: show a `Banner` with `t('share.error')` if the service throws.

**i18n keys to add**:
```
share.button        = "Share"
share.error         = "Could not share the reading. Please try again."
share.instagramSuccess = "Opening Instagram Stories..."
```

### Dependency summary

| Package | Version target | Notes |
|---|---|---|
| `react-native-view-shot` | `^4.0.0` | New Architecture compatible |
| `react-native-share` | `^10.x` | Instagram Stories + system share |
| `expo-sharing` | SDK 55 bundled | Fallback for system share sheet |

---

## Feature 2 — Friend Invitation (MVP: App Store link share)

### Overview

An "Invite a friend" row in Settings opens the native share sheet with pre-composed text and an App Store link tagged with UTM parameters for post-launch attribution analysis.

### MVP approach

No backend referral tracking. No custom deep links processed. Pure share-sheet with a UTM-tagged URL.

### UTM link format

```
https://apps.apple.com/app/id<APPID>?utm_source=invite&utm_medium=share&utm_campaign=friend
```

Replace `<APPID>` with the Apple numeric App Store ID once the app is registered. Set as a constant in `src/constants/config.ts`:

```ts
// Add to config.ts:
export const APP_STORE_URL_INVITE =
  'https://apps.apple.com/app/id<APPID>?utm_source=invite&utm_medium=share&utm_campaign=friend';
export const INVITE_SHARE_TEXT_EN =
  'I use AstraSk to get instant horary astrology answers. Try it free:';
export const INVITE_SHARE_TEXT_RU =
  'Я использую AstraSk для мгновенных ответов хорарной астрологии. Попробуй бесплатно:';
```

### Share sheet invocation

Use React Native's built-in `Share.share()` (no extra dependencies):

```ts
// In Settings screen, "Invite a friend" row onPress:
import { Share } from 'react-native';

const text = i18n.language === 'ru' ? INVITE_SHARE_TEXT_RU : INVITE_SHARE_TEXT_EN;
await Share.share({
  message: `${text}\n${APP_STORE_URL_INVITE}`,
  url: APP_STORE_URL_INVITE, // iOS only — shown as a link preview
});
```

### Placement: Settings screen

Add a new section in `src/app/(tabs)/settings.tsx` above the API key section:

```
── SHARE & INVITE ──────────────────
  [Share icon]  Invite a friend   [chevron →]
  [Star icon]   Rate AstraSk      [chevron →]  ← links to App Store page directly
```

The "Rate AstraSk" row links to the App Store page (direct open, not `requestReview()` — this is a compliant deep link approach). The review prompt service (Feature 3) is event-driven, separate from this row.

### Deep-link schema (deferred — Phase 2)

Document for future implementation:

```
astrask://invite?ref=<referrer_id>&utm_campaign=friend
```

When implemented in Phase 2:
- The app will handle this deep link in Expo Router's `+native-intent.ts`.
- On first launch via this link, store `referrer_id` in AsyncStorage key `horary_referrer`.
- No server-side referral tracking required for Phase 2 MVP — client-side only (track conversion in analytics).
- `referrer_id` is a base64-encoded string set by the inviter (e.g., their device UUID prefix, non-personally-identifiable).

**Do not implement Phase 2 deep-link handling in Phase 1.5.** Document schema only.

### i18n keys to add

```
settings.shareSection       = "Share & Invite"
settings.inviteFriend       = "Invite a friend"
settings.rateApp            = "Rate AstraSk"
settings.inviteFriendTitle  = "Share AstraSk"
```

---

## Feature 3 — 5-Star Review Prompt

### Overview

Trigger Apple's native in-app review dialog (`SKStoreReviewController`) at the optimal moment in the user journey to maximize 5-star review probability.

### Research Findings

- iOS system hard cap: **3 review prompts per app per 365-day rolling window per device**. After 3 calls, `requestReview()` is silently dropped — no error, no callback.
- `StoreReview.isAvailableAsync()` returns `false` on TestFlight. Do not interpret as a bug during internal testing.
- Apple explicitly prohibits triggering `requestReview()` from a user-visible button tap. The prompt must be event-driven.
- Source: SKStoreReviewController Apple Developer Docs, expo-store-review docs, SwiftLee guide.

### Trigger rules (ALL must be true simultaneously)

| Condition | Check | Source |
|---|---|---|
| 3+ completed readings | `questionsStore.entries.length >= 3` | In-memory, available at `onSuccess` |
| 7+ days since install | `AsyncStorage.getItem('install_date')` set on first launch | Set in `_layout.tsx` hydration on first run |
| Not prompted in last 180 days | `review_prompt_state.prompted_at` is null OR more than 180 days ago | AsyncStorage key `review_prompt_state` |
| Review available on device | `StoreReview.isAvailableAsync()` returns `true` | expo-store-review |

**Additional timing constraints (from aso-virality-brief.md)**:
- Do NOT prompt immediately after a negative verdict (`verdict === 'no'`).
- Do NOT prompt after an UNCLEAR verdict.
- Minimum time on result screen before prompt: fire after `onSuccess` → journal save → 2-second delay (let the animation complete and let the user read).
- Prompt only on YES or MAYBE verdicts for maximum emotional resonance.

### Implementation

**New service**: `src/services/reviewPromptService.ts`

```ts
// src/services/reviewPromptService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { ASYNC_STORAGE_KEYS } from '@/constants/config';

const REVIEW_PROMPT_KEY = 'review_prompt_state';
const INSTALL_DATE_KEY = 'install_date';
const MIN_ENTRIES_FOR_PROMPT = 3;
const MIN_DAYS_SINCE_INSTALL = 7;
const MIN_DAYS_BETWEEN_PROMPTS = 180;

interface ReviewPromptState {
  prompted_at: string | null; // ISO string or null
}

export const reviewPromptService = {
  /**
   * Call on app first launch (in _layout.tsx hydration block, before other stores).
   * Sets install_date if not already set — idempotent.
   */
  async initInstallDate(): Promise<void> {
    const existing = await AsyncStorage.getItem(INSTALL_DATE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(INSTALL_DATE_KEY, new Date().toISOString());
    }
  },

  /**
   * Main entry point. Call after journal save in useHoraryQuery.onSuccess,
   * only for YES or MAYBE verdicts.
   * Returns true if the prompt was shown (or attempted), false if conditions not met.
   */
  async maybePrompt(
    entriesCount: number,
    verdict: 'yes' | 'no' | 'maybe' | 'unclear'
  ): Promise<boolean> {
    // Gate 1: only after positive verdicts
    if (verdict === 'no' || verdict === 'unclear') return false;

    // Gate 2: minimum entries
    if (entriesCount < MIN_ENTRIES_FOR_PROMPT) return false;

    // Gate 3: system availability
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    // Gate 4: install date check
    const installDateStr = await AsyncStorage.getItem(INSTALL_DATE_KEY);
    if (!installDateStr) return false;
    const daysSinceInstall =
      (Date.now() - new Date(installDateStr).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInstall < MIN_DAYS_SINCE_INSTALL) return false;

    // Gate 5: last prompted check
    const stateStr = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    const state: ReviewPromptState = stateStr
      ? (JSON.parse(stateStr) as ReviewPromptState)
      : { prompted_at: null };

    if (state.prompted_at !== null) {
      const daysSincePrompt =
        (Date.now() - new Date(state.prompted_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePrompt < MIN_DAYS_BETWEEN_PROMPTS) return false;
    }

    // All gates passed — prompt
    await StoreReview.requestReview();
    await AsyncStorage.setItem(
      REVIEW_PROMPT_KEY,
      JSON.stringify({ prompted_at: new Date().toISOString() })
    );
    return true;
  },
};
```

### Integration point: `useHoraryQuery.ts`

In `onSuccess` callback, after `await incrementMonthlyCount()`, add:

```ts
// After journal save and counter increment:
const entriesCount = useQuestionsStore.getState().entries.length;
// Fire with a 2s delay so the verdict animation completes before any prompt appears
setTimeout(() => {
  reviewPromptService.maybePrompt(entriesCount, data.verdict).catch(() => {
    // Silent fail — review prompt is best-effort
  });
}, 2000);
```

**Note**: `setTimeout` is acceptable here for a non-critical side effect. Do not use `await` on the prompt — it must not block navigation to the result screen.

### `install_date` initialization

In `src/app/_layout.tsx`, in the hydration block that already runs `settingsStore.hydrate()` and `questionsStore.hydrate()`, add:

```ts
await reviewPromptService.initInstallDate();
```

This is idempotent — safe to call on every launch.

### AsyncStorage keys summary

| Key | Type | Set when |
|---|---|---|
| `install_date` | ISO string | On first app launch (idempotent) |
| `review_prompt_state` | `{ prompted_at: string \| null }` | After each prompt attempt |

Both keys should be added to `ASYNC_STORAGE_KEYS` in `config.ts`:

```ts
INSTALL_DATE: 'install_date',
REVIEW_PROMPT_STATE: 'review_prompt_state',
```

### iOS 3-per-year limit handling

The OS enforces the hard cap silently. Per `aso-virality-brief.md` guidance and the domain expert's MUST NOT directive: the application layer does NOT need an additional count guard beyond the 180-day `prompted_at` check. The 180-day gap between prompts means a maximum of ~2 prompts per year at the application layer, staying safely below the system cap of 3. The OS drops any excess calls silently.

The third annual prompt slot is reserved for organic OS-initiated prompts (e.g., user opens App Store and rates after a session). Do not attempt to fill all 3 slots programmatically.

### Dependency

| Package | Notes |
|---|---|
| `expo-store-review` | Already available in Expo SDK 55. Install: `npx expo install expo-store-review`. API stable in v56.0.3. |

---

## Feature Summary

| Feature | New files | Modified files | New deps |
|---|---|---|---|
| Share Verdict Card | `src/components/ShareVerdictCard.tsx`, `src/services/shareVerdictService.ts` | `src/app/(tabs)/result/[id].tsx`, `app.json` (infoPlist), `src/i18n/en.ts`, `src/i18n/ru.ts` | `react-native-view-shot`, `react-native-share` |
| Friend Invite | none | `src/app/(tabs)/settings.tsx`, `src/constants/config.ts`, `src/i18n/en.ts`, `src/i18n/ru.ts` | none |
| Review Prompt | `src/services/reviewPromptService.ts` | `src/hooks/useHoraryQuery.ts`, `src/app/_layout.tsx`, `src/constants/config.ts` | `expo-store-review` |

---

*End of viral-features-spec.md — StageM2-GrowthSpec, 2026-06-04*
