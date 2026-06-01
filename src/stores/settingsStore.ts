// src/stores/settingsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Persists locale to AsyncStorage under horary_language.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS, type SupportedLocale } from '@/constants/config';

interface SettingsState {
  locale: SupportedLocale;
  apiKeySource: 'personal' | 'default';
  onboardingComplete: boolean;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  setApiKeySource: (source: 'personal' | 'default') => void;
  completeOnboarding: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  apiKeySource: 'default',
  onboardingComplete: false,

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

  hydrate: async () => {
    try {
      const [storedLocale, onboardingFlag] = await Promise.all([
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);
      const update: Partial<SettingsState> = {};
      if (storedLocale === 'en' || storedLocale === 'ru') update.locale = storedLocale;
      if (onboardingFlag === '1') update.onboardingComplete = true;
      set(update);
    } catch {
      console.error('[settingsStore] Failed to hydrate settings');
    }
  },
}));
