import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslations() {
  const t = useNextIntlTranslations();

  return {
    t,
    translate: (key: string, params?: Record<string, any>) => {
      try {
        return t(key, params);
      } catch (error) {
        console.error(`Translation key not found: ${key}`, error);
        return key;
      }
    },
  };
}

export function useFormatDate() {
  const t = useNextIntlTranslations();

  return (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ) => {
    try {
      const dateObj =
        typeof date === 'string' || typeof date === 'number'
          ? new Date(date)
          : date;

      return t.dateTime(dateObj, {
        dateStyle: 'medium',
        ...options,
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return String(date);
    }
  };
}

export function useFormatNumber() {
  const t = useNextIntlTranslations();

  return (number: number, options?: Intl.NumberFormatOptions) => {
    try {
      return t.number(number, options);
    } catch (error) {
      console.error('Number formatting error:', error);
      return String(number);
    }
  };
}
