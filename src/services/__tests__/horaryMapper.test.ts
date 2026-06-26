// src/services/__tests__/horaryMapper.test.ts
// Covers the app↔wire mapping: request builder (timestamp → DateTimeLocation,
// category, language) and response normalizer (verdict/confidence/voc/
// significator mapping, defensive defaults, client id).

import {
  buildAnalysisRequest,
  normalizeAnalysisResponse,
  mapChartWheel,
} from '@/services/horaryMapper';
import type {
  HoraryRequest,
  HoraryAnalysisResponse,
  WireChartData,
} from '@/types/horary';

const baseRequest: HoraryRequest = {
  question: 'Will the deal close?',
  category: 'career',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
  timestamp: '2026-05-28T09:30:00.000Z',
};

describe('buildAnalysisRequest', () => {
  it('splits the timestamp into local DateTimeLocation components', () => {
    const dt = new Date(baseRequest.timestamp);
    const out = buildAnalysisRequest(baseRequest, 'en');
    // Compared against the same local getters → timezone-independent.
    expect(out.question_time).toMatchObject({
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: dt.getSeconds(),
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    });
  });

  it('forwards category, question, language and include_timing', () => {
    const out = buildAnalysisRequest(baseRequest, 'ru');
    expect(out.category).toBe('career');
    expect(out.question).toBe('Will the deal close?');
    expect(out.options?.language).toBe('ru');
    expect(out.include_timing).toBe(true);
  });

  it('includes subcategory when provided', () => {
    const out = buildAnalysisRequest({ ...baseRequest, subcategory: 'romantic' }, 'en');
    expect(out.subcategory).toBe('romantic');
  });

  it('omits subcategory when not provided', () => {
    const out = buildAnalysisRequest(baseRequest, 'en');
    expect(out.subcategory).toBeUndefined();
  });

  it('includes subject_role when provided and not "self"', () => {
    const out = buildAnalysisRequest({ ...baseRequest, subject_role: 'third_party_friend' }, 'en');
    expect((out as any).subject_role).toBe('third_party_friend');
  });

  it('omits subject_role when it equals "self"', () => {
    const out = buildAnalysisRequest({ ...baseRequest, subject_role: 'self' }, 'en');
    expect((out as any).subject_role).toBeUndefined();
  });

  it('includes chart_options when zodiacType is Sidereal', () => {
    const out = buildAnalysisRequest(baseRequest, 'en', 'Sidereal');
    expect((out as any).chart_options).toEqual({ zodiac_type: 'Sidereal' });
  });

  it('omits chart_options when zodiacType is Tropic (default)', () => {
    const out = buildAnalysisRequest(baseRequest, 'en', 'Tropic');
    expect((out as any).chart_options).toBeUndefined();
  });
});

function wireResponse(
  overrides: Partial<HoraryAnalysisResponse> = {}
): HoraryAnalysisResponse {
  return {
    category: 'career',
    judgment: {
      answer: 'yes',
      confidence_band: 'high',
      reasoning: 'Reasoning text.',
      interpretation: 'Localized interpretation.',
      voc_treatment: 'not_applicable',
    },
    significators: [],
    lunar_analysis: { is_void_of_course: false },
    ...overrides,
  };
}

