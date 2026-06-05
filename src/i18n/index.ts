// src/i18n/index.ts
// i18next initialization. Default language: 'en'. Fallback: 'en'.
// Language override loaded from settingsStore (AsyncStorage) on app boot.
// Do NOT use i18n-js — this project uses i18next + react-i18next.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/en';
import ru from '@/i18n/ru';
import uk from '@/i18n/uk';
import de from '@/i18n/de';
import fr from '@/i18n/fr';
import pt from '@/i18n/pt';
import es from '@/i18n/es';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uk: { translation: uk },
    de: { translation: de },
    fr: { translation: fr },
    pt: { translation: pt },
    es: { translation: es },
  },
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
