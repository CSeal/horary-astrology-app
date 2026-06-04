// src/types/horary.ts
// TypeScript interfaces for the horary API contract.
//
// Two layers:
//   • App model — HoraryRequest / HoraryResponse / SignificatorData. Used by
//     screens, journal, and the mock. Stable internal shape.
//   • Wire model — reflects the real API response shapes. Mapped to/from the
//     app model in horaryMapper.ts so the rest of the app never sees wire shapes.
//
// Wire model source: astrology-api.io v3, confirmed from live API response 2026-06-03.
// Endpoints covered: /horary/ask, /horary/analyze, /horary/aspects,
//   /horary/chart, /horary/fertility-analysis,
//   /horary/glossary/categories, /horary/glossary/considerations

import type { HoraryCategory, SubjectRole, ZodiacType } from '@/constants/config';

export type { HoraryCategory, SubjectRole, ZodiacType };
export type VerdictType = 'YES' | 'NO' | 'MAYBE' | 'UNCLEAR';
export type ConfidenceBand = 'high' | 'medium' | 'low';

// ── App model ────────────────────────────────────────────────────────────────

export interface SignificatorData {
  planet: string;
  role: 'querent' | 'quesited' | 'moon' | string;
  sign: string;
  house: number;
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | null;
  retrograde: boolean;
  aspect?: string | null;
}

export interface AspectPerfectionData {
  planet1: string;
  planet2: string;
  aspect_type: string;
  is_applying: boolean;
  orb: number;
  will_perfect: boolean;
  degrees_to_perfection?: number | null;
}

// Simplified timing estimate shown on the verdict / full-reading screens.
// Derived from the first WireTiming item; the teaser label is rendered from
// time_unit + value at display time so it stays localized.
export interface ReadingTiming {
  time_unit: 'days' | 'weeks' | 'months' | 'years';
  value: number;
  explanation: string;
}

export interface HoraryRequest {
  question: string;
  category: HoraryCategory;
  subcategory?: string;
  subject_role?: SubjectRole;
  latitude: number;
  longitude: number;
  timezone: string;
  timestamp: string;
}

export interface HoraryResponse {
  id: string;
  verdict: VerdictType;
  confidence_band: ConfidenceBand;
  summary: string;
  significators: SignificatorData[];
  aspects?: AspectPerfectionData[];
  voc_moon: boolean;
  voc_treatment?: string;
  // is_radical: false means chart not fit for judgment (→ reask later).
  // undefined means API did not return a radicality block (old data).
  is_radical?: boolean;
  radicality_summary?: string;
  // Chart strength 0-100 (radicality.score). undefined for old data.
  radicality_score?: number;
  // Timing estimate (first WireTiming entry), if the engine returned one.
  timing?: ReadingTiming;
  // Void-of-course Moon detail (lunar_analysis). All optional — old data and
  // non-void charts leave them undefined.
  voc_moon_sign?: string;            // full sign name + degree, e.g. "Taurus 26°"
  voc_degrees_to_sign_change?: number;
  voc_next_sign?: string;            // full sign name, e.g. "Gemini"
  voc_exception_sign?: string | null; // full sign name when a Lilly exception applies
  chart_time: string;
  location_display?: string;
}

export interface HoraryAPIError {
  code: 'NETWORK_ERROR' | 'API_4XX' | 'API_5XX' | 'TIMEOUT' | 'UNKNOWN' | 'LIMIT_EXCEEDED';
  message: string;
  retryable: boolean;
  originalStatus?: number;
  originalMessage?: string;
}

// ── Shared wire request schema ───────────────────────────────────────────────
// Used by all POST endpoints that accept a question_time body.

export interface DateTimeLocation {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  city?: string;
  country_code?: string;  // ISO 3166-1 alpha-2; strongly recommended alongside city
}

// ── Wire model: /horary/analyze and /horary/ask ──────────────────────────────

export interface HoraryAnalysisRequest {
  question?: string;
  category: HoraryCategory;
  subcategory?: string;
  subject_role?: string;
  question_time: DateTimeLocation;
  include_timing?: boolean;
  extended_lunar_sequence?: boolean;
  max_lookahead_degrees?: number;
  chart_options?: { zodiac_type?: ZodiacType };
  options?: { language?: string };
}

