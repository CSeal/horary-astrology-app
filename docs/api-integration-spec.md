---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [live API docs astrology-api.io v3, endpoint examples reviewed 2026-06-03, openapi.json scanned 2026-06-03]
reviewed_by: owner-pending
stage: Stage4-Architecture
gate_linkage: Gate5
---

# API Integration Spec — Horary Astrology App (AstraSk)

*Document version: 2.0 — complete rewrite based on confirmed live API*
*Provider: astrology-api.io (api.astrology-api.io)*

---

## 1. Overview

### Base URL & Auth

```
Base URL:   https://api.astrology-api.io
Auth:       Authorization: Bearer <api_key>
```

API key priority (see `horaryApi.ts`):
1. User-supplied key in SecureStore (`horary_api_key`)
2. `EXPO_PUBLIC_ASTROLOGY_API_KEY` env var
3. Empty string → 401

### Endpoints

| Endpoint | Method | Purpose | Credits |
|---|---|---|---|
| `/api/v3/horary/ask` | POST | AI auto-classify + full analysis | **10** |
| `/api/v3/horary/analyze` | POST | Manual category + full analysis | 1 |
| `/api/v3/horary/aspects` | POST | All applying aspects (timing) | ? |
| `/api/v3/horary/chart` | POST | Raw chart data, dignities, Arabic Parts | ? |
| `/api/v3/horary/fertility-analysis` | POST | Specialized pregnancy/fertility | 2 |
| `/api/v3/horary/glossary/categories` | GET | Category reference (static) | 0 |
| `/api/v3/horary/glossary/considerations` | GET | 8 radicality considerations (static) | 0 |

> ⚠️ **Open question:** credit costs for `/aspects`, `/chart` not confirmed.
> **Confirmed from live response 2026-06-03:** `/ask` costs **10 credits** (`metadata.credits_used: 10`). Earlier test showed `credits_used: 2` — discrepancy likely due to plan tier or pricing change. `metadata.endpoint` is `"horary.ask"` (distinct from `/analyze` → `"horary.analyze"`). Do NOT use `/ask` as the default MVP endpoint at 10 credits/call.

### Response Envelope

All POST endpoints return a full envelope:
```json
{
  "success": true,
  "data": { ...HoraryAnalysisResponse },
  "metadata": {
    "timestamp": "...",
    "calculation_time_ms": 3,
    "api_version": "3.2.0",
    "endpoint": "horary.analyze",   // "horary.ask" when calling /ask
    "request_id": "req_...",
    "cache_hit": false,
    "credits_used": 1               // 1 for /analyze, 10 for /ask (confirmed)
  },
  "warnings": null,
  "pagination": null
}
```

---

## 2. Shared Request Schema: DateTimeLocation

Used by `question_time` in all POST endpoints.

```typescript
interface DateTimeLocation {
  year: number;       // required
  month: number;      // required, 1–12
  day: number;        // required, 1–31
  hour: number;       // required, 0–23
  minute: number;     // required, 0–59
  second?: number;    // optional, default 0

  // Location — one of: (city + country_code) OR (latitude + longitude)
  city?: string;            // city name for auto-lookup
  country_code?: string;    // ISO 3166-1 alpha-2, strongly recommended with city
  latitude?: number;        // -90..90
  longitude?: number;       // -180..180
  timezone?: string;        // IANA name; auto-resolved from city/coords if omitted
}
```

> **App uses lat/lon + timezone** (from device GPS/Intl). `city` is for display only (journal entry). `country_code` is not currently sent — not blocking since lat/lon is provided.

---

## 3. Endpoint: POST /horary/ask

AI auto-classifies the natural-language question, runs full horary analysis, and returns a plain-language answer.

### When to use
- Primary endpoint candidate: no need for user to select category
- AI detects language and returns `ai_answer` in the same language
- Good fit for the simple UX in the original design (no category chips)

### Request

Confirmed minimal schema (no `category`, no `options`, no `chart_options` required):

```json
{
  "question": "Will I get the job I interviewed for?",
  "question_time": {
    "year": 2026, "month": 5, "day": 17,
    "hour": 14, "minute": 30, "second": 0,
    "city": "London",
    "country_code": "GB"
  }
}
```

