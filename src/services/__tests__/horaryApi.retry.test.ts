// src/services/__tests__/horaryApi.retry.test.ts
// Exercises askWithRetry through the public horaryApi.ask().
// axios is mocked so apiInstance.post is fully controllable; the response
// interceptor that normally normalizes errors is a no-op here, so post is
// made to reject directly with already-normalized HoraryAPIError shapes.

import type { HoraryRequest, HoraryResponse } from '@/types/horary';
import { horaryApi } from '@/services/horaryApi';

const mockPost = jest.fn();

// `post` is wrapped in an arrow so mockPost is read at call time, not when
// create() runs at module load (the SUT import is hoisted above these consts).
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: (...args: unknown[]) => mockPost(...args),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  },
}));

const request: HoraryRequest = {
  question: 'Will the deal close this week?',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
  timestamp: '2026-05-28T12:00:00.000Z',
};

const response: HoraryResponse = {
  id: 'r1',
  verdict: 'YES',
  confidence_band: 'high',
  summary: 'Test.',
  significators: [],
  voc_moon: false,
  chart_time: '2026-05-28T12:00:00.000Z',
};

const retryableError = { code: 'API_5XX', message: 'server', retryable: true };
const fatalError = { code: 'API_4XX', message: 'bad request', retryable: false };

describe('horaryApi.ask — retry/backoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves on first success without retrying', async () => {
    mockPost.mockResolvedValueOnce({ data: response });
    await expect(horaryApi.ask(request)).resolves.toEqual(response);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('retries a retryable error then resolves', async () => {
    mockPost
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce({ data: response });

    const promise = horaryApi.ask(request);
    await jest.advanceTimersByTimeAsync(1000); // first backoff = 1s
    await expect(promise).resolves.toEqual(response);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('gives up after 3 attempts on persistent retryable errors', async () => {
    mockPost.mockRejectedValue(retryableError);

    const promise = horaryApi.ask(request);
    const assertion = expect(promise).rejects.toEqual(retryableError);
    await jest.advanceTimersByTimeAsync(1000 + 2000); // backoffs between 3 attempts
    await assertion;
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-retryable error', async () => {
    mockPost.mockRejectedValue(fatalError);
    await expect(horaryApi.ask(request)).rejects.toEqual(fatalError);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
