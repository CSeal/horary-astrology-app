// ============================================================================
// datetime-location.ts
// Date/time/location input shared by all POST horary endpoints.
// ============================================================================

/**
 * Date, time and location for the moment the question was understood
 * (the chart's reference moment).
 *
 * Location resolution: EITHER \`city\` (with recommended \`country_code\`)
 * OR the pair (\`latitude\` + \`longitude\`) must be supplied.
 */
export interface DateTimeLocation {
  /** Day of the event (1-31). Required. */
  day: number;
  /** Hour of the event (0-23). Required. */
  hour: number;
  /** Minute of the event (0-59). Required. */
  minute: number;
  /** Month of the event (1-12). Required. */
  month: number;
  /** Year of the event (e.g., 1990). Required. */
  year: number;

  /** City name for automatic coordinate/timezone lookup. Required unless lat+lon supplied. */
  city?: string | null;
  /** ISO 3166-1 alpha-2 country code. Strongly recommended alongside \`city\`. */
  country_code?: string | null;
  /** Latitude (-90..90), positive = North. Required unless \`city\` supplied; pair with longitude. */
  latitude?: number | null;
  /** Longitude (-180..180), positive = East. Required unless \`city\` supplied; pair with latitude. */
  longitude?: number | null;
  /** Second of the event (0-59). Optional, default 0. */
  second?: number;
  /** TZ Database name (e.g., "Europe/London"). Auto-resolved from city or lat/lon if omitted. */
  timezone?: string | null;
}

/** Location supplied by city name. */
export type DateTimeLocationByCity = DateTimeLocation &
  Required<Pick<DateTimeLocation, "city">>;

/** Location supplied by explicit coordinates. */
export type DateTimeLocationByCoords = DateTimeLocation &
  Required<Pick<DateTimeLocation, "latitude" | "longitude">>;
