import { useState } from 'react';
import { Job } from '@/domain/types/Job';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { JobStatus } from './JobStatus';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Button } from '@/pages/_components/Button';
import { NavLink } from 'react-router';
import { useJobAPI } from '@/backend/hook';

interface JobProps {
  job: Job;
  onJobModified: () => void;
}

export const JobListItem = ({ job, onJobModified }: JobProps) => {
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
        <NavLink to={`/jobs/${job.id}`} className="text-link">
          {job.id}
        </NavLink>
      </td>
      <td>
        <JobStatus status={job.status} />
      </td>
      <td>{job.submittedAt}</td>
      <td className={clsx('text-wrap', 'break-words', 'whitespace-normal', 'max-w-min')}>
        {job.description}
      </td>
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

  function canCancel(status: string): boolean {
    return status === 'created' || status === 'transpiling' || status === 'queued';
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
    </div>
  );
};
