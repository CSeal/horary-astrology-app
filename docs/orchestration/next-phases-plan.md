---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [handoff-log.md, prd-v1.md, delivery-roadmap.md, qa-summary.md, viral-features-spec.md, growth-features-spec.md]
reviewed_by: owner-approved
date: 2026-06-04
---

# Next Phases Implementation Plan

## Context (what's done)

| Batch | Commit | Status |
|---|---|---|
| Stage 1–5e MVP (foundation → screens → polish → cleanup) | multiple | ✅ |
| Stage 6 QA (71 tests) | `c967a6b` | ✅ |
| M-cycle (market research + growth spec + API audit + doc refresh) | `ea3b8ee` | ✅ |
| Phase 1.5 Verdict C+ (FR-G04–G07 + two screens + Settings redesign) | `6aeae17` | ✅ |
| Phase 1.5 Growth G02+G03 (review prompt + invite/rate) | `ecdb629` | ✅ |

**Current baseline:** typecheck ✓ lint ✓ jest 84/84

### Deferred (do not do now)
- FR-G01 Share Card — requires dev build + physical device (guide: `docs/features/share-reading-G01-deferred.md`)
- Stage 6c Screenshots — requires dev build
- Phase 3 Monetization — explicitly deferred by owner

---

## Model selection

Simple rule: **code complexity → model**.

| Model | When to use | Example tasks |
|---|---|---|
| **Opus** `claude-opus-4-8` | Complex multi-file code, architecture, SVG geometry, non-trivial logic | Chart Wheel SVG, complex refactoring |
| **Sonnet** `claude-sonnet-4-6` | Medium code (1–5 files), documentation, research, QA runs | Outcome Tracking, Store Prep, QA, Location fallback |
| **Haiku** `claude-haiku-4-5-20251001` | Mechanical tasks: i18n translations, config, minor edits | Translating keys into 5 locales, Sentry init |

---

## Implementation stages

```
┌─────────────────────────────────────────────────────┐
│  STAGE 0: QA re-run (must be first)                 │  ~20 min
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌─────────────────┐       ┌─────────────────────────┐
│  STAGE 1:       │       │  STAGE 2:               │
│  Stage 6b       │       │  Outcome Tracking       │  in parallel
│  Store Prep     │       │  (Phase 2a)             │
└────────┬────────┘       └───────────┬─────────────┘
         │                            │
         │                  ┌─────────▼──────────────┐
         │                  │  STAGE 3:              │
         │                  │  Chart Wheel           │  after 2
         │                  │  (Phase 2b)            │
         │                  └─────────┬──────────────┘
         │                            │
         │                  ┌─────────▼──────────────┐
         │                  │  STAGE 4:              │
         │                  │  Manual Location +     │  after 3
         │                  │  Sentry (small ones)   │
         │                  └─────────┬──────────────┘
         │                            │
         └────────────┬───────────────┘
                      ▼
          ┌───────────────────────┐
          │  FINAL:               │
          │  Final QA run         │
          │  + Store upload       │
          └───────────────────────┘
```

---

## STAGE 0 — QA Re-run (must be first)
> 🤖 **Model: Sonnet** — runs commands, reads output, writes markdown reports. Opus is overkill.

### Why
Phase 1.5 added 13 new files and changed 16. `qa-summary.md` and `demo-readiness.md`
are stale (written before C+). A fresh baseline is needed before the next batches.

### Command
```
/orchestrate:qa
```

### Inputs (already ready)
- Code after `ecdb629`
- jest baseline: 84 tests (was 71 before Phase 1.5)

### Outputs
- `docs/qa-summary.md` — updated (new baseline: 84+ tests, new screens)
- `docs/demo-readiness.md` — updated (Verdict C+ screens, Share & Invite in Settings)
- Entry `Stage6b-QARerun` in `docs/orchestration/handoff-log.md`

### Acceptance checks
- [ ] expo doctor 19/19 ✅
- [ ] tsc --noEmit — 0 errors
- [ ] eslint src/ — 0 errors
- [ ] jest — all tests (minimum 84) green
- [ ] 6 smoke tests passed (Home → Ask → Loading → Verdict → Full Reading → Journal)
- [ ] `qa-summary.md` contains up-to-date test count
- [ ] P0 issues: none (P1 allowed with a recorded note)

