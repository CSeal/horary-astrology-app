// src/types/journal.ts
import type { VerdictType, ConfidenceBand, SignificatorData } from '@/types/horary';

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
  timestamp: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}
