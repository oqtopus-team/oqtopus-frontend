import { useState } from 'react';
import { Job, JobFileData, JobFileDataInfo, JobTypeType } from '@/domain/types/Job';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { JobStatus } from './JobStatus';
import { ConfirmModal } from '@/pages/_components/ConfirmModal';
import { Button } from '@/pages/_components/Button';
import { NavLink } from 'react-router';
import { useJobAPI } from '@/backend/hook';
import { BsDownload } from 'react-icons/bs';
import { DateTimeFormatter } from '../../_components/DateTimeFormatter';

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
      <td>
        <NavLink to={`/device/${job.deviceId}`} className="text-link">
          {job.deviceId}
        </NavLink>
      </td>
      <td>
        <JobStatus status={job.status} />
      </td>
      <td>{DateTimeFormatter(t, i18n, job.submittedAt)}</td>
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
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  function canCancel(status: string): boolean {
    return status === 'created' || status === 'transpiling' || status === 'queued';
  }

  function downloadJob() {
    setDownloadInProgress(true);

    const jobData: JobFileData = {
      name: job.name,
      description: job.description,
      shots: job.shots,
      deviceId: job.deviceId ?? '',
      jobType: job.jobType as JobTypeType,
      jobInfo: job.jobInfo as JobFileDataInfo,
      transpilerInfo: job.transpilerInfo,
      simulatorInfo: job.simulatorInfo,
      mitigationInfo: job.mitigationInfo,
    };

    try {
      const valuesBlob = new Blob([JSON.stringify(jobData, null, 2)], { type: 'application/json' });
      const blobURL = URL.createObjectURL(valuesBlob);

      const a = document.createElement('a');
      a.href = blobURL;
      a.download = 'job.json';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    } catch (error: any) {
      console.error('failed to download file due to following error:', error);
    } finally {
      setDownloadInProgress(false);
    }
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
      <Button color="secondary" onClick={downloadJob} disabled={downloadInProgress}>
        <BsDownload />
      </Button>
    </div>
  );
};
