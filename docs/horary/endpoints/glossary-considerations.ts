// ============================================================================
// endpoints/glossary-considerations.ts
// GET /api/v3/horary/glossary/considerations   (2 credits)
// The 8 traditional considerations before judgment (chart radicality).
// No request body / query params.
// ============================================================================

import type { SeverityLevel } from "../common";

export interface HoraryConsideration {
  /** Machine name, e.g. "early_ascendant". */
  name: string;
  /** Human-readable name, e.g. "Early Ascendant". */
  display_name: string;
  /** Traditional meaning of the consideration. */
  traditional_meaning: string;
  /** Trigger criteria, e.g. "Less than 3° of sign". */
  threshold: string;
  severity: SeverityLevel;
  /** Importance weighting (numeric). */
  weight: number;
  /** Plain description. */
  description: string;
  /** Optional exception note (e.g. Moon void of course in certain signs). */
  exception?: string;
}

/** 200 — Reference for the 8 traditional considerations before judgment. */
export interface GetConsiderationsGlossaryResponse {
  considerations: HoraryConsideration[];
  /** Total number of considerations (8). */
  total: number;
  /** Source attribution, e.g. William Lilly's "Christian Astrology". */
  source: string;
}
