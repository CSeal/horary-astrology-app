// ============================================================================
// endpoints/chart.ts
// POST /api/v3/horary/chart   (2 credits)
// Generate a basic horary chart (Regiomontanus by default).
// ============================================================================

import type { ChartOptions } from "../chart-options";
import type { DateTimeLocation } from "../datetime-location";
import type { HoraryOptions } from "../options";
import type { HouseSystemCode, SignAbbr } from "../common";
import type { ArabicPart, ChartData, EssentialDignity } from "../shared-models";

export interface HoraryChartRequest {
  /** Date/time/location when the question was understood. Required. */
  question_time: DateTimeLocation;
  /** Chart calculation options. Defaults to Regiomontanus ("R"). */
  chart_options?: ChartOptions | null;
  /** Output language/formatting options. */
  options?: HoraryOptions | null;
  /** @deprecated Legacy field — accepted for compatibility but NOT used in calculation. */
  question?: string | null;
}

/** 200 — Successful horary chart generation. */
export interface HoraryChartResponse {
  question: string;
  chart_data: ChartData;
  house_system: HouseSystemCode;
  ascendant_sign: SignAbbr;
  dignities: EssentialDignity[];
  arabic_parts: ArabicPart[];
}
