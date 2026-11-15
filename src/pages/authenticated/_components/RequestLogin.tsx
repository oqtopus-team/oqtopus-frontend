import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/hook';
import { Loader } from '@/pages/_components/Loader';
import { useEffect } from 'react';
import ENV from '@/env';

export const RequestLogin = ({ children }: React.PropsWithChildren) => {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      if (ENV.AUTH_MODE === 'proxy') {
        // BFF mode: hand off to the reverse proxy, which starts the OIDC login.
        const rd = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/oauth2/start?rd=${rd}`;
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, initialized]);

  return initialized && isAuthenticated ? children : <Loader />;
};
