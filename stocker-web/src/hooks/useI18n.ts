import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage as changeLanguageUtil, 
  getCurrentLanguage, 
  getLanguageConfig,
  formatNumber,
  formatCurrency,
  formatDate,
  languages,
  type SupportedLanguage 
} from '@/i18n/config';
import { useSettingsStore } from '@/app/store/settings.store';

export function useI18n(namespace?: string | string[]) {
  const { t, i18n, ready } = useTranslation(namespace);
  const { general, updateGeneral } = useSettingsStore();

  const currentLanguage = useMemo(() => getCurrentLanguage(), [i18n.language]);
  const languageConfig = useMemo(() => getLanguageConfig(currentLanguage), [currentLanguage]);

  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    await changeLanguageUtil(language);
    updateGeneral({ language });
  }, [updateGeneral]);

  const toggleLanguage = useCallback(async () => {
    const newLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
    await changeLanguage(newLanguage);
  }, [currentLanguage, changeLanguage]);

  const getDirection = useCallback(() => {
    // For future RTL support
    return 'ltr';
  }, []);

  const formatters = useMemo(() => ({
    number: formatNumber,
    currency: formatCurrency,
    date: formatDate,
    percentage: (value: number) => formatNumber(value / 100, { 
      style: 'percent', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }),
    decimal: (value: number, decimals = 2) => formatNumber(value, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }),
    compact: (value: number) => formatNumber(value, {
      notation: 'compact',
      maximumFractionDigits: 1
    }),
  }), []);

  const isRTL = useMemo(() => false, []); // For future RTL support

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    languageConfig,
    languages,
    changeLanguage,
    toggleLanguage,
    getDirection,
    formatters,
    isRTL,
    // Convenience methods
    isEnglish: currentLanguage === 'en',
    isTurkish: currentLanguage === 'tr',
    locale: currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
  };
}