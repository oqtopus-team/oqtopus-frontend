import { createContext } from 'react';

// The auth-driver contract. Every driver (cognito, proxy, …) implements this
// exact shape, so the rest of the app depends only on this interface — never on
// a specific identity provider. Add a new backend by adding a driver module
// that returns a UseAuth and registering it in Provider.tsx.

export interface Result {
  success: boolean;
  message: string;
}

export interface UseAuth {
  initialized: boolean;
  isAuthenticated: boolean;
  username: string;
  qrcode: string;
  email: string;
  getCurrentAccessToken: () => Promise<string>;
  signIn: (username: string, password: string) => Promise<Result>;
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
  // Change the signed-in user's password. In proxy mode this is delegated to
  // the IdP's account console (the driver reports it as unsupported).
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  // Preferred MFA status string (e.g. 'SOFTWARE_TOKEN_MFA' / 'NOMFA'). Empty in
  // proxy mode, where MFA lives in the IdP.
  getMfaStatus: () => Promise<string>;
}

export const AuthContext = createContext({} as UseAuth);
