---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/growth-features-spec.md (T1-01), docs/mvp-scope.md (Phase 3 IAP), docs/prd-v1.md, docs/kpi-and-economics.md]
reviewed_by: owner-pending
---

# Monetization Spec — AstraSk Horary Astrology App

**Stage**: Pending — run `/orchestrate:monetization` to populate this document.
**Phase**: Phase 3 — Monetization (after Phase 2 Retention KPIs are met)
**Gate**: Phase 3 unlocks after 30%+ 7-day retention AND >85% question-to-verdict conversion confirmed.

> This document is the single source of truth for all monetization work.
> No monetization code, stubs, or IAP infrastructure should appear in Phase 1, Phase 1.5, or Phase 2 (Retention).
> The only Phase 1 artifact is the "coming soon" banner shown when the API returns 429 (LIMIT_EXCEEDED).

---

## Current MVP State (Phase 1 — implemented)

- **Free tier**: 5 questions/month, auto-reset on 1st of calendar month
- **Counter storage**: `AsyncStorage` keys `horary_question_count` + `horary_question_reset_date` (in `questionsStore.ts`)
- **At-limit UX**: non-blocking "coming soon" banner (`src/app/(tabs)/index.tsx`)
- **No paywall, no RevenueCat, no StoreKit, no Google Play Billing** in Phase 1 or Phase 1.5

---

## T1-01 — Subscription / Unlimited Plan

> Extracted from growth-features-spec.md T1-01 (StageM2-GrowthSpec, 2026-06-04)

| Field | Value |
|---|---|
| Name | Subscription / unlimited plan |
| Competitor coverage | Co-Star, Nebula, Nummi, TimePassages — all have unlimited subscription |
| Priority justification | HIGH parity gap: every top competitor has this. Without it, users who hit the 5/month limit have zero upgrade path. Direct revenue and retention blocker. |
| Phase | **Phase 3** |
| Effort | L (1–2 weeks) |

### Implementation sketch (to be fully specced by `/orchestrate:monetization`)

- **Library**: `react-native-purchases` (RevenueCat SDK)
- **Product SKU**: `horary_unlimited_monthly` ($4.99/month) — price TBD with market data
- **Platforms**: App Store (StoreKit 2), Google Play Billing v5/v6
- **Entry point**: Replace "coming soon" banner CTA at 5/5 limit with real paywall trigger
- **Restore purchases**: required by App Store guidelines

### Compound V pre-flight needs (before coding begins)

- Library audit: `react-native-purchases` + RevenueCat SDK — Expo SDK 55 compatibility, New Architecture (Fabric) support
- StoreKit 2 vs legacy StoreKit — confirm which path `react-native-purchases` uses on Expo SDK 55
- Google Play Billing v6 — breaking changes from v5
- RevenueCat dashboard setup requirements (app registration, API keys, entitlement config)
- `expo-iap` as alternative to `react-native-purchases` — evaluate for Expo-first DX

### Prototype requirement

The paywall sheet UI **must be designed** (as a non-functional screen) before App Store submission so that:
- Screenshots and App Store listing can reference a premium tier
- Screenshot 5 "Alternative" (from aso-brief.md) can show "Upgrade to Unlimited" CTA in Settings
- App Review can see the intended monetization model upfront

→ `/orchestrate:design` (with `prototype-update-v2.md`) should include the paywall sheet mockup when run.

---

## T1-02 — Push Notification Reminders

| Field | Value |
|---|---|
| Name | Push notification reminders |
| Competitor coverage | Co-Star (daily transits push), Nebula (daily horoscope push), The Pattern (behaviorally triggered) |
| Phase | **Phase 2 (Retention)** |
| Effort | M (1–3 days) |

### Implementation sketch

- **Library**: `expo-notifications`
- **Permission**: Request on Settings screen after onboarding complete (never on first launch)
- **Use case v1**: "Ask your next question" reminder 7 days after last reading
- **Use case v2**: Weekly journal summary "You have [N] readings this month"
- **Backend requirement**: EAS Push Service (no custom backend needed for local scheduled notifications)

### Compound V pre-flight needs

- `expo-notifications` + EAS push service setup
- APNS certificate for iOS
- Permission request UX timing research for spiritual apps

---

## T3-01 — Friend Deep-Link + UTM Referral Tracking

| Field | Value |
|---|---|
| Phase | **Phase 2 (Retention)** |
| Effort | M |

- Deep-link schema: `astrask://invite?ref=<referrer_id>&utm_campaign=friend`
- Handle in Expo Router `+native-intent.ts`
- Store `referrer_id` in AsyncStorage `horary_referrer` on first launch via link
- Universal link variant (`https://astrask.app/invite`) for iOS in-app browser compatibility
- No server referral backend required for Phase 2 (client-side only)

---

## T3-04 — Android Instagram Stories Share

| Field | Value |
|---|---|
| Phase | **Phase 2 (Retention)** |
| Effort | M |

- `Intent.ACTION_SEND` with `setPackage("com.instagram.android")`
- Separate implementation branch in `shareVerdictService.ts` (platform guard: `Platform.OS === 'android'`)
- Android file URI vs content URI differences — requires testing on physical Android device

---

## T3-05 — Pre-Prompt Satisfaction Gate

| Field | Value |
|---|---|
| Phase | **Phase 2 (Retention)** |
| Effort | S |

- Custom modal before `requestReview()`: "Are you enjoying AstraSk?"
- YES → `requestReview()`, NO → opens email draft to support address
- Improves average App Store rating by 0.3–0.5 stars by filtering disgruntled users before the system prompt
- Requires: custom modal component + i18n strings in all 6 locales

---

## KPI Gates for Phase 3 Unlock

From `docs/kpi-and-economics.md`:
- 7-day retention ≥ 30%
- Question-to-verdict conversion ≥ 85%
- 3+ months of post-launch data
- App Store rating ≥ 4.2 before paywall launch (to avoid review bombing from users hitting the paywall)

---

## How to Run

When ready to implement monetization, run:

```
/orchestrate:monetization
```

The agent will:
1. Run Compound V pre-flight (library audit: RevenueCat SDK, StoreKit 2, Google Play Billing)
2. Produce a full implementation spec with partition map
3. Design the paywall sheet UI prompt for the HTML prototype
4. Create the Phase 3 coding sprint plan

---

*End of monetization-spec.md*
*To be populated by `/orchestrate:monetization` when Phase 3 is ready.*
