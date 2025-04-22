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
import { JobDetailMultiManualTabs } from './panels/JobDetailMultiManualTabs';
import { JobDetailTranspileResult } from './panels/JobDetailTranspileResult';

const combinedCircuitKey = 'Combined program';
const combinedCircuitHeading = 'Combined';
const dividedCountsKeyPre = 'Program index';
const dividedCountsHeading = 'Index';

export const SuccessViewMultiManual: React.FC<Job> = (job: Job) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<string>('0');
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

  const options = useMemo(() => {
    try {
      return [
        {
          value: combinedCircuitKey,
          tabLabel: combinedCircuitKey,
          heading: combinedCircuitHeading,
        },
        ...job.jobInfo.program.map((k, index) => ({
          value: index.toString(),
          tabLabel: `${dividedCountsKeyPre} ${index}`,
          heading: `${dividedCountsHeading} ${index}`,
        })),
      ];
    } catch (error) {
      console.error('Failed to generate options:', error);
      return [
        {
          value: combinedCircuitKey,
          tabLabel: combinedCircuitKey,
          heading: combinedCircuitHeading,
        },
      ];
    }
  }, [combinedCircuitKey, job.jobInfo.program]);

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
        {/* Tabs */}
        <div
          className={clsx([
            'col-start-1',
            'col-end-3',
            'transparent-header',
            'sticky',
            'top-0',
            'z-50',
          ])}
        >
          <JobDetailMultiManualTabs
            combinedCircuitKey={combinedCircuitKey}
            programs={job.jobInfo?.program ?? []}
            selectedKeyIndex={selectedKeyIndex}
            options={options}
            onChange={setSelectedKeyIndex}
          />
        </div>
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
            heading={`Histogram (${options[Number(selectedKeyIndex)].heading})`}
            height={histogramHeight}
          />
        </Card>
        {/* TranspilerInfo */}
        <Card className={clsx(['col-start-1', 'col-end-3'])}>
          <JobDetailTranspilerInfo
            transpilerInfo={JSON.stringify(job.transpilerInfo, null, 2)}
            heading="Transpiler Info (Combined)"
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Program */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailProgram
            program={selectedQASM}
            maxHeight={nonHistogramPanelHeight}
            heading={`Program (${options[Number(selectedKeyIndex)].heading})`}
          />
        </Card>
        {/* Transpiled Program */}
        <Card className={clsx(['col-start-2', 'col-end-3'])}>
          <JobDetailTranspiledProgram
            transpiledProgram={job.jobInfo.transpile_result?.transpiled_program ?? ''}
            heading="Transpiler Program (Combined)"
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Result */}
        <Card className={clsx(['col-start-1', 'col-end-2'])}>
          <JobDetailResult
            result={job.jobInfo.result?.sampling}
            mitigationInfo={JSON.stringify(job.mitigationInfo, null, 2)}
            heading="Result (Combined)"
            maxHeight={nonHistogramPanelHeight}
          />
        </Card>
        {/* Transpile Result */}
        {job.jobInfo.transpile_result && (
          <Card className={clsx(['col-start-2', 'col-end-3'])}>
            <JobDetailTranspileResult
              transpileResult={job.jobInfo.transpile_result}
              heading="Transpile Result (Combined)"
            />
          </Card>
        )}
      </div>
    </>
  );
};
