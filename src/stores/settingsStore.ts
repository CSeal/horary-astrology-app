// src/stores/settingsStore.ts
// Zustand v5 — named export only: import { create } from 'zustand'
// Persists locale to AsyncStorage under horary_language.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS, type SupportedLocale } from '../constants/config';

interface SettingsState {
  locale: SupportedLocale;
  apiKeySource: 'personal' | 'default';
  setLocale: (locale: SupportedLocale) => Promise<void>;
  setApiKeySource: (source: 'personal' | 'default') => void;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  apiKeySource: 'default',

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

  hydrate: async () => {
    try {
      const storedLocale = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LANGUAGE);
      if (storedLocale === 'en' || storedLocale === 'ru') {
        set({ locale: storedLocale });
      }
    } catch {
      console.error('[settingsStore] Failed to hydrate settings');
    }
  },
}));
