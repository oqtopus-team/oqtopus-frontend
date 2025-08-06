import { Card } from '@/pages/_components/Card';
import { JobWithS3Data } from '@/domain/types/Job';
import clsx from 'clsx';
import { JobDetailBasicInfo } from './panels/JobDetailBasicInfo';
import { JobDetailProgram } from './panels/JobDetailProgram';
import { JobDetailResult } from './panels/JobDetailResult';
import { JobDetailTranspiledProgram } from './panels/JobDetailTranspiledProgram';
import { JobDetailHistogram } from './panels/JobDetailHistogram';
import { JobDetailMitigationInfo } from './panels/JobDetailMitigationInfo';
import { JobDetailTranspilerInfo } from './panels/JobDetailTranspilerInfo';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import { JobDetailTranspileResult } from './panels/JobDetailTranspileResult';

export const SuccessViewSampling: React.FC<JobWithS3Data> = (job: JobWithS3Data) => {
  const histogramHeight = useWindowSize().height * 0.5;
  const nonHistogramPanelHeight = useWindowSize().height * 0.9;
  const hasMitigationInfo: boolean = job.mitigationInfo
    ? Object.keys(job.mitigationInfo).length > 0
    : false;

  return (
    <>
      <div className={clsx('grid', 'grid-cols-[1.0fr_1.0fr]', 'grid-rows-[auto_1fr]', 'gap-3')}>
        {/* Basic Information */}
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
            message={job.jobInfo.message}
          />
        </Card>
        {/* Histogram */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailHistogram
            countsJson={JSON.stringify(job.result?.sampling?.counts, null, 2)}
            mitigationInfo={job.mitigationInfo}
            height={histogramHeight}
            jobId={job.id}
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
        {/* TranspilerInfo */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailTranspilerInfo
            transpilerInfo={JSON.stringify(job.transpilerInfo, null, 2)}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* QASM */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailProgram program={job.input.program} maxHeight={nonHistogramPanelHeight} />
        </Card>
        {/* Transpiled QASM */}
        <Card className={clsx(['col-start-2', 'col-end-3'])}>
          <JobDetailTranspiledProgram
            transpiledProgram={job.transpileResult?.transpiled_program ?? ''}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Result */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailResult result={job.result?.sampling} maxHeight={nonHistogramPanelHeight} />
        </Card>
        {/* Transpile Result */}
        {job.transpileResult && (
          <Card className={clsx(['col-start-2', 'col-end-3'])}>
            <JobDetailTranspileResult transpileResult={job.transpileResult} />
          </Card>
        )}
      </div>
    </>
  );
};
