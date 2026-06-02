// src/types/horary.ts
// TypeScript interfaces for the horary API contract.
// No 'any' types — all fields explicitly typed.
//
// Two layers:
//   • App model — HoraryRequest / HoraryResponse / SignificatorData. Used by
//     screens, journal and the mock. Stable internal shape.
//   • Wire model — HoraryAnalysisRequest / HoraryAnalysisResponse and friends.
//     The real POST /api/v3/horary/analyze contract. Mapped to/from the app
//     model in horaryMapper.ts so the rest of the app never sees wire shapes.

import type { HoraryCategory } from '@/constants/config';

export type { HoraryCategory };
export type VerdictType = 'YES' | 'NO' | 'MAYBE' | 'UNCLEAR';
export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface SignificatorData {
  planet: string;
  role: 'querent' | 'quesited' | 'moon' | string;
  sign: string;
  house: number;
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | null;
  retrograde: boolean;
  aspect?: string | null;
}

export interface HoraryRequest {
  question: string;
  category: HoraryCategory;
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
  voc_moon: boolean;
  voc_treatment?: string;
  // Radicality: false means the chart is not fit for judgment (→ reask later).
  // undefined means the API did not return a radicality block (old data).
  is_radical?: boolean;
  radicality_summary?: string;
  chart_time: string;
  location_display?: string;
}

export interface HoraryAPIError {
  code: 'NETWORK_ERROR' | 'API_4XX' | 'API_5XX' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  originalStatus?: number;
  originalMessage?: string;
}

// ── Wire model: POST /api/v3/horary/analyze ─────────────────────────────────
// Only the fields the app reads/writes are typed; the real schema is larger.

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
}

export interface HoraryAnalysisRequest {
  question?: string;
  category: HoraryCategory;
  question_time: DateTimeLocation;
  include_timing?: boolean;
  options?: { language?: string };
}

export interface WireDignityInfo {
  sign?: string;
  essential_dignity?: string;
  accidental_conditions?: string[];
}

export interface WireSignificator {
  role: string;
  planet: string;
  house: number;
  reason?: string;
  dignity_info?: WireDignityInfo;
}

export interface WireJudgment {
  answer: string; // 'yes' | 'no' | 'unclear' | 'reask_later'
  confidence?: number;
  confidence_band?: ConfidenceBand;
  reasoning?: string;
  interpretation?: string | null;
  voc_treatment?: string;
}

export interface WireLunarSequence {
  is_void_of_course?: boolean;
}

export interface WireRadicality {
  is_radical: boolean;
  summary?: string;
  recommendation?: string; // 'proceed' | 'caution' | 'refuse'
}

export interface HoraryAnalysisResponse {
  question?: string;
  category: string;
  judgment: WireJudgment;
  significators?: WireSignificator[];
  lunar_analysis?: WireLunarSequence;
  radicality?: WireRadicality;
}

// The live API wraps every payload in a success envelope; the analysis lives
// under `data`. (The OpenAPI schema documents only the inner `data` shape.)
export interface HoraryAnalysisEnvelope {
  success: boolean;
  data: HoraryAnalysisResponse;
}
