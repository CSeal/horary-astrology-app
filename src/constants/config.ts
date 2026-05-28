// src/constants/config.ts
// App-wide configuration constants.
// API keys are NEVER stored here — see secureKeyService.ts and .env.local.example

export const API_BASE_URL = 'https://astrology-api.io';
export const API_TIMEOUT = 10000; // 10 seconds

export const MONTHLY_QUESTION_LIMIT = 5;
export const LOADING_MIN_DURATION = 1500; // 1.5 seconds minimum loading display
export const MAX_QUESTION_CHARS = 280;
export const MIN_QUESTION_CHARS = 5;
export const MAX_JOURNAL_ENTRIES = 500;

// Force-update remote config — GitHub Gist URL (or any static JSON endpoint).
// Set EXPO_PUBLIC_UPDATE_CONFIG_URL in .env.local before production builds.
// Leave empty to disable the update check (fail-open, same as unreachable endpoint).
export const UPDATE_CONFIG_URL =
  process.env.EXPO_PUBLIC_UPDATE_CONFIG_URL ?? '';

// Hidden developer debug mode — gated by a PIN supplied at build time.
// When EXPO_PUBLIC_DEBUG_PIN is unset, the PIN gate can never be satisfied,
// so the debug mode is effectively disabled (production default).
// Set in .env.local for local dev, or in an EAS build profile for QA builds.
export const DEBUG_PIN = process.env.EXPO_PUBLIC_DEBUG_PIN ?? null;

// AsyncStorage keys — never overlap with other apps
export const ASYNC_STORAGE_KEYS = {
  JOURNAL: 'horary_journal',
  QUESTION_COUNT: 'horary_question_count',
  QUESTION_RESET_DATE: 'horary_question_reset_date',
  LANGUAGE: 'horary_language',
  ONBOARDING_COMPLETE: 'horary_onboarding_complete',
  UPDATE_CONFIG_CACHE: 'horary_update_config_cache',
} as const;

// SecureStore key
export const SECURE_STORE_KEY_API = 'horary_api_key';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
