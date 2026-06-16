import clsx from 'clsx';
import { Footer } from '@/pages/_components/Footer';
import { Outlet } from 'react-router';

export default function DashboardLayout() {
  return (
    <div className={clsx('relative', 'flex-1', 'min-w-0')}>
      <div className={clsx('p-8', 'rounded-tl-2xl', 'rounded-bl-2xl', 'bg-base-card')}>
        <Outlet />
      </div>
      <div className={clsx('pt-6', 'px-8', 'pb-12')}>
        {/* TODO: Enable links */}
        {/* <Links /> */}
      </div>
      <Footer isAbsolute={true} />
    </div>
  );
}
