/**
 * Simple i18n utilities for auth pages
 * Lightweight translation system without external dependencies
 */

import { Locale, defaultLocale } from './config'
import trTranslations from './locales/tr.json'
import enTranslations from './locales/en.json'

type TranslationObject = typeof trTranslations

const translations: Record<Locale, TranslationObject> = {
  tr: trTranslations,
  en: enTranslations,
}

/**
 * Get translation for a key path
 * @param locale - Current locale
 * @param key - Translation key path (e.g., "auth.login.title")
 * @param variables - Optional variables for interpolation (e.g., {field: "email"})
 * @returns Translated string
 */
export function t(locale: Locale, key: string, variables?: Record<string, string>): string {
  const translation = translations[locale] || translations[defaultLocale]

  // Navigate the nested object using key path
  const keys = key.split('.')
  let value: any = translation

  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) break
  }

  // Fallback to English if translation not found
  if (value === undefined && locale !== 'en') {
    return t('en', key, variables)
  }

  // Return key if still not found
  if (typeof value !== 'string') {
    return key
  }

  // Interpolate variables
  if (variables) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable] || match
    })
  }

  return value
}

/**
 * Get current locale from browser or cookie
 * @returns Current locale
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  // Check cookie first
  const cookieLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('locale='))
    ?.split('=')[1] as Locale | undefined

  if (cookieLocale && (cookieLocale === 'tr' || cookieLocale === 'en')) {
    return cookieLocale
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'tr' || browserLang === 'en') {
    return browserLang
  }

  return defaultLocale
}

/**
 * Set locale cookie
 * @param locale - Locale to set
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return

  document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
  window.location.reload()
}

/**
 * React hook for translations
 */
export function useTranslations(locale?: Locale) {
  const currentLocale = locale || getCurrentLocale()

  return {
    t: (key: string, variables?: Record<string, string>) => t(currentLocale, key, variables),
    locale: currentLocale,
    setLocale,
  }
}
