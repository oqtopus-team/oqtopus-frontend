import { JobFormLog, JobFormLogState } from './useJobFormLog';

export type JobFormLogStateDispatchAction =
  | {
      kind: 'add';
      payload: JobFormLog;
    }
  | { kind: 'set'; payload: JobFormLog[] };

export const jobFormLogStateReducer = (
  curr: JobFormLogState,
  action: JobFormLogStateDispatchAction
): JobFormLogState => {
  switch (action.kind) {
    case 'add':
      return { ...curr, log: [action.payload, ...curr.log] };
    case 'set':
      return { ...curr, log: action.payload };
    default:
      return curr;
  }
};
