import { useNavigate } from 'react-router';
import { useAuth } from '@/auth/hook';
import { Loader } from '@/pages/_components/Loader';
import { useEffect } from 'react';

export const RequestLogin = ({ children }: React.PropsWithChildren) => {
  const { initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, initialized]);

  return initialized && isAuthenticated ? children : <Loader />;
};
