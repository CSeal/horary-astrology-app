# astrology-api.io API Knowledge Base

Maintained by Compound V Phase 1C validator. Append at the bottom.

---

## Updated 2026-06-03 — /horary/fertility-analysis endpoint validation

Source: live OpenAPI JSON `https://api.astrology-api.io/api/v3/openapi.json` (fetched 2026-06-03). Spec self-reports **Astrology API v3.2.10**, OpenAPI 3.1.0.

### General horary request shape (verified 2026-06-03)
- All `/horary/*` analysis endpoints use the `question_time: DateTimeLocation` envelope. They do **NOT** use the `subject` / `subject.birth_data` shape — that shape belongs only to natal/return/vedic/etc. endpoints (verified by enumerating all 120+ schemas carrying a `subject`/`birth_data` property; none are horary).
- `DateTimeLocation` required: `year, month, day, hour, minute`. Optional: `second, city, country_code, latitude, longitude, timezone`. Supply either `city`+`country_code` OR `latitude`+`longitude`.
- Auth: `BearerAuth` on horary endpoints.

### POST /api/v3/horary/fertility-analysis (verified 2026-06-03)
- Credit cost: **2 credits — confirmed in spec** via `x-badges`. Not inferred.
- Request schema `FertilityAnalysisRequest`, `additionalProperties: false`.
  - Only required field: `question_time` (DateTimeLocation).
  - Optional: `chart_options` (default Regiomontanus `R`), `include_timing` (default true), `extended_lunar_sequence` (default true), `max_lookahead_degrees` (15–90, default 45), `options` (e.g. `{language:'ru'}`), `question` (`deprecated`, `x-internal`, NOT used in calc), `include_all_planetary_aspects` (`x-internal`, default false; gates `planetary_future_aspects`).
  - **No `category`/`subcategory`/`subject_role`** — endpoint is category-agnostic (hard-wired fertility). Sending them is rejected (additionalProperties:false).
  - Note: the `question` field description text copy-pastes "category/subcategory/question_time drive the result" from `/horary/analyze` — misleading here; ignore.
- Response schema `FertilityAnalysisResponse`.
  - Required: `fertility_score` (number 0–100), `answer` (string — **NO enum** in spec; examples: favorable/challenging/mixed/unclear), `sign_fertility_analysis` (open map, `additionalProperties:true`), `arabic_parts` (`ArabicPart[]`), `fifth_house_analysis` (open map), `interpretation` (string), `radicality` (`RadicalityCheckResponse`).
  - Optional/nullable: `question` (deprecated), `lunar_analysis` (**`FertilityLunarAnalysis`**, not the generic lunar schema), `significator_aspects` (`SignificatorAspects`; `l1_to_l5` = PRIMARY pregnancy testimony per Lilly), `planetary_future_aspects` (`PlanetaryFutureAspect[]`, only when include_all_planetary_aspects=true), `timing_windows` (`TimingEstimate[]`; empty when Moon Void-of-Course).
  - Undocumented inner shapes: `sign_fertility_analysis` and `fifth_house_analysis` are `additionalProperties:true` open maps — inner keys (e.g. `{sign, fertility, weight, importance}`, `{cusp_sign, ruler, ruler_sign, ruler_dignity}`) are example-only, not schema-enforced.
- Sign-fertility value spelling: spec example uses **`semi_fruitful`** (underscore), alongside `fruitful` / `barren`.
- Sub-schemas:
  - `FertilityLunarAnalysis` required: `moon_sign, degrees_to_sign_change, is_void_of_course, favorable_count, challenging_count, summary`; also has `applying_aspects` (items `FertilityApplyingAspect`), `moon_to_l5` (`FertilityApplyingAspect`), `quesited_position`, `intervening_analysis`, `extended_mode`, `max_lookahead_degrees`.
  - `FertilityApplyingAspect` required: `planet, role, aspect_type, orb, degrees_to_perfection, nature, interpretation`; optional `crosses_sign_boundary, perfection_sign`.
  - `TimingEstimate` required: `time_unit, value, confidence, based_on, explanation`.
  - `SignificatorAspects`: `l1_to_l5`, `moon_to_l5` (no required list).
  - `RadicalityCheckResponse` required: `is_radical, score, considerations, recommendation, summary`; optional `flags`. NOTE: fertility examples omit `considerations`/`summary` — schema vs example contradiction; verify with a live call.

### Local TS drift findings vs spec (src/types/horary.ts, as of 2026-06-03)
- 🔴 `WireFertilitySignAnalysis.fertility` = `'semi-fruitful'` (hyphen) but live data is `'semi_fruitful'` (underscore) → never matches.
- 🟠 `lunar_analysis` typed `WireLunarSequence` but spec is `FertilityLunarAnalysis` (different fields: favorable_count/challenging_count/summary/moon_to_l5; aspect items are FertilityApplyingAspect not WireMoonAspect).
- 🟠 `WireRadicality.considerations`/`.summary` non-optional, but fertility examples omit them (resolve via live call).
- 🟡 `answer` typed as closed union; spec has no enum → guard at boundary.
- 🟡 `timing_windows`/`significator_aspects` typed `unknown`, but spec defines `TimingEstimate`/`SignificatorAspects`.
