/**
 * i18n Configuration
 * Simple internationalization setup for auth pages
 */

export const defaultLocale = 'tr' as const
export const locales = ['tr', 'en'] as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
}
