import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { i18n, TFunction } from 'i18next';

const locales = {
  en: enUS,
  ja: ja,
};

export const DateTimeFormatter = (t: TFunction, i18n: i18n, stringUtcDateTime?: string): string => {
  if (stringUtcDateTime != null) {
    try {
      const date = new Date(stringUtcDateTime);
      const selected_locale = locales[i18n.language as keyof typeof locales] || enUS;
      return format(date, t('common.date_format'), { locale: selected_locale });
    } catch (e) {
      return '';
    }
  } else {
    return '';
  }
};
