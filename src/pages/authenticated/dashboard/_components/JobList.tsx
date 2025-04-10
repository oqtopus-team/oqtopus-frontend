import { JobStatus } from '@/pages/authenticated/jobs/_components/JobStatus';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { Job } from '@/domain/types/Job';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

export const JobList = ({ jobs }: { jobs: Job[] }): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <div className={clsx('flex', 'justify-between', 'items-center')}>
        <div className={clsx('text-lg', 'font-bold', 'text-primary')}>
          {t('dashboard.job.title')}
        </div>
        <Button kind="link" color="secondary" href="/jobs">
          {t('dashboard.job.button')}
        </Button>
      </div>
      <Spacer className="h-3" />
      <table className={clsx('w-full')}>
        <thead>
          <tr>
            <th className="!w-[400px]">{t('dashboard.job.table.id')}</th>
            <th className="!w-[400px]">{t('dashboard.job.table.device')}</th>
            <th className="!w-[50px]">{t('dashboard.job.table.status')}</th>
            <th className="!w-[160px]">{t('dashboard.job.table.date')}</th>
            <th className="!w-[80px]">{t('dashboard.job.table.shots')}</th>
            <th>{t('dashboard.job.table.description')}</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            return (
              <tr key={job.id}>
                <td>
                  <NavLink to={`/jobs/${job.id}`} className="text-link">
                    {job.id}
                  </NavLink>
                </td>
                <td>
                  <NavLink to={`/device/${job.deviceId}`} className="text-link">
                    {job.deviceId}
                  </NavLink>
                </td>
                <td>
                  <JobStatus status={job.status} />
                </td>
                <td>{job.submittedAt}</td>
                <td>{job.shots}</td>
                <td>{job.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
