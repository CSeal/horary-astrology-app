---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [project-brief.md, competitor-research.md, kpi-and-economics.md, horary-domain-brief.md]
reviewed_by: owner-pending
---

# MVP Scope — Horary Astrology Mobile App

---

## Overview

This document defines what is built in each phase. Phase 1 (this build) is the MVP released to the App Store and Play Store. Phases 2 and 3 are post-launch roadmap items — they are scoped here to prevent scope creep and to ensure Phase 1 architectural decisions accommodate future expansion.

---

## Phase 1 — MVP (This Build)

**Theme**: Core loop — ask a sincere question, receive an instant horary verdict, keep a personal journal.

**Coding gate**: Coding is locked until all Definition of Ready checks pass (see CLAUDE.md).

---

### Core Ask → Loading → Verdict Flow

| Feature | Rationale |
|---|---|
| Question input screen (TextInput, 5–280 chars, character counter, "Ask the Stars" CTA) | This is the entire product entry point. No flow exists without it. |
| Auto-detect location via `expo-location` (lat/lng + IANA timezone + city display) | The horary chart requires the exact geographic coordinates of the querent. GPS is the only viable auto-source at MVP scale. |
| API call to `POST /horary/ask` (astrology-api.io) with correct payload | The entire verdict depends on this call. The API provides the chart calculation and AI summary. |
| Loading Screen with animated celestial illustration and indeterminate progress bar | Sets user expectation that real computation is happening. 1.5s minimum display prevents "too fast = fake" perception. |
| Verdict Screen: YES/NO/MAYBE/UNCLEAR badge with color coding | The primary deliverable. Color + text ensures verdict is scannable and accessible. |
| Confidence badge (HIGH/MEDIUM/LOW with dot visualization) | Calibrates user trust in the verdict; critical for users making real decisions. |
| Plain-language summary (2–4 sentences from API `summary` field) | Core UVP differentiator — no competitor app explains horary verdicts in plain language. |
| Significators section (querent, quesited, Moon with sign/house/dignity/retrograde) | Required for the Secondary ICP (practitioners). Also builds beginner trust that a real technique was applied. |
| Void-of-course Moon note with beginner tooltip | Key horary condition that modifies the verdict; must be surfaced per domain spec. |

---

### Journal

| Feature | Rationale |
|---|---|
| Auto-save each question + verdict to AsyncStorage immediately on verdict display | A journal that requires manual save will be used by fewer than 50% of users. Auto-save removes friction entirely. |
| Journal tab: entries grouped by month, newest-first | Enables reflection on past questions and outcomes — core engagement driver for retention. |
| Tap entry to view full verdict (read-only Verdict Screen) | Users need to revisit specific readings, not just question text. |
| Swipe-left-to-delete with confirmation dialog | Standard mobile UX pattern; necessary for data management. |
| Empty state ("No readings yet. Ask your first question...") | Required for first-run and reset scenarios. |

---

### Settings

| Feature | Rationale |
|---|---|
| Language toggle: English / Russian | Russian-speaking market is a primary acquisition target; the switch must be in-app and immediate. |
| Detected timezone display (IANA string, read-only) | Users need to verify their timezone is correct before trusting chart accuracy. |
| Question counter display (progress bar, X / 5, reset date) | Transparency about the free tier limit reduces frustration and builds trust. |
| API key input (masked, stored in `expo-secure-store`, source indicator) | Required for developers and power users who supply their own API key; also a safety valve if the bundled default key hits rate limits. |

---

### Onboarding (First Run)

| Feature | Rationale |
|---|---|
| Welcome screen with app name and one-line description | Sets context for new users; reduces immediate abandonment. |
| 3-step "How it works" explanation (Ask → Cast → Verdict) | Beginner users need to understand what the app does before they trust it enough to ask a question. |
| Location permission request with plain-language explanation | Location is mandatory for the chart. The explanation prevents users from reflexively denying permission. |
| Optional API key prompt (Skip / Enter) | Allows power users to set their key before their first question, reducing setup friction later. |
| One-time display (flag persisted in AsyncStorage) | Industry standard; re-showing onboarding would be annoying and is universally disliked. |

---

### Error States

| Error State | Behavior |
|---|---|
| No internet connection | Inline banner on Home Screen: "No internet connection. Check your network and try again." No crash. |
| Location permission denied | Informational message on Home Screen: "Location access needed — tap to open Settings." Question submission blocked. |
| API error (4xx / 5xx) | Error banner after Loading Screen: returns user to Home Screen with actionable message. |
| API timeout (>10 seconds) | Dedicated timeout message: "The server took too long to respond. Please try again." |
| Empty question submission | Submit button disabled; no-op if somehow triggered. |
| Question too short / too long | Character counter turns red; submit button remains disabled. |

---

### Freemium Counter (Local Only)

| Feature | Rationale |
|---|---|
| Monthly counter in AsyncStorage (`horary_question_count` + `horary_question_reset_date`) | Establishes the freemium model behavior without any payment infrastructure. |
| Auto-reset on 1st of each calendar month | Standard subscription billing cycle; users understand "monthly limits." |
| "Coming soon" banner at 5/5 questions (non-blocking) | Communicates the paid tier is coming without frustrating or locking out users in MVP. |
| No paywall, no payment prompt, no RevenueCat in MVP | IAP adds App Store review complexity and rejection risk. Validate engagement first. |

