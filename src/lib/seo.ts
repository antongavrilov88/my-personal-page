import type { Locale } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antongavrilov.dev';

export function languageAlternates(path: string) {
  return {
    languages: {
      en: `${SITE_URL}/en${path}`,
      ru: `${SITE_URL}/ru${path}`,
      'x-default': `${SITE_URL}/en${path}`,
    },
  };
}

export function pageTitle(locale: Locale, suffix?: string) {
  const base =
    locale === 'ru'
      ? 'Антон Гаврилов — Senior Frontend Engineer'
      : 'Anton Gavrilov — Senior Frontend Engineer';
  return suffix ? `${suffix} · ${base}` : base;
}
