import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export interface JobDetailTranspiledProgramProps {
  transpiledProgram?: string;
  maxHeight: number;
}

export const JobDetailTranspiledProgram: React.FC<JobDetailTranspiledProgramProps> = (
  jobInfo: JobDetailTranspiledProgramProps
) => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>Transpiled Program</h3>
      <Spacer className="h-2" />
      {jobInfo.transpiledProgram === undefined ||
        jobInfo.transpiledProgram === null ||
        jobInfo.transpiledProgram === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.transpiled_program.nodata')}</div>
      ) : (
        <div className={clsx(['p-3', 'rounded', 'bg-cmd-bg'], ['text-xs'])}>
          <SimpleBar style={{ maxHeight: jobInfo.maxHeight }}>
            {jobInfo.transpiledProgram}
          </SimpleBar>
        </div>
      )}
    </>
  );
};
