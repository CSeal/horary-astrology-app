---
created_by: claude-sonnet (APIGapAgent, StageM3)
updated_by: claude-sonnet
source_inputs:
  - docs/api-integration-spec.md
  - src/types/horary.ts
  - src/types/journal.ts
  - src/services/horaryMapper.ts
  - src/components/VerdictCard.tsx
  - src/components/SignificatorRow.tsx
  - src/app/(tabs)/result/[id].tsx
  - src/constants/config.ts
  - src/i18n/en.ts
  - docs/superpowers/expert/2026-06-03-fertility-routing.md
  - docs/superpowers/library-audit/2026-06-03-fertility-analysis-endpoint.md
reviewed_by: owner-pending
stage: StageM3-APIAudit
gate_linkage: Gate8
---

# API Gap Spec — AstraSk Horary App (Phase 1.5)

*Produced: 2026-06-04. Wire model source: `HoraryAnalysisResponse` in `api-integration-spec.md §5`,
confirmed against live API response 2026-06-03.*

---

## Task 1 — Wire-field gap table

Every field in `HoraryAnalysisResponse` (the shared wire contract for `/analyze` and `/ask`)
cross-checked against three layers: the mapper, the app model, and the rendered UI.

| wire_field | mapper_status | ui_status |
|---|---|---|
| `judgment.answer` | MAPPED → `verdict: VerdictType` | RENDERED — VerdictCard badge |
| `judgment.confidence_band` | MAPPED → `confidence_band` | RENDERED — VerdictCard dots |
| `judgment.interpretation` / `judgment.reasoning` | MAPPED → `summary` (interpretation preferred) | RENDERED — VerdictCard summary text |
| `judgment.voc_treatment` | MAPPED → `voc_treatment` (stored in JournalEntry) | NOT RENDERED — stored but no dedicated UI |
| `judgment.confidence` (numeric 0-100) | NOT MAPPED | NOT RENDERED |
| `judgment.key_factors[]` | NOT MAPPED | NOT RENDERED |
| `judgment.testimony_score` | NOT MAPPED | NOT RENDERED |
| `judgment.engine_overrides_applied[]` | NOT MAPPED | NOT RENDERED |
| `significators[].planet` | MAPPED | RENDERED — SignificatorRow glyph + name |
| `significators[].role` | MAPPED | RENDERED — SignificatorRow role label |
| `significators[].house` | MAPPED | RENDERED — SignificatorRow H{n} |
| `significators[].dignity_info.sign` | MAPPED → `sign` | RENDERED — SignificatorRow |
| `significators[].dignity_info.essential_dignity` | MAPPED → `dignity` (normalized enum) | RENDERED — SignificatorRow dignity badge |
| `significators[].dignity_info.accidental_conditions` (retrograde flag) | MAPPED → `retrograde: boolean` | RENDERED — SignificatorRow ℞ label |
| `significators[].dignity_info.dignity_score` | NOT MAPPED — `SignificatorData` has no such field | NOT RENDERED |
| `significators[].dignity_info.domicile_ruler` | NOT MAPPED — `SignificatorData` has no such field | NOT RENDERED |
| `significators[].dignity_info.exaltation_ruler` | NOT MAPPED | NOT RENDERED |
| `significators[].dignity_info.accidental_conditions[]` (non-retrograde) | NOT MAPPED (only retrograde is extracted) | NOT RENDERED |
| `significators[].reason` | NOT MAPPED | NOT RENDERED |
| `aspect_perfections[]` | NOT MAPPED — `normalizeAnalysisResponse` never reads this field | NOT RENDERED — `HoraryResponse.aspects` always `undefined`; `JournalEntry` has no `aspect_perfections` field |
| `lunar_analysis.is_void_of_course` | MAPPED → `voc_moon: boolean` | RENDERED — result screen Banner |
| `lunar_analysis.moon_sign` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.moon_longitude` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.degrees_to_sign_change` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.voc_exception_sign` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.voc_effective_strength` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.applying_aspects[]` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.last_aspect` | NOT MAPPED | NOT RENDERED |
| `lunar_analysis.moon_to_quesited` | NOT MAPPED | NOT RENDERED |
| `radicality.is_radical` | MAPPED → `is_radical: boolean` | RENDERED — result screen Banner (conditional) |
| `radicality.summary` | MAPPED → `radicality_summary` (only when non-radical) | RENDERED — Banner text |
| `radicality.score` | NOT MAPPED — `HoraryResponse` has no `radicality_score` field | NOT RENDERED |
| `radicality.recommendation` | NOT MAPPED | NOT RENDERED |
| `radicality.flags[]` | NOT MAPPED — no filtering by `show_to_client` | NOT RENDERED |
| `radicality.considerations[]` | NOT MAPPED | NOT RENDERED |
| `reception_analysis` | NOT MAPPED | NOT RENDERED |
| `secondary_perfection` | NOT MAPPED | NOT RENDERED |
| `timing[]` (when `include_timing=true`) | NOT MAPPED — request sends `include_timing: true` but response field is not extracted | NOT RENDERED |
| `chart_data` (planetary_positions, house_cusps, ascendant_sign) | NOT MAPPED | NOT RENDERED |
| `category` / `subcategory` / `turned_for` (echo) | NOT MAPPED | NOT RENDERED |
| `ai_answer.summary` (`/ask` only) | NOT MAPPED — falls back to `judgment.interpretation` | NOT RENDERED as a distinct section |
| `ai_classification` (`/ask` only) | NOT MAPPED | NOT RENDERED |

