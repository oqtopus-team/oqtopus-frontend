import { Card } from '@/pages/_components/Card';
import { Job } from '@/domain/types/Job';
import clsx from 'clsx';
import { JobDetailBasicInfo } from './panels/JobDetailBasicInfo';
import { JobDetailMitigationInfo } from './panels/JobDetailMitigationInfo';
import { JobDetailSSELog } from './panels/JobDetailSSELog';
import { JobDetailResult } from './panels/JobDetailResult';
import useWindowSize from '@/pages/_hooks/UseWindowSize';

export const SuccessViewSSELog: React.FC<Job> = (job: Job) => {
  const nonHistogramPanelHeight = useWindowSize().height * 0.9;
  const hasMitigationInfo: boolean = job.mitigationInfo
    ? Object.keys(job.mitigationInfo).length > 0
    : false;

  return (
    <>
      <div className={clsx('grid', 'grid-cols-[1.0fr_1.0fr]', 'grid-rows-[auto_1fr]', 'gap-3')}>
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailBasicInfo
            id={job.id}
            name={job.name}
            description={job.description}
            jobType={job.jobType}
            deviceId={job.deviceId}
            shots="-"
            status={job.status}
            submittedAt={job.submittedAt}
            readyAt={job.readyAt}
            runningAt={job.runningAt}
            endedAt={job.endedAt}
            executionTime={job.executionTime}
            message={job.jobInfo?.message}
          />
        </Card>
        {/* MitigationInfo */}
        {hasMitigationInfo && (
          <Card className={clsx(['col-start-1', 'col-end-3'])}>
            <JobDetailMitigationInfo
              mitigationInfo={job.mitigationInfo}
              maxHeight={nonHistogramPanelHeight}
            />
          </Card>
        )}
        {/* SSE log */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailSSELog job_id={job.id} status={job.status} />
        </Card>
        {/* Result */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailResult
            result={job.jobInfo.result?.sampling}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
      </div>
    </>
  );
};
