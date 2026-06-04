// src/services/horaryMapper.ts
// Pure mapping between the app model and the real wire contract of
// POST /api/v3/horary/analyze. Kept separate from horaryApi.ts (transport) so
// the mapping is trivially unit-testable with no axios/network involved.

import type {
  HoraryRequest,
  HoraryResponse,
  HoraryAnalysisRequest,
  HoraryAnalysisResponse,
  VerdictType,
  ConfidenceBand,
  SignificatorData,
  AspectPerfectionData,
  ReadingTiming,
  WireSignificator,
  WireRadicality,
  WireAspectPerfection,
  WireLunarSequence,
  WireTiming,
  WireChartData,
  WireReceptionAnalysis,
  WireSecondaryPerfection,
} from '@/types/horary';
import type { ChartWheelData } from '@/types/journal';
import { expandSign, nextSign } from '@/constants/zodiac';

// Wire judgment.answer → app verdict.
// 'reask_later' maps to UNCLEAR (same badge) but sets is_radical=false so the
// UI can show a distinct "chart not radical — ask again later" banner.
const VERDICT_BY_ANSWER: Record<string, VerdictType> = {
  yes: 'YES',
  no: 'NO',
  unclear: 'UNCLEAR',
  reask_later: 'UNCLEAR',
};

const ESSENTIAL_DIGNITIES: SignificatorData['dignity'][] = [
  'domicile',
  'exaltation',
  'detriment',
  'fall',
  'peregrine',
];

function toVerdict(answer: string | undefined): VerdictType {
  return VERDICT_BY_ANSWER[(answer ?? '').toLowerCase()] ?? 'UNCLEAR';
}

// A chart is "not radical" when the API says reask_later (engine-level refusal)
// OR when the radicality block explicitly marks it as non-radical.
function resolveRadicality(
  answer: string | undefined,
  radicality: WireRadicality | undefined
): { is_radical: boolean; radicality_summary: string | undefined } {
  const notRadicalFromAnswer = (answer ?? '').toLowerCase() === 'reask_later';
  const notRadicalFromBlock = radicality?.is_radical === false;
  const is_radical = !notRadicalFromAnswer && !notRadicalFromBlock;
  return {
    is_radical,
    radicality_summary: !is_radical ? radicality?.summary : undefined,
  };
}

function toDignity(essential: string | undefined): SignificatorData['dignity'] {
  const match = ESSENTIAL_DIGNITIES.find((d) => d === essential);
  return match ?? null;
}

function mapSignificator(s: WireSignificator): SignificatorData {
  const dignityInfo = s.dignity_info;
  return {
    planet: s.planet,
    role: s.role,
    sign: dignityInfo?.sign ?? '',
    house: s.house,
    dignity: toDignity(dignityInfo?.essential_dignity),
    retrograde: dignityInfo?.accidental_conditions?.includes('retrograde') ?? false,
    accidentalConditions: dignityInfo?.accidental_conditions,
    aspect: null,
  };
}

function mapAspect(a: WireAspectPerfection): AspectPerfectionData {
  return {
    planet1: a.planet1,
    planet2: a.planet2,
    aspect_type: a.aspect_type,
    is_applying: a.is_applying,
    orb: a.orb,
    will_perfect: a.will_perfect,
    degrees_to_perfection: a.degrees_to_perfection,
  };
}

// First timing window → simplified app timing. The teaser/estimate label is
// rendered from time_unit + value at display time so it stays localized.
function mapTiming(timing: WireTiming[] | null | undefined): ReadingTiming | undefined {
  const first = timing?.[0];
  if (!first) return undefined;
  return {
    time_unit: first.time_unit,
    value: first.value,
    explanation: first.explanation ?? '',
    confidence: first.confidence,
    basedOn: first.based_on || undefined,
  };
}

function mapReception(
  r: WireReceptionAnalysis | undefined
): HoraryResponse['reception'] | undefined {
  if (!r) return undefined;
  if (!r.has_mutual_reception && !r.has_one_way_reception) return undefined;
  return {
    hasMutual: r.has_mutual_reception,
    hasOneWay: r.has_one_way_reception,
    type: r.reception_type ?? null,
    description: r.description,
  };
}

function mapPerfectionPath(
  s: WireSecondaryPerfection | null | undefined
): HoraryResponse['perfectionPath'] | undefined {
  if (!s) return undefined;
  if (!s.summary) return undefined;
  return {
    enablesPerfection: s.enables_perfection,
    preventsPerfection: s.prevents_perfection,
    hasDirectAspect: s.has_direct_aspect,
    summary: s.summary,
  };
}

// Radicality flags for the UI. Prefer the typed `flags` list — it carries
// show_to_client (astrologer-only flags must not surface) but no human message,
// so the message is borrowed from the matching consideration. Fall back to the
// legacy considerations[] (filtered by is_present) when flags are absent.
function mapRadicalityFlags(
  r: WireRadicality | undefined
): HoraryResponse['radicalityFlags'] | undefined {
  if (!r) return undefined;
  if (r.flags?.length) {
    const visible = r.flags.filter((f) => f.show_to_client);
    if (!visible.length) return undefined;
    return visible.map((f) => {
      const consideration = r.considerations?.find((c) => c.name === f.type);
      return {
        name: f.type,
        severity: f.severity,
        message: consideration?.message ?? f.type,
      };
    });
  }
  if (!r.considerations?.length) return undefined;
  const triggered = r.considerations
    .filter((c) => c.is_present)
    .map((c) => ({
      name: c.name,
      severity: (c.severity === 'high'
        ? 'severe'
        : c.severity === 'medium'
          ? 'moderate'
          : 'mild') as 'severe' | 'moderate' | 'mild',
      message: c.message,
    }));
  return triggered.length ? triggered : undefined;
}

