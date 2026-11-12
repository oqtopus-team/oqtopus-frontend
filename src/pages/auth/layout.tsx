import clsx from 'clsx';
import { useEffect } from 'react';
import { Header } from '../_components/Header';
import { Footer } from '../_components/Footer';
import { Hero } from './_components/Hero';
import { Spacer } from '../_components/Spacer';
import { Outlet } from 'react-router';
import { Loader } from '@/pages/_components/Loader';
import './layout.css';

// These screens (login / signup / password-reset / MFA) are Cognito-specific.
// In proxy (BFF) mode the IdP owns the whole login lifecycle, so we never render
// them — we send the browser straight to the proxy's login entrypoint instead.
const isProxyAuth = import.meta.env.VITE_APP_AUTH_MODE === 'proxy';

export default function AuthLayout() {
  useEffect(() => {
    if (isProxyAuth) {
      // Full-page navigation: /oauth2/start is served by the reverse proxy, not
      // the SPA router. Return to the app root after login (not back to /login).
      window.location.replace('/oauth2/start?rd=%2F');
    }
  }, []);

  if (isProxyAuth) {
    return <Loader />;
  }

  return (
    <div className="auth-layout">
      <Header />
      <div className={clsx('px-8', 'pt-8')}>
        <Hero />
        <Spacer className="h-8" />
        <div className={clsx('flex', 'flex-1')}>
          <div className={clsx('auth-layout-content-wrapper', 'w-1/2', 'flex', 'justify-center')}>
            <Outlet />
          </div>
        </div>
      </div>
      <Footer isAbsolute={false} className={clsx('mt-auto')} />
    </div>
  );
}
