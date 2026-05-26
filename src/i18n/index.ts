// src/i18n/index.ts
// i18next initialization. Default language: 'en'. Fallback: 'en'.
// Language override loaded from settingsStore (AsyncStorage) on app boot.
// Do NOT use i18n-js — this project uses i18next + react-i18next.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import ru from './ru';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
