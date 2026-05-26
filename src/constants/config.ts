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

// AsyncStorage keys — never overlap with other apps
export const ASYNC_STORAGE_KEYS = {
  JOURNAL: 'horary_journal',
  QUESTION_COUNT: 'horary_question_count',
  QUESTION_RESET_DATE: 'horary_question_reset_date',
  LANGUAGE: 'horary_language',
  ONBOARDING_COMPLETE: 'horary_onboarding_complete',
} as const;

// SecureStore key
export const SECURE_STORE_KEY_API = 'horary_api_key';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
