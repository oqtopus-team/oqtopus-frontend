import { useAuth } from '@/auth/hook';
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    navigate('/dashboard');
  }, []);
  return <></>;
}
