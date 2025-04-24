import { Card } from '@/pages/_components/Card';
import { Job } from '@/domain/types/Job';
import clsx from 'clsx';
import { JobDetailBasicInfo } from './panels/JobDetailBasicInfo';
import { JobDetailMitigationInfo } from './panels/JobDetailMitigationInfo';
import { JobDetailResult } from './panels/JobDetailResult';
import { JobDetailExpectation } from './panels/JobDetailExpectation';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import { JobDetailTranspileResult } from './panels/JobDetailTranspileResult';
import { JobDetailProgram } from './panels/JobDetailProgram';
import { JobDetailTranspiledProgram } from './panels/JobDetailTranspiledProgram';

export const SuccessViewEstimation: React.FC<Job> = (job: Job) => {
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
            shots={job.shots.toString()}
            status={job.status}
            submittedAt={job.submittedAt}
            readyAt={job.readyAt}
            runningAt={job.runningAt}
            endedAt={job.endedAt}
            executionTime={job.executionTime}
            message={job.jobInfo?.message}
          />
        </Card>
        {/* Expectation */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailExpectation expectationValue={job.jobInfo.result?.estimation?.exp_value} />
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
        {/* QASM */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailProgram program={job.jobInfo.program} maxHeight={nonHistogramPanelHeight} />
        </Card>
        {/* Transpiled QASM */}
        <Card className={clsx(['col-start-2', 'col-end-3'])}>
          <JobDetailTranspiledProgram
            transpiledProgram={job.jobInfo.transpile_result?.transpiled_program ?? ''}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Result */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailResult
            result={job.jobInfo.result?.estimation}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Transpile Result */}
        {job.jobInfo.transpile_result && (
          <Card className={clsx(['col-start-2', 'col-end-3'])}>
            <JobDetailTranspileResult transpileResult={job.jobInfo.transpile_result} />
          </Card>
        )}
      </div>
    </>
  );
};
