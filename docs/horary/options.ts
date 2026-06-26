// ============================================================================
// options.ts
// Output/formatting + classifier options.
// ============================================================================

import type { LanguageCode } from "./common";

/** Output language/formatting options for horary analysis requests. */
export interface HoraryOptions {
  /** Language for interpretations and messages (en, de, ru, fr, ...). */
  language?: LanguageCode;
}

/** Options for /horary/ask. Extends HoraryOptions with classifier controls. */
export interface AskHoraryOptions extends Omit<HoraryOptions, "language"> {
  /** Minimum confidence for the AI classifier (0..1). Default 0.7. */
  classification_threshold?: number;
  /** Force output language for the AI answer; null = auto-detect from question. */
  language?: LanguageCode | null;
}