**Summary counts:**
- Fully mapped + rendered: 9 wire fields
- Mapped but not rendered: 2 wire fields (`voc_treatment`, `radicality_summary` when radical)
- Not mapped, not rendered: 25+ wire fields

---

## Task 2 — Per-gap implementation specs

### GAP-1 — aspect_perfections[] (BUG CRITICAL)

**Classification:** Bug — data present in wire response, fully typed in `WireAspectPerfection`,
but never extracted or displayed. `HoraryResponse.aspects` is always `undefined`.

**Root cause analysis:**
`normalizeAnalysisResponse` in `horaryMapper.ts` (line 126-138) does not read
`raw.aspect_perfections`. `AspectPerfectionData` type exists in `horary.ts` (lines 33-41)
and `HoraryResponse.aspects?: AspectPerfectionData[]` exists (line 60), confirming the
intended contract was defined but the mapper line was never written.
`JournalEntry` in `journal.ts` has no `aspect_perfections` field, so even if the mapper were
fixed the data would be lost on save.

**Mapper patch — `src/services/horaryMapper.ts`:**

Add to the return object of `normalizeAnalysisResponse`:
```ts
aspect_perfections: (raw.aspect_perfections ?? []).map((a) => ({
  planet1: a.planet1,
  planet2: a.planet2,
  aspect_type: a.aspect_type,
  is_applying: a.is_applying,
  orb: a.orb,
  will_perfect: a.will_perfect,
  degrees_to_perfection: a.degrees_to_perfection ?? null,
})),
```

`HoraryResponse` already has `aspects?: AspectPerfectionData[]` — rename or add
`aspect_perfections?: AspectPerfectionData[]` for naming consistency with the wire field,
and keep `aspects` as an alias or remove duplicate. Confirm naming choice before patch.
Recommended: keep wire field name `aspect_perfections` in `HoraryResponse` for zero
impedance mismatch.

**JournalEntry patch — `src/types/journal.ts`:**

Add one optional field:
```ts
aspect_perfections?: AspectPerfectionData[];
```

Import `AspectPerfectionData` from `@/types/horary`. `JournalService` must persist
this field alongside existing fields.

**New component — `src/components/AspectPerfectionRow.tsx`:**

Single row displaying one aspect between two significators.
- Left: planet1 glyph (from `PLANET_GLYPHS`) + planet1 name
- Center: aspect symbol (conjunction ☌, opposition ☍, trine △, square □, sextile ⚹) +
  orb in degrees (e.g. "2.3°")
- Right: planet2 glyph + planet2 name
- Applying badge: small chip "applying" (accent-gold) when `is_applying === true`
- Component accepts `data: AspectPerfectionData` and `index?: number` (stagger delay)
- Styling follows `SignificatorRow` pattern: `bg-bg-card rounded-xl px-4 py-3`
- Entrance animation: same stagger as `SignificatorRow` (Reanimated `withDelay`)

Aspect symbol map (local constant in the component):
```ts
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};
```

**UI placement — `src/app/(tabs)/result/[id].tsx`:**