> **`city` + `country_code`** can replace `latitude` / `longitude` / `timezone` in the request. Confirmed working. Our app currently uses lat/lon from device GPS — both forms accepted.

| Field | Required | Notes |
|---|---|---|
| `question` | Yes | Natural language; AI auto-classifies category/subcategory |
| `question_time` | Yes | DateTimeLocation (`city`+`country_code` OR `lat`+`lon`+`timezone`) |
| `options.language` | No | Force output language; omit = auto-detect from question text |
| `chart_options.zodiac_type` | No | `Tropic` (default) or `Sidereal` |

> ⚠️ **Cost: 10 credits/call.** Much higher than `/analyze` (1 credit). Avoid as the default MVP endpoint.

### Response (extends standard analysis, see §5)

Additional fields on top of `HoraryAnalysisResponse`:

```json
{
  "ai_classification": {
    "category": "career",
    "subcategory": "get_position",
    "subject_role": "self",
    "is_horary_appropriate": true,
    "rejection_reason": null,
    "confidence": 0.92,
    "detected_language": "en",
    "warnings": []
  },
  "ai_answer": {
    "plain_answer": "Yes, strong indications favour getting this position.",
    "summary": "Mars applies by trine to Sun (career lord) — direct perfection.",
    "recommendation": "Proceed with confidence."
  }
}
```

> **Key:** `ai_answer.summary` can replace `judgment.interpretation` as the "READING" section text — often richer and already localized.

---

## 4. Endpoint: POST /horary/analyze

Full horary analysis with manually specified category. Used when precise control over category/subcategory is required.

### Request

```json
{
  "category": "career",
  "subcategory": "get_position",
  "subject_role": "self",
  "question_time": { ...DateTimeLocation },
  "include_timing": true,
  "options": { "language": "en" },
  "chart_options": { "zodiac_type": "Tropic" }
}
```

| Field | Required | Notes |
|---|---|---|
| `category` | Yes | All 11 values in `HORARY_CATEGORIES` are accepted: `pregnancy`, `fertility`, `love`, `marriage`, `career`, `job`, `money`, `health`, `missing_item`, `travel`, `general`. Confirmed 2026-06-03. |
| `subcategory` | No | Sub-question within category |
| `subject_role` | No | Default `self`. Other values invoke Lilly's derived-houses doctrine |
| `question_time` | Yes | DateTimeLocation |
| `include_timing` | No | Returns `timing[]` array when true |
| `extended_lunar_sequence` | No | 45° lookahead for Moon sequence (10–22 aspects) |
| `chart_options.zodiac_type` | No | `Tropic` / `Sidereal` |

### Response

See §5 (Standard Analysis Response).

---

## 5. Standard Analysis Response (shared by /ask and /analyze)

```typescript
interface HoraryAnalysisResponse {
  category: string;
  subcategory?: string | null;
  turned_for?: string | null;      // echoes subject_role when not 'self'

  significators: WireSignificator[];
  aspect_perfections: WireAspectPerfection[];
  lunar_analysis: WireLunarSequence;
  radicality: WireRadicality;
  reception_analysis: WireReceptionAnalysis;
  secondary_perfection?: WireSecondaryPerfection | null;
  timing?: WireTiming[] | null;
  judgment: WireJudgment;
  chart_data: WireChartData;
}
```

#### 5.1 significators[]

```typescript
interface WireSignificator {
  role: string;          // querent | quesited | additional
  planet: string;
  house: number;         // 1–12
  reason: string;        // e.g. "Lord of 10th house (career)"
  dignity_info: WireDignityInfo | null;
}

interface WireDignityInfo {
  planet: string;              // planet name, e.g. 'Mercury' — confirmed in live response
  sign: string;                // 3-letter, e.g. 'Ari'
  essential_dignity: string;   // domicile | exaltation | triplicity | term | decan | peregrine | detriment | fall
  dignity_score: number;       // -10..15
  domicile_ruler: string;
  exaltation_ruler?: string | null;
  accidental_conditions?: string[]; // retrograde | combust | cazimi | under_beams | angular
}
```

