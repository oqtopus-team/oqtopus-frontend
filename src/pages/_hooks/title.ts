import ENV from '@/env';
import i18next from 'i18next';
import { useLayoutEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useLayoutEffect(() => {
    document.title = `${title} | ${import.meta.env.VITE_APP_APP_NAME_EN}`;
  });
};