function mapMoonToQuesited(
  lunar: WireLunarSequence | undefined
): HoraryResponse['moonToQuesited'] | undefined {
  const m = lunar?.moon_to_quesited;
  if (!m) return undefined;
  return {
    aspectType: m.aspect_type,
    planet: m.planet,
    degreesToPerfection: m.degrees_to_perfection ?? null,
    isApplying: m.is_applying,
  };
}

// Void-of-course Moon detail for the rich verdict banner. Returns an empty
// object when the Moon is not void or the lunar block is absent.
function mapVocDetail(
  lunar: WireLunarSequence | undefined
): Pick<
  HoraryResponse,
  | 'voc_moon_sign'
  | 'voc_degrees_to_sign_change'
  | 'voc_next_sign'
  | 'voc_exception_sign'
> {
  if (!lunar?.is_void_of_course) return {};
  const signName = expandSign(lunar.moon_sign);
  // Degree within the current sign, derived from the absolute longitude.
  const degreeInSign =
    lunar.moon_longitude != null
      ? Math.floor(((lunar.moon_longitude % 30) + 30) % 30)
      : undefined;
  const signDisplay =
    signName != null
      ? degreeInSign != null
        ? `${signName} ${degreeInSign}°`
        : signName
      : undefined;
  return {
    voc_moon_sign: signDisplay,
    voc_degrees_to_sign_change: lunar.degrees_to_sign_change,
    voc_next_sign: nextSign(lunar.moon_sign),
    voc_exception_sign: expandSign(lunar.voc_exception_sign ?? undefined) ?? null,
  };
}

// chart_data → ChartWheelData for the SVG chart wheel. house_cusps is a
// string-keyed map ("1".."12"); sorting numerically yields the 12 signs in
// house order.
export function mapChartWheel(raw: WireChartData): ChartWheelData {
  return {
    ascendantSign: raw.ascendant_sign,
    houseSigns: Object.keys(raw.house_cusps)
      .sort((a, b) => +a - +b)
      .map((k) => raw.house_cusps[k]),
    planets: raw.planetary_positions.map((p) => ({
      name: p.name,
      absoluteLongitude: p.absolute_longitude,
      isRetrograde: p.is_retrograde,
      house: p.house,
    })),
  };
}

// Client-side id: the wire response carries no stable id, but the journal keys
// entries by it. Time + randomness is collision-safe for a single device.
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// App request → wire request. Local wall-clock components come from the device
// (timezone is always device-derived), paired with lat/lon/timezone so the
// engine can cast the chart.
export function buildAnalysisRequest(
  request: HoraryRequest,
  language: string,
  zodiacType: 'Tropic' | 'Sidereal' = 'Tropic'
): HoraryAnalysisRequest {
  const dt = new Date(request.timestamp);
  return {
    question: request.question,
    category: request.category,
    ...(request.subcategory ? { subcategory: request.subcategory } : {}),
    ...(request.subject_role && request.subject_role !== 'self'
      ? { subject_role: request.subject_role }
      : {}),
    question_time: {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: dt.getSeconds(),
      latitude: request.latitude,
      longitude: request.longitude,
      timezone: request.timezone,
    },
    ...(zodiacType !== 'Tropic'
      ? { chart_options: { zodiac_type: zodiacType } }
      : {}),
    include_timing: true,
    options: { language },
  };
}

// Wire response → app response. Defensive against missing optional blocks so a
// partial payload never throws.
export function normalizeAnalysisResponse(
  raw: HoraryAnalysisResponse,
  request: HoraryRequest,
  locationDisplay?: string
): HoraryResponse {
  const judgment = raw.judgment;
  const { is_radical, radicality_summary } = resolveRadicality(
    judgment?.answer,
    raw.radicality
  );
  return {
    id: generateId(),
    verdict: toVerdict(judgment?.answer),
    confidence_band: (judgment?.confidence_band as ConfidenceBand) ?? 'low',
    summary: judgment?.interpretation ?? judgment?.reasoning ?? '',
    significators: (raw.significators ?? []).map(mapSignificator),
    aspects: (raw.aspect_perfections ?? []).map(mapAspect),
    voc_moon: raw.lunar_analysis?.is_void_of_course ?? false,
    voc_treatment: judgment?.voc_treatment,
    is_radical,
    radicality_summary,
    radicality_score: raw.radicality?.score,
    timing: mapTiming(raw.timing),
    ...mapVocDetail(raw.lunar_analysis),
    chart_wheel: raw.chart_data ? mapChartWheel(raw.chart_data) : undefined,
    reception: mapReception(raw.reception_analysis),
    perfectionPath: mapPerfectionPath(raw.secondary_perfection),
    keyFactors: judgment?.key_factors?.length ? judgment.key_factors : undefined,
    radicalityFlags: mapRadicalityFlags(raw.radicality),
    moonToQuesited: mapMoonToQuesited(raw.lunar_analysis),
    interveningPathCharacter:
      raw.lunar_analysis?.intervening_analysis?.path_character,
    testimonyScore: judgment?.testimony_score ?? undefined,
    chart_time: request.timestamp,
    location_display: locationDisplay,
  };
}
