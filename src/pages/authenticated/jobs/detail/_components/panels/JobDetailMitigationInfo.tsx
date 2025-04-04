import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Spacer } from '@/pages/_components/Spacer';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import CopyButton from './utils/copyButton';

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
      <div className="flex justify-between items-center">
        <h3 className={clsx('text-primary', 'font-bold')}>Error Mitigation Information</h3>
        <CopyButton text={text} />
      </div>
      <Spacer className="h-2" />
      {job.mitigationInfo === undefined || job.mitigationInfo === null ? (
        <div className={clsx('text-xs')}>{t('job.detail.mitigation_info.nodata')}</div>
      ) : (
        <SimpleBar style={{ maxHeight: job.maxHeight }}>
          <JSONCodeBlock json={text} />
        </SimpleBar>
      )}
    </>
  );
};
