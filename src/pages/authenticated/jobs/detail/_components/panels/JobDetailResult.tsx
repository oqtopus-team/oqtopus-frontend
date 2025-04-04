import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { JobsEstimationResult, JobsSamplingResult } from '@/api/generated';
import CopyButton from './utils/copyButton'

export interface JobDetailResultProps {
  result?: JobsSamplingResult | JobsEstimationResult;
  mitigationInfo?: string;
  maxHeight: number;
}

export const JobDetailResult: React.FC<JobDetailResultProps> = (job: JobDetailResultProps) => {
  const { t } = useTranslation();

  const json = (() => {
    const retVal: { [key: string]: any } = {};
    if (job.result != null) {
      retVal['result'] = { ...job.result };
    }
    if (job.mitigationInfo != null && job.mitigationInfo !== '') {
      retVal['mitigation_info'] = job.mitigationInfo;
    }
    return retVal;
  })();
  const text = JSON.stringify(json);

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Result</h3>
        <CopyButton text={text} />
      </div>
      <Spacer className="h-2" />
      {job.result === undefined || job.result === null ? (
        <div className={clsx('text-xs')}>{t('job.detail.result.nodata')}</div>
      ) : (
        <SimpleBar style={{ maxHeight: job.maxHeight }}>
          <JSONCodeBlock json={text} />
        </SimpleBar>
      )}
    </>
  );
};
