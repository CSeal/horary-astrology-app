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
  WireSignificator,
  WireRadicality,
} from '@/types/horary';

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
    aspect: null,
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
    voc_moon: raw.lunar_analysis?.is_void_of_course ?? false,
    voc_treatment: judgment?.voc_treatment,
    is_radical,
    radicality_summary,
    chart_time: request.timestamp,
    location_display: locationDisplay,
  };
}
