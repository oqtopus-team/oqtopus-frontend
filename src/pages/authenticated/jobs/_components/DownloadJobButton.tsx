import { useJobAPI } from '@/backend/hook';
import { Job, JobFileData, JobTypeType, JobWithS3Data } from '@/domain/types/Job';
import { Button } from '@/pages/_components/Button';
import { CSSProperties, useState } from 'react';
import { BsDownload } from 'react-icons/bs';

type DownloadJobButtonProps =
  | {
      kind: 'jobWithS3Data';
      job?: JobWithS3Data | null;
      style?: CSSProperties | undefined;
    }
  | {
      kind: 'jobWithoutS3Data';
      job?: Job | null;
      style?: CSSProperties | undefined;
    };

export default function DownloadJobButton({ kind, job, style }: DownloadJobButtonProps) {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const { retrieveJobFiles } = useJobAPI();

  // we provide job either with or without S3 data loaded.
  // In the latter case, we have to retrieve S3 data before downloading the job.
  async function downloadJob() {
    if (!job) return;
    setDownloadInProgress(true);

    try {
      let jobToDownload: JobWithS3Data;

      switch (kind) {
        case 'jobWithS3Data':
          jobToDownload = job;
        case 'jobWithoutS3Data':
          const jobS3Data = await retrieveJobFiles(job.jobInfo);
          jobToDownload = { ...job, ...jobS3Data };
      }

      const jobData: JobFileData = {
        name: jobToDownload.name,
        description: jobToDownload.description,
        shots: jobToDownload.shots,
        deviceId: jobToDownload.deviceId ?? '',
        jobType: jobToDownload.jobType as JobTypeType,
        jobInfo: jobToDownload.input,
        transpilerInfo: jobToDownload.transpilerInfo,
        simulatorInfo: jobToDownload.simulatorInfo,
        mitigationInfo: jobToDownload.mitigationInfo,
      };

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