describe('normalizeAnalysisResponse', () => {
  it.each([
    ['yes', 'YES'],
    ['no', 'NO'],
    ['unclear', 'UNCLEAR'],
    ['reask_later', 'UNCLEAR'],
    ['nonsense', 'UNCLEAR'],
  ])('maps judgment.answer "%s" → verdict %s', (answer, verdict) => {
    const raw = wireResponse({
      judgment: { answer, confidence_band: 'medium', reasoning: 'r' },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).verdict).toBe(verdict);
  });

  it('prefers interpretation over reasoning for the summary', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(out.summary).toBe('Localized interpretation.');
  });

  it('falls back to reasoning when interpretation is null', () => {
    const raw = wireResponse({
      judgment: {
        answer: 'no',
        confidence_band: 'low',
        reasoning: 'Reasoning text.',
        interpretation: null,
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).summary).toBe(
      'Reasoning text.'
    );
  });

  it('maps voc_moon and voc_treatment from the wire payload', () => {
    const raw = wireResponse({
      judgment: {
        answer: 'no',
        confidence_band: 'high',
        reasoning: 'r',
        voc_treatment: 'full_negation',
      },
      lunar_analysis: { is_void_of_course: true },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.voc_moon).toBe(true);
    expect(out.voc_treatment).toBe('full_negation');
  });

  it('maps significators including sign, dignity and retrograde', () => {
    const raw = wireResponse({
      significators: [
        {
          role: 'querent',
          planet: 'Mars',
          house: 1,
          dignity_info: {
            sign: 'Ari',
            essential_dignity: 'domicile',
            accidental_conditions: ['retrograde', 'combust'],
          },
        },
        {
          role: 'quesited',
          planet: 'Venus',
          house: 7,
          dignity_info: {
            sign: 'Lib',
            essential_dignity: 'not_a_real_dignity',
            accidental_conditions: [],
          },
        },
      ],
    });
    const [querent, quesited] = normalizeAnalysisResponse(
      raw,
      baseRequest
    ).significators;
    expect(querent).toMatchObject({
      planet: 'Mars',
      role: 'querent',
      sign: 'Ari',
      house: 1,
      dignity: 'domicile',
      retrograde: true,
      accidentalConditions: ['retrograde', 'combust'],
    });
    // Unknown essential dignity → null; no retrograde condition → false.
    expect(quesited.dignity).toBeNull();
    expect(quesited.retrograde).toBe(false);
  });

  it('is defensive: missing significators/lunar default to [] and false', () => {
    const raw = {
      category: 'general',
      judgment: { answer: 'yes', confidence_band: 'high', reasoning: 'r' },
    } as HoraryAnalysisResponse;
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.significators).toEqual([]);
    expect(out.voc_moon).toBe(false);
  });

  it('defaults confidence_band to "low" when absent', () => {
    const raw = wireResponse({
      judgment: { answer: 'unclear', reasoning: 'r' },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).confidence_band).toBe(
      'low'
    );
  });

  it('clamps the API 5-band confidence scale into the UI 3-band scale', () => {
    const band = (b: string) =>
      normalizeAnalysisResponse(
        wireResponse({ judgment: { answer: 'yes', confidence_band: b as never, reasoning: 'r' } }),
        baseRequest
      ).confidence_band;
    expect(band('very_high')).toBe('high');
    expect(band('very_low')).toBe('low');
    expect(band('medium')).toBe('medium');
    // Unknown/garbage bands fall back to 'low' rather than leaking through.
    expect(band('bananas')).toBe('low');
  });

  it('generates a non-empty string id and echoes chart_time', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(typeof out.id).toBe('string');
    expect(out.id.length).toBeGreaterThan(0);
    expect(out.chart_time).toBe(baseRequest.timestamp);
  });

  // ── Phase 1.5 — richer verdict fields ──

  it('maps radicality.score → radicality_score', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 58,
        recommendation: 'proceed_with_caution',
        summary: 'Borderline.',
        considerations: [],
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).radicality_score).toBe(58);
  });

  it('maps aspect_perfections → aspects', () => {
    const raw = wireResponse({
      aspect_perfections: [
        {
          planet1: 'Moon',
          planet2: 'Venus',
          aspect_type: 'sextile',
          is_applying: true,
          orb: 2.5,
          will_perfect: true,
          degrees_to_perfection: 2.5,
        },
      ],
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.aspects).toHaveLength(1);
    expect(out.aspects?.[0]).toMatchObject({
      planet1: 'Moon',
      planet2: 'Venus',
      aspect_type: 'sextile',
      is_applying: true,
      degrees_to_perfection: 2.5,
    });
  });

  it('maps the first timing window → timing', () => {
    const raw = wireResponse({
      timing: [
        {
          time_unit: 'weeks',
          value: 3,
          confidence: 'medium',
          based_on: 'perfection',
          explanation: 'Perfects in 4°.',
        },
        {
          time_unit: 'months',
          value: 1,
          confidence: 'low',
          based_on: 'fallback',
          explanation: 'Secondary.',
        },
      ],
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.timing).toEqual({
      time_unit: 'weeks',
      value: 3,
      explanation: 'Perfects in 4°.',
      confidence: 'medium',
      basedOn: 'perfection',
    });
  });

  it('leaves timing undefined when the wire timing array is empty/absent', () => {
    expect(normalizeAnalysisResponse(wireResponse(), baseRequest).timing).toBeUndefined();
    const raw = wireResponse({ timing: [] });
    expect(normalizeAnalysisResponse(raw, baseRequest).timing).toBeUndefined();
  });

  it('expands voc detail (sign+degree, next sign, exception) when the Moon is void', () => {
    const raw = wireResponse({
      lunar_analysis: {
        is_void_of_course: true,
        moon_sign: 'Tau',
        moon_longitude: 56, // 26° of Taurus (30..60)
        degrees_to_sign_change: 4,
        voc_exception_sign: 'Tau',
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.voc_moon_sign).toBe('Taurus 26°');
    expect(out.voc_degrees_to_sign_change).toBe(4);
    expect(out.voc_next_sign).toBe('Gemini');
    expect(out.voc_exception_sign).toBe('Taurus');
  });

  it('omits voc detail when the Moon is not void', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(out.voc_moon_sign).toBeUndefined();
    expect(out.voc_next_sign).toBeUndefined();
  });

  // ── Phase 2b — chart wheel ──

  it('omits chart_wheel when chart_data is absent', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(out.chart_wheel).toBeUndefined();
  });

  it('maps chart_data → chart_wheel when present', () => {
    const raw = wireResponse({ chart_data: chartData() });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.chart_wheel?.ascendantSign).toBe('Can');
    expect(out.chart_wheel?.houseSigns).toHaveLength(12);
  });

  // ── Phase 2c — full API coverage ──

  it('omits reception when no mutual/one-way reception present', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(out.reception).toBeUndefined();
    const raw = wireResponse({
      reception_analysis: {
        has_mutual_reception: false,
        has_one_way_reception: false,
        reception_type: null,
        description: 'No reception.',
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).reception).toBeUndefined();
  });

  it('maps reception when mutual or one-way reception is present', () => {
    const raw = wireResponse({
      reception_analysis: {
        has_mutual_reception: true,
        has_one_way_reception: false,
        reception_type: 'mutual_domicile',
        description: 'Mutual reception by domicile.',
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).reception).toEqual({
      hasMutual: true,
      hasOneWay: false,
      type: 'mutual_domicile',
      description: 'Mutual reception by domicile.',
    });
  });

  it('omits perfectionPath when secondary_perfection is null or summary empty', () => {
    expect(
      normalizeAnalysisResponse(wireResponse(), baseRequest).perfectionPath
    ).toBeUndefined();
    const raw = wireResponse({
      secondary_perfection: {
        translation: emptyTranslation(),
        collection: emptyCollection(),
        prohibition: emptyProhibition(),
        frustration: emptyFrustration(),
        enables_perfection: false,
        prevents_perfection: false,
        has_direct_aspect: false,
        summary: '',
      },
    });
    expect(
      normalizeAnalysisResponse(raw, baseRequest).perfectionPath
    ).toBeUndefined();
  });

  it('maps perfectionPath when secondary_perfection has a summary', () => {
    const raw = wireResponse({
      secondary_perfection: {
        translation: emptyTranslation(),
        collection: emptyCollection(),
        prohibition: emptyProhibition(),
        frustration: emptyFrustration(),
        enables_perfection: true,
        prevents_perfection: false,
        has_direct_aspect: true,
        summary: 'Translation of light by Mercury.',
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).perfectionPath).toEqual({
      enablesPerfection: true,
      preventsPerfection: false,
      hasDirectAspect: true,
      summary: 'Translation of light by Mercury.',
    });
  });

  it('maps key_factors → keyFactors and omits when empty', () => {
    const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
    expect(out.keyFactors).toBeUndefined();
    const raw = wireResponse({
      judgment: {
        answer: 'yes',
        confidence_band: 'high',
        reasoning: 'r',
        key_factors: ['Applying trine', 'Strong querent'],
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).keyFactors).toEqual([
      'Applying trine',
      'Strong querent',
    ]);
  });

  it('maps radicalityFlags from the typed flags list, filtering show_to_client', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 70,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [
          {
            name: 'late_ascendant',
            is_present: true,
            severity: 'medium',
            message: 'Ascendant in late degrees.',
            value: 28,
          },
        ],
        flags: [
          {
            type: 'late_ascendant',
            severity: 'moderate',
            show_to_client: true,
            weight_applied: 1,
          },
          {
            type: 'ascendant_ruler_combust',
            severity: 'severe',
            show_to_client: false,
            weight_applied: 2,
          },
        ],
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.radicalityFlags).toEqual([
      {
        name: 'late_ascendant',
        severity: 'moderate',
        message: 'Ascendant in late degrees.',
      },
    ]);
  });

  it('falls back to considerations for radicalityFlags when flags are absent', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 65,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [
          {
            name: 'early_ascendant',
            is_present: true,
            severity: 'high',
            message: 'Too early to judge.',
            value: 2,
          },
          {
            name: 'moon_voc',
            is_present: false,
            severity: 'low',
            message: 'Moon not void.',
            value: null,
          },
        ],
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).radicalityFlags).toEqual([
      {
        name: 'early_ascendant',
        severity: 'severe',
        message: 'Too early to judge.',
      },
    ]);
  });

  it('omits radicalityFlags when none are present/visible', () => {
    expect(
      normalizeAnalysisResponse(wireResponse(), baseRequest).radicalityFlags
    ).toBeUndefined();
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 80,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [
          {
            name: 'moon_voc',
            is_present: false,
            severity: 'low',
            message: 'Not void.',
            value: null,
          },
        ],
        flags: [],
      },
    });
    expect(
      normalizeAnalysisResponse(raw, baseRequest).radicalityFlags
    ).toBeUndefined();
  });

  it('omits moonToQuesited when absent and maps it when present', () => {
    expect(
      normalizeAnalysisResponse(wireResponse(), baseRequest).moonToQuesited
    ).toBeUndefined();
    const raw = wireResponse({
      lunar_analysis: {
        is_void_of_course: false,
        moon_to_quesited: {
          aspect_type: 'trine',
          event_order: 1,
          is_applying: true,
          orb: 3,
          planet: 'Jupiter',
          degrees_to_perfection: 3,
        },
        intervening_analysis: {
          benefic_aspects: 1,
          challenging_aspects: 0,
          harmonious_aspects: 1,
          malefic_aspects: 0,
          path_character: 'supported',
          sign_changes: 0,
          total_intervening: 1,
        },
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.moonToQuesited).toEqual({
      aspectType: 'trine',
      planet: 'Jupiter',
      degreesToPerfection: 3,
      isApplying: true,
    });
    expect(out.interveningPathCharacter).toBe('supported');
  });

  describe('testimony_score mapping', () => {
    it('passes testimony_score through when present', () => {
      const score = { positive: 5, negative: 2, neutral: 1 };
      const raw = wireResponse({
        judgment: {
          answer: 'yes',
          confidence_band: 'high',
          reasoning: 'r',
          testimony_score: score,
        },
      });
      expect(normalizeAnalysisResponse(raw, baseRequest).testimonyScore).toEqual(
        score
      );
    });

    it('returns undefined when testimony_score absent', () => {
      const out = normalizeAnalysisResponse(wireResponse(), baseRequest);
      expect(out.testimonyScore).toBeUndefined();
    });
  });

  // ── Missing branch coverage ──

  it('maps significator with no dignity_info → empty sign, null dignity, false retrograde', () => {
    const raw = wireResponse({
      significators: [
        { role: 'querent', planet: 'Saturn', house: 10 },
      ],
    });
    const [sig] = normalizeAnalysisResponse(raw, baseRequest).significators;
    expect(sig.sign).toBe('');
    expect(sig.dignity).toBeNull();
    expect(sig.retrograde).toBe(false);
  });

  it('maps significator with null accidental_conditions → retrograde: false', () => {
    const raw = wireResponse({
      significators: [
        {
          role: 'querent',
          planet: 'Mars',
          house: 1,
          dignity_info: { sign: 'Ari', essential_dignity: 'domicile', accidental_conditions: undefined },
        },
      ],
    });
    const [sig] = normalizeAnalysisResponse(raw, baseRequest).significators;
    expect(sig.retrograde).toBe(false);
  });

  it('maps timing with missing explanation → empty string; falsy based_on → basedOn undefined', () => {
    const raw = wireResponse({
      timing: [
        {
          time_unit: 'days',
          value: 5,
          confidence: 'high',
          based_on: '',
          explanation: '',
        },
      ],
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.timing?.explanation).toBe('');
    expect(out.timing?.basedOn).toBeUndefined();
  });

  it('maps reception with null reception_type → type: null', () => {
    const raw = wireResponse({
      reception_analysis: {
        has_mutual_reception: true,
        has_one_way_reception: false,
        reception_type: undefined as any,
        description: 'Mutual reception.',
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.reception?.type).toBeNull();
  });

  it('maps radicalityFlags: flag with no matching consideration falls back to f.type as message', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 70,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [],
        flags: [
          { type: 'ascendant_ruler_combust', severity: 'moderate', show_to_client: true, weight_applied: 1 },
        ],
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.radicalityFlags?.[0].message).toBe('ascendant_ruler_combust');
  });

  it('maps radicalityFlags: flag with undefined considerations array falls back to f.type', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 70,
        recommendation: 'proceed',
        summary: 'OK.',
        // intentionally omit considerations — tests mapper resilience with old API responses
        flags: [
          { type: 'late_ascendant', severity: 'mild', show_to_client: true, weight_applied: 1 },
        ],
      } as any,
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.radicalityFlags?.[0].message).toBe('late_ascendant');
  });

  it('maps radicalityFlags: low severity consideration → "mild"', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 90,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [
          { name: 'minor_flag', is_present: true, severity: 'low', message: 'Minor issue.', value: null },
        ],
      },
    });
    const flags = normalizeAnalysisResponse(raw, baseRequest).radicalityFlags;
    expect(flags?.[0].severity).toBe('mild');
  });

  it('omits radicalityFlags when all flags have show_to_client: false', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 70,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [],
        flags: [
          { type: 'moon_voc', severity: 'severe', show_to_client: false, weight_applied: 1 },
        ],
      },
    });
    expect(normalizeAnalysisResponse(raw, baseRequest).radicalityFlags).toBeUndefined();
  });

  it('maps moonToQuesited with null degrees_to_perfection → degreesToPerfection: null', () => {
    const raw = wireResponse({
      lunar_analysis: {
        is_void_of_course: false,
        moon_to_quesited: {
          aspect_type: 'sextile',
          event_order: 1,
          is_applying: true,
          orb: 5,
          planet: 'Venus',
          degrees_to_perfection: null,
        },
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.moonToQuesited?.degreesToPerfection).toBeNull();
  });

  it('voc detail: omits degree when moon_longitude is null → signDisplay is just the sign name', () => {
    const raw = wireResponse({
      lunar_analysis: {
        is_void_of_course: true,
        moon_sign: 'Gem',
        moon_longitude: null as any,
        degrees_to_sign_change: 2,
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.voc_moon_sign).toBe('Gemini');
  });

  it('voc detail: signDisplay is undefined when moon_sign cannot be resolved', () => {
    const raw = wireResponse({
      lunar_analysis: {
        is_void_of_course: true,
        moon_sign: undefined as any,
        moon_longitude: 45,
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.voc_moon_sign).toBeUndefined();
  });

  it('resolveRadicality: radicality.is_radical=false from block → is_radical: false with summary', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: false,
        score: 20,
        recommendation: 'do_not_judge',
        summary: 'Chart is not radical.',
        considerations: [],
      },
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.is_radical).toBe(false);
    expect(out.radicality_summary).toBe('Chart is not radical.');
  });

  it('maps undefined judgment answer → UNCLEAR (covers answer ?? "" branch)', () => {
    const raw = { category: 'general' } as HoraryAnalysisResponse;
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.verdict).toBe('UNCLEAR');
  });

  it('summary defaults to empty string when both interpretation and reasoning are absent', () => {
    const raw = wireResponse({
      judgment: { answer: 'yes', confidence_band: 'high', interpretation: null, reasoning: null } as any,
    });
    const out = normalizeAnalysisResponse(raw, baseRequest);
    expect(out.summary).toBe('');
  });

  it('maps radicalityFlags: medium severity consideration → "moderate"', () => {
    const raw = wireResponse({
      radicality: {
        is_radical: true,
        score: 75,
        recommendation: 'proceed',
        summary: 'OK.',
        considerations: [
          { name: 'medium_flag', is_present: true, severity: 'medium', message: 'Medium issue.', value: null },
        ],
      },
    });
    const flags = normalizeAnalysisResponse(raw, baseRequest).radicalityFlags;
    expect(flags?.[0].severity).toBe('moderate');
  });
});

