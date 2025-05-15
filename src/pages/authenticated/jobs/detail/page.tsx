import { Loader } from '@/pages/_components/Loader';
import { useAuth } from '@/auth/hook';
import { Job } from '@/domain/types/Job';
import clsx from 'clsx';
import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@/pages/_components/Spacer';
import { useParams } from 'react-router';
import { SuccessViewSampling } from './_components/SamplingJobDetail';
import { SuccessViewEstimation } from './_components/EstimationJobDetail';
import { SuccessViewMultiManual } from './_components/MultiManualJobDetail';
import { SuccessViewSSELog } from './_components/SSEJobDetail';
import { useJobAPI } from '@/backend/hook';
import ReloadButton from './_components/panels/utils/ReloadButton';
import DownloadJobButton from '../_components/DownloadJobButton';

export default function JobDetailPage_() {
  const { id } = useParams();
  return <JobDetailPage params={{ id: id ?? 'notfound' }} />;
}

type Params = { id: string };

const JobDetailPage = ({ params: { id } }: { params: Params }) => {
  const auth = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getJob } = useJobAPI();

  useLayoutEffect(() => {
    setLoading(true);
    if (id != '') {
      setJob({
        id: '1',
        name: 'test1',
        description: 'test 1 desc',
        jobInfo: { program: ['abc'] },
        transpilerInfo: { test1: 'tt' },
        jobType: 'estimation',
        shots: 412,
        status: 'submitted',
        deviceId: 'Kawasaki',
        submittedAt: '0',
        readyAt: '0',
        runningAt: '0',
        endedAt: '0',
        executionTime: 1,
      } as Job);
      setIsSuccess(true);
      setLoading(false);
      // getJob(id)
      //   .then((job) => setJob(job))
      //   .catch(() => setIsSuccess(false))
      //   .finally(() => {
      //     setIsSuccess(true);
      //     setLoading(false);
      //   });
    }
  }, [id]);

  if (loading) {
    return <LoadingView />;
  }
  if (job === null || !isSuccess) {
    return <NotFoundView />;
  }
  return (
    <>
      <Title job={job} />
      <Spacer className="h-3" />
      <SuccessViewWrapper {...job} />
    </>
  );
};

const LoadingView = () => {
  return (
    <>
      <Title />
      <Spacer className="h-3" />
      <Loader />
    </>
  );
};

const Title = ({ job }: { job?: Job }) => {
  const { t } = useTranslation();
  return (
    <div className={clsx('flex', 'items-center', 'text-primary', 'text-2xl', 'font-bold')}>
      {t('job.detail.title')}
      <ReloadButton />
      <DownloadJobButton style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }} job={job} />
    </div>
  );
};

const SuccessViewWrapper: React.FC<Job> = (job: Job) => {
  const jobType: string = job.jobType;
  if (jobType === 'sampling') {
    return <SuccessViewSampling {...job} />;
  } else if (jobType === 'estimation') {
    return <SuccessViewEstimation {...job} />;
  } else if (jobType === 'multi_manual') {
    return <SuccessViewMultiManual {...job} />;
  } else if (jobType === 'sse') {
    return <SuccessViewSSELog {...job} />;
  } else {
    return <NotFoundView />;
  }
};

const NotFoundView = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title />
      <Spacer className="h-3" />
      <p className={clsx('text-error', 'text-xs')}>{t('job.detail.not_found')}</p>
    </>
  );
};
