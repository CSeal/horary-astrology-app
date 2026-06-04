// src/types/journal.ts
import type {
  VerdictType,
  ConfidenceBand,
  SignificatorData,
  AspectPerfectionData,
  ReadingTiming,
} from '@/types/horary';

// Re-exported under the documented name; structurally identical to ReadingTiming.
export type JournalTiming = ReadingTiming;

export interface JournalEntry {
  id: string;
  question: string;
  verdict: VerdictType;
  confidence_band: ConfidenceBand;
  summary: string;
  significators: SignificatorData[];
  voc_moon: boolean;
  voc_treatment?: string;
  is_radical?: boolean;
  radicality_summary?: string;
  // Phase 1.5 — richer verdict data. All optional for backward compatibility
  // with entries saved before these fields existed.
  radicality_score?: number;
  aspects?: AspectPerfectionData[];
  timing?: JournalTiming;
  voc_moon_sign?: string;
  voc_degrees_to_sign_change?: number;
  voc_next_sign?: string;
  voc_exception_sign?: string | null;
  // Phase 2a — outcome tracking. Optional for backward compatibility with
  // entries saved before this field existed.
  outcome?: 'came_true' | 'did_not_happen' | 'pending' | null;
  timestamp: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}
