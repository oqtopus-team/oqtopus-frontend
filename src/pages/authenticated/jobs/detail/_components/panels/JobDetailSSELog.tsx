import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { Button } from '@/pages/_components/Button';
import { useDownloadLog } from '@/pages/_hooks/useDownloadLog';
import { isFinishedStatus } from './utils/StatusHelpers';

type JobDetailSSELogProps = {
  job_id: string;
  sseLogFileURL: string | undefined;
  status: string;
};

export const JobDetailSSELog: React.FC<JobDetailSSELogProps> = ({
  job_id,
  status,
  sseLogFileURL,
}) => {
  const { t } = useTranslation();
  const { handleDownloadLog } = useDownloadLog();

  const [color, isDisabled] = ((): ['disabled' | 'secondary' | 'error', boolean] => {
    if (isFinishedStatus(status)) {
      return ['secondary', false];
    } else {
      return ['disabled', true];
    }
  })();

  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>{t('job.detail.sselog.head')}</h3>
      <Spacer className="h-2" />
      <div className={clsx('flex', 'items-center', 'justify-center')}>
        <Button
          color={color}
          onClick={() => handleDownloadLog(job_id, sseLogFileURL)}
          disabled={isDisabled}
        >
          {t('job.detail.sselog.button')}
        </Button>
      </div>
    </>
  );
};
