import { JobsSubmitJobRequest } from '@/api/generated';
import { useContext } from 'react';
import { JobFormLogContext } from './FormLogProvider';

export type JobFormLog = {
  input: JobsSubmitJobRequest;
  timestamp?: string;
} & ({ kind: 'success'; jobId: string } | { kind: 'error'; erorr: string });

export type JobFormLogState = {
  /**
   * log
   *  log field holds the history of form submissions in descending order.
   */
  log: JobFormLog[];
};

export const useJobFormLog = () => {
  const { state, dispatch } = useContext(JobFormLogContext);

  const addLog = (log: JobFormLog) => {
    if (log.timestamp === undefined) {
      log.timestamp = new Date().toISOString();
    }
    dispatch({ kind: 'add', payload: log });
  };

  const clearLog = () => {
    dispatch({ kind: 'set', payload: [] });
  };

  return { log: state.log, addLog, clearLog };
};
