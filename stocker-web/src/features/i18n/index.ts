import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';

// Language configuration
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    direction: 'ltr'
  },
  tr: {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr'
  }
};

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      tr: { translation: trTranslations }
    },
    fallbackLng: 'tr',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng'
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;

// Helper functions
export const getCurrentLanguage = (): string => {
  return i18n.language || 'tr';
};

export const changeLanguage = async (lang: string): Promise<void> => {
  await i18n.changeLanguage(lang);
  
  // Update HTML attributes
  document.documentElement.lang = lang;
  document.documentElement.dir = languages[lang as keyof typeof languages]?.direction || 'ltr';
  
  // Store preference
  localStorage.setItem('preferred_language', lang);
};

export const getAvailableLanguages = () => {
  return Object.values(languages);
};

// Translation hook wrapper with typing
import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => changeLanguage(lang),
    languages: getAvailableLanguages()
  };
};