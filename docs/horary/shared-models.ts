// ============================================================================
// shared-models.ts
// Domain models reused across multiple horary response payloads.
// ============================================================================

import type {
  AccidentalCondition,
  AspectType,
  ConfidenceBand,
  EssentialDignityState,
  HouseSystemCode,
  JudgmentAnswer,
  Recommendation,
  SignAbbr,
  SignName,
  TimeUnit,
  TraditionalPlanet,
  VocEffectiveStrength,
  VocTreatment,
} from "./common";

/** Essential + accidental dignity for a planet. */
export interface EssentialDignity {
  planet: TraditionalPlanet;
  sign: SignAbbr;
  /** Planet ruling the sign (domicile ruler). */
  domicile_ruler: string;
  essential_dignity: EssentialDignityState;
  dignity_score: number;
  accidental_conditions: AccidentalCondition[];
}

/** An Arabic Part / Lot placement. */
export interface ArabicPart {
  /** e.g. "Part of Fortune", "Part of Children". */
  name: string;
  sign: SignAbbr;
  degree: number;
  absolute_longitude: number;
  house: number;
}

/** A significator (planet representing a party/topic in the question). */
export interface Significator {
  /** e.g. "querent", "quesited". */
  role: string;
  planet: TraditionalPlanet;
  /** Why this planet was chosen, e.g. "Lord of 1st house (Ascendant ruler)". */
  reason: string;
  house: number;
  /** Optional dignity details (shape varies / may be null). */
  dignity_info?: EssentialDignity | null;
}

/** Weighted testimony tally feeding the judgment. */
export interface TestimonyScore {
  positive: number;
  negative: number;
  neutral: number;
}

/** Timing estimate based on perfecting aspects. */
export interface HoraryTiming {
  time_unit: TimeUnit;
  value: number;
  confidence: ConfidenceBand;
  /** Basis of the estimate, e.g. "Mars-Sun trine perfection". */
  based_on: string;
  explanation?: string;
}

/** Radicality (fitness for judgment) result. */
export interface Radicality {
  is_radical: boolean;
  score: number;
  recommendation: Recommendation;
  /** Triggered considerations (present in some endpoints). */
  considerations?: string[];
  /** Short human summary (present in /ask). */
  summary?: string;
  /** Raised flags (present in /ask). */
  flags?: string[];
}

/** Base judgment block. */
export interface Judgment {
  answer: JudgmentAnswer;
  /** Numeric confidence (0-100). */
  confidence: number;
  reasoning: string;
  key_factors: string[];
  testimony_score: TestimonyScore;
  timing?: HoraryTiming | null;
}

/** Extended judgment block returned by /horary/ask. */
export interface AskJudgment extends Judgment {
  confidence_band: ConfidenceBand;
  interpretation?: string;
  voc_considered?: boolean;
  voc_treatment?: VocTreatment;
  engine_overrides_applied?: string[];
}

/** A single applying/separating aspect between two planets. */
export interface PlanetaryAspect {
  planet1: TraditionalPlanet;
  planet2: TraditionalPlanet;
  aspect_type: AspectType;
  /** Degrees until the aspect becomes exact. */
  degrees_to_perfection: number;
  orb: number;
  applying_planet: TraditionalPlanet;
  receiving_planet: TraditionalPlanet;
  /** Sign where the aspect perfects. */
  perfection_sign: SignAbbr;
  is_applying: boolean;
  p1_retrograde: boolean;
  p2_retrograde: boolean;
}

/** Aspect perfection record used in lunar/secondary analysis. */
export interface AspectPerfection {
  planet1: TraditionalPlanet;
  planet2: TraditionalPlanet;
  aspect_type: AspectType;
  orb: number;
  is_applying: boolean;
  will_perfect: boolean;
  degrees_to_perfection: number;
}

/** Moon analysis as co-significator. */
export interface LunarAnalysis {
  moon_longitude: number;
  moon_sign: SignName;
  degrees_to_sign_change: number;
  is_void_of_course: boolean;
  voc_exception_sign: SignAbbr | null;
  voc_effective_strength: VocEffectiveStrength;
  applying_aspects: AspectPerfection[];
  last_aspect: AspectPerfection | null;
  moon_to_quesited: AspectPerfection | null;
  extended_mode: boolean;
  max_lookahead_degrees: number;
}

/** Secondary perfection methods (translation/collection/prohibition/frustration). */
export interface SecondaryPerfection {
  translation: AspectPerfection | null;
  collection: AspectPerfection | null;
  prohibition: AspectPerfection | null;
  frustration: AspectPerfection | null;
  enables_perfection: boolean;
  prevents_perfection: boolean;
  has_direct_aspect: boolean;
  summary?: string;
}

/** Chart data block: house cusps keyed by house number "1".."12". */
export type HouseCusps = Record<
  "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12",
  SignAbbr
>;

/** Underlying chart data (full chart payload; some fields endpoint-specific). */
export interface ChartData {
  subject_data: ChartSubjectData | null;
  house_system: HouseSystemCode;
  ascendant_sign: SignAbbr;
  /** Planetary positions (shape depends on active_points / options). */
  planetary_positions?: unknown;
  house_cusps?: HouseCusps;
  /** Set when subject_role turns the chart (derived chart). */
  turned_for?: string;
}

export interface ChartSubjectData {
  name: string;
  year: number;
  month: number;
  day: number;
  [key: string]: unknown;
}
