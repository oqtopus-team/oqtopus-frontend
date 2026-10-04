import * as OAS from '../api/generated';
import { createContext } from 'react';
import axios, { AxiosInstance } from 'axios';

interface UserAPI {
  device: OAS.DeviceApi;
  job: OAS.JobApi;
  apiToken: OAS.ApiTokenApi;
  announcements: OAS.AnnouncementsApi;
  user: OAS.UsersApi;
  settings: OAS.SettingsApi;
}

/**
 * Axios instance for User-API calls.
 *
 * In proxy (BFF) mode the SPA holds no token and relies on the reverse proxy's
 * session cookie, so we (a) send credentials and (b) recover an expired session
 * by sending the browser back through the proxy login when the API returns 401.
 * In cognito mode behavior is unchanged (default axios, no redirect).
 */
export const createUserApiAxios = (): AxiosInstance => {
  // Read the build-time mode directly (avoid importing the whole @/env, whose
  // API_ENDPOINT getter throws when unset — it would break unrelated tests).
  const isProxy = import.meta.env.VITE_APP_AUTH_MODE === 'proxy';
  const instance = axios.create(isProxy ? { withCredentials: true } : {});
  if (isProxy) {
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          const rd = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/oauth2/start?rd=${rd}`;
        }
        return Promise.reject(error);
      }
    );
  }
  return instance;
};

export const newUserAPI = (config?: OAS.ConfigurationParameters): UserAPI => {
  const client = createUserApiAxios();
  const configuration = new OAS.Configuration(config);
  return {
    device: new OAS.DeviceApi(configuration, undefined, client),
    job: new OAS.JobApi(configuration, undefined, client),
    apiToken: new OAS.ApiTokenApi(configuration, undefined, client),
    announcements: new OAS.AnnouncementsApi(configuration, undefined, client),
    user: new OAS.UsersApi(configuration, undefined, client),
    settings: new OAS.SettingsApi(configuration, undefined, client),
  };
};

export const userApiContext = createContext({} as UserAPI);

export const UserAPIProvider: React.FC<OAS.ConfigurationParameters & React.PropsWithChildren> = ({
  children,
  ...config
}) => {
  return <userApiContext.Provider value={newUserAPI(config)}>{children}</userApiContext.Provider>;
};
