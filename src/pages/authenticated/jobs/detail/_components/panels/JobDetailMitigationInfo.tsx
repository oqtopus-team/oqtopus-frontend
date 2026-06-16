import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import ClipboardCopy from './utils/ClipboardCopy';

export interface JobDetailMitigationInfoProps {
  mitigationInfo?: { [key: string]: any };
  maxHeight: number;
}

export const JobDetailMitigationInfo: React.FC<JobDetailMitigationInfoProps> = (
  job: JobDetailMitigationInfoProps
) => {
  const { t } = useTranslation();
  const text = JSON.stringify(job.mitigationInfo, null, 2);
  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>Error Mitigation Information</h3>
      <Spacer className="h-2" />
      {job.mitigationInfo === undefined || job.mitigationInfo === null ? (
        <div className={clsx('text-xs')}>{t('job.detail.mitigation_info.nodata')}</div>
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
