// ============================================================================
// endpoints/aspects.ts
// POST /api/v3/horary/aspects   (2 credits)
// All applying aspects between the traditional 7 planets, with
// degrees_to_perfection. Essential for event timing.
// ============================================================================

import type { ChartOptions } from "../chart-options";
import type { DateTimeLocation } from "../datetime-location";
import type { TraditionalPlanet } from "../common";
import type { PlanetaryAspect } from "../shared-models";

export interface HoraryAspectsRequest {
  /** Date/time/location for aspect calculation. Required. */
  question_time: DateTimeLocation;
  /** Chart calculation options. Defaults to Regiomontanus ("R"). */
  chart_options?: ChartOptions | null;
  /** Include sign ingresses (planet entering new sign). Default true. */
  include_ingresses?: boolean;
  /** Include separating aspects in addition to applying. Default false. */
  include_separating?: boolean;
  /** Include planetary stations (R/D changes; Sun/Moon excluded). Default true. */
  include_stations?: boolean;
  /** Max degrees ahead to search for applying aspects. Default 45. */
  max_lookahead_degrees?: number;
  /** Max days ahead to search for stations (<= 730). Default 365. */
  max_station_days?: number;
  /** Filter to specific planets. null = all 7 traditional planets. */
  planets?: TraditionalPlanet[] | null;
}

/** 200 — Planetary aspects with degrees to perfection. */
export interface HoraryAspectsResponse {
  applying_aspects: PlanetaryAspect[];
  count: number;
  max_lookahead_degrees: number;
  planets_used: TraditionalPlanet[];
  /** ISO timestamp of the chart moment, e.g. "2026-01-15T07:49:00+03:00". */
  chart_time: string;
}
