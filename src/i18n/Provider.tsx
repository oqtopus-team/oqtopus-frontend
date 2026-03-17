import i18n from 'i18next';
import { i18nextInitOptions } from '@/i18n/config';
import { I18nextProvider } from 'react-i18next';
import { ReactNode } from 'react';
import LanguageDetector from 'i18next-browser-languagedetector';
import { toast } from 'react-toastify';

i18n.use(LanguageDetector).init(i18nextInitOptions, (err) => {
  if (err) {
    toast('i18next failed to initialize');
  }
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
