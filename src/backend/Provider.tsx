import * as OAS from '../api/generated';
import { createContext } from 'react';

interface UserAPI {
  device: OAS.DeviceApi;
  job: OAS.JobApi;
  apiToken: OAS.ApiTokenApi;
}

export const newUserAPI = (config?: OAS.ConfigurationParameters): UserAPI => {
  return {
    device: new OAS.DeviceApi(new OAS.Configuration(config)),
    job: new OAS.JobApi(new OAS.Configuration(config)),
    apiToken: new OAS.ApiTokenApi(new OAS.Configuration(config)),
  };
};

export const userApiContext = createContext({} as UserAPI);

export const UserAPIProvider: React.FC<OAS.ConfigurationParameters & React.PropsWithChildren> = ({
  children,
  ...config
}) => {
  return <userApiContext.Provider value={newUserAPI(config)}>{children}</userApiContext.Provider>;
};
