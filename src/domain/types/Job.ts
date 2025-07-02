import { JobsJobInfo } from '@/api/generated';

export const JOB_STATUSES = [
  'submitted',
  'ready',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'unknown',
] as const;

export type JobStatusType = (typeof JOB_STATUSES)[number];

export const NOT_CANCELABLE_JOBS: JobStatusType[] = ['succeeded', 'failed', 'cancelled'] as const;

export const JOB_TYPES = ['estimation', 'sampling'] as const;
export const JOB_TYPE_DEFAULT = JOB_TYPES[1];
export type JobTypeType = (typeof JOB_TYPES)[number];

export const SHOTS_DEFAULT = 1000;

export const isJobStatus = (str: string): str is JobStatusType => {
  return JOB_STATUSES.some((v) => v == str);
};

export const TRANSPILER_TYPES = ['Default', 'None'] as const;
export const TRANSPILER_TYPE_DEFAULT = TRANSPILER_TYPES[0];
export type TranspilerTypeType = (typeof TRANSPILER_TYPES)[number];

export const JOB_FORM_TRANSPILER_INFO_DEFAULTS: { [key in TranspilerTypeType]: string } = {
  Default: JSON.stringify({}, null, 2),
  None: JSON.stringify({ transpiler_lib: null }, null, 2),
} as const;

export const PROGRAM_TYPES = ['Default', 'Bell Measurement'] as const;
export const PROGRAM_TYPE_DEFAULT = PROGRAM_TYPES[0];
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export async function initializeJobFormProgramDefaults(): Promise<{
  [key in ProgramType]: string;
}> {
  const results = await Promise.all(
    PROGRAM_TYPES.map((fileName: string) => {
      if (fileName === PROGRAM_TYPE_DEFAULT) {
        // set the 'Default' program empty
        return Promise.resolve({ fileName, content: '' });
      }
      return fetch(`/sample_program/${fileName}.txt`).then((res) => {
        if (!res.ok) {
          console.error('failed to load file:', fileName);
          return { fileName, content: '' };
        }
        return res.text().then((content) => ({ fileName, content }));
      });
    })
  );
  const info: { [key in ProgramType]?: string } = {};
  results.forEach((result) => {
    if (result != null) {
      info[result.fileName as ProgramType] = result.content;
    }
  });
  return info as { [key in ProgramType]: string };
}

export const JOB_FORM_MITIGATION_INFO_DEFAULTS: { [key in 'PseudoInv' | 'None']: string } = {
  PseudoInv: JSON.stringify(
    {
      readout: 'pseudo_inverse',
    },
    null,
    2
  ),
  None: JSON.stringify({}, null, 2),
} as const;

export interface Job {
  id: string;
  name: string;
  description?: string;
  jobInfo: JobsJobInfo;
  transpilerInfo?: { [key: string]: any };
  simulatorInfo?: { [key: string]: any };
  mitigationInfo?: { [key: string]: any };
  jobType: string;
  shots: number;
  status: JobStatusType;
  deviceId?: string;
  submittedAt: string;
  readyAt: string;
  runningAt: string;
  endedAt: string;
  executionTime: number;
}

export interface JobSearchParams {
  query?: string; // id, name or description query string
  status?: JobStatusType;
  page?: string;
}

export interface ResponseJob {
  NextPage: string;
  MaxPage: string;
  Data: Job[];
}

export interface JobOperationResult {
  success: boolean;
  message?: string;
}

export interface JobFileData {
  name: string;
  description?: string;
  shots: number;
  deviceId: string;
  jobType: JobTypeType;
  jobInfo: JobFileDataInfo;
  transpilerInfo?: { [key: string]: any };
  simulatorInfo?: { [key: string]: any };
  mitigationInfo?: { [key: string]: any };
}

export interface JobFileDataInfo {
  program: string[];
  operator?: OperatorItem[];
}

export type OperatorItem = { pauli: string; coeff: number };
