// ============================================================================
// chart-options.ts
// Chart calculation options shared by all POST horary endpoints.
// ============================================================================

import type {
  ActivePoint,
  Ayanamsa,
  HouseSystemCode,
  Perspective,
  ZodiacType,
} from "./common";

/** A custom aspect orb configuration item for SVG/render output. */
export interface ActiveAspectConfig {
  /** Aspect name, e.g. "conjunction", "trine". */
  name: string;
  /** Orb in degrees. */
  orb: number;
}

/** Fixed stars configuration (used across endpoints). */
export interface FixedStarsConfig {
  /** Preset combinations, e.g. ["essential"], ["essential","traditional"], ["behenian"]. */
  presets?: string[];
  /** Include parans data. */
  include_parans?: boolean;
}

/**
 * Chart calculation options.
 * Defaults to Regiomontanus house system ("R") which is traditional for horary.
 */
export interface ChartOptions {
  /** Custom aspect configuration with orbs for SVG/render output. */
  active_aspects?: ActiveAspectConfig[] | null;
  /** List of celestial points to include. */
  active_points?: ActivePoint[];
  /** Ayanamsa (precession correction). Only valid when zodiac_type = "Sidereal". */
  ayanamsa?: Ayanamsa | null;
  /** Fixed stars configuration. */
  fixed_stars?: FixedStarsConfig | null;
  /** Points to exclude from aspect calculations and the aspect grid. */
  hide_points_in_aspects?: ActivePoint[] | null;
  /** House system. Defaults to Regiomontanus ("R") for horary. */
  house_system?: HouseSystemCode;
  /** Include declination data + parallel/contraparallel aspects. Default false. */
  include_declinations?: boolean;
  /** Astronomical calculation perspective. Default "geocentric". */
  perspective?: Perspective | null;
  /** Number of decimal places for degree values (0-8). */
  precision?: number;
  /** Alternative date (YYYY-MM-DD) for return calculations. */
  return_date?: string | null;
  /** Year for solar return calculations. */
  return_year?: number | null;
  /** Target date (YYYY-MM-DD) for progression calculations. */
  target_date?: string | null;
  /** Use cached calculations if available. Default true. */
  use_cache?: boolean;
  /** Zodiac type. "Tropic" (Western) or "Sidereal" (Vedic). Default "Tropic". */
  zodiac_type?: ZodiacType;
}
