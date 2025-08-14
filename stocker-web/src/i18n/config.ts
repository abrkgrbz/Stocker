import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import env from '@/config/env';

// Import translations
import trTranslations from './locales/tr';
import enTranslations from './locales/en';

export const defaultLanguage = 'tr';
export const supportedLanguages = ['tr', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Language configurations
export const languages: Record<SupportedLanguage, { 
  code: string; 
  name: string; 
  flag: string;
  dateFormat: string;
  currency: string;
  currencySymbol: string;
}> = {
  tr: {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    dateFormat: 'DD.MM.YYYY',
    currency: 'TRY',
    currencySymbol: '₺',
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    currencySymbol: '$',
  },
};

// i18n configuration
i18n
  .use(Backend) // Load translations from backend/files
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Resources
    resources: {
      tr: trTranslations,
      en: enTranslations,
    },

    // Language settings
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,

    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'stocker_language',
    },

    // Namespaces
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'modules', 'errors', 'validation'],

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Debug
    debug: env.app.isDevelopment,

    // React options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },

    // Backend options (if loading from files)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Missing key handler
    saveMissing: env.app.isDevelopment,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (env.app.isDevelopment) {
        console.warn(`Missing translation: ${lng}/${ns}:${key}`);
      }
    },
  });

// Helper functions
export const changeLanguage = (language: SupportedLanguage) => {
  i18n.changeLanguage(language);
  localStorage.setItem('stocker_language', language);
  
  // Update HTML lang attribute
  document.documentElement.lang = language;
  
  // Update Ant Design locale
  if (window.dayjs) {
    window.dayjs.locale(language === 'tr' ? 'tr' : 'en');
  }
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || defaultLanguage) as SupportedLanguage;
};

export const getLanguageConfig = (language?: SupportedLanguage) => {
  return languages[language || getCurrentLanguage()];
};

// Format number based on current locale
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  const language = getCurrentLanguage();
  return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', options).format(value);
};

// Format currency based on current locale
export const formatCurrency = (value: number) => {
  const config = getLanguageConfig();
  return formatNumber(value, {
    style: 'currency',
    currency: config.currency,
  });
};

// Format date based on current locale
export const formatDate = (date: Date | string, format?: string) => {
  const language = getCurrentLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
  }
  
  return dateObj.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default i18n;