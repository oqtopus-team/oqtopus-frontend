import { JobsSubmitJobRequest } from '@/api/generated';
import { Spacer } from '@/pages/_components/Spacer';
import { Chip } from './Chip';
import clsx from 'clsx';

export const LogItemInputSumary = ({ input }: { input: JobsSubmitJobRequest }) => {
  return (
    <div>
      <p className="font-semibold">{input.name}</p>
      <Spacer className="h-2" />
      <p>{input.description}</p>
      <Spacer className="h-4" />
      <div className={clsx('flex', 'gap-6', 'items-center')}>
        <Chip label="Type" className={clsx('text-xs')}>
          {input.job_type}
        </Chip>
        <Chip label="Device" className={clsx('text-xs')}>
          {input.device_id}
        </Chip>
      </div>
    </div>
  );
};
