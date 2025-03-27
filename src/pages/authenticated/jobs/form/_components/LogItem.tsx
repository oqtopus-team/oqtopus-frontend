import clsx from 'clsx';
import { JobFormLog } from '../_hooks/useJobFormLog';
import { NavLink } from 'react-router';
import { Spacer } from '@/pages/_components/Spacer';
import { LogItemUseInputButton } from './LogItemUseInputButton';
import { BsArrowUpRightSquare } from 'react-icons/bs';
import { LogItemInputSumary } from './LogItemInputSummary';

export const LogItem = ({ log }: { log: JobFormLog }) => {
  const timestamp = (() => {
    if (log.timestamp === undefined) {
      return;
    }
    return new Date(log.timestamp);
  })();

  return (
    <div
      className={clsx(
        [
          ['border-l-4', 'border-[1px]'],
          {
            'border-status-job-submitted border-opacity-70': log.kind === 'success',
            'border-error': log.kind === 'error',
          },
        ],
        ['rounded-md', 'p-2', 'w-full']
      )}
    >
      {log.kind === 'success' ? (
        <div>
          <NavLink
            to={`/jobs/${log.jobId}`}
            target="_brank"
            className={clsx('text-link', 'flex', 'items-center', 'gap-2')}
          >
            <p className={clsx('whitespace-nowrap', 'overflow-hidden', 'text-ellipsis')}>
              {log.jobId}
            </p>
            <BsArrowUpRightSquare size={14} />
          </NavLink>
          <Spacer className="h-2" />
          <LogItemInputSumary input={log.input} />
        </div>
      ) : (
        <div>
          <p className="text-error">{log.erorr}</p>
          <Spacer className="h-2" />
          <LogItemInputSumary input={log.input} />
        </div>
      )}

      <Spacer className="h-4" />

      <div className={clsx('flex', 'justify-between', 'items-end', 'text-xs')}>
        {/* Timestamp */}
        {timestamp && <p>{timestamp?.toLocaleString()}</p>}

        {/* Copy to use button */}
        <LogItemUseInputButton input={log.input} />
      </div>
    </div>
  );
};
