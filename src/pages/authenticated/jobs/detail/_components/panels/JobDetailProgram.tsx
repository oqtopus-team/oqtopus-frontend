import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import ClipboardCopy from './utils/ClipboardCopy';

export interface JobDetailProgramProps {
  program: string[];
  heading?: string;
  maxHeight: number;
}

export const JobDetailProgram: React.FC<JobDetailProgramProps> = (
  jobInfo: JobDetailProgramProps
) => {
  const { t } = useTranslation();
  const text = jobInfo.program.join('\n');
  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>
        {jobInfo.heading != null ? jobInfo.heading : 'Program'}
      </h3>
      <Spacer className="h-2" />
      {jobInfo.program === undefined || jobInfo.program === null || jobInfo.program.length === 0 ? (
        <div className={clsx('text-xs')}>{t('job.detail.program.nodata')}</div>
      ) : (
        <>
          <div className={clsx('relative')}>
            <div className={clsx('p-3', 'rounded', 'bg-cmd-bg', 'text-sm')}>
              <SimpleBar style={{ maxHeight: jobInfo.maxHeight }}>
                <div className={clsx('whitespace-pre-wrap')}>{text}</div>
              </SimpleBar>
            </div>
            <ClipboardCopy text={text} />
          </div>
        </>
      )}
    </>
  );
};