---

---

## Phase 1.5 — Growth Features

**Theme**: Pre-launch growth mechanics, API field completeness, and viral sharing.
**Trigger**: Ships after Phase 1 QA passes and before App Store submission.
**Monetization note**: IAP, RevenueCat, and subscriptions remain Phase 2. Phase 1.5 contains zero payment infrastructure.

| FR | Feature | Effort | Why Phase 1.5 |
|---|---|---|---|
| FR-G01 | Share verdict as image card (Instagram Stories + native share sheet) | M | Primary viral mechanic — each share exposes the app to new users with a branded card. Peak emotional moment on the result screen = highest share probability. |
| FR-G02 | 5-star review prompt (expo-store-review, event-driven) | S | App Store rating directly affects organic search rank and install conversion. Getting to 4.5+ stars amplifies all ASO effort. |
| FR-G03 | Invite a Friend row in Settings (native Share.share + UTM link) | S | Zero-friction growth: no backend, no new deps. UTM tagging gives attribution data post-launch. |
| FR-G04 | Aspect perfections inline display (top-3 applying aspects + "Show all") | S | Bug fix: `aspect_perfections[]` is already in the API response but never mapped or displayed. High practitioner value. |
| FR-G05 | Timing indication section (timing[] from API response) | M | High user value: "when?" is the second most common question after "will it happen?". API already computes timing on every call — it is not being surfaced. |
| FR-G06 | Radicality score bar ("Chart Strength" 0–100, replaces boolean badge) | S | UX improvement: a numeric bar communicates chart quality more clearly than a boolean "Radical/Not Radical" label. |
| FR-G07 | Moon analysis details (moon sign, degrees to sign change, VOC exception) | S | Practitioner parity: lunar data is returned by the API but never rendered beyond the basic VOC flag. |

---

## Phase 2 — Post-Store Launch

**Theme**: Monetization, chart depth, and sharing.

**Trigger**: Phase 2 unlocks after 3+ months post-launch with data confirming 30%+ 7-day retention and >85% question-to-verdict conversion.

---

### IAP / Subscription

→ Full spec in `docs/monetization-spec.md`. Run `/orchestrate:monetization` when Phase 2 KPI gates are met.

### Chart Wheel Visualization

- SVG-based planetary wheel showing house positions, planet glyphs, aspect lines
- Tappable planets to highlight significators
- Accessible description of the wheel for screen reader users

### Detailed Technical Breakdown

- Expandable aspects table: all major aspects between significators with orb, applying/separating, strength rating
- Full dignity table: essential dignity score for each significator
- House positions list: all planets by house number

### Share Result (Image Card Export)

- Generate a shareable image card: verdict + question + date + app branding
- Share via native iOS/Android Share Sheet
- Share button placeholder is on Verdict Screen in MVP (disabled or hidden until Phase 2)

### Push Notifications

- Daily optional prompt: "Ready to ask the stars something?" (opt-in only)
- Weekly journal reminder: "You have [N] readings this month"
- Requires `expo-notifications` + user permission
- Implementation depends on Phase 2 backend or a scheduled local notification approach

### Manual Location Entry (City Search)

- Full city-name search with geocoding for users who deny GPS
- Fallback for users in regions with poor GPS signal
- Phase 2 priority because the vast majority of users will grant location permission when it is explained clearly in onboarding

---

## Phase 3 — Growth

**Theme**: Practitioner depth, offline capability, and community.

**Trigger**: Phase 3 unlocks after reaching 5,000 MAU and evidence of strong Secondary ICP (practitioner) engagement.

---

### Practitioner Mode

- Toggle in Settings: "Practitioner Mode"
- Shows full radicality details, traditional terminology (Latin terms, dignity point scoring)
- Expanded significator view with all seven traditional planets
- Lilly-style judgment notes displayed alongside AI summary

### Offline Ephemeris

- Bundle Swiss Ephemeris data files for offline chart casting
- App works without internet for chart calculation; API summary still requires network
- Relevant for users in areas with poor connectivity or high API cost sensitivity

### Cloud Sync / User Accounts

- Server-side journal storage for cross-device sync
- Account creation: email/password + Apple Sign-In + Google Sign-In
- Required before launching desktop web companion (not in scope yet)

### Community / Peer Verification

- Verified outcome tagging: users can mark past verdicts "Came true" / "Did not come true"
- Aggregate accuracy score per question type (anonymous)
- Peer review by certified astrologers for premium journal entries

### Multiple Saved Profiles

- Asking a question on behalf of another person (e.g., client or family member)
- Profile stores name + default location
- Required for practitioners doing client work

### Apple Watch Complication

- Quick-ask flow from the watch face
- Verdict notification delivered to wrist
- Requires WatchOS companion app build

---

*Document version: 1.0*
*Stage: Stage2-PRD*
*Gate linkage: Gate 3 (PRD Approval), Gate 5 (Architecture — Phase 2 items inform architectural decisions)*