Below the significators section, before the footer (location + timestamp).
Show the top-3 applying aspects sorted by `orb` ascending. When
`entry.aspect_perfections` has more than 3 items, show a "Show all" Pressable that
toggles a `showAllAspects` state to reveal the full list. Section header:
`t('verdict.aspectsHeader')` styled identically to `t('verdict.significatorsHeader')`.

Hide the section entirely when `entry.aspect_perfections` is undefined or empty.

**New i18n keys (all 6 locales — en.ts, ru.ts, de.ts, fr.ts, pt.ts, es.ts):**
```
verdict.aspectsHeader           // "Applying Aspects" / "Применяющиеся аспекты" / ...
verdict.aspectsShowAll          // "Show all" / "Показать все" / ...
verdict.aspectsCollapse         // "Collapse" / "Скрыть" / ...
verdict.aspectApplying          // "applying" / "применяется" / ...
```

---

### GAP-2 — ai_answer.summary (AI narrative, /ask only)

**Classification:** Feature — only relevant when calling `/ask` (10 credits). Not a bug
for the current `/analyze` path.

**Current state:** When `/ask` is called (not the MVP default), `normalizeAnalysisResponse`
falls back to `judgment.interpretation`, discarding the richer `ai_answer.summary`.

**Mapper patch — `src/services/horaryMapper.ts`:**

`normalizeAnalysisResponse` signature already accepts `raw: HoraryAnalysisResponse`.
`AskHoraryResponse` extends `HoraryAnalysisResponse` with `ai_answer: WireAIAnswer`.
Cast-check at runtime:

```ts
const aiSummary = (raw as { ai_answer?: { summary?: string } }).ai_answer?.summary;
```

Set `ai_summary?: string` on `HoraryResponse`:
```ts
ai_summary: aiSummary ?? undefined,
```

**`HoraryResponse` patch — `src/types/horary.ts`:**
```ts
ai_summary?: string;   // present only when /ask was used (10 credits)
```

**`JournalEntry` patch — `src/types/journal.ts`:**
```ts
ai_summary?: string;
```

**UI — `src/app/(tabs)/result/[id].tsx`:**

Render "AI Reading" section between `VerdictCard` and the `is_radical` Banner, but only
when `entry.ai_summary` is non-null. Section header styled with a distinct color (e.g.
`text-accent-violet`) to differentiate it from the standard summary.

**Phase 2 decision:** Surface `/ask` (10 credits) as an optional "deep reading" upgrade.
Keep the section hidden in all `/analyze` responses. No UI for purchasing or unlocking
the premium mode is required in Phase 1.5.

---

### GAP-3 — lunar_rich fields (WireLunarSequence beyond is_void_of_course)

**Classification:** Feature — moderate practitioner value, low effort.

**Unmapped wire fields:** `moon_sign`, `degrees_to_sign_change`, `voc_exception_sign`,
`voc_effective_strength`.

**Mapper patch — `src/services/horaryMapper.ts`:**

Add to `normalizeAnalysisResponse` return:
```ts
lunar_rich: raw.lunar_analysis
  ? {
      moon_sign: raw.lunar_analysis.moon_sign,
      degrees_to_sign_change: raw.lunar_analysis.degrees_to_sign_change,
      voc_exception_sign: raw.lunar_analysis.voc_exception_sign ?? null,
      voc_effective_strength: raw.lunar_analysis.voc_effective_strength ?? null,
    }
  : undefined,
```

**`HoraryResponse` patch — `src/types/horary.ts`:**
```ts
lunar_rich?: {
  moon_sign?: string;
  degrees_to_sign_change?: number;
  voc_exception_sign?: string | null;
  voc_effective_strength?: 'full' | 'mitigated' | null;
};
```

**`JournalEntry` patch — `src/types/journal.ts`:**
```ts
lunar_rich?: HoraryResponse['lunar_rich'];
```

**UI — `src/app/(tabs)/result/[id].tsx`:**

Extend the existing VOC `Banner` row: when `entry.lunar_rich?.moon_sign` is present, show
a secondary line below the VOC note: `Moon in {sign}` and optionally
`{degrees_to_sign_change}° to sign change`. When `voc_exception_sign` is non-null and
`voc_effective_strength === 'mitigated'`, append `(mitigated in {sign})` to the VOC note.

Show the extended Moon panel only when `entry.voc_moon === true` or
`entry.lunar_rich?.moon_sign` is non-null. No separate collapsible needed — append
inline to the existing VOC section.