---

## STAGE 1 — Stage 6b Store Prep
> 🤖 **Model: Sonnet** — pure text generation (descriptions, privacy policy, ASO copywriting).
> Inside the agent, i18n translations for 6 locales should be delegated to **Haiku** (mechanical translation).

### Why
Prepare all text artifacts for App Store / Play Store. Upload comes later
(once App Store Connect account + numeric ID are available), but all content is prepared now.

### Prerequisites
- STAGE 0 completed (QA green)

### Command
```
/orchestrate:store-prep
```

### Inputs (already ready)
- `docs/aso-brief.md` — 50 keywords, 5 name candidates
- `docs/competitor-research.md` — competitors, differentiators
- `docs/prd-v1.md` — PRD with product description
- `docs/design-system-brief.md` — visual style
- `docs/qa-summary.md` — QA results for reviewer notes

### Outputs
- `docs/privacy-policy.md` — privacy policy text (for GitHub Pages)
- `docs/store-metadata.md` — localized descriptions EN/RU/DE/FR/PT/ES
  - App name (≤30 chars), subtitle (≤30 chars), description (≤4000 chars)
  - Keywords string (≤100 chars, comma-separated) — from `aso-brief.md`
  - Promotional text (≤170 chars), what's new (release notes)
- `docs/apple-privacy-labels.md` — Apple Privacy Nutrition Label answers
- `docs/play-data-safety.md` — Google Play Data Safety form answers
- `docs/app-reviewer-notes.md` — App Store reviewer instructions (demo access, feature description)
- `docs/age-rating.md` — age rating recommendation + justification
- Entry `Stage6b-StorePrep` in `handoff-log.md`

### Acceptance checks
- [ ] `store-metadata.md` contains all 6 locales
- [ ] App name ≤ 30 characters in all locales
- [ ] Keywords ≤ 100 characters (comma-separated)
- [ ] Privacy policy includes: data collection, location use, API key storage, retention
- [ ] Reviewer notes contain demo API key or instructions on how to test without one
- [ ] Apple 4.3(b) compliance: description of functional purpose (not fortune-telling)
- [ ] Age rating: 4+ with justification (no violence, gambling, user-generated content)

### ⚠️ Required from owner before upload
- Register the app in App Store Connect → get **numeric App Store ID**
- Replace `APP_STORE_ID = '000000000'` in `src/constants/config.ts` with the real ID
- This unblocks invite + rate links (G03) and store upload

---

## STAGE 2 — Journal Outcome Tracking (Phase 2a)
> 🤖 **Model: Sonnet** — medium complexity: new field in store, UI component, AsyncStorage.
> Predictable scope (5–6 files), no architectural complexity.
> i18n translations for 5 locales: delegate to **Haiku** agent in parallel.

### Why
"Came true / Didn't happen / Pending" on each journal entry. Improves retention —
users come back to check the outcome. Pure JS, no native deps.

### Prerequisites
- STAGE 0 completed (QA green)
- **Can run in parallel with STAGE 1**

### Inputs (already ready)
- `src/types/journal.ts` — `JournalEntry` interface
- `src/stores/questionsStore.ts` — `addEntry`, `deleteEntry`
- `src/app/(tabs)/journal.tsx` — journal screen
- `src/components/JournalItem.tsx` — entry card
- `src/app/(tabs)/result/[id]/index.tsx` — verdict screen (Screen 1)

### New files
- (none — everything integrates into existing files)

### Changes
| File | Change |
|---|---|
| `src/types/journal.ts` | New optional field `outcome?: 'came_true' \| 'did_not_happen' \| 'pending' \| null` |
| `src/stores/questionsStore.ts` | New method `updateOutcome(id, outcome)` |
| `src/services/journalService.ts` | Support `updateOutcome` in AsyncStorage |
| `src/components/JournalItem.tsx` | Three outcome buttons at bottom of card (or dropdown) |
| `src/app/(tabs)/journal.tsx` | Pass `onOutcome` callback into `JournalItem` |
| `src/i18n/en.ts` + 5 locales | Keys: `journal.outcomeCameTrue`, `journal.outcomeDidNot`, `journal.outcomePending`, `journal.outcomeLabel` |