// Dignity info attached to each significator.
// dignity_info can be null even though the schema marks it required — treat defensively.
export interface WireDignityInfo {
  planet?: string;                 // planet name, e.g. 'Mercury' — present in live responses
  sign: string;                    // 3-letter abbreviation, e.g. 'Ari'
  essential_dignity: string;       // domicile | exaltation | triplicity | term | decan | peregrine | detriment | fall
  dignity_score?: number;          // -10..15 (essential + accidental combined)
  domicile_ruler?: string;         // planet ruling the sign
  exaltation_ruler?: string | null;
  accidental_conditions?: string[]; // retrograde | combust | cazimi | under_beams | angular | succedent | cadent
}

export interface WireSignificator {
  role: string;               // querent | quesited | additional
  planet: string;
  house: number;
  reason?: string;
  dignity_info?: WireDignityInfo | null;
}

// Aspect between significators returned inline by /analyze and /ask.
export interface WireAspectPerfection {
  planet1: string;
  planet2: string;
  aspect_type: string;       // conjunction | opposition | trine | square | sextile
  is_applying: boolean;
  orb: number;
  will_perfect: boolean;
  degrees_to_perfection?: number | null;
}

// Radicality flag — canonical typed list (preferred over legacy considerations[]).
export interface WireRadicalityFlag {
  type:
    | 'early_ascendant'
    | 'late_ascendant'
    | 'moon_voc'
    | 'saturn_in_7th'
    | 'saturn_in_1st'
    | 'via_combusta_moon'
    | 'via_combusta_ascendant'
    | 'ascendant_ruler_combust';
  severity: 'severe' | 'moderate' | 'mild';
  show_to_client: boolean;    // false = astrologer-only warning, don't surface in UI
  weight_applied: number;
  mitigated_by?: string | null; // e.g. 'exception_sign_Can'
}

// Individual consideration result — all 8 are always returned, is_present=false when not triggered.
export interface WireConsiderationItem {
  name: string;          // e.g. 'early_ascendant'
  is_present: boolean;
  severity: 'high' | 'medium' | 'low';
  message: string;       // human-readable explanation
  value: number | null;  // the measured value (e.g. ascendant degree, Moon longitude)
}

export interface WireRadicality {
  is_radical: boolean;
  score: number;              // 0-100; <50 = caution, <30 = not radical
  recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_judge';
  summary: string;
  considerations: WireConsiderationItem[];  // always 8 items; use is_present to filter
  flags?: WireRadicalityFlag[];             // canonical typed list; only triggered flags
}

// Single Moon aspect in the lunar sequence.
export interface WireMoonAspect {
  aspect_type: string;
  event_order: number;
  is_applying: boolean;
  orb: number;
  planet: string;
  crosses_sign_boundary?: boolean;
  degrees_to_perfection?: number | null;
  is_to_quesited?: boolean;
  perfection_sign?: string | null;
}

export interface WireMoonLastAspect {
  planet: string;
  aspect_type: string;
  context_meaning: string;
  separation_degrees: number;
}

export interface WireInterveningAnalysis {
  benefic_aspects: number;
  challenging_aspects: number;
  harmonious_aspects: number;
  malefic_aspects: number;
  path_character: 'direct' | 'supported' | 'challenged' | 'mixed';
  sign_changes: number;
  total_intervening: number;
  intervening_events?: WireMoonAspect[];
}

export interface WireLunarSequence {
  is_void_of_course: boolean;
  moon_sign?: string;              // 3-letter abbreviation
  moon_longitude?: number;         // 0-360
  degrees_to_sign_change?: number;
  voc_exception_sign?: string | null;   // Tau | Can | Sag | Pis (Lilly exception signs)
  voc_effective_strength?: 'full' | 'mitigated' | null;
  applying_aspects?: WireMoonAspect[];
  last_aspect?: WireMoonLastAspect | null;
  moon_to_quesited?: WireMoonAspect | null;
  extended_mode?: boolean;
  max_lookahead_degrees?: number;
  quesited_position?: number | null;
  intervening_analysis?: WireInterveningAnalysis | null;
  intervening_events?: WireMoonAspect[];
}

