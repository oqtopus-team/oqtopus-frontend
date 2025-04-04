import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import CopyButton from './utils/copyButton';

export interface JobDetailProgramProps {
  program: string[];
  maxHeight: number;
}

export const JobDetailProgram: React.FC<JobDetailProgramProps> = (
  jobInfo: JobDetailProgramProps
) => {
  const { t } = useTranslation();
  const text = jobInfo.program.join('\n');
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Program</h3>
        <CopyButton text={text} />
      </div>
      <Spacer className="h-2" />
      {jobInfo.program === undefined || jobInfo.program === null || jobInfo.program.length === 0 ? (
        <div className={clsx('text-xs')}>{t('job.detail.program.nodata')}</div>
      ) : (
        <div className={clsx(['p-3', 'rounded', 'bg-cmd-bg'], ['text-xs', 'whitespace-pre-wrap'])}>
          <SimpleBar style={{ maxHeight: jobInfo.maxHeight }}>{text}</SimpleBar>
        </div>
      )}
    </>
  );
};
