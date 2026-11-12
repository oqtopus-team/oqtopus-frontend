/// <reference types="vite/client" />

/**
 * Typed surface for the app's build-time environment variables (Vite inlines
 * `VITE_APP_*` at build time). Selecting the auth driver is a build-time
 * decision via `VITE_APP_AUTH_MODE`; see `src/env/index.ts` and
 * `src/auth/Provider.tsx`.
 */
interface ImportMetaEnv {
  /** Auth driver to build: `cognito` (default, AWS/Amplify) or `proxy` (BFF). */
  readonly VITE_APP_AUTH_MODE?: 'cognito' | 'proxy';

  /**
   * User-API base URL. In `proxy` mode it defaults to the same-origin `/api`
   * (the reverse proxy forwards to the backend); required in `cognito` mode.
   */
  readonly VITE_APP_API_ENDPOINT?: string;

  /**
   * Base URL of the OIDC provider's self-service account console (`proxy`
   * mode). Password change and MFA management are delegated there.
   */
  readonly VITE_APP_ACCOUNT_CONSOLE_URL?: string;

  /** Signup service endpoint. Used only by the Cognito flows. */
  readonly VITE_APP_API_SIGNUP_ENDPOINT?: string;

  // --- Cognito (`cognito` mode) ---
  readonly VITE_APP_AUTH_REGION?: string;
  readonly VITE_APP_AUTH_USER_POOL_ID?: string;
  readonly VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID?: string;
  readonly VITE_APP_AUTH_COOKIE_STORAGE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
