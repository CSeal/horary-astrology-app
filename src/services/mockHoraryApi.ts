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
    confidence: 'high',
    basedOn: '[MOCK] Moon applying to Jupiter by trine',
  },
  NO: undefined,
  MAYBE: {
    time_unit: 'months',
    value: 2,
    explanation:
      '[MOCK] The applying aspect is wide and the Moon is slow — expect the matter to unfold gradually.',
    confidence: 'low',
    basedOn: '[MOCK] Wide applying aspect with a slow Moon',
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
      accidentalConditions: ['angular'],
      aspect: verdict === 'YES' ? 'trine' : 'square',
    },
    {
      planet: 'Venus',
      role: 'quesited',
      sign: 'Libra',
      house: 7,
      dignity: 'domicile',
      retrograde: verdict === 'NO',
      accidentalConditions: verdict === 'NO' ? ['combust'] : ['cazimi'],
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

const RECEPTION_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['reception']>
> = {
  YES: {
    hasMutual: true,
    hasOneWay: false,
    type: 'mutual_domicile',
    description:
      "[MOCK] Jupiter in Cancer (Moon's domicile) and Moon in Pisces (Jupiter's domicile) — mutual reception by domicile.",
  },
  NO: {
    hasMutual: false,
    hasOneWay: true,
    type: 'one_way_exaltation',
    description:
      '[MOCK] Saturn receives Mars by exaltation, but Mars offers nothing in return — one-way reception.',
  },
  MAYBE: {
    hasMutual: false,
    hasOneWay: true,
    type: 'one_way_triplicity',
    description:
      '[MOCK] Venus receives the Moon by triplicity — a mild, one-way reception.',
  },
  UNCLEAR: {
    hasMutual: false,
    hasOneWay: false,
    type: null,
    description: '[MOCK] No reception between the significators.',
  },
};

const PERFECTION_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['perfectionPath']>
> = {
  YES: {
    enablesPerfection: true,
    preventsPerfection: false,
    hasDirectAspect: true,
    summary:
      '[MOCK] Direct applying trine between Moon and Jupiter (3.2°) perfects the question.',
  },
  NO: {
    enablesPerfection: false,
    preventsPerfection: true,
    hasDirectAspect: false,
    summary:
      '[MOCK] Prohibition: Saturn perfects its square before the main aspect can complete.',
  },
  MAYBE: {
    enablesPerfection: true,
    preventsPerfection: false,
    hasDirectAspect: false,
    summary:
      '[MOCK] Translation of light via Venus enables the aspect to perfect, though indirectly.',
  },
  UNCLEAR: {
    enablesPerfection: false,
    preventsPerfection: false,
    hasDirectAspect: false,
    summary: '[MOCK] No clear path to perfection in this chart.',
  },
};

const KEY_FACTORS_BY_VERDICT: Record<VerdictType, string[]> = {
  YES: [
    '[MOCK] Moon applies to Jupiter by trine (3.2°) — strong applying aspect',
    '[MOCK] Jupiter in Cancer — exaltation, strong and dignified',
    '[MOCK] Moon as querent significator in angular house',
  ],
  NO: [
    '[MOCK] Significators separating — the matter is past its peak',
    '[MOCK] Saturn prohibits the perfecting aspect',
    '[MOCK] Quesited significator combust the Sun',
  ],
  MAYBE: [
    '[MOCK] Perfection only via translation of light — conditional',
    '[MOCK] Mixed testimony from the benefics and malefics',
  ],
  UNCLEAR: [
    '[MOCK] Chart not radical — testimony cannot be trusted',
  ],
};

const RADICALITY_FLAGS_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['radicalityFlags']>
> = {
  YES: [],
  NO: [
    {
      name: 'saturn_in_7th',
      severity: 'moderate',
      message: '[MOCK] Saturn in 7th house — caution on the astrologer',
    },
  ],
  MAYBE: [
    {
      name: 'late_ascendant',
      severity: 'severe',
      message: '[MOCK] Late Ascendant (28°) — question may be premature',
    },
    {
      name: 'saturn_in_7th',
      severity: 'moderate',
      message: '[MOCK] Saturn in 7th house — caution on the astrologer',
    },
    {
      name: 'via_combusta_moon',
      severity: 'mild',
      message: '[MOCK] Moon in Via Combusta — turbulent matter',
    },
  ],
  UNCLEAR: [
    {
      name: 'moon_voc',
      severity: 'severe',
      message: '[MOCK] Moon void of course — nothing comes of the matter',
    },
  ],
};

const MOON_TO_QUESITED_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['moonToQuesited']> | undefined
> = {
  YES: {
    aspectType: 'trine',
    planet: 'Jupiter',
    degreesToPerfection: 3.2,
    isApplying: true,
  },
  NO: {
    aspectType: 'square',
    planet: 'Saturn',
    degreesToPerfection: 5.4,
    isApplying: true,
  },
  MAYBE: {
    aspectType: 'sextile',
    planet: 'Venus',
    degreesToPerfection: null,
    isApplying: false,
  },
  UNCLEAR: undefined,
};

const PATH_CHARACTER_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['interveningPathCharacter']> | undefined
> = {
  YES: 'supported',
  NO: 'challenged',
  MAYBE: 'mixed',
  UNCLEAR: undefined,
};

const TESTIMONY_SCORE_BY_VERDICT: Record<
  VerdictType,
  NonNullable<HoraryResponse['testimonyScore']>
> = {
  YES: { positive: 7, negative: 2, neutral: 1 },
  NO: { positive: 2, negative: 6, neutral: 2 },
  MAYBE: { positive: 4, negative: 4, neutral: 3 },
  UNCLEAR: { positive: 3, negative: 3, neutral: 4 },
};

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
      reception: RECEPTION_BY_VERDICT[verdict],
      perfectionPath: PERFECTION_BY_VERDICT[verdict],
      keyFactors: KEY_FACTORS_BY_VERDICT[verdict],
      radicalityFlags: RADICALITY_FLAGS_BY_VERDICT[verdict],
      moonToQuesited: MOON_TO_QUESITED_BY_VERDICT[verdict],
      interveningPathCharacter: PATH_CHARACTER_BY_VERDICT[verdict],
      testimonyScore: TESTIMONY_SCORE_BY_VERDICT[verdict],
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