**New i18n keys:**
```
verdict.moonSign                // "Moon in {{sign}}" / "Луна в {{sign}}" / ...
verdict.moonDegToChange         // "{{deg}}° to sign change" / ...
verdict.vocMitigated            // "mitigated in {{sign}}" / ...
```

---

### GAP-4 — radicality.score + radicality.flags[] (filtered)

**Classification:** Bug/UX — `radicality.score` is a meaningful 0-100 number; flags with
`show_to_client=true` are intended for the end user (vendor-defined contract).

**Current state:** `HoraryResponse` has only `is_radical?: boolean` and `radicality_summary?: string`.
`radicality.score` is typed in `WireRadicality` (line 170) but never extracted.
`radicality.flags[]` with `show_to_client` filtering is not implemented anywhere.

**Mapper patch — `src/services/horaryMapper.ts`:**

Add to `normalizeAnalysisResponse` return:
```ts
radicality_score: raw.radicality?.score,
radicality_flags: (raw.radicality?.flags ?? [])
  .filter((f) => f.show_to_client)
  .map((f) => f.type),
```

**`HoraryResponse` patch — `src/types/horary.ts`:**
```ts
radicality_score?: number;          // 0-100
radicality_flags?: string[];        // only show_to_client=true flags
```

**`JournalEntry` patch — `src/types/journal.ts`:**
```ts
radicality_score?: number;
radicality_flags?: string[];
```

**UI — `src/app/(tabs)/result/[id].tsx`:**

Replace the current boolean "Radical / Not Radical" presentation:

1. Mini progress bar labeled "Chart Strength" showing `radicality_score / 100`.
   Bar width as inline style (percentage). Color: gold when score >= 70, maybe when
   score >= 50, no when score < 50. Only render when `entry.radicality_score` is defined.
   Place above the `is_radical === false` Banner.

2. Below the score bar, render visible flags as small chips (one per flag). Use
   `t(`radicalityFlags.${flag}`)` with a defaultValue fallback to the raw flag string.
   Chips styled: `bg-bg-surface rounded-full px-2 py-0.5 text-xs text-text-secondary`.
   Only render when `entry.radicality_flags` is non-empty.

**New i18n keys (flag display names):**
```
radicalityFlags.early_ascendant         // "Early Ascendant" / ...
radicalityFlags.late_ascendant          // "Late Ascendant" / ...
radicalityFlags.moon_voc                // "Moon Void of Course" / ...
radicalityFlags.saturn_in_7th          // "Saturn in 7th" / ...
radicalityFlags.saturn_in_1st          // "Saturn in 1st" / ...
radicalityFlags.via_combusta_moon       // "Moon in Via Combusta" / ...
radicalityFlags.via_combusta_ascendant  // "Ascendant in Via Combusta" / ...
radicalityFlags.ascendant_ruler_combust // "Ascendant Ruler Combust" / ...
verdict.chartStrength                   // "Chart Strength" / "Сила карты" / ...
```

---

### GAP-5 — include_timing true → timing[] response

**Classification:** Feature — HIGH user value. The request already sends `include_timing: true`
(horaryMapper.ts line 109) but the response `timing[]` is never extracted.

**Current state:** Wire field `timing?: WireTiming[] | null` is typed on `HoraryAnalysisResponse`
(line 349) but `normalizeAnalysisResponse` never reads it. Users get no "when?" answer even
though the API computes it on every call.

**Mapper patch — `src/services/horaryMapper.ts`:**

```ts
timing: (raw.timing ?? []).map((t) => ({
  time_unit: t.time_unit,
  value: t.value,
  confidence: t.confidence,
  based_on: t.based_on,
  explanation: t.explanation,
})),
```

**`HoraryResponse` patch — `src/types/horary.ts`:**

Add a new app-model timing type (mirrors wire type cleanly):
```ts
export interface TimingIndication {
  time_unit: 'days' | 'weeks' | 'months' | 'years';
  value: number;
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  based_on: string;
  explanation: string;
}
```

Add to `HoraryResponse`:
```ts
timing?: TimingIndication[];
```

**`JournalEntry` patch — `src/types/journal.ts`:**
```ts
timing?: TimingIndication[];
```
Import `TimingIndication` from `@/types/horary`.

**UI — `src/app/(tabs)/result/[id].tsx`:**

New "Timing Indication" section below the significators, above the footer.
Hide when `entry.timing` is undefined or empty.
Section header: `t('verdict.timingHeader')`.

