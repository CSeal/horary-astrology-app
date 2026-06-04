// src/services/mockHoraryApi.ts
// Stubbed horary response for the developer debug mode. Lets QA exercise the
// full UI flow (form → loading → VerdictCard → journal) without consuming API
// quota or needing a network connection. Activated via DebugSheet → mockMode.
//
// horaryApi.ts stays clean — the real/mock switch lives in useHoraryQuery.

import type {
  HoraryRequest,
  HoraryResponse,
  VerdictType,
  ConfidenceBand,
  SignificatorData,
  AspectPerfectionData,
  ReadingTiming,
} from '@/types/horary';

const MOCK_DELAY_MS = 600;

const CONFIDENCE_BY_VERDICT: Record<VerdictType, ConfidenceBand> = {
  YES: 'high',
  NO: 'high',
  MAYBE: 'medium',
  UNCLEAR: 'low',
};

const SCORE_BY_VERDICT: Record<VerdictType, number> = {
  YES: 78,
  NO: 32,
  MAYBE: 58,
  UNCLEAR: 24,
};

function buildAspects(verdict: VerdictType): AspectPerfectionData[] {
  return [
    {
      planet1: 'Moon',
      planet2: 'Venus',
      aspect_type: 'sextile',
      is_applying: true,
      orb: 2.5,
      will_perfect: verdict !== 'NO',
      degrees_to_perfection: 2.5,
    },
    {
      planet1: 'Jupiter',
      planet2: 'Sun',
      aspect_type: 'trine',
      is_applying: verdict === 'YES',
      orb: 4.17,
      will_perfect: verdict === 'YES',
      degrees_to_perfection: 4.17,
    },
    {
      planet1: 'Moon',
      planet2: 'Saturn',
      aspect_type: 'square',
      is_applying: true,
      orb: 6,
      will_perfect: verdict === 'NO',
      degrees_to_perfection: 6,
    },
    {
      planet1: 'Sun',
      planet2: 'Mars',
      aspect_type: 'sextile',
      is_applying: false,
      orb: 3.33,
      will_perfect: false,
      degrees_to_perfection: null,
    },
  ];
}

const TIMING_BY_VERDICT: Record<VerdictType, ReadingTiming | undefined> = {
  YES: {
    time_unit: 'weeks',
    value: 3,
    explanation:
      '[MOCK] Jupiter perfects its trine to the Sun in 4°10′. In a cardinal sign and angular house, each degree counts as days-to-weeks.',
  },
  NO: undefined,
  MAYBE: {
    time_unit: 'months',
    value: 2,
    explanation:
      '[MOCK] The applying aspect is wide and the Moon is slow — expect the matter to unfold gradually.',
  },
  UNCLEAR: undefined,
};

const SUMMARY_BY_VERDICT: Record<VerdictType, string> = {
  YES: '[MOCK] The significators apply by a strong applying trine — the matter resolves favourably.',
  NO: '[MOCK] The significators separate and the Moon is impeded — the matter does not come to pass.',
  MAYBE: '[MOCK] Mixed testimony — the outcome depends on conditions outside the querent.',
  UNCLEAR: '[MOCK] The chart is not radical enough to judge — ask again later.',
};

function buildSignificators(verdict: VerdictType): SignificatorData[] {
  return [
    {
      planet: 'Mars',
      role: 'querent',
      sign: 'Aries',
      house: 1,
      dignity: 'domicile',
      retrograde: false,
      aspect: verdict === 'YES' ? 'trine' : 'square',
    },
    {
      planet: 'Venus',
      role: 'quesited',
      sign: 'Libra',
      house: 7,
      dignity: 'domicile',
      retrograde: verdict === 'NO',
      aspect: verdict === 'YES' ? 'trine' : null,
    },
    {
      planet: 'Moon',
      role: 'moon',
      sign: 'Cancer',
      house: 4,
      dignity: verdict === 'UNCLEAR' ? 'peregrine' : 'exaltation',
      retrograde: false,
      aspect: null,
    },
  ];
}

export const mockHoraryApi = {
  ask(request: HoraryRequest, verdict: VerdictType): Promise<HoraryResponse> {
    const response: HoraryResponse = {
      id: `mock-${Date.now()}`,
      verdict,
      confidence_band: CONFIDENCE_BY_VERDICT[verdict],
      summary: SUMMARY_BY_VERDICT[verdict],
      significators: buildSignificators(verdict),
      aspects: buildAspects(verdict),
      voc_moon: verdict === 'UNCLEAR',
      voc_treatment:
        verdict === 'UNCLEAR'
          ? '[MOCK] Void-of-course Moon — nothing will come of the matter.'
          : undefined,
      radicality_score: SCORE_BY_VERDICT[verdict],
      timing: TIMING_BY_VERDICT[verdict],
      ...(verdict === 'UNCLEAR'
        ? {
            voc_moon_sign: 'Cancer 26°',
            voc_degrees_to_sign_change: 4,
            voc_next_sign: 'Leo',
            voc_exception_sign: 'Cancer',
          }
        : {}),
      chart_time: request.timestamp,
      location_display: '[MOCK] Test Location',
    };
    return new Promise((resolve) =>
      setTimeout(() => resolve(response), MOCK_DELAY_MS)
    );
  },
};
