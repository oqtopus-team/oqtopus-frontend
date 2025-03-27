import clsx from 'clsx';
import { Outlet } from 'react-router';
import { JobFormLogProvider } from './_hooks/FormLogProvider';
import { useJobFormLog } from './_hooks/useJobFormLog';
import { Spacer } from '@/pages/_components/Spacer';
import { useTranslation } from 'react-i18next';
import { LogItem } from './_components/LogItem';
import { BsTrash3Fill } from 'react-icons/bs';
import { Button } from '@/pages/_components/Button';

export default function JobFormLayout() {
  return (
    <JobFormLogProvider>
      <JobFormLayoutForProvided />
    </JobFormLogProvider>
  );
}

const JobFormLayoutForProvided = () => {
  const { t } = useTranslation();
  const { log, clearLog } = useJobFormLog();
  return (
    <div className={clsx('flex', 'flex-wrap', 'gap-4')}>
      <div className={clsx('w-full', 'max-w-[1120px]')}>
        <Outlet />
      </div>
      <div
        className={clsx(
          ['max-w-[420px]', 'w-full', 'min-h-40'],
          ['border-l-[1px]', 'border-l-divider-bg', 'pl-4']
        )}
      >
        <div className={clsx('flex', 'items-center', 'justify-between')}>
          <div className={clsx('text-primary', 'text-lg', 'font-bold')}>
            {t('job.form.log.title')}
          </div>
          <Button color="disabled" onClick={() => clearLog()}>
            <BsTrash3Fill />
          </Button>
        </div>
        <Spacer className="h-3" />
        {log.length === 0 && <p className={clsx('text-sm')}>{t('job.form.log.empty')}</p>}
        <div
          className={clsx(
            ['w-full', 'flex', 'flex-col', 'gap-5'],
            ['max-h-[1100px]', 'overflow-y-auto', 'pr-3']
          )}
        >
          {log.map((item, i) => (
            <div key={i}>
              <LogItem log={item} />
            </div>
          ))}
          {log.length > 6 && <Spacer className="min-h-[910px]" />}
        </div>
      </div>
    </div>
  );
};