> **Note:** `dignity_info` can be `null` in some responses despite being schema-required. Current `mapSignificator` handles this defensively.

#### 5.2 aspect_perfections[]

Aspects between significators — **already in the analyze response, no separate /aspects call needed**.

```typescript
interface WireAspectPerfection {
  planet1: string;
  planet2: string;
  aspect_type: string;          // conjunction | opposition | trine | square | sextile
  is_applying: boolean;
  orb: number;
  will_perfect: boolean;
  degrees_to_perfection?: number | null;
}
```

> **Mapper gap:** `aspect_perfections` is NOT currently extracted by `normalizeAnalysisResponse`. This is a known bug — see todo.

#### 5.3 radicality

```typescript
interface WireRadicality {
  is_radical: boolean;
  score: number;                // 0-100
  recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_judge';
  summary: string;
  considerations: WireConsiderationItem[];  // all 8 items always returned; is_present=false when not triggered
  flags?: WireRadicalityFlag[];
}

interface WireRadicalityFlag {
  type: 'early_ascendant' | 'late_ascendant' | 'moon_voc' | 'saturn_in_7th'
      | 'saturn_in_1st' | 'via_combusta_moon' | 'via_combusta_ascendant'
      | 'ascendant_ruler_combust';
  severity: 'severe' | 'moderate' | 'mild';
  show_to_client: boolean;      // false = astrologer-only, don't surface in UI
  weight_applied: number;
  mitigated_by?: string | null;
}
```

#### 5.4 lunar_analysis

```typescript
interface WireLunarSequence {
  is_void_of_course: boolean;
  moon_sign?: string;
  moon_longitude?: number;
  degrees_to_sign_change?: number;
  voc_exception_sign?: string | null;       // Tau | Can | Sag | Pis
  voc_effective_strength?: 'full' | 'mitigated' | null;
  applying_aspects?: WireMoonAspect[];
  last_aspect?: WireMoonLastAspect | null;
  moon_to_quesited?: WireMoonAspect | null;
  extended_mode?: boolean;
  quesited_position?: number | null;
  intervening_analysis?: WireInterveningAnalysis | null;
}
```

#### 5.5 judgment

```typescript
interface WireJudgment {
  answer: 'yes' | 'no' | 'unclear' | 'reask_later';
  confidence: number;           // 0-100
  confidence_band: 'high' | 'medium' | 'low';  // high ≥75, medium 60–74, low <60
  reasoning: string;
  interpretation?: string | null;   // localized; preferred for display
  voc_treatment: 'full_negation' | 'mitigated' | 'ignored_due_to_aspect' | 'not_applicable';
  key_factors: string[];
  testimony_score: { positive: number; negative: number; neutral: number };
  voc_considered: boolean;
  engine_overrides_applied?: string[];
}
```

#### 5.6 timing[] (when include_timing=true)

```typescript
interface WireTiming {
  time_unit: 'days' | 'weeks' | 'months' | 'years';
  value: number;
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  based_on: string;
  explanation: string;
}
```

#### 5.7 secondary_perfection

```typescript
interface WireSecondaryPerfection {
  translation: unknown | null;
  collection: unknown | null;
  prohibition: unknown | null;
  frustration: unknown | null;
  enables_perfection: boolean;
  prevents_perfection: boolean;
  has_direct_aspect: boolean;
  summary: string;
}
```

---

## 6. Endpoint: POST /horary/aspects

Returns all applying aspects between the traditional 7 planets, sorted by `degrees_to_perfection`. Used for timing analysis and event sequence.

> **Note:** For the Verdict screen AspectRow component, use `aspect_perfections` from `/analyze` (already returned, no extra call). Use `/aspects` only if full planet-pair coverage (15 aspects) or `applying_planet`/`perfection_sign`/retrograde flags are needed.

### Request

```json
{
  "question_time": { ...DateTimeLocation },
  "max_lookahead_degrees": 45
}
```

### Response

