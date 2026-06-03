# Library Audit — /horary/fertility-analysis (astrology-api.io)

**Date:** 2026-06-03
**Validator:** Compound V Phase 1C
**Scope:** API currency + schema/signature validation of `POST /api/v3/horary/fertility-analysis` against the LIVE OpenAPI spec, and drift check of the local TS type `WireFertilityAnalysisResponse`.
**Source of truth:** `https://api.astrology-api.io/api/v3/openapi.json` (fetched 2026-06-03; spec self-reports **Astrology API v3.2.10**, OpenAPI 3.1.0).

---

## 1. Tools Available

- Context7: ❌ not used — astrology-api.io is a private vendor REST API, not in Context7's library index. Validated directly against the publisher's live OpenAPI JSON (authoritative, not training-data-derived).
- Manifests inspected: N/A for this task (single external API, not an npm dependency). Local type contract: `src/types/horary.ts`.
- Method: full `openapi.json` (1.99 MB) downloaded and queried with `jq` against `$ref`-resolved component schemas. Not summarizer-derived — exact field lists.

---

## 2. Endpoint Summary (table)

| Property | Value (from live spec) |
|---|---|
| Path | `POST /api/v3/horary/fertility-analysis` |
| operationId | `analyze_fertility_question_api_v3_horary_fertility_analysis_post` |
| Request schema | `FertilityAnalysisRequest` (`additionalProperties: false`) |
| Response schema (200) | `FertilityAnalysisResponse` |
| Auth | `BearerAuth` (required) |
| Credit cost | **2 credits — CONFIRMED in spec** via `x-badges: [{ "name": "2 credits" }]` |
| Error responses | 400 (invalid horary parameters), 422 (validation error) |

---

## 3. Request Body Schema

### Required vs optional

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `question_time` | `DateTimeLocation` | **YES (only required field)** | — | date/time/location of the question |
| `question` | `string \| null` | no | — | **`deprecated: true`, `x-internal: true`** — accepted for backwards-compat but **NOT used in calculation** |
| `chart_options` | `ChartOptions \| null` | no | Regiomontanus (`R`) | house system etc. |
| `include_timing` | `boolean` | no | `true` | include conception timing windows |
| `extended_lunar_sequence` | `boolean` | no | `true` | `false` = traditional sign-boundary-only |
| `max_lookahead_degrees` | `number` (15–90) | no | `45.0` | 45° → 10–22 aspects |
| `include_all_planetary_aspects` | `boolean` | no | `false` | `x-internal: true`; gates `planetary_future_aspects` in response |
| `options` | `HoraryOptions \| null` | no | English | `options.language` for interpretations (ru/en confirmed via examples) |

`additionalProperties: false` — **unknown fields are rejected.**

### Q3 — Does it accept a `category` field?

**NO.** `FertilityAnalysisRequest` has no `category` (nor `subcategory`, nor `subject_role`). With `additionalProperties: false`, sending `category` would be rejected. The endpoint is **category-agnostic / hard-wired to fertility**.

> ⚠️ Spec inconsistency to be aware of: the `question` field's description text says *"Only category/subcategory/question_time drive the result."* That sentence is copy-pasted from the generic `/horary/analyze` schema and is **misleading here** — `category`/`subcategory` do not exist on this request. Do not send them.

### Q1/Q6 — Same format as `/horary/analyze`? Or `subject.birth_data`?

Same `question_time: DateTimeLocation` envelope as `/horary/analyze`. **NOT** the `subject` / `subject.birth_data` format.

| | `/horary/analyze` (`HoraryAnalysisRequest`) | `/horary/fertility-analysis` (`FertilityAnalysisRequest`) |
|---|---|---|
| Required | `category`, `question_time` | `question_time` only |
| Extra fields | `category`, `subcategory`, `subject_role` | (none — those are absent) |
| Shared optional | `chart_options`, `include_timing`, `extended_lunar_sequence`, `max_lookahead_degrees`, `options`, `question` | same set |
| Location format | `DateTimeLocation` | `DateTimeLocation` (identical) |

`DateTimeLocation` required keys: `year, month, day, hour, minute`. Optional: `second, city, country_code, latitude, longitude, timezone`. You supply **either** `city`+`country_code` **or** `latitude`+`longitude`.

> The `subject` / `birth_data` request shape exists ONLY on natal/derived endpoints (NatalChartRequest, SolarReturnRequest, Vedic*, etc. — 120+ schemas). **No horary endpoint uses it.** Confirmed by enumerating every schema with a `subject`/`birth_data` property: none of them are horary.

---

## 4. Response Schema

### Q2 — Field existence confirmation

