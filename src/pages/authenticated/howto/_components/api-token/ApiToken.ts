import {
  CreateApiTokenResponse,
  DeleteApiTokenResponse,
  GetApiTokenResponse,
} from '@/domain/types/ApiToken';
import i18next from 'i18next';
import { ApiTokenApi } from '@/api/generated';

export const API_TOKEN_API_MESSAGE = (currentLang: string) => ({
  unavailable: currentLang === 'ja' ? '現在利用できません' : 'This is currently unavailable.',
  get: {
    success: {
      found: currentLang === 'ja' ? 'APIトークンを取得しました' : 'got an API token.',
      not_found: currentLang === 'ja' ? 'APIトークンが存在しません' : 'API token does not exist.',
    },
    fail: currentLang === 'ja' ? 'APIトークンの取得に失敗しました' : 'Failed to get API token.',
  },
  create: {
    success: currentLang === 'ja' ? 'APIトークンを発行しました' : 'API token issued',
    fail: currentLang === 'ja' ? 'APIトークンの生成に失敗しました' : 'Failed to create API token.',
  },
  remove: {
    success: currentLang === 'ja' ? 'APIトークンを削除しました' : 'API token removed.',
    fail: currentLang === 'ja' ? 'APIトークンの削除に失敗しました' : 'Failed to remove API token.',
  },
});

export async function createApiToken(api: ApiTokenApi): Promise<CreateApiTokenResponse> {
  const currentLang = i18next.language;

  return api
    .createApiToken()
    .then((res) => {
      // cast to any because the response type is cannot access
      // the properties api_token_secret and api_token_expiration
      const data: any = res.data;
      return {
        operationResult: {
          success: true,
          message: API_TOKEN_API_MESSAGE(currentLang).create.success,
        },
        token: {
          secret: data.api_token_secret ?? '',
          expiration: data.api_token_expiration ?? '',
        },
      };
    })
    .catch((error) => {
      const message = ((): string => {
        if (error.response.status === 403) {
          return API_TOKEN_API_MESSAGE(currentLang).unavailable;
        }
        console.log(error);
        return API_TOKEN_API_MESSAGE(currentLang).create.fail;
      })();
      return {
        operationResult: {
          success: false,
          message: message,
        },
        token: {
          secret: '',
          expiration: '',
        },
      };
    });
}

export async function deleteApiToken(api: ApiTokenApi): Promise<DeleteApiTokenResponse> {
  const currentLang = i18next.language;
  return api
    .deleteApiToken()
    .then(() => {
      return {
        operationResult: {
          success: true,
          message: API_TOKEN_API_MESSAGE(currentLang).remove.success,
        },
      };
    })
    .catch((error) => {
      const message = ((): string => {
        if (error.response.status === 403) {
          return API_TOKEN_API_MESSAGE(currentLang).unavailable;
        }
        console.log(error);
        return API_TOKEN_API_MESSAGE(currentLang).remove.fail;
      })();

      return {
        operationResult: {
          success: false,
          message: message,
        },
      };
    });
}

export async function getApiToken(api: ApiTokenApi): Promise<GetApiTokenResponse> {
  const currentLang = i18next.language;

  return api
    .getApiToken()
    .then((res) => {
      // cast to any because the response type is cannot access
      // the properties api_token_secret and api_token_expiration
      const data: any = res.data;
      return {
        operationResult: {
          success: true,
          message: API_TOKEN_API_MESSAGE(currentLang).get.success.found,
        },
        token: {
          secret: data.api_token_secret,
          expiration: data.api_token_expiration,
        },
      };
    })
    .catch((error) => {
      const message = ((): string => {
        if (error.response.status === 403) {
          return API_TOKEN_API_MESSAGE(currentLang).unavailable;
        }
        if (error.response.status === 404) {
          return API_TOKEN_API_MESSAGE(currentLang).get.success.not_found;
        }
        console.log(error);
        return API_TOKEN_API_MESSAGE(currentLang).get.fail;
      })();

      return {
        operationResult: {
          success: false,
          message: message,
        },
        token: {
          secret: '',
          expiration: '',
        },
      };
    });
}
