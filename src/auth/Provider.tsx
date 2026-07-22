import { useTranslation } from 'react-i18next';
import { createContext, useEffect, useState } from 'react';
import ENV from '@/env';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({ Auth: ENV.AWS_CONFIG });

export interface UseAuth {
  initialized: boolean;
  isAuthenticated: boolean;
  username: string;
  qrcode: string;
  email: string;
  // Name of a sign-in challenge currently awaiting a follow-up call (e.g.
  // 'NEW_PASSWORD_REQUIRED'), or null. Screens that complete a challenge use
  // this to confirm the pending CognitoUser still exists in this provider
  // instance -- it is lost on a full reload, unlike router history state.
  pendingChallenge: string | null;
  getCurrentIdToken: () => Promise<string>;
  signIn: (username: string, password: string) => Promise<Result>;
  completeNewPassword: (newPassword: string) => Promise<Result>;
  signOut: () => Promise<Result>;
  signUp: (username: string, password: string) => Promise<Result>;
  confirmSignUp: (verificationCode: string) => Promise<Result>;
  forgotPassword: (username: string) => Promise<Result>;
  confirmPassword: (username: string, code: string, password: string) => Promise<Result>;
  setQRCodeFromSecret: (username: string, secret: string) => void;
  setUpMfa: () => Promise<Result>;
  confirmMfa: (totpCode: string) => Promise<Result>;
  confirmSignIn: (totpCode: string) => Promise<Result>;
  startMfaReset: (username: string, password: string) => Promise<Result>;
  confirmMfaReset: (access_token: string, code: string) => Promise<Result>;
  resetMfa: (access_token: string, totp_code: string) => Promise<Result>;
  refreshApiToken: () => Promise<Result>;
}

interface Result {
  success: boolean;
  message: string;
}

