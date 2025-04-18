import { useState } from 'react';
import { Job, JobStatusType, NOT_CANCELABLE_JOBS } from '@/domain/types/Job';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { JobStatus } from './JobStatus';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Button } from '@/pages/_components/Button';
import { NavLink } from 'react-router';
import { useJobAPI } from '@/backend/hook';
import { DateTimeFormatter } from '../../_components/DateTimeFormatter';
import DownloadJobButton from './DownloadJobButton';

interface JobProps {
  job: Job;
  onJobModified: () => void;
  selectedJobs: Job[];
  onJobSelectionChange: (job: Job, selected: boolean) => void;
}

export const JobListItem = ({
  job,
  onJobModified,
  selectedJobs,
  onJobSelectionChange,
}: JobProps) => {
  const { t, i18n } = useTranslation();
  const { cancelJob, deleteJob } = useJobAPI();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onClickCancel = (): void => {
    // ダブルクリック防止
    if (isProcessing) return;
    setIsProcessing(true);
    setLoading(true);

    cancelJob(job)
      .then((message) => {
        alert(message);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        onJobModified();
        setLoading(false);
        setIsProcessing(false);
      });
  };

  const onClickDelete = (): void => {
    // ダブルクリック防止
    if (isProcessing) return;
    setIsProcessing(true);
    setLoading(true);

    deleteJob(job)
      .then((message) => {
        alert(message);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        onJobModified();
        setLoading(false);
        setIsProcessing(false);
      });
  };

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={selectedJobs.some((j) => j.id === job.id)}
          onChange={(e) => onJobSelectionChange(job, e.target.checked)}
        />
      </td>
      <td>
        <NavLink to={`/jobs/${job.id}`} className="text-link">
          {job.id}
        </NavLink>
      </td>
      <td>{job.name}</td>
      <td>
        <NavLink to={`/device/${job.deviceId}`} className="text-link">
          {job.deviceId}
        </NavLink>
      </td>
      <td>
        <JobStatus status={job.status} />
      </td>
      <td>{DateTimeFormatter(t, i18n, job.submittedAt)}</td>
      <td className={clsx('py-1')}>
        <OperationButtons job={job} onClickCancel={onClickCancel} onClickDelete={onClickDelete} />
      </td>
    </tr>
  );
};

interface ButtonProps {
  job: Job;
  onClickCancel: () => void;
  onClickDelete: () => void;
}

const OperationButtons = ({ job, onClickCancel, onClickDelete }: ButtonProps) => {
  const { t } = useTranslation();

  const [cancelModalShow, setCancelModalShow] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);

  function canCancel(status: JobStatusType): boolean {
    return !NOT_CANCELABLE_JOBS.includes(status);
  }

  return (
    <div className={clsx('flex', 'gap-2')}>
      <Button color="error" onClick={() => setDeleteModalShow(true)}>
        {t('job.list.operation.delete')}
      </Button>
      <ConfirmModal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
        title={t('job.list.modal.title')}
        message={t('job.list.modal.delete')}
        onConfirm={onClickDelete}
      />
      {canCancel(job.status) && (
        <>
          <Button color="secondary" onClick={() => setCancelModalShow(true)}>
            {t('job.list.operation.cancel')}
          </Button>
          <ConfirmModal
            show={cancelModalShow}
            onHide={() => setCancelModalShow(false)}
            title={t('job.list.modal.title')}
            message={t('job.list.modal.cancel')}
            onConfirm={onClickCancel}
          />
        </>
      )}
      <DownloadJobButton job={job} />
    </div>
  );
};
