import { JobsS3JobResult } from '@/api/generated';
import clsx from 'clsx';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { JSONCodeBlock } from '@/pages/_components/JSONCodeBlock';
import { Spacer } from '@/pages/_components/Spacer';
import ClipboardCopy from './utils/ClipboardCopy';

export interface JobDetailMitigationDetailsProps {
  result?: JobsS3JobResult;
  maxHeight: number;
}

export const JobDetailMitigationDetails: React.FC<JobDetailMitigationDetailsProps> = ({
  result,
  maxHeight,
}) => {
  const mitigationDetails = result?.mitigation_details;
  if (mitigationDetails === undefined || mitigationDetails === null) {
    return null;
  }

  const text = JSON.stringify(mitigationDetails, null, 2) ?? '{}';

  return (
    <>
      <h3 className={clsx('text-primary', 'font-bold')}>Error Mitigation Details</h3>
      <Spacer className="h-2" />
      <div className={clsx('relative')}>
        <div className={clsx('rounded', 'bg-cmd-bg', 'text-sm')}>
          <SimpleBar style={{ maxHeight }}>
            <JSONCodeBlock json={text} />
          </SimpleBar>
        </div>
        <ClipboardCopy text={text} />
      </div>
    </>
  );
};