export const AuthContext = createContext({} as UseAuth);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const useProvideAuth = (): UseAuth => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [qrcode, setQRCode] = useState('');
  const [resultUser, setResultUser] = useState({});
  const [pendingChallenge, setPendingChallenge] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((result: any) => {
        setUsername(result.username);
        if (Object.prototype.hasOwnProperty.call(result, 'preferredMFA')) {
          if (import.meta.env.DEV === true || result.preferredMFA === 'SOFTWARE_TOKEN_MFA') {
            setIsAuthenticated(true);
            setInitialized(true);
          }
        }
        // TODO: Loader
        // setLoading(false);
        setEmail(result.attributes.email);
      })
      .catch((error: unknown) => {
        console.log(error);
        setUsername('');
        setIsAuthenticated(false);
        setInitialized(true);
        // TODO: Loader
        // setLoading(false);
      });
  }, []);

  const getCurrentIdToken = async function (): Promise<string> {
    return await Auth.currentSession()
      .then((data: any) => {
        return data.idToken.jwtToken;
      })
      .catch((error) => {
        console.log(error);
        return '';
      });
  };

  const signIn = async (username: string, password: string): Promise<Result> => {
    try {
      const result = await Auth.signIn(username, password);
      setResultUser(result);
      setUsername(result.username);
      setPassword(result.password);
      setIsAuthenticated(false);
      setInitialized(true);
      // A user provisioned with a temporary password (e.g. after a pool
      // restore / admin-created account) must set a new password before any
      // MFA step. This is a distinct challenge from the TOTP one, so surface it
      // separately and let the login page route to the set-new-password screen.
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setPendingChallenge('NEW_PASSWORD_REQUIRED');
        return { success: false, message: 'signin.new_password_required' };
      }
      setPendingChallenge(null);
      const hasChallenge = Object.prototype.hasOwnProperty.call(result, 'challengeName');
      if (!hasChallenge) {
        return { success: false, message: 'signup.confirm.form.mfa_setup_request' };
      }
      return { success: true, message: '' };
    } catch (error) {
      setPendingChallenge(null);
      const errorMessage = (error as Error).message ?? 'signin.errors.authentication_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Completes the NEW_PASSWORD_REQUIRED challenge raised by signIn for a user
  // that still has a temporary password. `resultUser` is the CognitoUser
  // captured by signIn.
  //
  // Auth.completeNewPassword resolves in more than one terminal state: it may
  // establish the session outright, or return the CognitoUser bearing a further
  // challenge (SOFTWARE_TOKEN_MFA for an already-enrolled user, MFA_SETUP for a
  // required-MFA pool). Only when the session is actually established can the
  // next screen call Auth.currentAuthenticatedUser(), so distinguish the cases
  // and tell the caller where to go via the message:
  //   - success, message ''                    -> session established, enroll MFA
  //   - success, message 'signin.totp_required' -> TOTP challenge, go enter code
  //   - failure                                 -> unsupported/failed
  const completeNewPassword = async (newPassword: string): Promise<Result> => {
    try {
      const user = await Auth.completeNewPassword(resultUser, newPassword);
      setResultUser(user);
      setIsAuthenticated(false);
      setInitialized(true);

      const nextChallenge: string | undefined = (user as { challengeName?: string })?.challengeName;
      if (!nextChallenge) {
        // Session established. The pending challenge is resolved.
        setPendingChallenge(null);
        return { success: true, message: '' };
      }
      if (nextChallenge === 'SOFTWARE_TOKEN_MFA') {
        // Already-enrolled user: resultUser now holds this challenge, which the
        // existing confirm-mfa screen consumes via confirmSignIn.
        setPendingChallenge(null);
        return { success: true, message: 'signin.totp_required' };
      }
      // MFA_SETUP / SMS_MFA / anything else: there is no challenge-driven
      // enrollment path here (and an OPTIONAL-MFA pool never raises these). The
      // NEW password has ALREADY been accepted by Cognito at this point, so this
      // is not a password-change failure and the challenge is spent -- keeping
      // the user on the new-password form would be both wrong and unrecoverable.
      // Return a dedicated result so the caller sends them back to sign in.
      setPendingChallenge(null);
      return { success: false, message: 'signin.new_password.additional_mfa_required' };
    } catch (error) {
      // Leave pendingChallenge intact so the user can correct and retry.
      const errorMessage = (error as Error).message ?? 'signin.errors.password_change_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const signOut = async (): Promise<Result> => {
    try {
      await Auth.signOut();
      setUsername('');
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.logout_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const signUp = async (username: string, password: string): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/signup`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });
      if (res.status !== 201) {
        throw new Error('Failed to sign up');
      }
      setUsername(username);
      setPassword(password);
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error: any) {
      const errorMessage = (error as Error).message;
      if (error.code === 'UsernameExistsException') {
        return {
          success: false,
          message: errorMessage ?? 'signup.errors.email_already_registered',
        };
      } else {
        return {
          success: false,
          message: errorMessage ?? 'signup.errors.signup_failed_prereq',
        };
      }
    }
  };

  const confirmSignUp = async (verificationCode: string): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/confirm_signup`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: username,
          confirmation_code: verificationCode,
        }),
      });
      if (res.status !== 200) {
        throw new Error('Failed to confirm sign up');
      }
      await Auth.signIn(username, password);
      setPassword('');
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signup.errors.authentication_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const forgotPassword = async (username: string): Promise<Result> => {
    try {
      await Auth.forgotPassword(username);
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error: any) {
      const errorMessage = (error as Error).message;
      if (error.code === 'UserNotFoundException') {
        return {
          success: false,
          message: errorMessage ?? 'signin.errors.email_not_found',
        };
      } else {
        return {
          success: false,
          message: errorMessage ?? 'signin.errors.email_sending_failed',
        };
      }
    }
  };

  const confirmPassword = async (
    username: string,
    code: string,
    password: string
  ): Promise<Result> => {
    try {
      await Auth.forgotPasswordSubmit(username, code, password);
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.password_change_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const setQRCodeFromSecret = (username: string, secret: string): void => {
    const issuer = encodeURI('OQTOPUS');
    const code =
      'otpauth://totp/' + issuer + ':' + username + '?secret=' + secret + '&issuer=' + issuer;
    setQRCode(code);
  };

  const setUpMfa = async (): Promise<Result> => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = await Auth.setupTOTP(user);
      const username: string = user.username;
      setQRCodeFromSecret(username, token);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.totp_setup_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const confirmMfa = async (totpCode: string): Promise<Result> => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUsername(user.username);
      await Auth.verifyTotpToken(user, totpCode);
      await Auth.setPreferredMFA(user, 'TOTP');
      setIsAuthenticated(true);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.totp_verification_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const confirmSignIn = async (totpCode: string): Promise<Result> => {
    try {
      const result = await Auth.confirmSignIn(resultUser, totpCode, 'SOFTWARE_TOKEN_MFA');
      setIsAuthenticated(true);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.totp_verification_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const startMfaReset = async (username: string, password: string): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/start`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });
      const resJson = await res.json();
      const accessToken = resJson.access_token;
      setUsername(username);
      setPassword(password);
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: accessToken };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: t('signup.auth.message.error.send_code'),
      };
    }
  };

  const confirmMfaReset = async (accessToken: string, code: string): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/verify_code`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          code: code,
        }),
      });
      const data = await res.json();
      const secret = data.secret;
      return { success: true, message: secret };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: t('signup.auth.message.error.verify_code'),
      };
    }
  };

  const resetMfa = async (accessToken: string, totpCode: string): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/confirm_totp`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          totp_code: totpCode,
        }),
      });
      if (res.status !== 204) {
        throw new Error('Failed to reset MFA');
      }
      setIsAuthenticated(true);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: t('signup.auth.message.error.setup_totp'),
      };
    }
  };

  const refreshApiToken = async (): Promise<Result> => {
    try {
      const cognitoUser: CognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession: CognitoUserSession = await Auth.currentSession();

      cognitoUser.refreshSession(
        currentSession.getRefreshToken(),
        (err: any, session: any): void => {
          if (err !== null) {
            return; // callback内で例外が扱えないので諦めて中断する
          }
        }
      );

      return {
        success: true,
        message: 'signin.confirm.api_token_reissued',
      };
    } catch (error) {
      const errorMessage = (error as Error).message ?? 'signin.errors.api_token_reissue_failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return {
    initialized,
    isAuthenticated,
    username,
    qrcode,
    email,
    pendingChallenge,
    getCurrentIdToken,
    signIn,
    completeNewPassword,
    signOut,
    signUp,
    confirmSignUp,
    forgotPassword,
    confirmPassword,
    setQRCodeFromSecret,
    setUpMfa,
    confirmMfa,
    confirmSignIn,
    startMfaReset,
    confirmMfaReset,
    resetMfa,
    refreshApiToken,
  };
};
