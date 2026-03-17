import { describe, it, expect, vi, beforeEach } from 'vitest';
import globalAxios from 'axios';
import i18next from 'i18next';
import { toast } from 'react-toastify';
import { setupInterceptors } from './api-interceptor-error';
import { errorToastConfig } from '@/config/toast';

vi.mock('axios', () => {
  return {
    default: {
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    },
  };
});

vi.mock('react-toastify', () => ({
  toast: vi.fn(),
}));

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('setupInterceptors', () => {
  let responseInterceptorSuccess: any;
  let responseInterceptorError: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setupInterceptors();
    
    // Get the interceptor functions passed to axios.interceptors.response.use
    const mockUse = globalAxios.interceptors.response.use as any;
    [responseInterceptorSuccess, responseInterceptorError] = mockUse.mock.calls[0];
  });

  it('should call toast with message from error response if it exists', async () => {
    const errorMessage = 'Custom error message';
    const error = {
      response: {
        data: {
          message: errorMessage,
        },
      },
    };

    try {
      await responseInterceptorError(error);
    } catch (e) {
      // Expected rejection
    }

    expect(toast).toHaveBeenCalledWith(errorMessage, errorToastConfig);
  });

  it('should call toast with generic message if error response message does not exist', async () => {
    const error = {
      response: {
        data: {},
      },
    };

    try {
      await responseInterceptorError(error);
    } catch (e) {
      // Expected rejection
    }

    expect(i18next.t).toHaveBeenCalledWith('common.unknown_error');
    expect(toast).toHaveBeenCalledWith('common.unknown_error', errorToastConfig);
  });

  it('should call toast with generic message if response object does not exist', async () => {
    const error = new Error('Network Error');

    try {
      await responseInterceptorError(error);
    } catch (e) {
      // Expected rejection
    }

    expect(i18next.t).toHaveBeenCalledWith('common.unknown_error');
    expect(toast).toHaveBeenCalledWith('common.unknown_error', errorToastConfig);
  });

  it('should return Promise.reject with the error', async () => {
    const error = new Error('Some error');
    
    await expect(responseInterceptorError(error)).rejects.toThrow('Some error');
  });

  it('should return response as is on success', () => {
    const response = { data: 'success' };
    const result = responseInterceptorSuccess(response);
    expect(result).toBe(response);
  });
});
