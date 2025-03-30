import clsx from 'clsx';
import { Header } from '../_components/Header';
import { Sidebar } from './_components/Sidebar';
import { RequestLogin } from './_components/RequestLogin';
import { Outlet } from 'react-router';
import { useAuth } from '@/auth/hook';
import { UserAPIProvider } from '@/backend/Provider';
import ENV from '@/env';

export default function AuthenticatedLayout() {
  const auth = useAuth();
  return (
    <RequestLogin>
      <UserAPIProvider basePath={ENV.API_ENDPOINT} accessToken={auth.getCurrentIdToken}>
        <div className={clsx('min-h-screen', 'flex', 'flex-col')}>
          <Header />
          <div className={clsx('flex', 'flex-auto', 'bg-base-100')}>
            <Sidebar />
            <Outlet />
          </div>
        </div>
      </UserAPIProvider>
    </RequestLogin>
  );
}
