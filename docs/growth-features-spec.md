---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/aso-brief.md (StageM1 competitive parity gap table), docs/competitor-research.md, docs/prd-v1.md, docs/viral-features-spec.md, docs/superpowers/expert/aso-virality-brief.md]
reviewed_by: owner-pending
---

# Growth Features Spec — Hora
**Stage**: StageM2-GrowthSpec
**Date**: 2026-06-04

---

## How to Read This Document

- **Tier 1 — Parity MUST-HAVE**: Present in 3+ top competitors AND missing from current Hora build. Must ship before App Store launch or the product will underperform in conversion and retention metrics relative to every alternative.
- **Tier 2 — Growth / Viral**: High viral coefficient or strong retention impact. Ship Phase 1.5 (pre-launch polish sprint).
- **Tier 3 — Phase 2+**: Post-launch. Meaningful but not launch-blocking.

**Effort scale**: S = < 1 day, M = 1–3 days, L = 3–7 days, XL = 1–2 weeks.

**Competitive parity source**: docs/aso-brief.md Section "Competitive Parity Gap Table" — rows marked HIGH priority where `Hora Has` = PHASE 2 or NOT PLANNED AND competitors have the feature.

---

## Tier 1 — Parity MUST-HAVE (ship before App Store launch)

Derived from HIGH-priority parity gaps where Hora does not currently have the feature.

**T1-01 — Subscription / Unlimited Plan** → Phase 2. Full spec in `docs/monetization-spec.md`. Run `/orchestrate:monetization` when ready.

**T1-02 — Push Notification Reminders** → Phase 2. Full spec in `docs/monetization-spec.md`.

**Note**: T1-01 and T1-02 are the only two HIGH-priority parity gaps currently missing from Hora that are not already implemented. All other HIGH-priority items are either implemented or out-of-scope by product decision (natal, tarot, live astrologer).

---

## Tier 2 — Growth / Viral (ship Phase 1.5)

### T2-01 — Share Verdict Card

| Field | Value |
|---|---|
| Name | Share Verdict Card |
| Full spec | docs/viral-features-spec.md Feature 1 |
| Viral coefficient | High — each share exposes Hora to the sharer's Instagram/WhatsApp audience with a visually branded card and the call-to-action "Ask yours: hora.app" |
| User impact | Medium-High — the result screen is the peak emotional moment; sharing while emotionally engaged is the highest-probability share action |
| Effort | M |
| Phase | **1.5** |
| Spec summary | `ShareVerdictCard` component (off-screen, fixed 1080×1920px) captured via `react-native-view-shot` (v4, New Architecture compatible). Instagram Stories via `react-native-share` (URL scheme + pasteboard). Fallback to `expo-sharing` (system share sheet) when Instagram is not installed. Card shows: verdict badge (color-coded YES/NO/MAYBE/UNCLEAR) + question truncated to 40 chars + "Hora" wordmark + "Ask yours: hora.app". Share button added to `result/[id].tsx` nav bar (currently placeholder `Share2` icon per design system brief). Android Instagram path deferred to Phase 2. |
| Compound V pre-flight needs | Library audit: react-native-view-shot v4 Expo SDK 55 install (`npx expo install react-native-view-shot`). Library audit: react-native-share v10 New Architecture compatibility. Expo config plugin for `LSApplicationQueriesSchemes`. |
| New files | `src/components/ShareVerdictCard.tsx`, `src/services/shareVerdictService.ts` |
| Modified files | `src/app/(tabs)/result/[id].tsx`, `app.json`, `src/i18n/en.ts`, `src/i18n/ru.ts` |

### T2-02 — 5-Star Review Prompt

| Field | Value |
|---|---|
| Name | 5-star review prompt |
| Full spec | docs/viral-features-spec.md Feature 3 |
| Viral coefficient | Low (not directly viral) |
| Retention impact | High — App Store rating directly affects organic search rank and conversion rate. Getting to 4.5+ is a force-multiplier on all ASO effort. |
| Effort | S |
| Phase | **1.5** |
| Spec summary | `reviewPromptService.maybePrompt()` called from `useHoraryQuery.ts` `onSuccess` with a 2-second delay. Triggers only on YES or MAYBE verdicts, 3+ completed readings, 7+ days since install, not prompted in last 180 days, `StoreReview.isAvailableAsync()` true. Uses `expo-store-review`. iOS OS enforces 3-per-365-day cap. AsyncStorage keys: `install_date` (set on first launch in `_layout.tsx`) and `review_prompt_state` (`{ prompted_at: string \| null }`). |
| Compound V pre-flight needs | `npx expo install expo-store-review` (SDK 55 compatible, v56.0.3 stable). No breaking changes reported. |
| New files | `src/services/reviewPromptService.ts` |
| Modified files | `src/hooks/useHoraryQuery.ts`, `src/app/_layout.tsx`, `src/constants/config.ts` |

### T2-03 — Invite a Friend (Settings share button)

| Field | Value |
|---|---|
| Name | Invite a friend |
| Full spec | docs/viral-features-spec.md Feature 2 |
| Viral coefficient | Medium — App Store link with UTM parameter. Lower virality than verdict card sharing but zero implementation friction. |
| User impact | Low-Medium — reaches friends of users who are motivated enough to open Settings |
| Effort | S |
| Phase | **1.5** |
| Spec summary | Settings screen gets a "Share & Invite" section. "Invite a friend" row opens React Native `Share.share()` with pre-composed text + UTM-tagged App Store URL. Text is i18n-aware (EN/RU). No backend required. UTM: `utm_source=invite&utm_medium=share&utm_campaign=friend`. "Rate Hora" row deep-links to the App Store page directly (compliant: this is not `requestReview()` from a button). |
| Compound V pre-flight needs | None — uses built-in `Share` from `react-native`. Need App Store numeric ID (`<APPID>`) once app is registered. Placeholder constant `APP_STORE_URL_INVITE` in config.ts until then. |
| New files | None |
| Modified files | `src/app/(tabs)/settings.tsx`, `src/constants/config.ts`, `src/i18n/en.ts`, `src/i18n/ru.ts` |

