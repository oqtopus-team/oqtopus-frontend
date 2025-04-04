import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import CopyButton from './utils/copyButton'

export interface JobDetailTranspilerInfoProps {
  transpilerInfo?: string;
  maxHeight: number;
}

export const JobDetailTranspilerInfo: React.FC<JobDetailTranspilerInfoProps> = (
  job: JobDetailTranspilerInfoProps
) => {
  const { t } = useTranslation();
  const text = job.transpilerInfo ?? '';
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Transpiler Info</h3>
        <CopyButton text={text} />
      </div>
      <Spacer className="h-2" />
      {job.transpilerInfo === undefined ||
        job.transpilerInfo === null ||
        job.transpilerInfo === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.transpiler_info.nodata')}</div>
      ) : (
        <div className={clsx(['p-3', 'rounded', 'bg-cmd-bg'], ['text-xs', 'whitespace-pre-wrap'])}>
          <SimpleBar style={{ maxHeight: job.maxHeight }}>
            <JSONCodeBlock json={text} />
          </SimpleBar>
        </div>
      )}
    </>
  );
};
