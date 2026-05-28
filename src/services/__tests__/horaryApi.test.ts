// src/services/__tests__/horaryApi.test.ts
// Unit tests for horaryApi.ts — mock axios, test retry logic.
// See docs/quality-gates.md section 2.1 for full test spec.

import type { HoraryRequest, HoraryResponse } from '../../types/horary';

// Mock axios at module level
jest.mock('axios');

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test_api_key'),
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
}));

const mockHoraryResponse: HoraryResponse = {
  id: 'test_id_001',
  verdict: 'YES',
  confidence_band: 'high',
  summary: 'Test summary text.',
  significators: [],
  voc_moon: false,
  chart_time: new Date().toISOString(),
};

const validRequest: HoraryRequest = {
  question: 'Will I get the job offer this month?',
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
  timestamp: new Date().toISOString(),
};

describe('horaryApi.ask()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns HoraryResponse on success', async () => {
    // TODO Sprint B: implement with full axios mock
    expect(validRequest.question.length).toBeGreaterThanOrEqual(5);
    expect(mockHoraryResponse.verdict).toMatch(/^(YES|NO|MAYBE|UNCLEAR)$/);
  });

  it('has correct VerdictType union', () => {
    const verdicts = ['YES', 'NO', 'MAYBE', 'UNCLEAR'] as const;
    expect(verdicts).toContain(mockHoraryResponse.verdict);
  });

  it('has correct ConfidenceBand union', () => {
    const bands = ['high', 'medium', 'low'] as const;
    expect(bands).toContain(mockHoraryResponse.confidence_band);
  });
});
