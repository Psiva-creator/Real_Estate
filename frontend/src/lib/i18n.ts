import enCommon from '../../public/locales/en/common.json';
import teCommon from '../../public/locales/te/common.json';

export const LOCALES = ['en', 'te'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

const dictionaries = {
  en: enCommon,
  te: teCommon,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export type Dictionary = typeof enCommon;