```typescript
interface HoraryAspectsResponse {
  applying_aspects: WireApplyingAspect[];
  count: number;
  max_lookahead_degrees: number;
  planets_used: string[];      // default: 7 traditional planets
  chart_time: string;          // ISO timestamp
  ingresses?: WireIngress[] | null;
  separating_aspects?: WireApplyingAspect[] | null;
  stations?: unknown[] | null;
}

interface WireApplyingAspect {
  planet1: string;
  planet2: string;
  aspect_type: string;
  degrees_to_perfection: number;
  orb: number;
  applying_planet: string;     // the faster/approaching planet
  receiving_planet: string;
  perfection_sign: string;     // 3-letter abbreviation
  is_applying: boolean;
  p1_retrograde: boolean;
  p2_retrograde: boolean;
}

interface WireIngress {
  planet: string;
  from_sign: string;
  to_sign: string;
  degrees_to_ingress: number;
  estimated_days: number;
}
```

---

## 7. Endpoint: POST /horary/chart

Generates raw chart data: planetary positions, house cusps, dignities, Arabic Parts. **Not currently called by the app.** Returns `HoraryChartResponse` (structure partially documented).

Notable response fields:
- `chart_data` — full planetary positions (structure undocumented — see open questions)
- `dignities[]` — per-planet dignity with `dignity_score`, `domicile_ruler`, `accidental_conditions[]`
- `arabic_parts[]` — Part of Fortune and others
- `house_system: "R"` (Regiomontanus, default for horary)

---

## 8. Endpoint: POST /horary/fertility-analysis

Specialized analysis for pregnancy/conception questions. **Costs 2 credits** (vs. 1 for standard). Currently `pregnancy` and `fertility` categories are routed to `/analyze` — routing decision pending.

### Response

```typescript
interface WireFertilityAnalysisResponse {
  fertility_score: number;     // 0-100 overall score
  answer: 'favorable' | 'challenging' | 'mixed' | 'unclear';
  sign_fertility_analysis: Record<string, WireFertilitySignAnalysis>;
  arabic_parts: WireArabicPart[];
  fifth_house_analysis: WireFifthHouseAnalysis;
  interpretation: string;
  radicality: WireRadicality;
  timing_windows?: unknown[] | null;
  lunar_analysis?: WireLunarSequence | null;
  planetary_future_aspects?: WireApplyingAspect[] | null;
}
```

---

## 9. Endpoint: GET /horary/glossary/categories

Static reference for all 11 horary categories. Query param: `?language=en`.

**Already sourced into `config.ts`** — `HORARY_CATEGORIES` and `HORARY_SUBCATEGORIES` are derived from this endpoint. Response also includes `houses`, `house_names`, `significators`, `significator_meanings` which are not currently used in the UI.

---

## 10. Endpoint: GET /horary/glossary/considerations

Static reference for the 8 traditional radicality considerations (William Lilly). Useful for educational display in the app.

```typescript
interface WireConsiderationGlossary {
  name: string;           // e.g. 'early_ascendant'
  display_name: string;
  traditional_meaning: string;
  threshold: string;
  severity: 'high' | 'medium' | 'low';
  weight: number;         // 0-20
  exception?: string;
  description: string;
}
```

---

## 11. Current App → API Mapping

### Request builder (`horaryMapper.ts:buildAnalysisRequest`)

```
HoraryRequest (app)          → HoraryAnalysisRequest (wire)
─────────────────────────────────────────────────────
question                     → question (deprecated; sent for compat)
category                     → category
subcategory                  → subcategory (omitted if undefined)
subject_role (≠ 'self')      → subject_role
timestamp (ISO)              → question_time.{year,month,day,hour,minute,second}
latitude                     → question_time.latitude
longitude                    → question_time.longitude
timezone                     → question_time.timezone
zodiacType ('Sidereal' only) → chart_options.zodiac_type
—                            → include_timing: true
—                            → options.language (current i18n locale)
```

### Response normalizer (`horaryMapper.ts:normalizeAnalysisResponse`)

