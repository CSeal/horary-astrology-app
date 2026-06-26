// src/services/__tests__/horaryApi.test.ts
// Unit tests for the two pure-ish helpers exported from horaryApi.ts:
//   - normalizeError  (AxiosError → HoraryAPIError, 6 branches)
//   - getApiKey       (SecureStore → env var → empty, 3 branches)
// Retry/backoff behaviour lives in horaryApi.retry.test.ts.

import type { AxiosError } from 'axios';
import { normalizeError, getApiKey } from '@/services/horaryApi';
import { secureKeyService } from '@/services/secureKeyService';

// settingsStore uses AsyncStorage (native) — mock it so Jest can load horaryApi.ts.
jest.mock('@/stores/settingsStore', () => ({
  useSettingsStore: { getState: () => ({ zodiacType: 'Tropic' }) },
}));

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

  it('maps 429 → LIMIT_EXCEEDED, not retryable, surfacing the API message', () => {
    const result = normalizeError(
      makeAxiosError({ status: 429, data: { message: 'Monthly limit reached' } })
    );
    expect(result.code).toBe('LIMIT_EXCEEDED');
    expect(result.retryable).toBe(false);
    expect(result.message).toBe('Monthly limit reached');
    expect(result.originalStatus).toBe(429);
  });

  it('uses default 429 message when the API body has no message field', () => {
    const result = normalizeError(makeAxiosError({ status: 429, data: {} }));
    expect(result.code).toBe('LIMIT_EXCEEDED');
    expect(result.message).toBe('You have reached your monthly question limit.');
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

  it('maps 401 → INVALID_API_KEY, not retryable', () => {
    const result = normalizeError(
      makeAxiosError({ status: 401, data: { message: 'Invalid API key' } })
    );
    expect(result.code).toBe('INVALID_API_KEY');
    expect(result.retryable).toBe(false);
    expect(result.message).toBe('Invalid API key');
    expect(result.originalStatus).toBe(401);
  });

  it('uses default 401 message when the API body has none', () => {
    const result = normalizeError(makeAxiosError({ status: 401, data: {} }));
    expect(result.code).toBe('INVALID_API_KEY');
    expect(result.message).toBe('Invalid or missing API key. Check Settings → API Key.');
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

  it('returns empty string when neither source has a key (public-host default)', async () => {
    // No key is the normal default now — requests use the public host, so this
    // must NOT warn.
    mockedGetKey.mockResolvedValue(null);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(getApiKey()).resolves.toBe('');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('treats a whitespace-only SecureStore value as empty and falls through', async () => {
    mockedGetKey.mockResolvedValue('   ');
    process.env.EXPO_PUBLIC_ASTROLOGY_API_KEY = 'env_fallback_key';
    await expect(getApiKey()).resolves.toBe('env_fallback_key');
  });
});
