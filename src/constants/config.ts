// src/constants/config.ts
// App-wide configuration constants.
// API keys are NEVER stored here — see secureKeyService.ts and .env.local.example

// Real API lives on the api. subdomain (the bare domain is the marketing site).
export const API_BASE_URL = 'https://api.astrology-api.io';
export const HORARY_ENDPOINT = '/api/v3/horary/analyze';
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
  LOCATION_SOURCE: 'horary_location_source',
  HOME_LOCATION: 'horary_home_location',
  ZODIAC_TYPE: 'horary_zodiac_type',
} as const;

// SecureStore key
export const SECURE_STORE_KEY_API = 'horary_api_key';

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Horary question categories — required by POST /api/v3/horary/analyze.
// 'general' is the catch-all default shown first in the picker.
export const HORARY_CATEGORIES = [
  'general',
  'love',
  'marriage',
  'career',
  'job',
  'money',
  'health',
  'pregnancy',
  'fertility',
  'missing_item',
  'travel',
] as const;
export type HoraryCategory = (typeof HORARY_CATEGORIES)[number];
export const DEFAULT_HORARY_CATEGORY: HoraryCategory = 'general';

// Subcategories per category — sourced from GET /api/v3/horary/glossary/categories.
// Categories without subcategories are omitted (general only has yes_no which is the default).
export const HORARY_SUBCATEGORIES: Partial<Record<HoraryCategory, readonly string[]>> = {
  love:         ['marriage', 'fidelity', 'rival', 'breakup', 'who_interested', 'compatibility'],
  marriage:     ['will_marry', 'marriage_happy', 'reconciliation'],
  career:       ['get_position', 'project_success', 'reputation', 'authority_favorable'],
  job:          ['get_job', 'keep_job'],
  money:        ['gain', 'debt_repaid', 'inheritance', 'should_invest', 'will_become_wealthy'],
  health:       ['will_recover', 'is_dangerous', 'nature_of_illness', 'treatment_good', 'when_crisis'],
  missing_item: ['will_find', 'where_is', 'who_stole', 'will_return', 'stolen_or_lost'],
  travel:       ['safe_journey', 'profitable', 'will_return', 'should_emigrate'],
  pregnancy:    ['will_conceive', 'will_have_children', 'boy_or_girl', 'safe_delivery'],
  fertility:    ['will_conceive', 'ivf_success'],
};

// Subject roles — whose perspective the chart is cast for (Lilly's derived-houses doctrine).
// 'self' is the default; other roles turn the chart for a third party.
export const SUBJECT_ROLES = [
  'self',
  'spouse_partner',
  'third_party_friend',
  'third_party_employer',
  'third_party_parent',
  'third_party_child',
  'third_party_other',
] as const;
export type SubjectRole = (typeof SUBJECT_ROLES)[number];
export const DEFAULT_SUBJECT_ROLE: SubjectRole = 'self';

// Zodiac type — stored in settings, shared across all questions.
export const ZODIAC_TYPES = ['Tropic', 'Sidereal'] as const;
export type ZodiacType = (typeof ZODIAC_TYPES)[number];
export const DEFAULT_ZODIAC_TYPE: ZodiacType = 'Tropic';
