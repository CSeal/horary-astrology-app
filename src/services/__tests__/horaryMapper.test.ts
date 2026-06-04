// src/services/__tests__/horaryMapper.test.ts
// Covers the app↔wire mapping: request builder (timestamp → DateTimeLocation,
// category, language) and response normalizer (verdict/confidence/voc/
// significator mapping, defensive defaults, client id).

import {
  buildAnalysisRequest,
  normalizeAnalysisResponse,
} from '@/services/horaryMapper';
import type {
  HoraryRequest,
  HoraryAnalysisResponse,
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
});
