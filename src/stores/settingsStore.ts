// src/stores/settingsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Persists locale, onboarding flag, and the location-source preference
// (device GPS vs a manually-set home city) to AsyncStorage.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS, type SupportedLocale } from '@/constants/config';
import type { LocationOverride } from '@/types/location';

// Where chart coordinates come from by default when no per-question override
// is active. 'device' = GPS first, falling back to homeLocation when GPS is
// unavailable. 'manual' = always use homeLocation (GPS ignored).
export type LocationSource = 'device' | 'manual';

interface SettingsState {
  locale: SupportedLocale;
  apiKeySource: 'personal' | 'default';
  onboardingComplete: boolean;
  locationSource: LocationSource;
  homeLocation: LocationOverride | null;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  setApiKeySource: (source: 'personal' | 'default') => void;
  completeOnboarding: () => Promise<void>;
  setLocationSource: (source: LocationSource) => Promise<void>;
  setHomeLocation: (location: LocationOverride | null) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  apiKeySource: 'default',
  onboardingComplete: false,
  locationSource: 'device',
  homeLocation: null,

  setLocale: async (locale: SupportedLocale) => {
    set({ locale });
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LANGUAGE, locale);
    } catch {
      console.error('[settingsStore] Failed to persist locale');
    }
  },

  setApiKeySource: (source: 'personal' | 'default') => {
    set({ apiKeySource: source });
  },

  completeOnboarding: async () => {
    set({ onboardingComplete: true });
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE, '1');
    } catch {
      console.error('[settingsStore] Failed to persist onboarding flag');
    }
  },

  setLocationSource: async (source: LocationSource) => {
    set({ locationSource: source });
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LOCATION_SOURCE, source);
    } catch {
      console.error('[settingsStore] Failed to persist location source');
    }
  },

  // Persists (or clears) the home city. Setting a city also flips the source
  // to 'manual' so the user's explicit pick takes effect immediately; clearing
  // it reverts to 'device'.
  setHomeLocation: async (location: LocationOverride | null) => {
    set({
      homeLocation: location,
      locationSource: location ? 'manual' : 'device',
    });
    try {
      if (location) {
        await AsyncStorage.multiSet([
          [ASYNC_STORAGE_KEYS.HOME_LOCATION, JSON.stringify(location)],
          [ASYNC_STORAGE_KEYS.LOCATION_SOURCE, 'manual'],
        ]);
      } else {
        await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.HOME_LOCATION]);
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.LOCATION_SOURCE, 'device');
      }
    } catch {
      console.error('[settingsStore] Failed to persist home location');
    }
  },

  hydrate: async () => {
    try {
      const [storedLocale, onboardingFlag, storedSource, storedHome] =
        await Promise.all([
          AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE),
          AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LOCATION_SOURCE),
          AsyncStorage.getItem(ASYNC_STORAGE_KEYS.HOME_LOCATION),
        ]);
      const update: Partial<SettingsState> = {};
      if (storedLocale === 'en' || storedLocale === 'ru') update.locale = storedLocale;
      if (onboardingFlag === '1') update.onboardingComplete = true;
      if (storedSource === 'device' || storedSource === 'manual') {
        update.locationSource = storedSource;
      }
      if (storedHome) {
        try {
          update.homeLocation = JSON.parse(storedHome) as LocationOverride;
        } catch {
          // Corrupt entry — ignore and leave homeLocation null.
        }
      }
      set(update);
    } catch {
      console.error('[settingsStore] Failed to hydrate settings');
    }
  },
}));