export interface WireJudgment {
  answer: string;               // yes | no | unclear | reask_later
  confidence?: number;          // 0-100
  confidence_band?: ConfidenceBand;
  reasoning?: string;
  interpretation?: string | null;  // localized text; preferred over reasoning for display
  voc_treatment?: 'full_negation' | 'mitigated' | 'ignored_due_to_aspect' | 'not_applicable';
  key_factors?: string[];
  testimony_score?: { positive: number; negative: number; neutral: number };
  voc_considered?: boolean;
  engine_overrides_applied?: string[];
  timing?: Record<string, unknown> | null;
}

export interface WireTiming {
  time_unit: 'days' | 'weeks' | 'months' | 'years';
  value: number;
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  based_on: string;
  explanation: string;
}

export interface WireTranslation {
  has_translation: boolean;
  translator: string | null;
  separated_from: string | null;
  applying_to: string | null;
  separation_aspect: string | null;
  applying_aspect: string | null;
  separation_orb: number | null;
  degrees_to_perfection: number | null;
  quality: string | null;
  reason: string | null;
}

export interface WireCollection {
  has_collection: boolean;
  collector: string | null;
  querent_aspect: string | null;
  quesited_aspect: string | null;
  querent_degrees: number | null;
  quesited_degrees: number | null;
  quality: string | null;
  reason: string | null;
}

export interface WireProhibition {
  has_prohibition: boolean;
  prohibitor: string | null;
  prohibits_which: string | null;
  prohibition_aspect: string | null;
  prohibitor_degrees: number | null;
  main_aspect_degrees: number | null;
  prohibitor_nature: string | null;
  severity: string | null;
  reason: string | null;
}

export interface WireFrustration {
  has_frustration: boolean;
  frustrated_planet: string | null;
  degrees_to_sign_change: number | null;
  degrees_to_perfection: number | null;
  frustration_type: string | null;  // e.g. 'leaves_sign'
  reason: string | null;
}

export interface WireSecondaryPerfection {
  translation: WireTranslation;
  collection: WireCollection;
  prohibition: WireProhibition;
  frustration: WireFrustration;
  enables_perfection: boolean;
  prevents_perfection: boolean;
  has_direct_aspect: boolean;
  summary: string;
}

// Reception analysis between significators.
export interface WireReceptionAnalysis {
  has_mutual_reception: boolean;
  has_one_way_reception: boolean;
  reception_type: string | null;  // e.g. 'mutual_domicile'
  description: string;
}

// Planetary position inside chart_data.
export interface WirePlanetaryPosition {
  name: string;
  sign: string;              // 3-letter abbreviation
  degree: number;            // degree within sign (0-29.99)
  absolute_longitude: number; // 0-360
  house: number;             // 1-12
  is_retrograde: boolean;
}

// chart_data — confirmed structure from live API response.
export interface WireChartData {
  subject_data: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  house_system: string;          // e.g. 'R' (Regiomontanus)
  ascendant_sign: string;        // 3-letter abbreviation
  planetary_positions: WirePlanetaryPosition[];
  house_cusps: Record<string, string>; // {"1": "Can", "2": "Leo", ...}
}

// Full response from POST /horary/analyze (and base shape for /horary/ask).
export interface HoraryAnalysisResponse {
  question?: string;
  category: string;
  subcategory?: string | null;
  judgment: WireJudgment;
  significators?: WireSignificator[];
  lunar_analysis?: WireLunarSequence;
  radicality?: WireRadicality;
  aspect_perfections?: WireAspectPerfection[];
  reception_analysis?: WireReceptionAnalysis;
  secondary_perfection?: WireSecondaryPerfection | null;
  timing?: WireTiming[] | null;
  turned_for?: string | null;
  chart_data?: WireChartData;
}

// Request metadata included in every response envelope.
export interface WireRequestMetadata {
  timestamp: string;
  calculation_time_ms: number;
  api_version: string;
  endpoint: string;
  request_id: string;
  cache_hit: boolean;
  cache_age_seconds: number | null;
  credits_used: number;
  server_location: string | null;
  calculation_method: string | null;
}

// Full response envelope — wraps data + metadata.
export interface HoraryAnalysisEnvelope {
  success: boolean;
  data: HoraryAnalysisResponse;
  metadata?: WireRequestMetadata;
  warnings?: unknown[] | null;
  pagination?: unknown | null;
}

// ── Wire model: /horary/ask (AI auto-classify variant) ──────────────────────

