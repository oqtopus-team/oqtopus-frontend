import { Footer } from '@/pages/_components/Footer';
import clsx from 'clsx';
import { Outlet } from 'react-router';

export default function AuthenticatedDefaultLayout() {
  return (
    <div className={clsx('relative', 'flex-1', 'bg-base-card', 'rounded-tl-2xl', 'min-w-0')}>
      <div className={clsx('relative', 'pt-8', 'px-8', 'pb-16')}>
        <Outlet />
      </div>
      <Footer isAbsolute={true} />
    </div>
  );
}
