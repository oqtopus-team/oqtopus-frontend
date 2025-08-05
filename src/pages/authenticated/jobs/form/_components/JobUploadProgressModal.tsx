import { Button } from '@/pages/_components/Button';
import { Card } from '@/pages/_components/Card';
import { Divider } from '@/pages/_components/Divider';
import { Loader } from '@/pages/_components/Loader';
import { Spacer } from '@/pages/_components/Spacer';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCheckCircle, BsExclamationCircleFill } from 'react-icons/bs';

import './JobUploadProgressModal.css';

type JobUploadModalProps = {
  isSubmitting: boolean;
  registerDone: boolean;
  uploadDone: boolean;
  uploadProgressPercent: number;
  submitDone: boolean;
};

export default function JobUploadProgressModal({
  isSubmitting,
  registerDone,
  uploadDone,
  uploadProgressPercent,
  submitDone,
}: JobUploadModalProps) {
  const { t } = useTranslation();

  const registerStatus = getStageStatus(registerDone);
  const uploadStatus = getStageStatus(uploadDone, registerDone);
  const submitStatus = getStageStatus(submitDone, registerDone, uploadDone);
  const jobUploadCompleted = [registerStatus, uploadStatus, submitStatus].every(
    (s) => s === StageStatus.SUCCEEDED
  );

  return (
    <div
      className={clsx(
        !isSubmitting && '!hidden',
        ['!fixed', '!top-0', '!left-0', '!w-full', '!h-full', 'z-40'],
        ['flex', 'flex-col', 'items-center', 'justify-center'],
        ['bg-modal-bg', 'bg-opacity-50']
      )}
    >
      <Card className={clsx('max-w-[800px]', 'min-w-[400px]', 'text-xg')}>
        <h1 className={clsx('text-2xl', 'font-bold', 'text-primary')}>Job Upload</h1>
        <Spacer className={'h-8'} />
        <section className={clsx('flex', 'flex-col', 'gap-[0.5rem]')}>
          <h2 className={clsx('font-bold', 'text-primary')}>Register job</h2>
          <UploadStage status={registerStatus} />
        </section>
        <Spacer className={'h-8'} />
        <section className={clsx('flex', 'flex-col', 'gap-[0.5rem]')}>
          <h2 className={clsx('font-bold', 'text-primary')}>Upload job info</h2>
          <UploadStage status={uploadStatus} />
          <progress
            className="upload-job-info-progress-bar"
            max={100}
            value={uploadProgressPercent}
          ></progress>
        </section>
        <Spacer className={'h-8'} />
        <section className={clsx('flex', 'flex-col', 'gap-[0.5rem]')}>
          <h2 className={clsx('font-bold', 'text-primary')}>Submit job</h2>
          <UploadStage status={submitStatus} />
        </section>
        <Spacer className="h-8" />
        {jobUploadCompleted && <p>Job upload completed</p>}
      </Card>
    </div>
  );
}

enum StageStatus {
  PENDING = 'pending...',
  IN_PROGRESS = 'in progress...',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

function getStageStatus(stageDone: boolean, ...previousStagesDoneList: boolean[]): StageStatus {
  if (stageDone) return StageStatus.SUCCEEDED;

  for (const prevStageDone of previousStagesDoneList) {
    if (!prevStageDone) return StageStatus.PENDING;
  }

  return StageStatus.IN_PROGRESS;
}

type UploadStageProps = {
  status: StageStatus;
};

function UploadStage({ status }: UploadStageProps) {
  return (
    <div className={clsx('flex', 'flex-row', 'items-center', 'gap-[0.5rem]')}>
      <StatusIcon status={status} />
      <span>{status}</span>
    </div>
  );
}

function StatusIcon({ status }: { status: StageStatus }) {
  switch (status) {
    case StageStatus.PENDING:
      return <Loader size="xs" />;
    case StageStatus.IN_PROGRESS:
      return <Loader size="xs" />;
    case StageStatus.SUCCEEDED:
      return <BsCheckCircle color="green" size={20} />;
    case StageStatus.FAILED:
      return <BsExclamationCircleFill color="red" size={20} />;
  }
}