### UI design
```
┌─────────────────────────────┐
│  YES  Will I get the job?   │
│  Jun 4 · London             │
│  ─────────────────────────  │
│  [✓ Came true] [✗ Didn't]  [… Pending]  │
└─────────────────────────────┘
```
- Active button is highlighted (came_true → yes-color, did_not → no-color, pending → unclear)
- State is saved immediately to AsyncStorage
- Backward compatible: old entries without `outcome` show all three buttons

### Acceptance checks
- [ ] Three outcome options displayed on each journal entry
- [ ] Selection persists after app restart
- [ ] Active outcome is visually highlighted
- [ ] Old entries (without outcome field) work correctly
- [ ] i18n: all 6 locales
- [ ] jest: tests for `journalService.updateOutcome` + `questionsStore.updateOutcome`
- [ ] tsc + lint: 0 errors

---

## STAGE 3 — Chart Wheel (Phase 2b)
> 🤖 **Model: Opus** — most complex task in the plan.
> SVG wheel geometry (trigonometry, 12 houses, planet positions by degrees),
> new `ChartWheelData` type, wire data mapping, Reanimated animations.
> Sonnet risks making coordinate errors or missing edge-cases here.

### Why
Visual horoscope wheel — the main differentiator from competitors that only show
text. Wire data (`chart_data`) already arrives from the API but is not mapped.
`react-native-svg` is already installed.

### Prerequisites
- STAGE 2 completed (or at least its PR does not conflict — different files)
- Verify: `chart_data` actually arrives in the astrology-api.io response (may require
  a test with a real API key, not a mock)

### Inputs (already ready)
- `src/types/horary.ts` — `WireChartData`, `WirePlanetaryPosition`, `WireChartData`
- `src/components/svg/ChartWheel.tsx` — stub (Phase 2 placeholder)
- `src/app/(tabs)/result/[id]/full.tsx` — Screen 2 (location for new section)
- `react-native-svg` — already installed

### New files
- `src/types/horary.ts` — new type `ChartWheelData` (mapping from `WireChartData`)
- `src/components/svg/HoraryChartWheel.tsx` — real SVG component

### Changes
| File | Change |
|---|---|
| `src/types/journal.ts` | New optional field `chart_wheel?: ChartWheelData` |
| `src/services/horaryMapper.ts` | Mapping `raw.chart_data` → `ChartWheelData` |
| `src/hooks/useHoraryQuery.ts` | Pass `chart_wheel` into `buildJournalEntry` |
| `src/components/svg/ChartWheel.tsx` | Replace stub with `HoraryChartWheel` |
| `src/app/(tabs)/result/[id]/full.tsx` | Add "Chart" section with `HoraryChartWheel` |
| `src/i18n/en.ts` + 5 locales | Key `verdict.chartTitle` = 'Horary Chart' |

### What the wheel renders
```
- Outer ring: 12 zodiac signs with glyphs (♈♉♊...)
- 12 house sectors (cusps from house_cusps)
- Planets by degrees (planetary_positions → positions on the wheel)
- Glyph + planet name, color from theme.ts
- Ascendant marked AC
- Fixed size, no scale needed
```

### Acceptance checks
- [ ] Wheel renders on Screen 2 (Full Reading) for new entries
- [ ] Old entries (without `chart_wheel`) — wheel is hidden (graceful fallback)
- [ ] 12 houses visible
- [ ] Planets at correct positions (visually — not an auto-test)
- [ ] Colors only from `theme.ts`
- [ ] No `StyleSheet.create`, no inline hex
- [ ] tsc + lint: 0 errors
- [ ] Mapper tests: `chart_data` → `ChartWheelData` correct

---

## STAGE 4 — Manual Location + Sentry (small batches)

### Prerequisites
- STAGE 3 completed

### 4a — Manual Location Fallback
> 🤖 **Model: Sonnet** — small change in one file, straightforward logic.

#### Why
PRD gap: when GPS is denied currently only error state. `LocationPickerSheet` already exists —
needs to be connected as a fallback.