export interface WireAIAnswer {
  plain_answer: string;
  summary: string;
  recommendation: string;
}

export interface WireAIClassification {
  category: string;
  subcategory: string;
  subject_role: string;
  transformed_intent?: string;
  is_horary_appropriate: boolean;
  rejection_reason?: string | null;
  confidence: number;
  reasoning?: string;
  detected_language?: string;
  alternatives?: { category: string; subcategory: string; confidence: number }[] | null;
  warnings?: string[];
}

// Minimal request body for POST /horary/ask — no category required (AI auto-classifies).
// Costs 10 credits vs 1 credit for /analyze — not suitable as the default MVP endpoint.
export interface AskHoraryApiRequest {
  question: string;
  question_time: DateTimeLocation;
  options?: { language?: string | null };
  chart_options?: { zodiac_type?: ZodiacType };
}

// /ask response adds AI fields on top of the standard analysis response.
export interface AskHoraryResponse extends HoraryAnalysisResponse {
  ai_answer: WireAIAnswer;
  ai_classification: WireAIClassification;
}

export interface AskHoraryEnvelope {
  success: boolean;
  data: AskHoraryResponse;
}

// ── Wire model: /horary/aspects ──────────────────────────────────────────────

export interface WireApplyingAspect {
  planet1: string;
  planet2: string;
  aspect_type: string;
  degrees_to_perfection: number;
  orb: number;
  applying_planet: string;    // the faster/approaching planet
  receiving_planet: string;
  perfection_sign: string;    // 3-letter abbreviation
  is_applying: boolean;
  p1_retrograde: boolean;
  p2_retrograde: boolean;
}

export interface WireIngress {
  planet: string;
  from_sign: string;
  to_sign: string;
  degrees_to_ingress: number;
  estimated_days: number;
}

export interface HoraryAspectsResponse {
  applying_aspects: WireApplyingAspect[];
  count: number;
  max_lookahead_degrees: number;
  planets_used: string[];
  chart_time: string;
  ingresses?: WireIngress[] | null;
  separating_aspects?: WireApplyingAspect[] | null;
  stations?: unknown[] | null;  // station schema not fully documented
}

// ── Wire model: /horary/fertility-analysis ───────────────────────────────────

export interface WireFertilitySignAnalysis {
  sign: string;
  fertility: 'fruitful' | 'semi-fruitful' | 'barren';
  weight: number;
  importance: 'primary' | 'high' | 'medium' | 'low';
}

export interface WireArabicPart {
  name: string;
  sign: string;
  degree: number;
  absolute_longitude: number;
  house: number;
  interpretation?: string | null;
}

export interface WireFifthHouseAnalysis {
  cusp_sign: string;
  ruler: string;
  ruler_sign: string;
  ruler_dignity: string;
}

export interface WireFertilityAnalysisResponse {
  question?: string;
  fertility_score: number;        // 0-100
  answer: 'favorable' | 'challenging' | 'mixed' | 'unclear';
  sign_fertility_analysis: Record<string, WireFertilitySignAnalysis>;
  arabic_parts: WireArabicPart[];
  fifth_house_analysis: WireFifthHouseAnalysis;
  interpretation: string;
  radicality: WireRadicality;
  lunar_analysis?: WireLunarSequence | null;
  timing_windows?: unknown[] | null;
  significator_aspects?: unknown | null;
  planetary_future_aspects?: WireApplyingAspect[] | null;
}

// ── Wire model: /horary/glossary/categories ──────────────────────────────────

export interface WireCategoryGlossary {
  category: string;
  display_name: string;
  houses: number[];
  house_names: string[];
  significators: string[];
  significator_meanings: Record<string, string>;
  description: string;
  subcategories?: Record<string, unknown>;
}

export interface CategoriesGlossaryResponse {
  categories: WireCategoryGlossary[];
  total: number;
}

// ── Wire model: /horary/glossary/considerations ──────────────────────────────

export interface WireConsiderationGlossary {
  name: string;
  display_name: string;
  traditional_meaning: string;
  threshold: string;
  severity: 'high' | 'medium' | 'low';
  weight: number;
  exception?: string;
  description: string;
}

export interface ConsiderationsGlossaryResponse {
  considerations: WireConsiderationGlossary[];
  total: number;
  source: string;
}
