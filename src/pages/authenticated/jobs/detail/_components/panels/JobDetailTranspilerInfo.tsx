import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export interface JobDetailTranspilerInfoProps {
  transpilerInfo?: string;
  maxHeight: number;
}

export const JobDetailTranspilerInfo: React.FC<JobDetailTranspilerInfoProps> = (
  job: JobDetailTranspilerInfoProps
) => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>Transpiler Info</h3>
      <Spacer className="h-2" />
      {job.transpilerInfo === undefined ||
      job.transpilerInfo === null ||
      job.transpilerInfo === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.transpiler_info.nodata')}</div>
      ) : (
        <div className={clsx(['p-3', 'rounded', 'bg-cmd-bg'], ['text-xs', 'whitespace-pre-wrap'])}>
          <SimpleBar style={{ maxHeight: job.maxHeight }}>
            <JSONCodeBlock json={job.transpilerInfo} />
          </SimpleBar>
        </div>
      )}
    </>
  );
};
