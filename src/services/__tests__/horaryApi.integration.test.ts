// src/services/__tests__/horaryApi.integration.test.ts
// LIVE integration tests against the public, spam-protected host
// (api-public.astrology-api.io) — NO API key required.
//
// Gated behind RUN_INTEGRATION=1 so the default `npm test` / CI never hits the
// network (the host throttles floods — repeated CI runs would get banned).
//
//   npm run test:integration
//
// Calls run sequentially (jest runs tests within a file in order) with a delay
// between each request to stay well under the public rate limit.

import axios from 'axios';
import { API_BASE_URL_PUBLIC } from '@/constants/config';

const RUN = process.env.RUN_INTEGRATION === '1';

// Spacing between live calls. Bump via INTEGRATION_DELAY_MS if the host tightens.
const DELAY_MS = Number(process.env.INTEGRATION_DELAY_MS ?? 3000);
const REQUEST_TIMEOUT_MS = 30000;

const client = axios.create({
  baseURL: API_BASE_URL_PUBLIC,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  // Never send an Authorization header — this is the public, keyless host.
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A fixed reference moment so responses are deterministic across runs.
const QUESTION_TIME = {
  year: 2026,
  month: 2,
  day: 10,
  hour: 9,
  minute: 15,
  second: 0,
  city: 'New York',
  country_code: 'US',
};

// Skip the whole suite unless explicitly opted in.
const describeLive = RUN ? describe : describe.skip;

describeLive('horary API — live public host (keyless)', () => {
  // Throttle: pause before every call so requests never burst.
  beforeEach(async () => {
    await delay(DELAY_MS);
  });

  it(
    'GET /glossary/considerations → 200, success envelope',
    async () => {
      const { status, data } = await client.get('/api/v3/horary/glossary/considerations');
      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.considerations)).toBe(true);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );

  it(
    'GET /glossary/categories → 200, returns categories',
    async () => {
      const { status, data } = await client.get('/api/v3/horary/glossary/categories', {
        params: { language: 'en' },
      });
      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.categories)).toBe(true);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );

  it(
    'POST /chart → 200, returns chart_data',
    async () => {
      const { status, data } = await client.post('/api/v3/horary/chart', {
        question_time: QUESTION_TIME,
      });
      expect(status).toBe(200);
      expect(data.success).toBe(true);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );

  it(
    'POST /fertility-analysis → 200',
    async () => {
      const { status, data } = await client.post('/api/v3/horary/fertility-analysis', {
        question_time: QUESTION_TIME,
      });
      expect(status).toBe(200);
      expect(data.success).toBe(true);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );

  it(
    'POST /aspects → 200',
    async () => {
      const { status, data } = await client.post('/api/v3/horary/aspects', {
        question_time: QUESTION_TIME,
      });
      expect(status).toBe(200);
      expect(data.success).toBe(true);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );

  it(
    'POST /analyze → 200, keyless, full judgment payload (the endpoint the app uses)',
    async () => {
      const { status, data } = await client.post('/api/v3/horary/analyze', {
        category: 'career',
        subcategory: 'get_position',
        question_time: QUESTION_TIME,
        include_timing: true,
        options: { language: 'en' },
      });
      expect(status).toBe(200);
      expect(data.success).toBe(true);

      const d = data.data;
      // Confirms the live /analyze response is the rich shape the app maps,
      // not the abbreviated one in the published spec.
      expect(d.judgment).toBeDefined();
      expect(['yes', 'no', 'unclear', 'reask_later']).toContain(d.judgment.answer);
      expect(d.judgment.confidence_band).toBeDefined();
      expect(d.significators).toBeDefined();
      expect(d.chart_data?.house_system).toBe('R');
      // Keyless calls on the public host cost the standard 2 credits.
      expect(data.metadata?.credits_used).toBe(2);
    },
    REQUEST_TIMEOUT_MS + DELAY_MS
  );
});