```
Wire field                          → App field              Status
────────────────────────────────────────────────────────────────────
judgment.answer                     → verdict                ✅
judgment.confidence_band            → confidence_band        ✅
judgment.interpretation/reasoning   → summary                ✅
judgment.voc_treatment              → voc_treatment          ✅
significators[].dignity_info.sign   → significators[].sign   ✅
significators[].dignity_info.*      → dignity/retrograde     ✅
lunar_analysis.is_void_of_course    → voc_moon               ✅
radicality.is_radical               → is_radical             ✅
radicality.summary                  → radicality_summary     ✅
aspect_perfections[]                → aspects[]              ❌ NOT EXTRACTED
ai_answer.summary (ask only)        → summary (preferred)    ❌ NOT USED
lunar_analysis.moon_sign            → (not in app model)     ❌ NOT MAPPED
radicality.score                    → (not in app model)     ❌ NOT MAPPED
timing[]                            → (not in app model)     ❌ NOT MAPPED
```

---

## 12. Known Gaps & Open Questions

### Open questions (need owner input)

| # | Status | Question |
|---|---|---|
| 1 | ✅ Resolved | `chart_data` contains `planetary_positions[]` + `house_cusps` + `ascendant_sign`. Fully typed as `WireChartData`. |
| 2 | ✅ Resolved | `considerations[]` items: `{name, is_present, severity, message, value}`. Always 8 items; `is_present=false` when not triggered. |
| 3 | ✅ Updated | `/ask` = **10 credits** (confirmed from live response 2026-06-03). Earlier test showed 2 — likely plan-tier difference. `/analyze` = 1 credit. This makes `/analyze` the clear MVP primary endpoint. `/aspects`, `/chart` costs still unconfirmed. |
| 4 | ✅ Resolved | `/analyze` accepts all 11 categories: `pregnancy`, `fertility`, `love`, `marriage`, `career`, `job`, `money`, `health`, `missing_item`, `travel`, `general`. Confirmed from API enum 2026-06-03. `HORARY_CATEGORIES` in config.ts is correct. |
| 5 | ✅ Resolved | All endpoints return `{success, data, metadata, warnings, pagination}` envelope. |

### Known mapper bugs (tracked in todo)

1. `aspect_perfections[]` — not extracted, `aspects` always empty in app model
2. `ai_answer.summary` — not used even when calling `/ask`; currently uses `judgment.interpretation`
3. `WireLunarSequence` — only `is_void_of_course` extracted; rich Moon data unused
4. `radicality.score` — present in wire response but not in app model

### Architecture decisions pending

- **`/ask` vs `/analyze` as primary endpoint** — `/ask` simplifies UX (no category chips), auto-detects language, returns richer `ai_answer`. Decision needed before next implementation sprint.
- **`pregnancy`/`fertility` routing** — use specialized `/fertility-analysis` (2 credits, richer data) or keep on `/analyze`?

---

---

## 13. Additional Data Endpoints (Non-Horary)

These endpoints are from the `/api/v3/data/` group. They use a **different request schema** from the horary endpoints.

### Common: DataRequest schema

```typescript
// /data/* uses subject.birth_data — different from horary question_time
{
  "subject": {
    "name": "horary-question",   // arbitrary label, not displayed
    "birth_data": {
      "year": number,
      "month": number,
      "day": number,
      "hour": number,
      "minute": number,
      "second": number,
      "latitude": number,
      "longitude": number
    }
  },
  "options": {
    "house_system": "R",         // Regiomontanus — matches horary default
    "language": "en",            // IANA locale
    "tradition": "classical",    // classical for horary consistency
    "zodiac_type": "Tropic"      // or "Sidereal" from user settings
  }
}
```

> App note: always pass `house_system: "R"` and `tradition: "classical"` when calling from a horary context.

---

### 13.1 POST /api/v3/data/positions/enhanced

**Priority: MVP-candidate**

**Use case:** Full dignity analysis for all 7 traditional planets — mutual receptions, sect (day/night chart), Arabic Parts, and accidental conditions (combust / cazimi / under beams). The horary `/analyze` endpoint returns dignities only for significators via `significators[].dignity_info`. This endpoint fills the gap and provides a direct answer to open question §12 Q1 (undocumented `chart_data` structure).

Additional request options:
```json
"options": {
  "active_points": ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Ascendant"],
  "include_declinations": false
}
```

