import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh', label: '繁體中文', short: '繁中' },
] as const;

export type SupportedLangCode = typeof SUPPORTED_LANGUAGES[number]['code'];

/**
 * Some feature names live inside CSV-derived caches in `graphDataStore` that
 * snapshot the active locale when first parsed. Rather than threading i18n
 * into the data store, we invalidate those caches on language change.
 * The caches are rebuilt on next read.
 */
function invalidateLocaleSensitiveCaches() {
  try {
    const mod: any = (window as any).__graphDataStore; // optional hook for tests
    if (mod?.resetFeatureCaches) mod.resetFeatureCaches();
  } catch { /* ignore */ }
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    interpolation: { escapeValue: false },
    // Default to English as primary language. Only honour an explicit
    // localStorage choice from the user — do not infer from navigator.language.
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bitoguard.lang',
    },
    lng: (typeof localStorage !== 'undefined' && localStorage.getItem('bitoguard.lang')) || 'en',
    react: { useSuspense: false },
  });

i18n.on('languageChanged', () => {
  invalidateLocaleSensitiveCaches();
  // SHAP / features parsed at load time contain translated labels;
  // ask components to re-fetch by dispatching a custom event.
  window.dispatchEvent(new CustomEvent('bitoguard:localeChanged'));
});

export default i18n;
