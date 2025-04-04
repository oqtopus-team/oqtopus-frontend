import { useState, useLayoutEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Job, JobSearchParams, JOB_STATUSES, JobStatusType } from '@/domain/types/Job';
import { useTranslation } from 'react-i18next';
import { JobListItem } from './_components/JobListItem';
import { Card } from '@/pages/_components/Card';
import { Loader } from '@/pages/_components/Loader';
import { JobSearchForm } from './_components/JobSearchForm';
import clsx from 'clsx';
import { NavLink, useSearchParams } from 'react-router';
import { Button } from '@/pages/_components/Button';
import { Spacer } from '@/pages/_components/Spacer';
import { useDocumentTitle } from '@/pages/_hooks/title';
import { useJobAPI } from '@/backend/hook';

const PAGE_SIZE = 20; // 無限スクロールの1回の取得数

export default function JobListPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('job.list.title'));

  const { getLatestJobs } = useJobAPI();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [urlSearchParams, _] = useSearchParams();
  const [params, setParams] = useState<JobSearchParams>({});

  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useLayoutEffect(() => {
    setParams((params) => {
      urlSearchParams.forEach((value, key) => {
        if (key === 'status' && JOB_STATUSES.includes(value as JobStatusType)) {
          params.status = value as JobStatusType;
        } else if (key === 'jobid' || key === 'description') {
          params[key] = value;
        }
      });
      return params;
    });
    setJobs([]);
    setHasMore(true);
    reloadJobs();
  }, []);

  const onSearchSubmit = (): void => {
    window.history.pushState(null, '', `/jobs?${generateSearchParams(params)}`);
    reloadJobs();
  };

  const reloadJobs = (): void => {
    setPage(0);
    setJobs([]);
    getJobsScroll(1);
  };

  // 無限スクロール取得
  const getJobsScroll = (page: number): void => {
    setHasMore(false); // 連続発火を防ぐためにfalseに変更
    setLoading(true);

    getLatestJobs(page, PAGE_SIZE)
      .then((resJobs) => {
        setJobs(page === 1 ? resJobs : [...jobs, ...resJobs]);
        if (resJobs.length === PAGE_SIZE) {
          setHasMore(true); // 続けて読み込み可
        }
        setPage(page + 1);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <h2 className={clsx('text-primary', 'text-2xl', 'font-bold')}>{t('job.list.title')}</h2>
      <Spacer className="h-3" />
      <p className={clsx('text-sm')}>{t('job.list.description')}</p>
      <Spacer className="h-8" />
      <div className={clsx('absolute', 'top-8', 'right-8')}>
        <NavLink color="secondary" to={'/jobs/form'}>
          <Button color="secondary">{t('job.list.register_button')}</Button>
        </NavLink>
      </div>
      <div className={clsx('max-w-full', 'min-w-[800px]', 'flex', 'flex-col', 'gap-6')}>
        <Card>
          <JobSearchForm params={params} setParams={setParams} onSubmit={onSearchSubmit} />
        </Card>
        <Card>
          <InfiniteScroll
            next={() => getJobsScroll(page)}
            hasMore={hasMore}
            scrollThreshold={20}
            loader={undefined}
            dataLength={0}
          >
            <table className={clsx('w-full')}>
              <thead>
                <tr>
                  <th>{t('job.list.table.id')}</th>
                  <th>{t('job.list.table.device')}</th>
                  <th>{t('job.list.table.status')}</th>
                  <th>{t('job.list.table.date')}</th>
                  <th className={clsx('w-full')}>{t('job.list.table.description')}</th>
                  <th>{t('job.list.table.operation')}</th>
                </tr>
              </thead>
              <tbody>
                {jobs
                  .filter((job) => {
                    if (params.status && job.status !== params.status) {
                      return false;
                    }
                    if (params.jobid && job.id !== params.jobid) {
                      return false;
                    }
                    if (params.description && !job.description?.includes(params.description)) {
                      return false;
                    }
                    return true;
                  })
                  .map((job) => (
                    <JobListItem key={job.id} job={job} onJobModified={reloadJobs} />
                  ))}
                {!loading && jobs.length === 0 && (
                  <tr>
                    <td colSpan={4}>{t('job.list.nodata')}</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className={clsx('text-center')}>
                      <div className={clsx('justify-center')}>
                        <Loader />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </InfiniteScroll>
        </Card>
      </div>
    </div>
  );
}

const generateSearchParams = (params: JobSearchParams): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }
    searchParams.set(key, value);
  });
  searchParams.sort();

  const search = searchParams.toString();
  return search;
};
