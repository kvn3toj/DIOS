import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default async function getMessages(locale: string) {
  try {
    return (await import(`./messages/${locale}/common.json`)).default;
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function getLocale(locale: string): Locale {
  if (!locales.includes(locale as Locale)) {
    return 'en';
  }
  return locale as Locale;
}

export const defaultLocale = 'en';
export const localePrefix = 'as-needed';

export async function getI18nConfig() {
  return {
    defaultLocale,
    locales,
    localePrefix,
  };
}

export default getRequestConfig(async ({ locale }) => ({
  messages: await getMessages(locale),
  timeZone: 'UTC',
  now: new Date(),
}));
