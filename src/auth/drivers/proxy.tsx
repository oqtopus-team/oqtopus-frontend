import { useEffect, useState } from 'react';
import { AuthContext, UseAuth, Result } from '../contract';

// BFF / proxy auth strategy.
//
// In this mode a reverse proxy (oauth2-proxy) sits in front of the SPA and API
// and owns the entire authentication lifecycle. The browser holds only the
// proxy's session cookie -- never an OIDC token. Therefore:
//   - login/logout are redirects to the proxy's endpoints,
//   - "who am I / am I logged in" is answered by GET /oauth2/userinfo,
//   - outgoing API calls carry no Authorization header (the proxy injects the
//     Bearer token upstream),
//   - sign-up / MFA / password-reset are handled entirely by the IdP (Keycloak)
//     and are therefore not implemented here.

const OAUTH2_USERINFO = '/oauth2/userinfo';
const OAUTH2_START = '/oauth2/start';
// Server-side RP-initiated logout endpoint (nginx): ends the IdP session with
// id_token_hint (no confirmation page) and clears the proxy session cookie.
const LOGOUT = '/logout';

const notSupported = async (): Promise<Result> => ({
  success: false,
  message: 'auth.proxy.operation_delegated_to_idp',
});

const useProxyAuth = (): UseAuth => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(OAUTH2_USERINFO, { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const info = await res.json();
          setEmail(info.email ?? '');
          setUsername(info.preferredUsername ?? info.user ?? info.email ?? '');
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setInitialized(true));
  }, []);

  const redirectToLogin = (): void => {
    const rd = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${OAUTH2_START}?rd=${rd}`;
  };

  const signIn = async (): Promise<Result> => {
    redirectToLogin();
    return { success: true, message: '' };
  };

  const signOut = async (): Promise<Result> => {
    // Full logout is handled server-side at /logout: it ends the Keycloak SSO
    // session (with id_token_hint, so no confirmation page) AND clears the
    // oauth2-proxy session cookie. Clearing only the proxy cookie would let the
    // IdP silently re-authenticate on the next request.
    window.location.href = LOGOUT;
    return { success: true, message: '' };
  };

  // The proxy injects the Bearer token upstream, so the SPA never handles one.
  const getCurrentIdToken = async (): Promise<string> => '';

  return {
    initialized,
    isAuthenticated,
    username,
    email,
    qrcode: '',
    getCurrentIdToken,
    signIn,
    signOut,
    // Delegated to the IdP (Keycloak) in proxy mode.
    signUp: notSupported,
    confirmSignUp: notSupported,
    forgotPassword: notSupported,
    confirmPassword: notSupported,
    setQRCodeFromSecret: () => {},
    setUpMfa: notSupported,
    confirmMfa: notSupported,
    confirmSignIn: notSupported,
    startMfaReset: notSupported,
    confirmMfaReset: notSupported,
    resetMfa: notSupported,
    refreshApiToken: notSupported,
  };
};

export const ProxyAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useProxyAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
