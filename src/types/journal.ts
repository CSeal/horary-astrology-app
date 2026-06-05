// src/types/journal.ts
import type {
  VerdictType,
  ConfidenceBand,
  SignificatorData,
  AspectPerfectionData,
  ReadingTiming,
  HoraryResponse,
} from '@/types/horary';
import type { HoraryCategory } from '@/constants/config';

// Re-exported under the documented name; structurally identical to ReadingTiming.
export type JournalTiming = ReadingTiming;

// Phase 2b — chart wheel data. Drives the SVG horary chart wheel render.
export interface ChartPlanet {
  name: string;
  absoluteLongitude: number;
  isRetrograde: boolean;
  house: number;
}

export interface ChartWheelData {
  ascendantSign: string;         // 3-letter abbrev e.g. 'Can'
  houseSigns: string[];          // 12 elements, houseSigns[0] = house 1 sign (3-letter)
  planets: ChartPlanet[];
}

export interface JournalEntry {
  id: string;
  question: string;
  category?: HoraryCategory;
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
  // Phase 2b — chart wheel render data. Optional for backward compatibility
  // with entries saved before this field existed.
  chart_wheel?: ChartWheelData;
  // Phase 2c — full API coverage. All optional for backward compatibility.
  reception?: HoraryResponse['reception'];
  perfectionPath?: HoraryResponse['perfectionPath'];
  keyFactors?: string[];
  radicalityFlags?: HoraryResponse['radicalityFlags'];
  moonToQuesited?: HoraryResponse['moonToQuesited'];
  interveningPathCharacter?: HoraryResponse['interveningPathCharacter'];
  testimonyScore?: { positive: number; negative: number; neutral: number };
  timestamp: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}
