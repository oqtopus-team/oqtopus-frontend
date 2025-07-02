import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { JobsEstimationResult, JobsSamplingResult } from '@/api/generated';
import ClipboardCopy from './utils/ClipboardCopy';

export interface JobDetailResultProps {
  result?: JobsSamplingResult | JobsEstimationResult;
  heading?: string;
  maxHeight: number;
}

export const JobDetailResult: React.FC<JobDetailResultProps> = (job: JobDetailResultProps) => {
  const { t } = useTranslation();

  const json = (() => {
    const retVal: { [key: string]: any } = (() => {
      if (job.result != null) {
        return job.result;
      }
      return {};
    })();
    return retVal;
  })();
  const text = JSON.stringify(json);

  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>
        {job.heading != null ? job.heading : 'Result'}
      </h3>
      <Spacer className="h-2" />
      {job.result === undefined || job.result === null ? (
        <div className={clsx('text-xs')}>{t('job.detail.result.nodata')}</div>
      ) : (
        <div className={clsx('relative')}>
          <div className={clsx('rounded', 'bg-cmd-bg', 'text-sm')}>
            <SimpleBar style={{ maxHeight: job.maxHeight }}>
              <JSONCodeBlock json={text} />
            </SimpleBar>
          </div>
          <ClipboardCopy text={text} />
        </div>
      )}
    </>
  );
};