---

## Tier 3 — Phase 2+ (post-launch)

### T3-01 — Friend Deep-Link + UTM Tracking

| Field | Value |
|---|---|
| Name | Friend deep-link with referral tracking |
| Full spec | docs/viral-features-spec.md Feature 2 (Phase 2 schema section) |
| Effort | M |
| Phase | **2** |
| Spec summary | Deep-link schema: `hora://invite?ref=<referrer_id>&utm_campaign=friend`. Handle in Expo Router `+native-intent.ts`. Store `referrer_id` in AsyncStorage `horary_referrer` on first launch via link. Client-side only — no server referral backend required for Phase 2. Universal link variant (`https://hora.app/invite`) for iOS WKWebView compatibility (Instagram in-app browser blocks URL schemes). |
| Compound V pre-flight needs | Expo Router deep-link handling, Associated Domains for universal links, branch.io or custom redirect service for link generation. |

### T3-02 — Push Notification Reminders (moved from Tier 1 detail)

See T1-02 above for full detail. Phase 2 implementation.

### T3-03 — Outcome Tracking ("Did it come true?")

| Field | Value |
|---|---|
| Name | Outcome tracking |
| Competitor | Horary Astrology Pro (Android) — has this feature |
| Effort | M |
| Phase | **2** |
| Spec summary | Add `outcome` field to `JournalEntry` type: `'confirmed' \| 'denied' \| 'pending' \| null`. Journal item UI gets a "Mark outcome" action. Settings screen shows accuracy stats. No backend — local only. |
| Compound V pre-flight needs | UX design for the outcome tracking UI in Journal. |

### T3-04 — Android Instagram Stories Share

| Field | Value |
|---|---|
| Name | Android Instagram Stories share |
| Effort | M |
| Phase | **2** |
| Spec summary | `Intent.ACTION_SEND` with `setPackage("com.instagram.android")` and `interactive_asset_uri` extra for the sticker image. Separate implementation branch in `shareVerdictService.ts` (platform guard: `if (Platform.OS === 'android')`). |
| Compound V pre-flight needs | react-native-share Android Instagram support verification. Android file URI vs content URI differences. |

### T3-05 — Pre-Prompt Satisfaction Gate (review prompt enhancement)

| Field | Value |
|---|---|
| Name | Pre-prompt satisfaction gate |
| Effort | S |
| Phase | **2** |
| Spec summary | Before calling `requestReview()`, show a custom modal: "Are you enjoying Hora?" → YES triggers `requestReview()`, NO opens an email draft to the support address. Per aso-virality-brief.md domain expert, this pattern reliably improves average rating by 0.3–0.5 stars by filtering disgruntled users before the system prompt. Deferred to Phase 2 because it requires a custom modal component and i18n strings — adds effort beyond the Phase 1.5 target. |
| Compound V pre-flight needs | None — standard React Native Modal. |

---

## Implementation Ordering (Phase 1.5 sprint)

Recommended sequence within the Phase 1.5 viral sprint, ordered by lowest-risk first:

1. **T2-03 Invite a Friend** (S effort) — pure JS, no new dependencies, no native config. Safe warm-up.
2. **T2-02 Review Prompt** (S effort) — one new service, two modified files, one new Expo dep. Low risk.
3. **T2-01 Share Verdict Card** (M effort) — two new native deps, Expo config change, new component. Most complex. Do last, test on physical device (simulator will not work for Instagram URL scheme).

---

## Compound V Pre-Flight Checklist (Phase 1.5 viral sprint)

Before the implementation agent opens any files:

| Check | Command / action |
|---|---|
| Install react-native-view-shot | `npx expo install react-native-view-shot` — verify SDK 55 compatibility in output |
| Install react-native-share | `npx expo install react-native-share` — check peer deps, verify New Architecture support |
| Install expo-store-review | `npx expo install expo-store-review` |
| Verify `LSApplicationQueriesSchemes` in app.json | Add `"instagram-stories"` to `expo.ios.infoPlist.LSApplicationQueriesSchemes` array |
| expo doctor | Run after dep installs — must stay 19/19 |
| tsc --noEmit | Must pass after all new service/component files are added |
| Physical device test | Share card capture + Instagram open MUST be tested on a physical iOS device with Instagram installed. Simulator will always return `canOpenURL = false`. |

---

## Parity Gap Coverage Summary

| Gap | Status after Phase 1.5 | Status after Phase 2 |
|---|---|---|
| Subscription / unlimited | → see docs/monetization-spec.md | → /orchestrate:monetization |
| Push notifications | → see docs/monetization-spec.md | → /orchestrate:monetization |
| Social sharing | SHIPPED (verdict card + invite) | + Android Instagram |
| Friend referral | UTM link only | + deep-link tracking |
| Outcome tracking | Not started | SHIPPED |
| Pre-prompt gate | Not started | SHIPPED |

After Phase 1.5: Hora will have shipped all Tier 2 growth mechanics. The only remaining competitive gaps will be the subscription paywall and push notifications — both tracked for Phase 2.

---

*End of growth-features-spec.md — StageM2-GrowthSpec, 2026-06-04*
