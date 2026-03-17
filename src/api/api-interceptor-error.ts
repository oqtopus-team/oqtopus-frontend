import globalAxios from 'axios';
import i18next from 'i18next';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';

export const setupInterceptors = () => {
  globalAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error.response?.data?.message || i18next.t('common.unknown_error');
      toast(message, errorToastConfig);
      return Promise.reject(error);
    }
  );
};
