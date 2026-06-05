---
created_by: claude-sonnet
updated_by: claude-sonnet-4-6
source_inputs: [qa-summary.md, handoff-log.md, mvp-scope.md, Phase 1.5 artifacts (commits 6aeae17, 1ca13f7, ecdb629)]
reviewed_by: owner-pending
---

# Demo Readiness — Horary Astrology App (Phase 1 + Phase 1.5)

**Date:** 2026-06-04 (updated — post Phase 1.5)
**Status: READY FOR DEMO**
**QA result:** Gate 7 PASS, Gate 8 PASS, 0 P0 issues
**Shipped:** Phase 1 MVP + Verdict C+ two-screen layout + FR-G02 review prompt + FR-G03 invite/rate + FR-G04–G07 API field surfacing

---

## 1. Prerequisites

| Requirement | Value |
|---|---|
| Node.js | v22.x (tested on v22.22.0) |
| Expo Go | Install from the App Store or Play Store on your test device |
| API key | Set `EXPO_PUBLIC_ASTROLOGY_API_KEY` in `.env.local` at project root |
| Dependencies | Run `npm install` once if not done |

### .env.local format
```
EXPO_PUBLIC_ASTROLOGY_API_KEY=your_key_here
EXPO_PUBLIC_DEBUG_PIN=4242
```

The API key is loaded at startup in priority order: user-entered key in SecureStore → `.env.local` env var → 401 fallback. For demo, the env var is sufficient.

---

## 2. Start Command

```bash
npx expo start
```

Scan the QR code with the Expo Go app on iOS or Android. Metro will build and stream the bundle to the device.

For debug mode (enables the hidden developer panel):

```bash
npm run start:debug
```

---

## 3. Demo Flow

### Step a — Home Screen: star background animation

On the very first launch, onboarding plays (3 screens: Welcome → How It Works → Location permission). Tap through or grant location to proceed.

On the Home tab, show:
- The animated `CosmosBackground`: 60 SVG stars with staggered opacity pulses running on the Reanimated UI thread.
- The `PlanetOrbit` animation that replaces the form while a question is in flight: a planet glyph orbiting a central pulse (3 s revolution + 1.5 s core pulse).
- The question type selector: category picker (General / Love / Career / etc.) + optional subcategory + subject role ("For myself" / "For partner" / etc.).
- The location row: shows the detected GPS city or a manually overridden city with a "Change" link that opens the city-search bottom sheet.

### Step b — Ask a question

Type a yes/no question, for example:

> "Will I get the job offer this week?"

Show:
- Character counter (5–280 chars). Counter turns amber near the upper limit.
- Subject-role selector row above the input.
- Location row with GPS city and a "Change" link for the city-search picker.
- The "Ask the Stars" button activates once the question is valid and a location is available.

### Step c — Loading with planet animation

After tapping "Ask the Stars":
- The `AskForm` is replaced by the `PlanetOrbit` animation + "Reading the sky…" text while the API call is in flight.
- The API client applies 3-attempt exponential backoff (1 s / 2 s / 4 s) for 5xx and network errors.
- Timeout is 15 seconds; a "took too long" banner returns the user to Home on timeout.

### Step d — Verdict screen (C+ Screen 1)

The result screen (Phase 1.5 C+ layout) shows:

- **Compact VerdictCard** — verdict badge (YES / NO / MAYBE / UNCLEAR) in theme color (green / red / gold / violet) with confidence dots. Scale-spring entrance animation + haptic feedback.
- **Chart Strength bar** — `ChartStrengthBar` renders a numeric 0–100 radicality score as a gradient bar with a label (Strong / Borderline / Weak). Replaces the old boolean "Radical" badge (FR-G06).
- **VOC Moon banner** — `VocMoonBanner` shows Moon sign, degrees to sign change, next sign, and Lilly exception note when the Moon is void-of-course (FR-G07).
- **AI summary** — 2–4 sentence plain-language interpretation from the API.
- **Timing teaser** — "When might this happen? ≈ 3 weeks" with a time-unit scale badge (FR-G05), shown when the API returns timing data.
- **"See the full reading" CTA** — pushes to the Full Reading screen (Screen 2). On non-radical charts this CTA is replaced by "Ask again when ready."

Entry is auto-saved to the journal when this screen loads.

### Step e — Full Reading screen (C+ Screen 2)

Tap "See the full reading" to push the second screen:

- **Significators** — querent, quesited, and Moon with sign, house, dignity label, and retrograde flag (same data as Phase 1; now on a dedicated screen).
- **Aspect Perfections** — `AspectRow` list of applying/past aspects with planet names, aspect type, orb, and status pill (FR-G04). First 3 shown; "Show all N aspects" toggle reveals the rest.
- **Timing block** — `TimingBlock` shows the full timing estimate with unit scale (FR-G05).
- Back arrow navigates to the verdict screen.

### Step f — Journal tab

Switch to the Journal tab:
- The saved reading appears immediately (auto-saved on verdict display).
- Entries are grouped by month, newest first.
- Swipe left on an entry to reveal a red delete button (react-native-gesture-handler `ReanimatedSwipeable`).
- Tap any entry to open the full C+ two-screen verdict (read-only).
- Empty state ("The scroll is empty. Ask your first question to begin your chronicle.") appears when no entries exist.

### Step g — Settings: language toggle, API key, Share & Invite

Switch to the Settings tab:

- **Language section** — segmented picker with EN / RU / DE / FR / PT / ES flags. Tap "RU" — the entire UI relabels instantly with no reload. Tap "EN" to switch back.
- **Zodiac type** — Tropical / Sidereal toggle (new in Phase 1.5; controls API `zodiac_type` parameter).
- **Location source** — Device GPS (default) or Set City (always uses the chosen city). Tapping "Set City" opens the city-search bottom sheet.
- **Timezone** — read-only IANA timezone string (e.g. `Europe/London`).
- **API key section** — shows current source ("Using: app default" or "Using: personal key"). Tap "Edit" to reveal the masked text input. Enter a key and tap "Save Key" to persist to SecureStore. "Remove key" clears it.
- **Share & Invite section** (FR-G03) — "Invite a friend" triggers the native Share sheet with a UTM-tagged app store link. "Rate Hora" opens the App Store review page via `Linking.openURL`.

---

## 4. Known Limitations (P1 — non-blocking for demo)

1. **5/5 question limit is a "coming soon" banner, not a paywall.** Per PRD Phase 1 scope, no payment infrastructure exists. When the API returns 429, a dismissible banner ("You've reached your monthly question limit. Unlimited access is coming soon.") is shown. Non-blocking.

2. **FR-G01 share card deferred.** The share-verdict-as-image-card feature is deferred to a dev build (requires `react-native-view-shot` + `expo-media-library`). See `docs/features/share-reading-G01-deferred.md`. Invite-a-friend text share (FR-G03) works today.

3. **Chart Wheel is a Phase 2 placeholder.** The full SVG planetary wheel is Phase 2. The `ChartWheel` component renders two placeholder circles with a "Chart wheel — Phase 2" label; it is not shown on any screen in the demo flow.

4. **npm audit: 13 moderate vulnerabilities.** All are transitive inside Expo SDK 55 (`uuid < 11.1.1` via `@expo/cli`). Running `npm audit fix --force` would downgrade Expo to v46. This is an upstream issue; not actionable without a full SDK upgrade.
