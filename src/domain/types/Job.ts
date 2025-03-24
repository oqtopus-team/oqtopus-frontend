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

export const JOB_FORM_MITIGATION_INFO_DEFAULTS: { [key in 'PseudoInv' | 'None']: string } = {
  PseudoInv: JSON.stringify(
    {
      readout: 'pseudo_inverse',
    },
    null
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
  jobid?: string;
  description?: string;
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

export type OperatorItem = { pauli: string; coeff: [string, string] };
