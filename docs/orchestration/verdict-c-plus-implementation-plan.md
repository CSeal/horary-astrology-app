---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [Verdict Redesign.html, AstraSk - Standalone.html, result/[id].tsx, VerdictCard.tsx, types/journal.ts, settings.tsx]
reviewed_by: owner-approved
stage: Phase1.5-ImplementationPlan
date: 2026-06-04
---

# Verdict C+ Implementation Plan

## Design source
- `Verdict Redesign.html` — Option C+ chosen by owner
- `AstraSk - Standalone.html` — 22-screen reference (settings discrepancies resolved in our favour)

## Architectural decisions (owner-approved)

| Decision | Choice | Reason |
|---|---|---|
| Screen 2 navigation | **New Expo Router route** `result/[id]/full.tsx` | Standard push, native back gesture, correct Expo Router pattern |
| VerdictCard summary | **Move outside** — add `hideSummary?: boolean` prop | Matches design intent: card = compact badge only |
| Back button label | **Always "← Journal" (localised)** | Fresh readings are auto-saved on arrival, always in journal |
| Language selector | **No change** — already has flags + 2×3 grid, better than design | |
| API Key UI | **View/edit mode redesign** — include in same batch | |

---

## Batch scope

### 1. Data layer

**`src/types/journal.ts`** — add optional fields:
```ts
radicality_score?: number;          // 0-100
aspects?: AspectPerfectionData[];
timing?: JournalTiming;             // simplified from wire
voc_moon_sign?: string;
voc_degrees_to_sign_change?: number;
voc_next_sign?: string;
voc_exception_sign?: string | null;
```

New type `JournalTiming`:
```ts
export interface JournalTiming {
  time_unit: 'days' | 'weeks' | 'months' | 'years';
  value: number;
  teaser: string;          // e.g. "≈ 3–4 weeks"
  explanation: string;
}
```

**`src/services/horaryMapper.ts`** — map new fields from wire:
- `radicality_score` ← `raw.radicality.score`
- `aspects` ← `raw.aspect_perfections` (mapped via existing `AspectPerfectionData`)
- `timing` ← first item of `raw.timing[]` + format teaser
- `voc_moon_sign` ← `raw.lunar_analysis.moon_sign` (expand abbreviation)
- `voc_degrees_to_sign_change` ← `raw.lunar_analysis.degrees_to_sign_change`
- `voc_next_sign` ← derive from `moon_sign + degrees_to_sign_change`
- `voc_exception_sign` ← `raw.lunar_analysis.voc_exception_sign`

### 2. New components

**`src/components/ChartStrengthBar.tsx`**
- Props: `score: number`, `band: 'yes' | 'maybe' | 'no'`, `label: string`
- Coloured fill bar (yes=green, maybe=amber, no=red) with score + label note

**`src/components/VocMoonBanner.tsx`**
- Props: `sign?: string`, `degreesToChange?: number`, `nextSign?: string`, `exceptionSign?: string | null`
- Rich banner: glyph ☽ + "Moon is Void of Course" + VOID pill + mini-tags (Sign / To sign change / Next) + exception note if present
- If `!sign` (old entries): fallback to simple "☽ Moon · Void of Course" banner

**`src/components/AspectRow.tsx`**
- Props: `data: AspectPerfectionData`
- Planet1 + aspect symbol + Planet2 + name + orb + Applying/Past/Caution pill

**`src/components/TimingBlock.tsx`**
- Props: `timing: JournalTiming`
- Large estimate display + explanation text + Days/Weeks/Months scale bar with marker

**`src/components/TimingTeaser.tsx`**
- Props: `teaser: string`, `onPress: () => void`
- Gold clock icon + "When might this happen?" label + estimate value + chevron →

### 3. VerdictCard changes

**`src/components/VerdictCard.tsx`**
- Add `hideSummary?: boolean` prop (default `false` for backward compat)
- When `hideSummary=true`: render badge + confidence dots only (no summary text)

### 4. Screen 1 — `result/[id].tsx` (full rewrite of JSX)