| Field you asked about | In spec? | Required? | Spec type |
|---|---|---|---|
| `fertility_score` | ✅ | **required** | `number` 0–100 |
| `answer` | ✅ | **required** | `string` (see drift note — **NO enum**) |
| `sign_fertility_analysis` | ✅ | **required** | `object`, `additionalProperties: true` (**untyped map**) |
| `arabic_parts` | ✅ | **required** | `ArabicPart[]` (typed) |
| `fifth_house_analysis` | ✅ | **required** | `object`, `additionalProperties: true` (**untyped map**) |
| `interpretation` | ✅ | **required** | `string` |
| `timing_windows` | ✅ | optional/nullable | `TimingEstimate[] \| null` (typed) |
| `radicality` | ✅ | **required** | `RadicalityCheckResponse` (typed) |
| `lunar_analysis` | ✅ | optional/nullable | `FertilityLunarAnalysis \| null` (typed) |

All 9 requested fields exist. Spec `required` set: `fertility_score, answer, sign_fertility_analysis, arabic_parts, fifth_house_analysis, interpretation, radicality`.

Additional response fields present in spec (not in your question list):
- `question` — `deprecated`, echoes request, nullable.
- `significator_aspects` — `SignificatorAspects \| null` (L1→L5 + Moon→L5; spec calls L1→L5 the PRIMARY pregnancy indicator).
- `planetary_future_aspects` — `PlanetaryFutureAspect[] \| null` (only when `include_all_planetary_aspects=true`).

### Q4 — Undocumented / unknown-structure fields

Two response fields are typed as **open maps** (`additionalProperties: true`, no property schema) in the OpenAPI — their internal shape is **not formally documented by the spec**:

1. `sign_fertility_analysis` — `object` with free-form keys (examples show keys `moon`, `fifth_house` → objects `{sign, fertility, weight, importance}`). The per-entry shape is example-only, **not schema-enforced**.
2. `fifth_house_analysis` — `object` (examples show `{cusp_sign, ruler, ruler_sign, ruler_dignity}`), **not schema-enforced**.

Treat both as inferred-from-examples, not guaranteed. The vendor can add/rename inner keys without an OpenAPI change.

### Q5 — Credit cost

**2 credits — CONFIRMED, in the spec** (not inferred): `paths./api/v3/horary/fertility-analysis.post.x-badges = [{"name":"2 credits"}]`.

---

## 5. TS Drift Check — `WireFertilityAnalysisResponse` (src/types/horary.ts:454–492)

### 🔴 CRITICAL — `WireFertilitySignAnalysis.fertility` enum is WRONG

- Local type (line 458): `'fruitful' | 'semi-fruitful' | 'barren'` (hyphen).
- Live spec example value: **`semi_fruitful`** (underscore). The favorable/challenging examples use `fruitful` / `barren`; the mixed example uses `semi_fruitful`.
- Impact: any runtime narrowing/validation or exhaustive `switch` on `fertility === 'semi-fruitful'` will **never match** the real payload. Mixed-fertility signs silently fall through.
- Fix direction (for plan, not here): change to `'semi_fruitful'`. Note this map is also `additionalProperties: true` in spec, so the value shape itself is example-derived, not guaranteed.

### 🟠 HIGH — `WireRadicality` over-specifies vs `RadicalityCheckResponse`

- `radicality` resolves to spec schema `RadicalityCheckResponse`, required: `is_radical, score, considerations, recommendation, summary`. Optional: `flags`.
- Local `WireRadicality` (lines 168–175) matches the field set, BUT the fertility examples in the spec show `radicality` as only `{is_radical, score, recommendation}` — missing the schema-required `considerations` and `summary`. The example contradicts the schema. The schema is authoritative, but real responses may be thinner than the type asserts (`considerations: WireConsiderationItem[]` non-optional could be absent at runtime). Verify against a live call before trusting non-null.

### 🟠 HIGH — `lunar_analysis` typed as wrong schema

- Local: `lunar_analysis?: WireLunarSequence | null`.
- Spec: `lunar_analysis` → **`FertilityLunarAnalysis`**, a *different* schema from the generic lunar sequence.
- `FertilityLunarAnalysis` required: `moon_sign, degrees_to_sign_change, is_void_of_course, favorable_count, challenging_count, summary`. Has fertility-specific fields **absent from `WireLunarSequence`**: `favorable_count`, `challenging_count`, `summary`, `moon_to_l5` (→ `FertilityApplyingAspect`), `quesited_position`, `intervening_analysis`, `extended_mode`, `max_lookahead_degrees`, `applying_aspects` (items → `FertilityApplyingAspect`, NOT `WireMoonAspect`).
- `WireLunarSequence` fields NOT in the fertility schema: `moon_longitude`, `voc_exception_sign`, `voc_effective_strength`, `last_aspect`, `moon_to_quesited`. Accessing these on a fertility response = always `undefined`.
- Impact: structural mismatch. `WireLunarSequence` is a near-miss reused from the generic endpoint; it will compile but mislead at runtime (missing `favorable_count`/`challenging_count`/`summary`; wrong aspect item type).

