import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import ClipboardCopy from './utils/ClipboardCopy';

export interface JobDetailTranspilerInfoProps {
  transpilerInfo?: string;
  heading?: string;
  maxHeight: number;
}

export const JobDetailTranspilerInfo: React.FC<JobDetailTranspilerInfoProps> = (
  job: JobDetailTranspilerInfoProps
) => {
  const { t } = useTranslation();
  const text = job.transpilerInfo ?? '';
  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>
        {job.heading != null ? job.heading : 'Transpiler Info'}
      </h3>
      <Spacer className="h-2" />
      {job.transpilerInfo === undefined ||
      job.transpilerInfo === null ||
      job.transpilerInfo === '' ? (
        <div className={clsx('text-xs')}>{t('job.detail.transpiler_info.nodata')}</div>
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