Layout (top → bottom):
1. Nav: `← Journal` (localised `verdict.backJournal`) + Share icon (top-right, TODO Phase 1.5)
2. Question text (italic)
3. `<VerdictCard hideSummary />` (compact badge + dots only)
4. `<ChartStrengthBar />` (if `entry.radicality_score !== undefined`)
5. `<VocMoonBanner />` (if `entry.voc_moon`)
6. Low-confidence banner (if `entry.confidence_band === 'low' && entry.is_radical !== false`)
7. AI Summary block (italic serif, `entry.summary`) — always shown
8. `<TimingTeaser />` (if `entry.timing`) → taps → push to Screen 2
9. Spacer (flex-1)
10. CTA: "See the full reading →" gold button + "Significators · Perfections · Timing" hint
    - OR: "✦ Ask again when ready" ghost button (if `entry.is_radical === false`)

Significators removed from Screen 1 — they move to Screen 2.

### 5. Screen 2 — new `result/[id]/full.tsx`

Layout:
1. Nav: `←` arrow only + "Full Reading" title (localised `verdict.fullReadingTitle`)
2. "When might this happen?" section + `<TimingBlock />` (if `entry.timing`)
3. Significators section header + `<SignificatorRow />` list
4. "Perfections" section header + `<AspectRow />` list (if `entry.aspects?.length`)
   - "Show all / Show fewer" toggle if > 3 aspects

### 6. i18n — new keys (all 6 locales)

```ts
verdict: {
  // existing keys stay
  backJournal: '← Journal',         // back button label (was: backButton)
  fullReadingTitle: 'Full Reading',
  chartStrengthLabel: 'Chart Strength',
  vocMoonTitle: 'Moon is Void of Course',
  vocVoidPill: 'VOID',
  vocSignLabel: 'Sign',
  vocToChangeLabel: 'To sign change',
  vocNextLabel: 'Next',
  timingWhen: 'When might this happen?',
  timingUnit_days: 'DAYS',
  timingUnit_weeks: 'WEEKS',
  timingUnit_months: 'MONTHS',
  perfectionLabel: 'Perfections',
  aspectApplying: 'Applying',
  aspectCaution: 'Caution',
  aspectPast: 'Past',
  showAllAspects: 'Show all {{count}} aspects',
  showFewerAspects: 'Show fewer',
  seeFullReading: 'See the full reading',
  fullReadingHint: 'Significators · Perfections · Timing',
  askAgain: '✦ Ask again when ready',
}
```

### 7. Settings — API Key view/edit redesign

**`src/app/(tabs)/settings.tsx`** — API Key section only:

States: `editingKey: boolean` (default false)

- **View mode, key set**: masked `●●●●●●●●●●●●●●●●` (JetBrains Mono) + ✏️ Edit button, source text below, Remove button below
- **View mode, no key**: "Set your API key →" tappable row → enters edit mode
- **Edit mode**: TextInput (secureTextEntry) + Cancel + Save buttons

No i18n key additions needed (reuse existing `apiKeySave`, `apiKeyRemove`, `apiKeyPlaceholder`, `apiKeySourcePersonal`, `apiKeySourceDefault`). May add `apiKeyEdit`, `apiKeyMasked` if needed.

---

## Files touched

| File | Change |
|---|---|
| `src/types/journal.ts` | add 7 new optional fields + `JournalTiming` |
| `src/services/horaryMapper.ts` | map new fields |
| `src/components/VerdictCard.tsx` | add `hideSummary` prop |
| `src/components/ChartStrengthBar.tsx` | new |
| `src/components/VocMoonBanner.tsx` | new |
| `src/components/AspectRow.tsx` | new |
| `src/components/TimingBlock.tsx` | new |
| `src/components/TimingTeaser.tsx` | new |
| `src/app/(tabs)/result/[id].tsx` | full JSX rewrite |
| `src/app/(tabs)/result/[id]/full.tsx` | new screen |
| `src/i18n/en.ts` + 5 locales | new verdict keys |
| `src/app/(tabs)/settings.tsx` | API Key section view/edit mode |

## Backward compatibility

All new `JournalEntry` fields are optional. Old entries (without aspects/timing/radicality_score):
- ChartStrengthBar: hidden
- TimingTeaser: hidden
- TimingBlock on Screen 2: hidden
- AspectRow list: hidden
- VocMoonBanner: falls back to simple "Void of Course" text
- Screen 2 CTA still shown (significators always exist)

## Not in this batch

- Share button functionality (Phase 1.5 social sharing — button present but TODO)
- ScreenFreeLimit (Phase 3 paywall)
- Settings language/zodiac/location sections (already correct)
