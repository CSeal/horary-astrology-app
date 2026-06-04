---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, mvp-scope.md, 2026-05-25-horary-app-stack.md]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5
---

# Delivery Roadmap — Horary Astrology App (AstraSk)

*Document version: 1.0*

---

## Overview

Delivery is structured in implementation sprints A through D. Sprints C and D run concurrently (parallel dispatch) after Sprint B completes. This maps directly to the partition-map batches in `docs/superpowers/plans/partition-map.md`.

```
Sprint A (Foundation)
     │
     ▼
Sprint B (Services)
     │
     ├─────────────────────────┐
     ▼                         ▼
Sprint C (Screens)        Sprint D (Polish)
     │                         │
     └──────────┬──────────────┘
                ▼
         QA + Release Prep
```

---

## Phase 1 — MVP (This Build)

**Theme**: Core loop — Ask → Loading → Verdict → Journal. First version for App Store + Play Store submission.

**Target Completion**: Stage 5 implementation, all sprints.

---

### Sprint A — Foundation

**Goal**: Working app shell, navigation, theming, i18n, and empty screen stubs.

**Files**: (see Batch A in partition-map.md)

| Task | Description |
|---|---|
| A1 | Initialize Expo SDK 55 project (`tabs@sdk-55` template) |
| A2 | Configure `app.json` (scheme, plugins, permissions, infoPlist) |
| A3 | Configure `babel.config.js` for NativeWind v5 + Reanimated v4 |
| A4 | Configure `metro.config.js` with `withNativeWind` wrapper |
| A5 | Configure `tailwind.config.js` with content paths and color tokens |
| A6 | Create `src/constants/theme.ts` with all design token constants |
| A7 | Create `src/constants/config.ts` (API URL, timeout, AsyncStorage keys, limits) |
| A8 | Create `src/constants/planets.ts` (glyph map, name map) |
| A9 | Implement `src/i18n/index.ts`, `en.ts`, `ru.ts` |
| A10 | Implement root `src/app/_layout.tsx` (QueryClientProvider, i18n init, font loading) |
| A11 | Implement `src/app/(tabs)/_layout.tsx` (tab navigator: Home, Journal, Settings) |
| A12 | Create base UI components: Button, Card, Input, Badge |
| A13 | Run smoke: app launches, tabs navigate, no TypeScript errors |

**Acceptance**: App shell runs on device/simulator. Tab navigation works. English and Russian i18n loads. No TypeScript errors.

---

### Sprint B — Services

**Goal**: All data services, stores, and hooks functional and unit-tested.

**Files**: (see Batch B in partition-map.md)

**Depends on**: Sprint A complete.

| Task | Description |
|---|---|
| B1 | Implement `src/types/horary.ts` (HoraryRequest, HoraryResponse, etc.) |
| B2 | Implement `src/services/horaryApi.ts` (Axios instance, retry, error normalization) |
| B3 | Implement `src/services/secureKeyService.ts` (SecureStore get/set/delete) |
| B4 | Implement `src/services/locationService.ts` (expo-location, foreground only) |
| B5 | Implement `src/services/journalService.ts` (AsyncStorage CRUD for horary_journal) |
| B6 | Implement `src/stores/settingsStore.ts` (locale, apiKeySource, hydrate) |
| B7 | Implement `src/stores/questionsStore.ts` (entries, monthly counter, hydrate) |
| B8 | Implement `src/hooks/useHoraryQuery.ts` (useMutation wrapper) |
| B9 | Implement `src/hooks/useLocation.ts` (location hook) |
| B10 | Write unit tests: `horaryApi.test.ts` (mock axios, retry logic) |
| B11 | Write unit tests: `questionsStore.test.ts` (monthly counter reset) |
| B12 | Run: `npx jest` — all tests pass |

**Acceptance**: All unit tests pass. horaryApi correctly retries 5xx. Monthly counter resets on month change. SecureStore and AsyncStorage operations complete without errors.

---

### Sprint C — Screens (Parallel with D)

**Goal**: All MVP screens implemented and functional.

**Files**: (see Batch C in partition-map.md)

**Depends on**: Sprint B complete.
**Runs in parallel with**: Sprint D.

| Task | Description |
|---|---|
| C1 | Implement `src/app/(tabs)/index.tsx` (Home screen: AskForm, location row, counter) |
| C2 | Implement `src/app/result/[id].tsx` (Verdict screen: VerdictCard, summary, significators) |
| C3 | Implement `src/app/(tabs)/journal.tsx` (Journal screen: grouped list, swipe-delete) |
| C4 | Implement `src/components/AskForm.tsx` (TextInput composite with validation) |
| C5 | Implement `src/components/VerdictCard.tsx` (verdict badge, glow, confidence dots) |
| C6 | Implement `src/components/SignificatorRow.tsx` (planet row with dignity badge) |
| C7 | Implement `src/components/JournalItem.tsx` (journal entry card with left border) |
| C8 | Implement `src/stores/questionsStore.ts` (finalize with addEntry, deleteEntry) |
| C9 | End-to-end manual test: ask question → verdict → journal entry visible |
| C10 | Accessibility: add accessibilityLabel to all interactive elements |

**Acceptance**: Full ask → verdict → journal flow works end-to-end. All 6 smoke tests pass.

---

### Sprint D — Polish (Parallel with C)

**Goal**: Settings, onboarding, animations, and visual polish.

**Files**: (see Batch D in partition-map.md)

**Depends on**: Sprint B complete.
**Runs in parallel with**: Sprint C.

