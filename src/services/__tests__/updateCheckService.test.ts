// src/services/__tests__/updateCheckService.test.ts
// Covers the 3-tier fallback in checkForUpdate: fresh fetch → cache (30-min TTL)
// → fail-open (null). Also the __DEV__ short-circuit and the semver coerce path.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { checkForUpdate } from '@/services/updateCheckService';
import { ASYNC_STORAGE_KEYS } from '@/constants/config';

jest.mock(
  '@react-native-async-storage/async-storage',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Force a usable config URL (the real constant reads an env var that is unset in CI).
jest.mock('../../constants/config', () => ({
  ...jest.requireActual('../../constants/config'),
  UPDATE_CONFIG_URL: 'https://example.com/update-config.json',
}));

// Mutable native version so each test can set the "installed" version.
jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.0.0' }));

const CACHE_KEY = ASYNC_STORAGE_KEYS.UPDATE_CONFIG_CACHE;

const config = (iosMin: string, androidMin = iosMin) => ({
  ios: { minVersion: iosMin, storeUrl: 'https://apps.apple.com/app/hora' },
  android: { minVersion: androidMin, storeUrl: 'https://play.google.com/store' },
});

function mockFetchOk(body: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => body,
  }) as jest.Mock;
}

function mockFetchFail() {
  globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down')) as jest.Mock;
}

function setVersion(v: string | null) {
  (Application as { nativeApplicationVersion: string | null }).nativeApplicationVersion =
    v;
}

describe('checkForUpdate', () => {
  const originalDev = (globalThis as unknown as { __DEV__: boolean }).__DEV__;

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
    setVersion('1.0.0');
  });

  afterEach(() => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
  });

  it('returns null immediately in __DEV__ without fetching', async () => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = true;
    globalThis.fetch = jest.fn() as jest.Mock;
    await expect(checkForUpdate()).resolves.toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fresh fetch: current >= min → not required, and caches the config', async () => {
    mockFetchOk(config('1.0.0'));
    const result = await checkForUpdate();
    expect(result).toEqual({
      required: false,
      storeUrl: 'https://apps.apple.com/app/hora',
    });
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    expect(cached).not.toBeNull();
  });

  it('fresh fetch: current < min → required', async () => {
    setVersion('1.0.0');
    mockFetchOk(config('2.0.0'));
    const result = await checkForUpdate();
    expect(result?.required).toBe(true);
  });

  it('coerces EAS-style versions: "1.0.0.1" current vs "1.0.0" min → not required', async () => {
    setVersion('1.0.0.1');
    mockFetchOk(config('1.0.0'));
    const result = await checkForUpdate();
    expect(result?.required).toBe(false);
  });

  it('fetch fails but a fresh cache exists → uses the cached config', async () => {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ config: config('2.0.0'), fetchedAt: Date.now() })
    );
    mockFetchFail();
    const result = await checkForUpdate();
    expect(result?.required).toBe(true); // current 1.0.0 < cached min 2.0.0
  });

  it('fetch fails and cache is stale (>30 min) → null (fail-open)', async () => {
    const THIRTY_ONE_MIN = 31 * 60 * 1000;
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        config: config('2.0.0'),
        fetchedAt: Date.now() - THIRTY_ONE_MIN,
      })
    );
    mockFetchFail();
    await expect(checkForUpdate()).resolves.toBeNull();
  });

  it('fetch fails and no cache → null (fail-open)', async () => {
    mockFetchFail();
    await expect(checkForUpdate()).resolves.toBeNull();
  });

  // ── Branch: fetchConfig !resp.ok ──────────────────────────────────────────
  it('fetch returns non-OK response and no cache → null (fail-open)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as jest.Mock;
    await expect(checkForUpdate()).resolves.toBeNull();
  });

  // ── Branch: readCache catch (corrupt JSON in AsyncStorage) ────────────────
  it('fetch fails and AsyncStorage contains corrupt JSON → null (fail-open)', async () => {
    await AsyncStorage.setItem(CACHE_KEY, '{invalid json');
    mockFetchFail();
    await expect(checkForUpdate()).resolves.toBeNull();
  });

  // ── Branch: writeCache catch (AsyncStorage.setItem throws) ───────────────
  it('writeCache failure is non-fatal — checkForUpdate still returns a valid result', async () => {
    mockFetchOk(config('1.0.0'));
    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('storage full'));
    const result = await checkForUpdate();
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('storeUrl');
  });

  // ── Branch: nativeApplicationVersion is null ──────────────────────────────
  it('null nativeApplicationVersion coerces to "0" → update required when min > 0', async () => {
    setVersion(null);
    mockFetchOk(config('1.0.0'));
    const result = await checkForUpdate();
    expect(result?.required).toBe(true);
  });

  // ── Branch: !platformConfig (config missing current platform key) ─────────
  it('config missing the current platform key → null (fail-open)', async () => {
    // Platform.OS is 'ios' in jest-expo; supply a config with only android.
    mockFetchOk({ android: { minVersion: '1.0.0', storeUrl: 'https://play.google.com' } });
    await expect(checkForUpdate()).resolves.toBeNull();
  });
});
