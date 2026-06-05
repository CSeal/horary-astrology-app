// src/stores/settingsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Persists locale, onboarding flag, and the location-source preference
// (device GPS vs a manually-set home city) to AsyncStorage.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ASYNC_STORAGE_KEYS,
  DEFAULT_ZODIAC_TYPE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type ZodiacType,
} from '@/constants/config';
import { secureKeyService } from '@/services/secureKeyService';
import type { LocationOverride } from '@/types/location';

// Where chart coordinates come from by default when no per-question override
// is active. 'device' = GPS first, falling back to homeLocation when GPS is
// unavailable. 'manual' = always use homeLocation (GPS ignored).
export type LocationSource = 'device' | 'manual';

interface SettingsState {
  locale: SupportedLocale;
  apiKeySource: 'personal' | 'default';
  hasApiKey: boolean;
  onboardingComplete: boolean;
  locationSource: LocationSource;
  homeLocation: LocationOverride | null;
  zodiacType: ZodiacType;
  notificationsEnabled: boolean;
  notificationDelayDays: 7 | 14 | 30;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  setApiKeySource: (source: 'personal' | 'default') => void;
  setHasApiKey: (val: boolean) => void;
  completeOnboarding: () => Promise<void>;
  setLocationSource: (source: LocationSource) => Promise<void>;
  setHomeLocation: (location: LocationOverride | null) => Promise<void>;
  setZodiacType: (type: ZodiacType) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationDelayDays: (days: 7 | 14 | 30) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  apiKeySource: 'default',
  hasApiKey: false,
  onboardingComplete: false,
  locationSource: 'device',
  homeLocation: null,
  zodiacType: DEFAULT_ZODIAC_TYPE,
  notificationsEnabled: false,
  notificationDelayDays: 14,

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

  setHasApiKey: (val: boolean) => {
    set({ hasApiKey: val });
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

  setZodiacType: async (type: ZodiacType) => {
    set({ zodiacType: type });
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ZODIAC_TYPE, type);
    } catch {
      console.error('[settingsStore] Failed to persist zodiac type');
    }
  },

  setNotificationsEnabled: async (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    try {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.NOTIFICATIONS_ENABLED,
        enabled ? '1' : '0'
      );
    } catch {
      console.error('[settingsStore] Failed to persist notifications flag');
    }
  },

  setNotificationDelayDays: async (days: 7 | 14 | 30) => {
    set({ notificationDelayDays: days });
    try {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEYS.NOTIFICATION_DELAY_DAYS,
        String(days)
      );
    } catch {
      console.error('[settingsStore] Failed to persist notification delay');
    }
  },

  hydrate: async () => {
    try {
      const [
        storedLocale,
        onboardingFlag,
        storedSource,
        storedHome,
        storedZodiac,
        storedNotifEnabled,
        storedNotifDelay,
        storedApiKey,
      ] = await Promise.all([
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LOCATION_SOURCE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.HOME_LOCATION),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ZODIAC_TYPE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.NOTIFICATIONS_ENABLED),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.NOTIFICATION_DELAY_DAYS),
        secureKeyService.getKey(),
      ]);
      const update: Partial<SettingsState> = {};
      if (SUPPORTED_LOCALES.includes(storedLocale as SupportedLocale)) update.locale = storedLocale as SupportedLocale;
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
      if (storedZodiac === 'Tropic' || storedZodiac === 'Sidereal') {
        update.zodiacType = storedZodiac;
      }
      if (storedNotifEnabled === '1') update.notificationsEnabled = true;
      const delay = Number(storedNotifDelay);
      if (delay === 7 || delay === 14 || delay === 30) {
        update.notificationDelayDays = delay;
      }
      const hasKey = Boolean(storedApiKey && storedApiKey.trim().length > 0);
      update.hasApiKey = hasKey;
      update.apiKeySource = hasKey ? 'personal' : 'default';
      set(update);
    } catch {
      console.error('[settingsStore] Failed to hydrate settings');
    }
  },
}));
