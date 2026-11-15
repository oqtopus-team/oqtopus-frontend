const env = import.meta.env;

// Authentication strategy. `cognito` (default) preserves the existing
// Amplify/Cognito behavior for AWS deployments; `proxy` uses the BFF model
// (oauth2-proxy in front), where the SPA holds no tokens and delegates all
// authentication to the OIDC provider.
const AUTH_MODE = (env.VITE_APP_AUTH_MODE as string) || 'cognito';

const ENV = {
  AUTH_MODE,
  AWS_CONFIG: {
    region: env.VITE_APP_AUTH_REGION,
    userPoolId: env.VITE_APP_AUTH_USER_POOL_ID,
    userPoolWebClientId: env.VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID,
    cookieStorage: {
      domain: env.VITE_APP_AUTH_COOKIE_STORAGE_DOMAIN,
      path: '/',
      expires: 365,
      sameSite: 'strict',
      secure: env.VITE_APP_AUTH_COOKIE_STORAGE_DOMAIN !== 'localhost',
    },
    authenticationFlowType: 'USER_SRP_AUTH',
  },
  API_ENDPOINT: (() => {
    if (!env.VITE_APP_API_ENDPOINT || env.VITE_APP_API_ENDPOINT === '') {
      // In the BFF/proxy model the API is reached same-origin through the
      // reverse proxy, so a relative `/api` base is the correct default.
      if (AUTH_MODE === 'proxy') {
        return '/api';
      }
      throw new Error('Env `VITE_APP_API_ENDPOINT` is not specified');
    }
    if (`${env.VITE_APP_API_ENDPOINT}`.endsWith('/')) {
      const endpointString = `${env.VITE_APP_API_ENDPOINT}`;
      return endpointString.substring(0, endpointString.length - 1);
    }
    return env.VITE_APP_API_ENDPOINT;
  })(),
  // Base URL of the OIDC provider's self-service account console (proxy mode).
  // Password change and MFA (OTP) management are delegated there.
  ACCOUNT_CONSOLE_URL: (env.VITE_APP_ACCOUNT_CONSOLE_URL as string) || '',
  // Lazy: the signup endpoint is only used by the Cognito flows. Accessing it
  // in `proxy` mode (where signup is delegated to the IdP / not offered) would
  // otherwise throw at import time.
  get API_SIGNUP_ENDPOINT(): string {
    if (!env.VITE_APP_API_SIGNUP_ENDPOINT || env.VITE_APP_API_SIGNUP_ENDPOINT === '') {
      throw new Error('Env `VITE_APP_API_SIGNUP_ENDPOINT` is not specified');
    }
    return env.VITE_APP_API_SIGNUP_ENDPOINT;
  },
};

export default ENV;
