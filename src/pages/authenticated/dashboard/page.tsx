import { useLayoutEffect, useState } from 'react';
import { Job } from '@/domain/types/Job';
import { DeviceList } from './_components/DeviceList';
import { Announcements } from './_components/Announcements';
import { JobList } from './_components/JobList';
import { Hero } from './_components/Hero';
import { Composer } from './_components/Composer';
import clsx from 'clsx';
import { Card } from '@/pages/_components/Card';
import { Spacer } from '@/pages/_components/Spacer';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useJobAPI } from '@/backend/hook';
import './page.css';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(t('dashboard.title'));

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const { getLatestJobs } = useJobAPI();

  useLayoutEffect(() => {
    setLoadingJobs(true);
    getLatestJobs(1, 10)
      .then((jobs) => setJobs(jobs))
      .catch((e) => console.error(e))
      .finally(() => setLoadingJobs(false));
  }, []);

  return (
    <>
      <Hero />
      <Spacer className="h-5" />
      <div
        className={clsx(
          'dashboard-page',
          'grid',
          'grid-cols-[1fr_1fr_1fr]',
          'grid-rows-[auto_1fr]',
          'gap-5'
        )}
      >
        <Card className={clsx(['col-start-1', 'col-end-1'], ['grayscale', 'bg-disable-bg'])}>
          <Composer />
        </Card>
        <Card className={clsx(['col-start-2', 'col-end-3', 'overflow-x-auto'])}>
          <DeviceList />
        </Card>
        <Card className={clsx(['col-start-3', 'col-end-4', 'row-start-1', 'row-end-1  '])}>
          <Announcements style={{ post: { '--base-size': 0.55 } }} />
        </Card>
        <Card className={clsx(['col-start-1', 'col-end-3', 'row-start-2', 'overflow-x-auto'])}>
          <JobList jobs={jobs ?? []} />
        </Card>
      </div>
    </>
  );
}
