import { JobFormLog } from './useJobFormLog';

const LOCAL_STORAGE_KEY = 'qasm_form_log';

export const storeLog = (log: JobFormLog[]) => {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(log));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('failed to store qasm form log: ' + error.message);
    } else {
      console.error(`failed to store qasm form log: ${error}`);
    }
  }
};

export const getLog = (): JobFormLog[] => {
  try {
    const storedLog = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedLog === null) {
      return [];
    }

    const parsedLog = JSON.parse(storedLog);
    if (!Array.isArray(parsedLog)) {
      throw new Error('Invalid log format');
    }
    return parsedLog as JobFormLog[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('failed to get qasm form log: ' + error.message);
    } else {
      console.error(`failed to get qasm form log: ${error}`);
    }
  }
  return [];
};
