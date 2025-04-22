import { useTranslation } from 'react-i18next';
import React from 'react';
import clsx from 'clsx';
import { Spacer } from '@/pages/_components/Spacer';
import { isFinishedStatus } from './utils/StatusHelpers';
import { DateTimeFormatter } from '../../../../_components/DateTimeFormatter';

export interface JobDetailBasicInfoProps {
  id: string;
  name: string;
  description?: string;
  jobType: string;
  deviceId?: string;
  shots: string;
  status: string;
  submittedAt: string;
  readyAt: string;
  runningAt: string;
  endedAt: string;
  executionTime: number;
  message?: string;
}
interface BoldThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const BoldTh: React.FC<BoldThProps> = ({ children, className, ...props }) => {
  return (
    <th className={clsx('font-bold', 'text-lg')} style={{ color: 'black' }} {...props}>
      {children}
    </th>
  );
};

export const JobDetailBasicInfo: React.FC<JobDetailBasicInfoProps> = (
  job: JobDetailBasicInfoProps
) => {
  const { t, i18n } = useTranslation();

  const executionTime = isFinishedStatus(job.status) ? job.executionTime.toString() : '';

  return (
    <>
      <Spacer className="h-2" />
      <table className={clsx('w-full')}>
        <thead>
          <tr>
            <th className={clsx('text-base-content')}>{t('job.detail.info.item')}</th>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <BoldTh>{t('job.detail.info.id')}</BoldTh>
            <td>{job.id}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.name')}</BoldTh>
            <td>{job.name}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.description')}</BoldTh>
            <td className={clsx('break-all', 'whitespace-pre-wrap')}>{job.description ?? ''}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.job_type')}</BoldTh>
            <td>{job.jobType ?? ''}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.device_id')}</BoldTh>
            <td>{job.deviceId ?? ''}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.shots')}</BoldTh>
            <td>{job.shots}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.status')}</BoldTh>
            <td>{job.status}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.submitted_at')}</BoldTh>
            <td>{DateTimeFormatter(t, i18n, job.submittedAt)}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.ready_at')}</BoldTh>
            <td>{DateTimeFormatter(t, i18n, job.readyAt)}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.running_at')}</BoldTh>
            <td>{DateTimeFormatter(t, i18n, job.runningAt)}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.ended_at')}</BoldTh>
            <td>{DateTimeFormatter(t, i18n, job.endedAt)}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.execution_time')}</BoldTh>
            <td>{executionTime}</td>
          </tr>
          <tr>
            <BoldTh>{t('job.detail.info.message')}</BoldTh>
            <td className={clsx('break-all', 'whitespace-pre-wrap')}>{job.message ?? ''}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
