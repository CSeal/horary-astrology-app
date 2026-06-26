// ============================================================================
// endpoints/analyze.ts
// POST /api/v3/horary/analyze   (2 credits)
// Full horary analysis with judgment (radicality, significators, perfection,
// reception, lunar analysis, final judgment, optional timing).
// ============================================================================

import type { ChartOptions } from "../chart-options";
import type { DateTimeLocation } from "../datetime-location";
import type { HoraryOptions } from "../options";
import type { Judgment, Radicality, Significator, HoraryTiming } from "../shared-models";

/** Question categories (main values). API may accept additional ones. */
export type HoraryCategory =
  | "pregnancy" | "fertility" | "love" | "marriage" | "career" | "job"
  | "money" | "health" | "missing_item" | "travel";

/** Whose chart this is (Lilly's derived/turned charts). Default "self". */
export type SubjectRole =
  | "self"
  | "spouse_partner"
  | "third_party_parent"
  | "third_party_sibling"
  | "third_party_child"
  | "third_party_employer"
  | "third_party_friend"
  | "third_party_enemy"
  | "third_party_other";

export interface HoraryAnalyzeRequest {
  /** Question category for significator selection. Required. */
  category: HoraryCategory;
  /** Date/time/location when the question was understood. Required. */
  question_time: DateTimeLocation;
  /** Chart calculation options. Defaults to Regiomontanus ("R"). */
  chart_options?: ChartOptions | null;
  /** Extended lunar sequence (45° lookahead). Default true. */
  extended_lunar_sequence?: boolean;
  /** Include timing predictions. Default true. */
  include_timing?: boolean;
  /** Max degrees ahead for lunar sequence. Default 45. */
  max_lookahead_degrees?: number;
  /** Output language/formatting options. */
  options?: HoraryOptions | null;
  /** @deprecated Legacy field — accepted for compatibility but NOT used in calculation. */
  question?: string | null;
  /** Specific sub-question within the category (e.g. "marriage", "get_job"). */
  subcategory?: string | null;
  /** Whose chart this is. Default "self". */
  subject_role?: SubjectRole;
}

/** 200 — Successful horary analysis with judgment. */
export interface HoraryAnalyzeResponse {
  question: string;
  category: HoraryCategory;
  subcategory: string | null;
  radicality: Radicality;
  significators: Significator[];
  judgment: Judgment;
  timing?: HoraryTiming | null;
}
