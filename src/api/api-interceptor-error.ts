import globalAxios from 'axios';
import i18next from 'i18next';
import { toast } from 'react-toastify';
import { errorToastConfig } from '@/config/toast';

export const setupInterceptors = () => {
  globalAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data?.message_code) {
        const errorMessage = i18next.t(`errors.api.${error.response.data.message_code}`, {
          ...error.response.data.message_params,
        });

        toast(errorMessage as string, errorToastConfig);
      } else {
        toast(i18next.t('errors.api.unknown_error'), errorToastConfig);
      }
      return Promise.reject(error);
    }
  );
};