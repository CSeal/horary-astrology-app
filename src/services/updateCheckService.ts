// src/services/updateCheckService.ts
// Checks a remote JSON config for the minimum required native app version.
// Strategy: try a fresh fetch first (3s timeout); on failure fall back to
// the last cached config (30-min TTL in AsyncStorage); if both are absent,
// fail-open (return null → no block).
//
// Skipped in __DEV__ builds — nativeApplicationVersion is null in Expo Go.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import semver from 'semver';
import { UPDATE_CONFIG_URL, ASYNC_STORAGE_KEYS } from '@/constants/config';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FETCH_TIMEOUT_MS = 3_000;

interface PlatformConfig {
  minVersion: string;
  storeUrl: string;
}

interface RemoteConfig {
  ios: PlatformConfig;
  android: PlatformConfig;
}

interface CachedConfig {
  config: RemoteConfig;
  fetchedAt: number;
}

export interface UpdateCheckResult {
  required: boolean;
  storeUrl: string;
}

async function fetchConfig(): Promise<RemoteConfig | null> {
  if (!UPDATE_CONFIG_URL) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(UPDATE_CONFIG_URL, { signal: controller.signal });
    if (!resp.ok) return null;
    return (await resp.json()) as RemoteConfig;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function readCache(): Promise<RemoteConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.UPDATE_CONFIG_CACHE);
    if (!raw) return null;
    const { config, fetchedAt }: CachedConfig = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return config;
  } catch {
    return null;
  }
}

async function writeCache(config: RemoteConfig): Promise<void> {
  try {
    const entry: CachedConfig = { config, fetchedAt: Date.now() };
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.UPDATE_CONFIG_CACHE,
      JSON.stringify(entry),
    );
  } catch {
    // Non-fatal — next boot will re-fetch
  }
}

export async function checkForUpdate(): Promise<UpdateCheckResult | null> {
  if (__DEV__) return null;

  const fresh = await fetchConfig();
  if (fresh) await writeCache(fresh);
  const config = fresh ?? (await readCache());
  if (!config) return null; // fail-open

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const platformConfig = config[platform];
  if (!platformConfig) return null;

  // semver.coerce handles "1.0", "1.0.0.1" (EAS auto-bump) and plain "1"
  const current = semver.coerce(Application.nativeApplicationVersion ?? '0');
  const minimum = semver.coerce(platformConfig.minVersion);

  const required =
    current !== null && minimum !== null && semver.lt(current, minimum);

  return {
    required,
    storeUrl: platformConfig.storeUrl,
  };
}