For each `TimingIndication` item, render one row:
- Value + unit: `{value} {t(`timing.unit.{time_unit}`)}` (e.g. "3 months")
- Explanation text in smaller secondary font
- Confidence chip: `very_high/high` → accent-gold, `medium` → maybe, `low/very_low` →
  text-secondary

When multiple items, show in a vertical `gap-2` list (the API may return 1-3 items).

**New i18n keys:**
```
verdict.timingHeader            // "Timing Indication" / "Указание на время" / ...
timing.unit.days                // "days" / "дней" / ...
timing.unit.weeks               // "weeks" / "недель" / ...
timing.unit.months              // "months" / "месяцев" / ...
timing.unit.years               // "years" / "лет" / ...
timing.confidence.very_high     // "very high" / ...
timing.confidence.high          // "high" / ...
timing.confidence.medium        // "medium" / ...
timing.confidence.low           // "low" / ...
timing.confidence.very_low      // "very low" / ...
```

---

### GAP-6 — dignity_score / domicile_ruler in SignificatorData (BUG)

**Classification:** Bug — wire fields `dignity_score` and `domicile_ruler` are present in
`WireDignityInfo` (lines 116-121 in horary.ts) but `mapSignificator` in horaryMapper.ts
never copies them to `SignificatorData`. Practitioners rely on dignity scores to assess chart
quality.

**Mapper patch — `src/services/horaryMapper.ts` (function `mapSignificator`):**

```ts
function mapSignificator(s: WireSignificator): SignificatorData {
  const dignityInfo = s.dignity_info;
  return {
    planet: s.planet,
    role: s.role,
    sign: dignityInfo?.sign ?? '',
    house: s.house,
    dignity: toDignity(dignityInfo?.essential_dignity),
    retrograde: dignityInfo?.accidental_conditions?.includes('retrograde') ?? false,
    aspect: null,
    dignity_score: dignityInfo?.dignity_score,       // ADD
    domicile_ruler: dignityInfo?.domicile_ruler,     // ADD
  };
}
```

**`SignificatorData` patch — `src/types/horary.ts`:**

```ts
export interface SignificatorData {
  planet: string;
  role: 'querent' | 'quesited' | 'moon' | string;
  sign: string;
  house: number;
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | null;
  retrograde: boolean;
  aspect?: string | null;
  dignity_score?: number;       // ADD: -10..15 essential + accidental combined
  domicile_ruler?: string;      // ADD: planet ruling the sign (e.g. 'Saturn')
}
```

`JournalEntry` stores `SignificatorData[]` directly, so no patch needed there —
the new fields are on the shared type.

**UI — `src/components/SignificatorRow.tsx`:**

In the dignity badge section (lines 87-97), add a domicile ruler hint when
`data.domicile_ruler` is present and `data.dignity` is null or `'peregrine'`
(meaning the significator is in a sign ruled by a different planet — practitioner context):

```tsx
{data.domicile_ruler && !showDignityBadge && (
  <Text className="font-inter text-[10px] text-text-secondary">
    {`r: ${PLANET_GLYPHS[data.domicile_ruler] ?? data.domicile_ruler}`}
  </Text>
)}
```

Dignity score is stored but not rendered in Phase 1.5. It feeds GAP-4 (radicality score
bar) contextually and is available for a future "planet strength" display in Phase 2.

---

### GAP-7 — SUBJECT_ROLES config missing third_party_sibling / third_party_enemy (BUG)

**Classification:** Bug — `SUBJECT_ROLES` in `src/constants/config.ts` (lines 83-91) is
missing at least two values that the API accepts: `third_party_sibling` and
`third_party_enemy`. The AskForm subject role picker shows an incomplete list.
These correspond to derived houses 3 (siblings/neighbours) and 7 (open enemies/opponents)
in Lilly's doctrine.

**Config patch — `src/constants/config.ts`:**

```ts
export const SUBJECT_ROLES = [
  'self',
  'spouse_partner',
  'third_party_friend',
  'third_party_employer',
  'third_party_parent',
  'third_party_child',
  'third_party_sibling',    // ADD — 3rd-house (sibling, neighbour, short journey)
  'third_party_enemy',      // ADD — 7th-house (open enemy, opponent, rival)
  'third_party_other',
] as const;
```

