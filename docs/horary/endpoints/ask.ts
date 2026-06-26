// ============================================================================
// endpoints/ask.ts
// POST /api/v3/horary/ask   (10 credits — AI classify + summarize)
// Natural-language question (max 500 chars). The API classifies it via AI
// into the appropriate category/subcategory, runs the full analysis, and
// returns a plain-language answer. Language auto-detected from the question.
// ============================================================================

import type { ChartOptions } from "../chart-options";
import type { DateTimeLocation } from "../datetime-location";
import type { AskHoraryOptions } from "../options";
import type {
  AskJudgment,
  ChartData,
  LunarAnalysis,
  Radicality,
  Significator,
  SecondaryPerfection,
  AspectPerfection,
  HoraryTiming,
} from "../shared-models";
import type { HoraryCategory, SubjectRole } from "./analyze";

export interface AskHoraryRequest {
  /** Natural-language horary question (1-500 chars). Required. */
  question: string;
  /** Date/time/location when the question was understood. Required. */
  question_time: DateTimeLocation;
  /** Chart calculation options. Defaults to Regiomontanus ("R"). */
  chart_options?: ChartOptions | null;
  /** Options incl. classifier controls + forced output language. */
  options?: AskHoraryOptions | null;
}

/** Why a question is not appropriate for horary, when flagged. */
export type AskRejectionReason = "hypothetical" | "out_of_scope" | "ambiguous" | (string & {});

/** AI classification of the natural-language question. */
export interface AskAiClassification {
  category: string;
  subcategory: string;
  subject_role: SubjectRole;
  /** The question rewritten as a clean horary intent. */
  transformed_intent: string;
  is_horary_appropriate: boolean;
  rejection_reason?: AskRejectionReason | null;
  /** Classifier confidence (0..1). */
  confidence: number;
  reasoning: string;
  /** Detected language code of the input question. */
  detected_language: string;
  /** Alternative classifications considered. */
  alternatives?: Record<string, unknown>;
  warnings?: string[];
}

/** Plain-language AI answer derived from the analysis. */
export interface AskAiAnswer {
  plain_answer: string;
  summary: string;
  recommendation: string;
}

/** 200 — Successful response with full analysis + AI answer. */
export interface AskHoraryResponse {
  category: HoraryCategory | string;
  subcategory: string | null;
  radicality: Radicality;
  significators: Significator[];
  aspect_perfections: AspectPerfection[];
  lunar_analysis: LunarAnalysis;
  /** Position info for the quesited (shape varies). */
  quesited_position?: unknown;
  intervening_events?: unknown[];
  intervening_analysis?: unknown | null;
  /** Mutual reception / dispositorship details. */
  reception_analysis?: Record<string, unknown>;
  judgment: AskJudgment;
  timing?: HoraryTiming | null;
  secondary_perfection?: SecondaryPerfection;
  chart_data: ChartData;
  ai_classification: AskAiClassification;
  ai_answer: AskAiAnswer;
}
