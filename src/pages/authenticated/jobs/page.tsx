import { useState, useLayoutEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Job,
  JobSearchParams,
  JOB_STATUSES,
  JobStatusType,
  NOT_CANCELABLE_JOBS,
} from '@/domain/types/Job';
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
import { ConfirmModal } from '@/pages/_components/ConfirmModal';

const PAGE_SIZE = 20; // 無限スクロールの1回の取得数

export default function JobListPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('job.list.title'));

  const { getLatestJobs, deleteJob, cancelJob } = useJobAPI();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [urlSearchParams, _] = useSearchParams();
  const [params, setParams] = useState<JobSearchParams>({});

  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteInProgress, setBulkDeleteInProgress] = useState(false);
  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const [bulkCancelInProgress, setBulkCancelInProgress] = useState(false);

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
    setSelectedJobs([]);
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

  const handleJobSelectionChange = (job: Job, selected: boolean) => {
    if (selected) {
      setSelectedJobs([...selectedJobs, job]);
    } else {
      setSelectedJobs(selectedJobs.filter((j) => j.id !== job.id));
    }
  };

  const handleAllJobsSelectionChange = (selected: boolean) => {
    if (selected) {
      setSelectedJobs([...jobs]);
    } else {
      setSelectedJobs([]);
    }
  };

  const deleteSelectedJobs = async () => {
    if (bulkDeleteInProgress) return;

    setBulkDeleteInProgress(true);

    for (const job of selectedJobs) {
      try {
        await deleteJob(job);
      } catch (error: any) {
        console.error(error);
      }
    }

    reloadJobs();
    setBulkDeleteInProgress(false);
  };

  const cancelSelectedJobs = async () => {
    if (bulkCancelInProgress) return;

    setBulkCancelInProgress(true);

    for (const job of selectedJobs) {
      try {
        await cancelJob(job);
      } catch (error: any) {
        console.error(error);
      }
    }

    reloadJobs();
    setBulkCancelInProgress(false);
  };

  const areAllJobsSelected = () => {
    return (
      jobs.length > 0 &&
      jobs.every((j) => selectedJobs.some((selectedJob) => selectedJob.id === j.id))
    );
  };

  const isDeleteSelectedDisabled = () => {
    return selectedJobs.length === 0 || bulkDeleteInProgress;
  };

  const isCancelSelectedDisabled = () => {
    return (
      selectedJobs.length === 0 || selectedJobs.some((j) => NOT_CANCELABLE_JOBS.includes(j.status))
    );
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
          <section className={clsx('mt-2', 'mb-2', 'flex', 'gap-[0.5rem]', 'justify-end')}>
            <Button
              color={isDeleteSelectedDisabled() ? 'disabled' : 'error'}
              disabled={isDeleteSelectedDisabled()}
              onClick={() => setShowBulkDeleteModal(true)}
            >
              {t('job.list.delete_selected')}
            </Button>
            <Button
              color={isCancelSelectedDisabled() ? 'disabled' : 'secondary'}
              disabled={isCancelSelectedDisabled()}
              onClick={() => setShowBulkCancelModal(true)}
            >
              {t('job.list.cancel_selected')}
            </Button>
          </section>
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
                  <th>
                    <input
                      type="checkbox"
                      checked={areAllJobsSelected()}
                      onChange={(e) => handleAllJobsSelectionChange(e.target.checked)}
                    />
                  </th>
                  <th>{t('job.list.table.id')}</th>
                  <th>{t('job.list.table.name')}</th>
                  <th>{t('job.list.table.device')}</th>
                  <th>{t('job.list.table.status')}</th>
                  <th>{t('job.list.table.date')}</th>
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
                    <JobListItem
                      key={job.id}
                      job={job}
                      onJobModified={reloadJobs}
                      selectedJobs={selectedJobs}
                      onJobSelectionChange={handleJobSelectionChange}
                    />
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
          <ConfirmModal
            show={showBulkDeleteModal}
            onHide={() => setShowBulkDeleteModal(false)}
            title={t('job.list.modal.title')}
            message={t('job.list.modal.bulk_delete')}
            onConfirm={deleteSelectedJobs}
          />
          <ConfirmModal
            show={showBulkCancelModal}
            onHide={() => setShowBulkCancelModal(false)}
            title={t('job.list.modal.title')}
            message={t('job.list.modal.cancel')}
            onConfirm={cancelSelectedJobs}
          />
          <div
            className={clsx(
              !bulkDeleteInProgress && !bulkCancelInProgress && '!hidden',
              ['!fixed', '!top-0', '!left-0', '!w-full', '!h-full', 'z-40'],
              ['flex', 'flex-col', 'items-center', 'justify-center'],
              ['bg-modal-bg', 'bg-opacity-50']
            )}
          >
            <Loader size="xl" color="secondary" />
            <h3 className={clsx('text-secondary-content', 'mt-4')}>
              {bulkCancelInProgress
                ? t('job.list.cancel_in_progress')
                : t('job.list.delete_in_progress')}
            </h3>
          </div>
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