**i18n patch — all 6 locale files (en.ts, ru.ts, de.ts, fr.ts, pt.ts, es.ts):**

Add to `subjectRoles` map in each locale:
```ts
third_party_sibling: 'For sibling',    // ru: 'За брата/сестру', etc.
third_party_enemy:   'For opponent',   // ru: 'За оппонента', etc.
```

No type changes needed — `SubjectRole` is derived from the const array via `typeof`.
`AskForm` uses `t(`subjectRoles.${role}`, { defaultValue: role })` so it handles new
keys gracefully even before locale files are updated, but localized labels should be
added in the same commit.

---

### GAP-8 — toggle "THE PLANETS SAY" collapsible significators section

**Classification:** Design-to-code — HTML prototype shows a collapsible significators section.
Current `result/[id].tsx` renders the significators list statically with no toggle.
i18n key `verdict.significatorsToggle` ("The Planets Say") exists in `en.ts` (line 120)
suggesting this was intended but not implemented.

**Implementation — `src/app/(tabs)/result/[id].tsx`:**

1. Add `const [sigsExpanded, setSigsExpanded] = useState(true)` (default open).
2. Replace the static `Text` header for `verdict.significatorsHeader` with a `Pressable`
   row containing:
   - The header text (unchanged styling)
   - A `ChevronDown` / `ChevronUp` icon from `lucide-react-native` (size `typography.sm`)
   - Icon rotation animated via Reanimated `useSharedValue` + `withTiming(expanded ? 0 : -90, { duration: 200 })`
   - Use `useAnimatedStyle` on an `Animated.View` wrapping the icon for smooth rotation
3. The significator `View className="gap-2"` block conditionally renders:
   `{sigsExpanded && entry.significators.map(...)}`
4. Single-owner rule: rotation SharedValue is driven by one `useEffect` keyed on `sigsExpanded`.
   Use `cancelAnimation` at the top of the effect before applying the new `withTiming`.

**Note on Reanimated 4 compliance:**
Follow CLAUDE.md single-owner rule. Chevron rotation SharedValue must be written in
exactly one `useEffect`. Use `queueMicrotask` if `setSigsExpanded` is called from
within an animated callback.

---

### GAP-9 — /api/v3/horary/aspects endpoint — DEFERRED

**Decision:** Defer to Phase 2.

**Rationale:** `aspect_perfections[]` is already returned inline by `/analyze` (no extra API
call or credits needed). The `/aspects` endpoint adds coverage for all 15 planet-pair aspects
and extra fields (`applying_planet`, `perfection_sign`, retrograde flags) useful for advanced
timing work. This is a Phase 2 feature, not a Phase 1.5 blocker.

No implementation spec needed for Phase 1.5.

---

### GAP-10 — pregnancy/fertility routing — DECIDED (v1.1)

**Decision is final (pre-flight 2026-06-03):** `pregnancy` and `fertility` categories stay
on `/analyze` (1 credit) for all of MVP Phase 1.5.

**Three blocking reasons (documented in pre-flight artifacts):**

1. `/fertility-analysis` accepts no `category`/`subcategory` (`additionalProperties: false`
   rejects them) — subcategory context (`boy_or_girl`, `ivf_success`) is lost entirely.
2. Response has no `judgment`/`confidence_band`/`significators[]` fields — structurally
   incompatible with `VerdictCard`, `JournalEntry`, and the mapper (13+ files to change).
3. `fertility_score 0-100` is a pseudo-medical vendor metric, not a traditional astrology
   concept — must not be shown as-is to users; Apple 1.4.1 medical-scrutiny risk.

**v1.1 prerequisites (before routing switch can be made):**
- Dedicated fertility detail screen design (5th-house + fruitful-sign + Part-of-Children)
- `fertility_score` display decision (product/legal)
- `WireFertilitySignAnalysis.fertility` type fix (`'semi-fruitful'` → `'semi_fruitful'`)
- `WireLunarSequence` replaced with dedicated `WireFertilityLunarAnalysis` type
- One live API call to verify the response contract

**Pre-flight artifacts:**
- `docs/superpowers/expert/2026-06-03-fertility-routing.md`
- `docs/superpowers/library-audit/2026-06-03-fertility-analysis-endpoint.md`

No action in Phase 1.5.

---

## Task 3 — Effort + value matrix

Effort scale: XS (<1 hr), S (1-3 hrs), M (3-8 hrs), L (>8 hrs)

