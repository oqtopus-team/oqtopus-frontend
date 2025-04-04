import { createContext, useEffect, useLayoutEffect, useReducer } from 'react';
import { JobFormLog, JobFormLogState } from './useJobFormLog';
import { JobFormLogStateDispatchAction, jobFormLogStateReducer } from './JobFormLogDispatch';
import * as storage from './storage';

export const JobFormLogContext = createContext<{
  state: JobFormLogState;
  dispatch: React.Dispatch<JobFormLogStateDispatchAction>;
}>({
  state: { log: [] },
  dispatch: () => {},
});

export const JobFormLogProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(jobFormLogStateReducer, { log: [] });

  // Load logs from local storage
  useLayoutEffect(() => {
    const log = storage.getLog();
    dispatch({ kind: 'set', payload: log });
  }, []);

  // Save logs to local storage
  useEffect(() => {
    storage.storeLog(state.log);
  }, [state.log]);

  return (
    <JobFormLogContext.Provider value={{ state, dispatch }}>{children}</JobFormLogContext.Provider>
  );
};
