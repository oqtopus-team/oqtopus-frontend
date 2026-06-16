import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { JobForm } from '@/pages/authenticated/jobs/_components/JobForm';
import { useTranslation } from 'react-i18next';

export default function Page() {
  const { t } = useTranslation();

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={2000} // display for 2 seconds
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        hideProgressBar={true}
        pauseOnHover
      />
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('job.form.title')}</h2>
      <Spacer className="h-3" />
      <p className={clsx('text-sm')}>{t('job.form.description')}</p>
      <Spacer className="h-8" />
      <JobForm />
    </div>
  );
}
