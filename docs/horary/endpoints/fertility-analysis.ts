// ============================================================================
// endpoints/fertility-analysis.ts
// POST /api/v3/horary/fertility-analysis   (2 credits)
// Specialized pregnancy/fertility analysis.
// ============================================================================

import type { ChartOptions } from "../chart-options";
import type { DateTimeLocation } from "../datetime-location";
import type { HoraryOptions } from "../options";
import type { FertilityLevel, ImportanceLevel, SignAbbr, EssentialDignityState } from "../common";
import type { ArabicPart, Radicality } from "../shared-models";

export interface FertilityAnalysisRequest {
  /** Date/time/location when the question was understood. Required. */
  question_time: DateTimeLocation;
  /** Chart calculation options. Defaults to Regiomontanus ("R"). */
  chart_options?: ChartOptions | null;
  /** Extended lunar sequence (45° lookahead, 10-22 aspects). Default true. */
  extended_lunar_sequence?: boolean;
  /** Include all planetary aspects (use /horary/aspects for full). Default false. */
  include_all_planetary_aspects?: boolean;
  /** Include conception timing windows. Default true. */
  include_timing?: boolean;
  /** Max degrees ahead for lunar sequence. Default 45. */
  max_lookahead_degrees?: number;
  /** Output language/formatting options. */
  options?: HoraryOptions | null;
  /** @deprecated Legacy field — accepted for compatibility but NOT used in calculation. */
  question?: string | null;
}

export interface SignFertilityEntry {
  sign: SignAbbr;
  fertility: FertilityLevel;
  weight: number;
  importance: ImportanceLevel;
}

export interface FifthHouseAnalysis {
  cusp_sign: SignAbbr;
  ruler: string;
  ruler_sign: SignAbbr;
  ruler_dignity: EssentialDignityState;
}

/** Overall favorability of the fertility question. */
export type FertilityAnswer = "favorable" | "unfavorable" | "neutral";

export interface SignFertilityAnalysis {
  moon: SignFertilityEntry;
  fifth_house: SignFertilityEntry;
  [key: string]: SignFertilityEntry;
}

/** 200 — Successful fertility analysis. */
export interface FertilityAnalysisResponse {
  question: string;
  /** Overall fertility score (0-100). */
  fertility_score: number;
  answer: FertilityAnswer;
  sign_fertility_analysis: SignFertilityAnalysis;
  arabic_parts: ArabicPart[];
  fifth_house_analysis: FifthHouseAnalysis;
  /** Narrative interpretation of fertility indications. */
  interpretation: string;
  radicality: Radicality;
}