| Task | Description |
|---|---|
| D1 | Implement `src/app/settings.tsx` (language toggle, API key input, counter display) |
| D2 | Implement `src/app/onboarding.tsx` (3-step first-run flow, location permission) |
| D3 | Implement `src/components/CosmosBackground.tsx` (star particle animation) |
| D4 | Implement `src/components/svg/StarField.tsx` (SVG particle layer) |
| D5 | Implement `src/components/svg/PlanetOrbit.tsx` (loading animation orbit) |
| D6 | Implement `src/components/svg/PlanetGlyph.tsx` (planet symbol SVG) |
| D7 | Implement `src/components/svg/VerdictStar.tsx` (animated ✦ reveal) |
| D8 | Implement `src/components/svg/ChartWheel.tsx` (stub — Phase 2 placeholder) |
| D9 | Add haptic feedback: expo-haptics on verdict reveal, button press |
| D10 | Add verdict reveal animation: scale + opacity entrance, glow reveal |
| D11 | Add onboarding completion flag (AsyncStorage `horary_onboarding_complete`) |
| D12 | Language switch: verify immediate update of all visible strings |

**Acceptance**: Onboarding shows on first launch only. Settings language toggle works immediately. Loading animation runs during API call. Verdict reveal animation plays on result screen. Haptics fire correctly.

---

### QA + Release Prep

**Goal**: All acceptance criteria pass; app store assets ready.

**Depends on**: Sprint C + Sprint D both complete.

| Task | Description |
|---|---|
| QA1 | Run full acceptance criteria table (FR-01 through FR-12) — all PASS |
| QA2 | Run all 6 smoke tests on physical iOS device |
| QA3 | Run all 6 smoke tests on physical Android device (or emulator) |
| QA4 | TypeScript strict compile — zero errors |
| QA5 | Accessibility sweep: VoiceOver on iOS, TalkBack on Android |
| QA6 | Performance check: cold start < 2s, journal render < 500ms |
| QA7 | Security audit: confirm no API key in source, no plaintext key in logs |
| QA8 | Prepare App Store assets (screenshots, description, privacy URL) |
| QA9 | Submit to TestFlight (iOS) and Play Console internal track (Android) |

---

## Phase 2 — Retention

**Trigger**: Phase 2 unlocks after 3+ months post-launch with confirmed 30%+ 7-day retention and >85% question-to-verdict conversion.

**Theme**: Keep users coming back — chart depth, social sharing, outcome tracking, and push notifications.

| Feature | Library / Approach | Est. Effort |
|---|---|---|
| Chart wheel visualization | `react-native-svg` (already installed) | 1.5 sprints |
| Detailed aspects table | New screen, new API fields | 1 sprint |
| Share result as image card | `react-native-view-shot` + Share Sheet | 1 sprint |
| Push notifications (optional, opt-in) | `expo-notifications` | 1 sprint |
| Journal outcome tracking ("came true") | AsyncStorage update, journal screen | 0.5 sprints |
| Manual location entry (city search) | Geocoding API | 1 sprint |
| Crash reporter (Sentry) | `@sentry/react-native` | 0.5 sprints |
| Journal export / import | Share-to-Files, cross-device safety net | 0.5 sprints |

---

## Phase 3 — Monetization

**Trigger**: Phase 3 unlocks after Phase 2 retention KPIs are met and IAP infrastructure is approved by legal/finance.

**Theme**: Convert retained users into paying subscribers — IAP, paywall, and premium depth features.

| Feature | Library / Approach | Est. Effort |
|---|---|---|
| IAP / Subscription (RevenueCat) | `react-native-purchases` | 2 sprints |
| Paywall screen (replaces "coming soon" banner) | Bottom sheet + RevenueCat entitlements | 0.5 sprints |
| Restore Purchases | RevenueCat SDK | 0.5 sprints |
| Practitioner Mode toggle | Full radicality details, Latin terms, expanded significators | 1 sprint |
| Offline ephemeris | Bundle Swiss Ephemeris data files | 2 sprints |
| Cloud sync / user accounts | Server-side journal, Apple Sign-In, Google Sign-In | 3 sprints |
| Community peer verification | Outcome tagging, accuracy scores | 2 sprints |
| Multiple saved profiles | Client work / family member profiles | 1 sprint |
| Apple Watch complication | WatchOS companion app | 2 sprints |

---

## Parallel Dispatch Map

```
Sprint A (Foundation)   ──────────────────────────────────────► COMPLETE
       │
       ▼
Sprint B (Services)     ──────────────────────────────────────► COMPLETE
       │
       ├────────────────────────────────────────────┐
       │                                            │
       ▼                                            ▼
Sprint C (Screens)      ────────────────────────►  Sprint D (Polish)
- Home screen (AskForm)                          - Settings screen
- Verdict screen (result/[id])                   - Onboarding screen
- Journal screen                                 - CosmosBackground
- AskForm component                              - SVG components
- VerdictCard component                          - Haptics
- SignificatorRow                                - Verdict animations
- JournalItem                                    - First-run flag
- questionsStore (finalize)
       │                                            │
       └──────────────────┬─────────────────────────┘
                          │
                          ▼
               QA + Release Prep ─────────────────► SHIP
```

Agents executing Sprint C and Sprint D must operate on disjoint file sets (enforced by partition-map.md — no file appears in more than one batch).

---

*Stage: Stage4-Architecture*
*Gate 5: Delivery roadmap defined — PASS*
