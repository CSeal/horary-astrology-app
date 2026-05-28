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
} from '../types/horary';

const MOCK_DELAY_MS = 600;

const CONFIDENCE_BY_VERDICT: Record<VerdictType, ConfidenceBand> = {
  YES: 'high',
  NO: 'high',
  MAYBE: 'medium',
  UNCLEAR: 'low',
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
      voc_moon: verdict === 'UNCLEAR',
      voc_treatment:
        verdict === 'UNCLEAR'
          ? '[MOCK] Void-of-course Moon — nothing will come of the matter.'
          : undefined,
      chart_time: request.timestamp,
      location_display: '[MOCK] Test Location',
    };
    return new Promise((resolve) =>
      setTimeout(() => resolve(response), MOCK_DELAY_MS)
    );
  },
};
