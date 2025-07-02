import { Job, JobFileData, JobFileDataInfo, JobTypeType } from '@/domain/types/Job';
import { Button } from '@/pages/_components/Button';
import { CSSProperties, useState } from 'react';
import { BsDownload } from 'react-icons/bs';

type DownloadJobButtonProps = {
  job?: Job | null;
  style?: CSSProperties | undefined;
};

export default function DownloadJobButton({ job, style }: DownloadJobButtonProps) {
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  function downloadJob() {
    if (!job) return;

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
    <Button
      style={style}
      color="secondary"
      onClick={downloadJob}
      disabled={!job || downloadInProgress}
    >
      <BsDownload />
    </Button>
  );
}