### 🟡 MEDIUM — `answer` typed as closed union but spec has no enum

- Local: `answer: 'favorable' | 'challenging' | 'mixed' | 'unclear'`.
- Spec: `answer` is `type: string` with **no `enum`** — the four values appear only in `examples`. A future/edge value would violate the TS union at runtime (unsafe cast). The union is a reasonable contract but is not enforced by the API; guard at the boundary.

### 🟡 MEDIUM — `timing_windows` / `significator_aspects` typed as `unknown`, but spec HAS schemas

- Local (lines 489–490): `timing_windows?: unknown[] | null`, `significator_aspects?: unknown | null`.
- Spec provides typed schemas: `timing_windows` items = `TimingEstimate` (`time_unit, value, confidence, based_on, explanation`); `significator_aspects` = `SignificatorAspects` (`l1_to_l5`, `moon_to_l5`). These are recoverable as real types — `unknown` is conservative but leaves usable data untyped (and obscures that `significator_aspects.l1_to_l5` is, per spec, the PRIMARY pregnancy testimony).

### 🟢 OK — fields that match

- `fertility_score: number`, `answer` presence, `interpretation: string`, `arabic_parts: WireArabicPart[]` (matches `ArabicPart`: `name, sign, degree, absolute_longitude, house` required + `interpretation?`), `planetary_future_aspects` presence (type item is close), `question?: string` optional. Request side: local usage of `question_time: DateTimeLocation` matches the spec exactly.

---

## 6. Design Constraints for the Plan (non-negotiable)

- MUST fix `WireFertilitySignAnalysis.fertility` to `'semi_fruitful'` (underscore). Current hyphen value never matches live data. (🔴)
- MUST NOT send `category`/`subcategory`/`subject_role` to `/horary/fertility-analysis` — `additionalProperties:false` rejects them. Fertility is hard-wired. (🔴 request-side)
- MUST NOT use the `subject`/`birth_data` request shape for any horary call. Horary uses `question_time: DateTimeLocation` only.
- MUST replace `lunar_analysis: WireLunarSequence` with a fertility-specific type modeling `FertilityLunarAnalysis` (`favorable_count`, `challenging_count`, `summary`, `moon_to_l5`, `applying_aspects: FertilityApplyingAspect[]`). Reusing `WireLunarSequence` drops fields and mis-types aspect items. (🟠)
- MUST validate `answer` at the API boundary (runtime narrow) — spec has no enum; do not trust the closed TS union for untrusted input. (🟡)
- MUST treat `sign_fertility_analysis` and `fifth_house_analysis` inner shapes as example-derived, not schema-guaranteed (`additionalProperties:true`). Parse defensively. (🟡)
- MUST send EITHER `city`+`country_code` OR `latitude`+`longitude` in `question_time` (plus required `year/month/day/hour/minute`).
- SHOULD type `timing_windows` as `TimingEstimate[]` and `significator_aspects` as `SignificatorAspects` instead of `unknown` — both are defined in the spec; `significator_aspects.l1_to_l5` is the primary pregnancy testimony and is currently invisible to consumers. (🟡)
- Budget note: 2 credits/call (confirmed). Account for this in any rate/usage estimate.

---

## 7. Open Questions for the Human (escalate)

1. **Radicality at runtime:** spec schema requires `considerations` + `summary` on `radicality`, but the fertility *examples* omit them. Does the live fertility endpoint actually return the full `RadicalityCheckResponse`, or a trimmed `{is_radical, score, recommendation}`? This determines whether `WireRadicality.considerations`/`.summary` may be non-optional. Recommend one live test call to settle. (Cannot resolve from spec alone — schema and example contradict.)
2. **`include_all_planetary_aspects` is `x-internal: true`** yet gates `planetary_future_aspects`. Is the app intended to use this flag, or is it vendor-internal (and the field effectively always null for us)? Affects whether `planetary_future_aspects` belongs in the consumer type.
3. **VOC behavior:** spec says `timing_windows` may be `[]` when Moon is Void-of-Course. Product decision: how does the UI present "timing cannot be determined" vs "no favorable windows"? (Routes to Phase 1B domain, flagged here only because it's schema-visible.)

---

## 8. Knowledge Base Updates

Appended to `docs/superpowers/library-audit/_knowledge-base/astrology-api-io.md` (created — no prior file for this vendor). Recorded: spec version v3.2.10, fertility endpoint request/response schemas, 2-credit cost, horary-uses-DateTimeLocation rule, and the five TS drift findings, all date-stamped 2026-06-03 with the openapi.json source URL.
