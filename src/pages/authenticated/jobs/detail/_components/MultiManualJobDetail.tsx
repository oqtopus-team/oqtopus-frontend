import React, { useState, useMemo } from 'react';
import { Card } from '@/pages/_components/Card';
import { Job } from '@/domain/types/Job';
import clsx from 'clsx';
import { JobDetailBasicInfo } from './panels/JobDetailBasicInfo';
import { JobDetailProgram } from './panels/JobDetailProgram';
import { JobDetailResult } from './panels/JobDetailResult';
import { JobDetailTranspiledProgram } from './panels/JobDetailTranspiledProgram';
import { JobDetailTranspilerInfo } from './panels/JobDetailTranspilerInfo';
import useWindowSize from '@/pages/_hooks/UseWindowSize';
import { JobDetailMultiManualHistogram } from './panels/JobDetailMultiManualHistogram';
import { JobDetailMultiManualPullDown } from './panels/JobDetailMultiManualPullDown';
import { JobDetailTranspileResult } from './panels/JobDetailTranspileResult';

const combinedCircuitKey = 'Combined Circuit';

export const SuccessViewMultiManual: React.FC<Job> = (job: Job) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<string>(combinedCircuitKey);
  const histogramHeight = useWindowSize().height * 0.5;
  const nonHistogramPanelHeight = useWindowSize().height * 0.9;

  const selectedQASM: string[] = useMemo(() => {
    try {
      if (selectedKeyIndex === combinedCircuitKey) {
        if (job.jobInfo?.combined_program == null) {
          return [];
        }
        return [job.jobInfo?.combined_program];
      }
      const programs = job.jobInfo?.program;
      const index = Number(selectedKeyIndex);
      if (!isNaN(index) && programs && programs[index] !== undefined) {
        return [programs[index]];
      } else {
        console.error(`Program for key '${selectedKeyIndex}' not found.`);
      }
    } catch (error) {
      console.error('Failed to get selected QASM:', error);
    }
    return [];
  }, [selectedKeyIndex, job.jobInfo?.combined_program, job.jobInfo?.program]);

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
        {/* Pull down */}
        <JobDetailMultiManualPullDown
          combinedCircuitKey={combinedCircuitKey}
          programs={job.jobInfo?.program ?? []}
          selectedKeyIndex={selectedKeyIndex}
          onChange={setSelectedKeyIndex}
        />
        {/* Histogram */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailMultiManualHistogram
            combinedCircuitKey={combinedCircuitKey}
            pullDownKey={selectedKeyIndex}
            combinedCircuitCountsJson={JSON.stringify(
              job.jobInfo.result?.sampling?.counts,
              null,
              2
            )}
            dividedCircuitCountsJson={JSON.stringify(
              job.jobInfo.result?.sampling?.divided_counts,
              null,
              2
            )}
            height={histogramHeight}
          />
        </Card>
        {/* TranspilerInfo */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailTranspilerInfo
            transpilerInfo={JSON.stringify(job.transpilerInfo, null, 2)}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Program */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailProgram program={selectedQASM} maxHeight={nonHistogramPanelHeight} />
        </Card>
        {/* Transpiled Program */}
        <Card className={clsx(['col-start-2', 'col-end-3'])}>
          <JobDetailTranspiledProgram
            transpiledProgram={job.jobInfo.transpile_result?.transpiled_program ?? ''}
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Result */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailResult
            result={job.jobInfo.result?.sampling}
            mitigationInfo={JSON.stringify(job.mitigationInfo, null, 2)}
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