Response:
```typescript
interface WireEnhancedPositionsResponse {
  positions: WireEnhancedPlanetPosition[];
  dignity_overview: {
    dignified_planets: unknown[];
    debilitated_planets: unknown[];
    mutual_receptions: WireMutualReception[];   // ⚠️ inner structure not yet confirmed
  };
  sect_info: {
    is_day_chart: boolean;
    sect: 'diurnal' | 'nocturnal';
    sect_ruler: string;
    benefic_in_sect: string;
    malefic_out_of_sect: string;
  };
  traditional_points: Record<string, unknown>;  // Part_of_Fortune, Part_of_Spirit, etc. — structure TBD
  calculation_time: string;                     // ISO 8601
}

interface WireEnhancedPlanetPosition {
  name: string;
  sign: string;                  // 3-letter, e.g. "Ari"
  degree: number;                // degree within sign, 0–29.99
  absolute_longitude: number;    // 0–360
  house: number;                 // 1–12
  is_retrograde: boolean;
  speed: number;                 // degrees/day; negative = retrograde
  conditions: {
    domicile: boolean;
    exaltation: boolean;
    exile: boolean;
    fall: boolean;
    triplicity: {
      is_in_triplicity: boolean;
      ruler_primary: string;
      ruler_secondary: string;
      ruler_participant: string;
      active_ruler: string;
    };
    term: string;                // planet name ruling the term
    decan: string;               // planet name ruling the decan
    combustion: boolean;
    cazimi: boolean;
    under_beams: boolean;
    in_joy: boolean;
    about_to_change_sign: boolean;
  };
}
```

> **App integration note:** Can substitute for undocumented `chart_data` from `/horary/analyze` when building a planet positions display. Mutual receptions in `dignity_overview.mutual_receptions` are critical for horary perfection via reception — currently missing from the app model entirely.

---

### 13.2 POST /api/v3/data/lunar-metrics/enhanced

**Priority: MVP-candidate**

**Use case:** Richer Moon display in Journal list and Verdict screen: illumination %, exact VOC next-aspect with `hours_until` + ISO timestamp, traditional phase meaning, full triplicity / term / decan dignities. Complements `lunar_analysis` in the horary response (which only returns `is_void_of_course` and basic sequence).

Response:
```typescript
interface WireEnhancedLunarMetrics {
  moon_sign: string;
  void_of_course: boolean;
  phase_info: {
    phase_name: string;
    illumination_percent: number;
    moon_age_days: number;
    elongation_deg: number;
    increasing_light: boolean;
    void_of_course: boolean;
    next_aspect: {
      planet: string;
      aspect_type: string;
      hours_until: number;
      exact_time: string;    // ISO 8601
    };
  };
  lunar_dignities: {
    domicile: boolean;
    exaltation: boolean;
    detriment: boolean;
    fall: boolean;
    triplicity: {
      is_in_triplicity: boolean;
      ruler_primary: string;
      ruler_secondary: string;
      ruler_participant: string;
      active_ruler: string;
    };
    term: string;
    decan: string;
  };
  next_sign_change: {
    hours_until: number;
    next_sign: string;
    dignity_change: string;  // human-readable description of dignity shift
  };
  traditional_phase_meaning: string;
}
```

> **App integration note:** Call alongside `/horary/ask` to enrich Moon display in Verdict and Journal. Cache per 60 minutes per location — Moon data doesn't change meaningfully within 1 hour.

---

### 13.3 POST /api/v3/data/sabian-symbols

**Priority: Polish (post-MVP)**

**Use case:** Sabian symbol for Ascendant and Moon degree on the Verdict screen. Adds interpretive depth without extra logic on the app side.

Filter to 2 points to minimize response payload:
```json
"options": { "active_points": ["Moon", "Ascendant"] }
```

Response item:
```typescript
interface WireSabianSymbol {
  point: string;
  sign: string;
  degree_in_sign: number;    // 0–29.99
  sabian_degree: number;     // 1–30 (ceiling of degree_in_sign)
  symbol: string;            // archetypal image, e.g. "A large white dove bearing a message"
  keynote: string;           // Rudhyar interpretive meaning
  keyword: string;           // single-word essence
  house: number;
  is_retrograde: boolean;
}

interface WireSabianSymbolsResponse {
  symbols: WireSabianSymbol[];
}
```

