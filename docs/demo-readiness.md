---
created_by: claude-sonnet
source_inputs: [qa-summary.md, handoff-log.md, mvp-scope.md, docs/features/testing.md]
reviewed_by: owner-pending
---

# Demo Readiness — Horary Astrology App (MVP)

**Date:** 2026-06-04
**Status: READY FOR DEMO**
**QA result:** Gate 7 PASS, Gate 8 PASS, 0 P0 issues

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

The API key is loaded at startup: app → SecureStore (user-entered) → `.env.local` env var → 401 fallback. For demo, the env var is sufficient.

---

## 2. Start Command

```bash
npx expo start
```

Scan the QR code with the Expo Go app on iOS or Android. The metro bundler will build and stream the bundle to the device.

For debug mode (enables hidden developer panel):

```bash
npm run start:debug
```

---

## 3. Demo Flow

### Step a — Home Screen: star background animation

On launch, onboarding runs on first-ever install (3 screens: Welcome → How It Works → Location permission). Skip through or grant location permission.

On the Home tab, point out:
- The animated `CosmosBackground`: 60 SVG stars with staggered opacity pulses (Reanimated, UI thread only).
- The `PlanetOrbit` animation: a planet glyph orbiting a central pulse with a 3s revolution + 1.5s core pulse.
- The question counter chip at the top: "Queries to the stars: X / 5".
- The question type selector (category + subcategory) above the text input.

### Step b — Ask a question

Type a yes/no question into the input, for example:

> "Will I get the job offer this week?"

Point out:
- The character counter (5–280 chars). The counter turns amber near the limit.
- The "Ask for" subject role toggle (for myself / for someone else).
- The location row showing GPS city or manual override with a "Change" link.
- The "Ask the Stars" button activates once a valid question is entered and location is available.

### Step c — Loading with planet animation

After tapping "Ask the Stars":
- The `AskForm` is replaced by a `PlanetOrbit` animation + spinner while the API call is in flight.
- The API uses 3-attempt exponential backoff (1s/2s/4s) for server errors.
- Timeout is 15 seconds; a "took too long" banner is shown on timeout.

### Step d — Verdict screen

The result screen shows:
- The `VerdictStar` burst animation (scale 0→1 spring, 8-point starburst rotation).
- A large verdict badge: YES / NO / MAYBE / UNCLEAR in the corresponding theme color (green/red/gold/violet).
- Confidence dots (1–3 filled) + HIGH/MEDIUM/LOW label.
- A plain-language summary paragraph (2–4 sentences from the API).
- The Significators section: querent, quesited, and Moon with sign, house, dignity, and retrograde flag.
- A Void-of-Course Moon note if applicable.
- Entry is auto-saved to the journal on this screen.

### Step e — Journal tab

Switch to the Journal tab to show:
- The saved reading appears immediately (auto-saved on verdict display).
- Entries are grouped by month, newest first.
- Swipe left on an entry to reveal a delete button (react-native-gesture-handler swipeable).
- Tap any entry to open a read-only copy of the full verdict.
- Empty state ("No readings yet") appears when the journal is cleared.

### Step f — Settings: language toggle

Switch to the Settings tab:
- Language section: segmented picker with EN / RU / DE / FR / PT / ES flags.
- Tap "RU" — the entire UI relabels instantly (no reload). Tap "EN" to switch back.
- Timezone row: read-only IANA timezone string (e.g. "Europe/London").
- Usage row: progress bar showing X / 5 monthly questions used.
- API key row: masked text input. Enter or clear an API key; source indicator shows "env" vs "user".

---

## 4. Known Limitations (P1 — non-blocking for demo)

1. **Loading minimum duration not enforced.** The `withMinDuration` hook exists (`src/hooks/withMinDuration.ts`) and is tested, but is not wired to the API mutation. On a fast connection, the loading screen may flash briefly before the verdict appears. Not user-harmful; fix in next polish pass.

2. **5/5 question limit is a "coming soon" banner, not a paywall.** Per PRD Phase 1 scope, no payment infrastructure exists. The banner is dismissible and non-blocking.

3. **Chart Wheel is a Phase 2 placeholder.** The verdict screen shows the significators section and summary; the SVG chart wheel renders two placeholder circles with a "Chart wheel — Phase 2" label. This is by design.

4. **`StyleSheet.create` in AnimatedSplash.** One instance in `src/components/AnimatedSplash.tsx` uses `StyleSheet` for layout-only properties (NativeWind limitation for absolute positioning). Values are from `theme.ts`; no hardcoded hex. Low impact.

5. **npm audit: 13 moderate vulnerabilities.** All are transitive inside Expo SDK 55 (`uuid < 11.1.1` via `@expo/cli`). Running `npm audit fix --force` would downgrade Expo to v46 (breaking). This is an upstream issue; not actionable at app level without a full SDK upgrade.

6. **Jest baseline documentation stale.** `docs/features/testing.md` documents the baseline as 9 suites / 54 tests. Actual suite is now 10 suites / 71 tests (`horaryMapper.test.ts` added, `useDebugTrigger` gained 1 test). Update the doc before next QA cycle.