#### Changes
| File | Change |
|---|---|
| `src/app/(tabs)/index.tsx` | When `locationDenied` show `LocationPickerSheet` instead of error banner + "Open Settings" button |
| `src/i18n/en.ts` + 5 locales | Keys if new ones are needed |

#### Checks
- [ ] When GPS is denied the city picker opens
- [ ] Selected city is used for the question
- [ ] GPS flow works as before

### 4b — Sentry Crash Reporter
> 🤖 **Model: Haiku** — mechanical setup: install, init, env var, plugin in app.json.
> No logic, no architectural decisions. Haiku handles it in a minute.

#### Why
Crash reporting is needed after launch. Without it, production bugs are invisible.

#### What to do
```bash
npx expo install @sentry/react-native
```

#### Changes
| File | Change |
|---|---|
| `src/app/_layout.tsx` | `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN })` |
| `.env.local.example` | Add `EXPO_PUBLIC_SENTRY_DSN=` |
| `app.json` | Plugin `@sentry/react-native` |

#### Checks
- [ ] `Sentry.init` is called on startup
- [ ] DSN from env (not hardcoded)
- [ ] Errors go to Sentry in production build
- [ ] Dev/test build is not broken when DSN is absent

---

## STAGE FINAL — Final QA + Store Upload
> 🤖 **Model: Sonnet** — runs commands + uploads artifacts. QA agent (`horary-qa-agent`) is already configured.

### Prerequisites
- Stages 0–4 completed
- `APP_STORE_ID` replaced with real numeric ID (`src/constants/config.ts`)
- App Store Connect account ready
- Demo API key, email, debug PIN, GitHub username available

### Actions
1. **`/store:finalize`** ← **MUST be first**
   - Collects email / demo API key / debug PIN / GitHub username
   - Fills placeholders in `docs/privacy-policy.md`, `docs/reviewer-notes.md`, `docs/play-data-safety.md`
   - Runs `npm run generate:icon` + `npm run build:privacy`
   - Adds entertainment disclaimer to Settings screen
   - Proposes a commit
2. `git push` → GitHub Actions deploys privacy policy to Pages
3. Run `/orchestrate:qa` — final run
4. Run `/orchestrate:screenshots` — 30 PNG (5 × 6 locales), requires dev build
5. Upload store drafts to App Store Connect (from `docs/store-drafts/`)
6. Upload screenshots
7. Fill Apple Privacy Labels from `docs/apple-privacy-labels.md`
8. Submit for review

---

## Dependencies between stages (graph)

```
STAGE 0 (QA re-run)
  ├──► STAGE 1 (Store Prep)     ← independent of 2/3/4, only depends on 0
  └──► STAGE 2 (Outcome Track)  ← in parallel with 1
         └──► STAGE 3 (Chart Wheel)
                └──► STAGE 4a (Location)
                └──► STAGE 4b (Sentry)
                       └──► FINAL (requires: App Store ID + dev build for screenshots)
```

### In parallel (can run simultaneously)
- STAGE 1 and STAGE 2 — different files, no conflicts
- STAGE 4a and STAGE 4b — different files, no conflicts

### Strictly sequential
- STAGE 0 → everything else (fresh baseline needed)
- STAGE 2 → STAGE 3 (Outcome changes `JournalEntry` — Chart Wheel also adds a field)
- STAGE 3 → FINAL (chart_data needed in new entries for screenshots)

---

## Entry checklist for each stage

Before starting any stage, verify:

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm run test        # all tests green
git status          # no uncommitted changes (clean worktree)
```

---

## Important constants / TODO

| Constant | File | Current value | Replace with |
|---|---|---|---|
| `APP_STORE_ID` | `src/constants/config.ts` | `'000000000'` | Real numeric ID from App Store Connect |
| iOS Signing Team | `app.json` + `ios/` | `DGAHHMV358` (personal) | AstraSk org team ID before TestFlight |
| `EXPO_PUBLIC_SENTRY_DSN` | `.env.local` | not set | DSN from sentry.io after project creation |
| `EXPO_PUBLIC_DEBUG_PIN` | `.env.local` | not set (debug disabled) | PIN for QA builds |
