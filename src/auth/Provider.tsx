import { lazy, Suspense } from 'react';
import { Loader } from '@/pages/_components/Loader';

// Public surface preserved for existing importers of `@/auth/Provider`.
export { AuthContext } from './contract';
export type { UseAuth, Result } from './contract';

// Auth-driver registry.
//
// AUTH_MODE is a build-time constant (Vite inlines `import.meta.env.VITE_APP_*`),
// so the ternary below is evaluated at build time and only the selected driver's
// dynamic `import()` survives dead-code elimination. A `proxy` build therefore
// ships no aws-amplify/Cognito code; a `cognito` build ships no proxy driver.
// (Set VITE_APP_AUTH_MODE explicitly at build time to get a fully-split bundle.)
//
// To add a new backend: create `./drivers/<name>.tsx` exporting a
// `<Name>AuthProvider` that supplies a `UseAuth` (see ./contract), then add a
// branch here.
const AUTH_MODE = import.meta.env.VITE_APP_AUTH_MODE || 'cognito';

const DriverProvider = lazy(() =>
  AUTH_MODE === 'proxy'
    ? import('./drivers/proxy').then((m) => ({ default: m.ProxyAuthProvider }))
    : import('./drivers/cognito').then((m) => ({ default: m.CognitoAuthProvider }))
);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Suspense fallback={<Loader />}>
      <DriverProvider>{children}</DriverProvider>
    </Suspense>
  );
};
