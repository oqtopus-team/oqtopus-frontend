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
  getCurrentIdToken: () => Promise<string>;
  signIn: (username: string, password: string) => Promise<Result>;
  signOut: () => void;
  signUp: (username: string, password: string) => Promise<Result>;
  confirmSignUp: (verificationCode: string) => Promise<Result>;
  forgotPassword: (username: string) => Promise<Result>;
  confirmPassword: (username: string, code: string, password: string) => Promise<Result>;
  setQRCodeFromSecret: (username: string, secret: string) => void;
  setUpMfa: () => Promise<Result>;
  confirmMfa: (totpCode: string) => Promise<Result>;
  confirmSignIn: (totpCode: string) => Promise<Result>;
  startMfaReset: (username: string, password: string) => Promise<Result>;
  confirmMfaReset: (username: string, password: string, code: string) => Promise<Result>;
  resetMfa: (username: string, password: string, totp_code: string) => Promise<Result>;
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
  const [email, setEmail] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((result: any) => {
        setUsername(result.username);
        if (Object.prototype.hasOwnProperty.call(result, 'preferredMFA')) {
          if (result.preferredMFA === 'SOFTWARE_TOKEN_MFA') {
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
      const hasChallenge = Object.prototype.hasOwnProperty.call(result, 'challengeName');
      setIsAuthenticated(false);
      setInitialized(true);
      if (!hasChallenge) {
        return { success: false, message: 'MFAを設定してください。' };
      }
      return { success: true, message: '' };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: '認証に失敗しました。',
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
      console.log(error);
      return {
        success: false,
        message: 'ログアウトに失敗しました。',
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
      console.log(error);
      if (error.code === 'UsernameExistsException') {
        return {
          success: false,
          message: '入力したメールアドレスはすでに登録されています',
        };
      } else {
        return {
          success: false,
          message:
            'サインアップに失敗しました。\nサインアップには事前ユーザー登録が必要です。\n登録がお済みでない場合は管理者までお問い合わせください。',
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
      return {
        success: false,
        message: '認証に失敗しました。',
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
      console.log(error);
      if (error.code === 'UserNotFoundException') {
        return {
          success: false,
          message: '入力したメールアドレスは存在しません',
        };
      } else {
        return {
          success: false,
          message: 'メール送信に失敗しました。',
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
      console.log(error);
      return {
        success: false,
        message: 'パスワード変更に失敗しました。',
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
      console.log(error);
      return {
        success: false,
        message: 'TOTPの設定に失敗しました。',
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
      console.log(error);
      return {
        success: false,
        message: 'TOTPの認証に失敗しました。',
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
      console.log(error);
      return {
        success: false,
        message: 'TOTPの認証に失敗しました。',
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
      setUsername(username);
      setPassword(password);
      setIsAuthenticated(false);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'MFA再設定に必要な確認コードの送信に失敗しました。',
      };
    }
  };

  const confirmMfaReset = async (
    username: string,
    password: string,
    code: string
  ): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/verify_code`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
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
        message: '確認コードの検証に失敗しました。',
      };
    }
  };

  const resetMfa = async (
    username: string,
    password: string,
    totpCode: string
  ): Promise<Result> => {
    try {
      const res = await fetch(`${ENV.API_SIGNUP_ENDPOINT}/mfa_reset/confirm_totp`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
          totp_code: totpCode,
        }),
      });
      setIsAuthenticated(true);
      setInitialized(true);
      return { success: true, message: '' };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'TOTPの認証に失敗しました。',
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
        message: 'APIトークンを再発行しました。',
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'APIトークンの再発行に失敗しました。',
      };
    }
  };

  return {
    initialized,
    isAuthenticated,
    username,
    qrcode,
    email,
    getCurrentIdToken,
    signIn,
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