> **App integration note:** Display as an optional "depth" expandable card below the main verdict — not on the critical path. Uses same `subject.birth_data` schema as other `/data/*` endpoints.

---

### 13.4 GET /api/v3/data/now — NOT RECOMMENDED

Response schema is minimal: only normalizes and returns current UTC time as a `birth_data` object with default `latitude: 0.0 / longitude: 0.0`. Does not return astrological positions. Use `new Date()` in the app instead and pass the datetime directly to other endpoints.

---

---

## 14. Official TypeScript SDK — `@astro-api/astroapi-typescript`

*Researched 2026-06-03. Package: https://www.npmjs.com/package/@astro-api/astroapi-typescript*

### What it is

Official TypeScript SDK by the astrology-api.io team (v1.0.1, MIT). Wraps the same provider we already use (`api.astrology-api.io`). Provides a typed `AstrologyClient` class with Axios under the hood, retry/backoff, runtime validation, and types generated from OpenAPI.

```typescript
import { AstrologyClient } from '@astro-api/astroapi-typescript';

const client = new AstrologyClient({
  apiKey: 'your-key',
  retry: { attempts: 2, delayMs: 250 },
});
```

### Critical: horary endpoints NOT covered

The SDK does **not** include a `horary` sub-client. Our custom `horaryApi.ts` + `horaryMapper.ts` remain the only way to call `/api/v3/horary/*`. The SDK is complementary, not a replacement.

### Compatibility with React Native

`package.json` declares `engines: { node: ">=22.0.0" }`. This is a server/Node SDK — the engine field may not apply to Hermes/JSC in React Native, but the SDK was not tested in a mobile bundle context. **Do not install in the mobile app without verifying no Node-specific APIs are used in the built output.** If needed, proxy calls through an Expo API route or a lightweight BFF.

### Sub-clients provided

| Sub-client | Endpoints | Relevance to AstraSk |
|---|---|---|
| `data` | `/api/v3/data` — positions, enhanced, global | `getPositions` could supplement chart_data; already partially covered by `chart_data` in `/analyze` |
| `svg` | `/api/v3/svg` — natal, synastry, transit SVGs | **High future value** — natal chart SVG for Verdict screen chart visualization |
| `traditional` | `/api/v3/traditional` — analysis, profection, lots | `getLots` provides Arabic Parts (Part of Fortune) — gap in current MVP |
| `lunar` | `/api/v3/lunar` — calendar, phases, VOC | `getVoidOfCourse` complements our VOC data from `/analyze` |
| `charts` | `/api/v3/charts` — natal, transit, solar return | Post-MVP: natal chart for user birth data |
| `horoscope` | `/api/v3/horoscope` — daily, weekly, sign texts | Post-MVP: optional daily content feature |
| `analysis` | `/api/v3/analysis` — synastry, compatibility, progression | Post-MVP: relationship analysis feature |
| `numerology` | `/api/v3/numerology` | Out of scope |
| `tarot` | `/api/v3/tarot` | Out of scope |
| `chinese` | `/api/v3/chinese` — BaZi, forecasts | Out of scope |
| `astrocartography` | `/api/v3/astrocartography` | Out of scope |
| `insights` | `/api/v3/insights` — relationship, wellness, financial | Out of scope for MVP |
| `eclipses` | `/api/v3/eclipses` | Out of scope |
| `fixedStars` | `/api/v3/fixed-stars` | Out of scope |

### Recommendation

| Phase | Action |
|---|---|
| **MVP (now)** | Do not install. Our `horaryApi.ts` handles all required horary calls. SDK adds no coverage and has unverified RN compatibility. |
| **v1.1 — chart visualization** | Evaluate `client.svg.getNatalChartSvg` — could render a chart wheel on the Verdict screen. Test in RN bundle first. |
| **v1.2 — Arabic Parts** | Use `client.traditional.getLots` to surface Part of Fortune, Part of Spirit etc. as a "depth" card. |
| **v2 — natal/transit features** | Use `client.charts` and `client.analysis` if natal chart features are added to the app scope. |

---

*Stage: Stage4-Architecture → Stage5-Implementation*
*Gate 5: API contract specification — updated 2026-06-03*