function emptyTranslation() {
  return {
    has_translation: false,
    translator: null,
    separated_from: null,
    applying_to: null,
    separation_aspect: null,
    applying_aspect: null,
    separation_orb: null,
    degrees_to_perfection: null,
    quality: null,
    reason: null,
  };
}

function emptyCollection() {
  return {
    has_collection: false,
    collector: null,
    querent_aspect: null,
    quesited_aspect: null,
    querent_degrees: null,
    quesited_degrees: null,
    quality: null,
    reason: null,
  };
}

function emptyProhibition() {
  return {
    has_prohibition: false,
    prohibitor: null,
    prohibits_which: null,
    prohibition_aspect: null,
    prohibitor_degrees: null,
    main_aspect_degrees: null,
    prohibitor_nature: null,
    severity: null,
    reason: null,
  };
}

function emptyFrustration() {
  return {
    has_frustration: false,
    frustrated_planet: null,
    degrees_to_sign_change: null,
    degrees_to_perfection: null,
    frustration_type: null,
    reason: null,
  };
}

function chartData(overrides: Partial<WireChartData> = {}): WireChartData {
  return {
    subject_data: { name: '', year: 2026, month: 5, day: 28, hour: 9, minute: 30 },
    house_system: 'R',
    ascendant_sign: 'Can',
    planetary_positions: [
      {
        name: 'Sun',
        sign: 'Gem',
        degree: 7.2,
        absolute_longitude: 67.2,
        house: 12,
        is_retrograde: false,
      },
      {
        name: 'Mercury',
        sign: 'Gem',
        degree: 15,
        absolute_longitude: 75,
        house: 12,
        is_retrograde: true,
      },
    ],
    // Intentionally out of key order to verify numeric sorting.
    house_cusps: {
      '2': 'Leo',
      '1': 'Can',
      '3': 'Vir',
      '4': 'Lib',
      '5': 'Sco',
      '6': 'Sag',
      '7': 'Cap',
      '8': 'Aqu',
      '9': 'Pis',
      '10': 'Ari',
      '11': 'Tau',
      '12': 'Gem',
    },
    ...overrides,
  };
}

describe('mapChartWheel', () => {
  it('produces the ascendant sign', () => {
    expect(mapChartWheel(chartData()).ascendantSign).toBe('Can');
  });

  it('produces 12 house signs in numeric house order', () => {
    const out = mapChartWheel(chartData());
    expect(out.houseSigns).toEqual([
      'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag',
      'Cap', 'Aqu', 'Pis', 'Ari', 'Tau', 'Gem',
    ]);
  });

  it('maps planet longitude, retrograde flag and house', () => {
    const [sun, mercury] = mapChartWheel(chartData()).planets;
    expect(sun).toEqual({
      name: 'Sun',
      absoluteLongitude: 67.2,
      isRetrograde: false,
      house: 12,
    });
    expect(mercury.isRetrograde).toBe(true);
    expect(mercury.absoluteLongitude).toBe(75);
  });
});
