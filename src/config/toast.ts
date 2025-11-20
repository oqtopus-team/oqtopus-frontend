import { ToastOptions } from 'react-toastify';

const baseToastConfig: ToastOptions = {
  closeOnClick: true,
  hideProgressBar: true,
};

export const errorToastConfig: ToastOptions = {
  ...baseToastConfig,
  type: 'error',
};

export const successToastConfig: ToastOptions = {
  ...baseToastConfig,
  type: 'success',
};

export const infoToastConfig: ToastOptions = {
  ...baseToastConfig,
  type: 'info',
};
