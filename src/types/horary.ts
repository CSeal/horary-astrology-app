// src/types/horary.ts
// TypeScript interfaces for the horary API contract.
// No 'any' types — all fields explicitly typed.

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
