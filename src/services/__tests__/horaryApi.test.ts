// src/services/__tests__/horaryApi.test.ts
// Unit tests for the two pure-ish helpers exported from horaryApi.ts:
//   - normalizeError  (AxiosError → HoraryAPIError, 6 branches)
//   - getApiKey       (SecureStore → env var → empty, 3 branches)
// Retry/backoff behaviour lives in horaryApi.retry.test.ts.

import type { AxiosError } from 'axios';
import { normalizeError, getApiKey } from '@/services/horaryApi';
import { secureKeyService } from '@/services/secureKeyService';

// secureKeyService is mocked per-test so getApiKey's priority chain is observable.
jest.mock('../secureKeyService', () => ({
  secureKeyService: {
    getKey: jest.fn(),
  },
}));

const mockedGetKey = secureKeyService.getKey as jest.Mock;

/** Build a minimal AxiosError-shaped object for normalizeError. */
function makeAxiosError(opts: {
  code?: string;
  message?: string;
  status?: number;
  data?: unknown;
  hasResponse?: boolean;
}): AxiosError {
  const { code, message = '', status, data, hasResponse = true } = opts;
  return {
    code,
    message,
    isAxiosError: true,
    name: 'AxiosError',
    response:
      hasResponse && status !== undefined
        ? ({ status, data } as AxiosError['response'])
        : undefined,
  } as AxiosError;
}

describe('normalizeError', () => {
  it('maps ECONNABORTED (no response) → TIMEOUT, not retryable', () => {
    const result = normalizeError(
      makeAxiosError({ code: 'ECONNABORTED', hasResponse: false })
    );
    expect(result.code).toBe('TIMEOUT');
    expect(result.retryable).toBe(false);
  });

  it('maps a "timeout" message (no response) → TIMEOUT', () => {
    const result = normalizeError(
      makeAxiosError({ message: 'timeout of 10000ms exceeded', hasResponse: false })
    );
    expect(result.code).toBe('TIMEOUT');
  });

  it('maps a missing response (non-timeout) → NETWORK_ERROR, not retryable', () => {
    const result = normalizeError(
      makeAxiosError({ message: 'Network Error', hasResponse: false })
    );
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('maps a 4xx → API_4XX, not retryable, surfacing the API message', () => {
    const result = normalizeError(
      makeAxiosError({ status: 422, data: { message: 'Invalid question' } })
    );
    expect(result.code).toBe('API_4XX');
    expect(result.retryable).toBe(false);
    expect(result.message).toBe('Invalid question');
    expect(result.originalStatus).toBe(422);
  });

  it('maps a 5xx → API_5XX, retryable', () => {
    const result = normalizeError(makeAxiosError({ status: 503 }));
    expect(result.code).toBe('API_5XX');
    expect(result.retryable).toBe(true);
    expect(result.originalStatus).toBe(503);
  });

  it('falls back to a generic 4xx message when the body has none', () => {
    const result = normalizeError(makeAxiosError({ status: 404, data: {} }));
    expect(result.code).toBe('API_4XX');
    expect(result.message).toBe('Something went wrong. Please try again.');
  });

  it('maps an unexpected status (3xx) → UNKNOWN, not retryable', () => {
    const result = normalizeError(makeAxiosError({ status: 302 }));
    expect(result.code).toBe('UNKNOWN');
    expect(result.retryable).toBe(false);
  });
});

describe('getApiKey', () => {
  const originalEnv = process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;
  });

  afterAll(() => {
    if (originalEnv === undefined) delete process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY;
    else process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY = originalEnv;
  });

  it('returns the SecureStore key when present (priority 1)', async () => {
    mockedGetKey.mockResolvedValue('user_secure_key');
    process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY = 'env_key_should_be_ignored';
    await expect(getApiKey()).resolves.toBe('user_secure_key');
  });

  it('falls back to the env var when SecureStore is empty (priority 2)', async () => {
    mockedGetKey.mockResolvedValue(null);
    process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY = 'env_fallback_key';
    await expect(getApiKey()).resolves.toBe('env_fallback_key');
  });

  it('returns empty string when neither source has a key', async () => {
    mockedGetKey.mockResolvedValue(null);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(getApiKey()).resolves.toBe('');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('treats a whitespace-only SecureStore value as empty and falls through', async () => {
    mockedGetKey.mockResolvedValue('   ');
    process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY = 'env_fallback_key';
    await expect(getApiKey()).resolves.toBe('env_fallback_key');
  });
});