| field / feature | type | user value (1-5) | effort | credits cost | phase |
|---|---|---|---|---|---|
| aspect_perfections (mapper + JournalEntry + AspectPerfectionRow) | BUG CRITICAL | 5 | S | 0 | 1.5 |
| dignity_score / domicile_ruler (SignificatorData + mapper) | BUG | 4 | S | 0 | 1.5 |
| radicality.flags[] show_to_client filter | BUG/UX | 3 | S | 0 | 1.5 |
| SUBJECT_ROLES config fix (+ 6 locale keys) | BUG | 2 | XS | 0 | 1.5 |
| toggle "THE PLANETS SAY" collapsible | Design->Code | 3 | S | 0 | 1.5 |
| radicality_score progress bar ("Chart Strength") | Feature | 3 | S | 0 | 1.5 |
| lunar_rich details (moon_sign, degrees_to_sign_change, voc_exception) | Feature | 3 | S | 0 | 1.5 |
| timing indication (timing[] section on verdict screen) | Feature | 5 | M | 0 | 1.5 |
| share verdict card | Feature | 5 | M | 0 | 1.5 |
| review prompt (5-star, post-verdict) | Feature | 5 | S | 0 | 1.5 |
| invite friend button | Feature | 3 | S | 0 | 1.5 |
| ai_answer.summary ("AI Reading" section) | Feature | 4 | M | +9 credits/call | Phase 2 |
| /aspects endpoint (full planet-pair coverage) | Feature | 3 | M | unknown | Phase 2 |
| /fertility-analysis routing (dedicated screen) | Feature | 4 | L | +1 credit/call | v1.1 |

---

## Phase 1.5 implementation order (recommended)

Based on gap severity and dependencies:

1. **GAP-7** (SUBJECT_ROLES config) — XS, no dependencies, fix config + i18n keys.
2. **GAP-6** (dignity_score + domicile_ruler) — S, pure type + mapper change, no UI risk.
3. **GAP-4** (radicality_score + flags filter) — S, depends on GAP-6 conceptually but not
   technically; mapper + type + score bar UI.
4. **GAP-1** (aspect_perfections) — S, the single most valuable bug fix; mapper + JournalEntry +
   new AspectPerfectionRow component + result screen section.
5. **GAP-3** (lunar_rich) — S, mapper + type + VOC Banner extension.
6. **GAP-8** (collapsible toggle) — S, UI-only, no data changes, Reanimated chevron.
7. **GAP-5** (timing indication) — M, mapper + types + new result screen section; highest user
   value of the features but requires more test coverage.
8. **GAP-2** (ai_summary) — defer to Phase 2 as noted.
9. **GAP-9** (/aspects endpoint) — defer to Phase 2.
10. **GAP-10** (fertility routing) — defer to v1.1.

---

## Files requiring changes (Phase 1.5 scope)

| file | changes required |
|---|---|
| `src/types/horary.ts` | Add fields to `SignificatorData`; add `TimingIndication` interface; add fields to `HoraryResponse` |
| `src/types/journal.ts` | Add `aspect_perfections`, `timing`, `lunar_rich`, `radicality_score`, `radicality_flags`, `ai_summary` |
| `src/services/horaryMapper.ts` | Extract `aspect_perfections`, `timing`, `lunar_rich`, `radicality_score`, `radicality_flags`; patch `mapSignificator` for `dignity_score`/`domicile_ruler` |
| `src/constants/config.ts` | Add `third_party_sibling`, `third_party_enemy` to `SUBJECT_ROLES` |
| `src/i18n/en.ts` | Add keys for aspects, timing, radicality flags, lunar rich, subject roles |
| `src/i18n/ru.ts` | Same key set |
| `src/i18n/de.ts` | Same key set |
| `src/i18n/fr.ts` | Same key set |
| `src/i18n/pt.ts` | Same key set |
| `src/i18n/es.ts` | Same key set |
| `src/components/SignificatorRow.tsx` | Add domicile ruler hint |
| `src/components/AspectPerfectionRow.tsx` | NEW — aspect display row component |
| `src/app/(tabs)/result/[id].tsx` | Add aspect section, timing section, lunar rich, radicality score bar, collapsible toggle |

---

*Stage: StageM3-APIAudit*
*Gate: gateM3 PASS*
*Next: StageM4-DocRefresh (after StageM2 also COMPLETE)*
